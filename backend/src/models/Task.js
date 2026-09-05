import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a task title'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['personal', 'work', 'shopping', 'health', 'education', 'finance', 'other'],
    default: 'personal'
  },
  dueDate: {
    type: Date
  },
  dueTime: {
    type: String
  },
  reminder: {
    type: Boolean,
    default: false
  },
  reminderTime: {
    type: Number,
    default: 15
  },
  order: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

taskSchema.index({ user: 1, completed: 1, order: 1 });
taskSchema.index({ user: 1, dueDate: 1 });

export default mongoose.model('Task', taskSchema);