import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from './config/index.js';
import { User, Task, Event, Notification } from './models/index.js';

const seedUsers = [
  {
    name: 'Demo User',
    email: 'demo@plannerhub.com',
    password: 'password123',
    theme: 'system',
    notificationsEnabled: true,
    reminderTime: 15
  }
];

const seedTasks = [
  {
    title: 'Complete project proposal',
    description: 'Finish the quarterly project proposal for the client',
    priority: 'urgent',
    category: 'work',
    dueDate: new Date('2025-09-15T17:00:00.000Z'),
    dueTime: '17:00',
    reminder: true,
    reminderTime: 60,
    tags: ['urgent', 'client']
  },
  {
    title: 'Team sync meeting',
    description: 'Weekly sync with the development team',
    priority: 'high',
    category: 'work',
    dueDate: new Date('2025-09-20T10:00:00.000Z'),
    dueTime: '10:00',
    reminder: true,
    reminderTime: 15,
    tags: ['team']
  }
];

const seedEvents = [
  {
    title: 'Product planning workshop',
    description: 'Planning session for Q4 product roadmap',
    startDate: '2025-09-20',
    startTime: '14:00',
    endDate: '2025-09-20',
    endTime: '17:00',
    allDay: false,
    category: 'meeting',
    color: '#6366f1',
    location: 'Conference Room A',
    reminder: true,
    reminderTime: 30,
    recurring: 'none'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    await Notification.deleteMany({});
    await Event.deleteMany({});
    await Task.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    const createdUsers = await User.insertMany(
      seedUsers.map(u => ({ ...u, password: bcrypt.hashSync(u.password, 10) }))
    );
    console.log(`Created ${createdUsers.length} users`);

    await Task.insertMany(seedTasks.map(t => ({ ...t, user: createdUsers[0]._id })));
    console.log(`Created ${seedTasks.length} tasks`);

    await Event.insertMany(seedEvents.map(e => ({ ...e, user: createdUsers[0]._id })));
    console.log(`Created ${seedEvents.length} events`);

    console.log('\nSeed data created successfully!');
    console.log('Login with: demo@plannerhub.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
