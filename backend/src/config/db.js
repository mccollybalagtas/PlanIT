import mongoose from 'mongoose';
import { config } from './index.js';

let mongoServer;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);

    if (config.nodeEnv === 'development') {
      console.log('Attempting to start in-memory MongoDB server for development...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoServer = await MongoMemoryServer.create();
        const inMemoryUri = mongoServer.getUri();
        console.log(`In-memory MongoDB started at: ${inMemoryUri}`);
        const conn = await mongoose.connect(inMemoryUri);
        console.log(`Connected to in-memory MongoDB: ${conn.connection.host}`);
      } catch (memError) {
        console.error(`In-memory MongoDB failed: ${memError.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
};