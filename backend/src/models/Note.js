import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    trim: true,
    default: ''
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [50000, 'Content cannot exceed 50000 characters']
  },
  category: {
    type: String,
    enum: ['personal', 'work', 'ideas', 'meeting', 'general'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

noteSchema.index({ user: 1, category: 1 });
noteSchema.index({ user: 1, isPinned: 1, createdAt: -1 });

export default mongoose.model('Note', noteSchema);
