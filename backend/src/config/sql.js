import { Sequelize, DataTypes } from 'sequelize';
import { config } from './index.js';

let sequelize;
let StudySet, Flashcard, StudyFile;

export const connectSQL = async () => {
  const dbUrl = config.postgresUrl;

  if (dbUrl && dbUrl.startsWith('postgres')) {
    try {
      sequelize = new Sequelize(dbUrl, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: config.postgresCa
          ? { ssl: { require: true, ca: config.postgresCa, rejectUnauthorized: true } }
          : undefined,
      });
      await sequelize.authenticate();
      console.log('Connected to PostgreSQL');
    } catch (pgError) {
      if (config.nodeEnv === 'production') {
        throw new Error(`PostgreSQL connection failed: ${pgError.message}`);
      }
      console.error('PostgreSQL connection failed, falling back to SQLite:', pgError.message);
      sequelize = null;
    }
  }

  if (!sequelize) {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: config.sqlPath || './data/plannerhub.sqlite',
      logging: false,
    });
    await sequelize.authenticate();
    console.log('Connected to SQLite (local)');
  }

  StudySet = sequelize.define('StudySet', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    subject: { type: DataTypes.STRING, defaultValue: 'General' },
    description: { type: DataTypes.TEXT, defaultValue: '' },
    color: { type: DataTypes.STRING, defaultValue: '#6366f1' },
    dueDate: { type: DataTypes.DATE, allowNull: true },
    reviewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    mastery: { type: DataTypes.INTEGER, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'study_sets',
    timestamps: true,
  });

  Flashcard = sequelize.define('Flashcard', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    studySetId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.STRING, allowNull: false },
    front: { type: DataTypes.TEXT, allowNull: false },
    back: { type: DataTypes.TEXT, allowNull: false },
    category: { type: DataTypes.STRING, defaultValue: 'General' },
    difficulty: { type: DataTypes.ENUM('easy', 'medium', 'hard'), defaultValue: 'medium' },
    reviewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    lastReviewed: { type: DataTypes.DATE, allowNull: true },
  }, {
    tableName: 'flashcards',
    timestamps: true,
  });

  StudyFile = sequelize.define('StudyFile', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.STRING, allowNull: false },
    studySetId: { type: DataTypes.INTEGER, allowNull: true },
    filename: { type: DataTypes.STRING, allowNull: false },
    originalName: { type: DataTypes.STRING, allowNull: false },
    mimetype: { type: DataTypes.STRING, allowNull: false },
    size: { type: DataTypes.INTEGER, allowNull: false },
    path: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, defaultValue: 'resource' },
  }, {
    tableName: 'study_files',
    timestamps: true,
  });

  StudySet.hasMany(Flashcard, { foreignKey: 'studySetId', as: 'flashcards' });
  StudySet.hasMany(StudyFile, { foreignKey: 'studySetId', as: 'files' });
  Flashcard.belongsTo(StudySet, { foreignKey: 'studySetId', as: 'studySet' });
  StudyFile.belongsTo(StudySet, { foreignKey: 'studySetId', as: 'studySet' });

  await sequelize.sync({ alter: config.nodeEnv !== 'production' });
  console.log('SQL models synced');

  return sequelize;
};

export { sequelize, StudySet, Flashcard, StudyFile };
