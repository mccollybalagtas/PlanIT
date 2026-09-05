import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide an event title'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date']
  },
  startTime: {
    type: String,
    required: [true, 'Please provide a start time']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date']
  },
  endTime: {
    type: String,
    required: [true, 'Please provide an end time']
  },
  allDay: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['meeting', 'appointment', 'reminder', 'birthday', 'holiday', 'work', 'personal', 'other'],
    default: 'personal'
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  location: {
    type: String,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  reminder: {
    type: Boolean,
    default: true
  },
  reminderTime: {
    type: Number,
    default: 15
  },
  recurring: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'none'
  },
  recurringEndDate: {
    type: Date
  }
}, {
  timestamps: true
});

eventSchema.index({ user: 1, startDate: 1, startTime: 1 });
eventSchema.index({ user: 1, startDate: 1, endDate: 1 });

export default mongoose.model('Event', eventSchema);