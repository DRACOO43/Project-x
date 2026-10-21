import mongoose, { Schema, Document } from 'mongoose';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'to_do' | 'in_progress' | 'in_review' | 'completed' | 'blocked';

export interface ITaskComment {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface ITask extends Document {
  title: string;
  description: string;
  project: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  priority: TaskPriority;
  status: TaskStatus;
  startDate?: Date;
  dueDate: Date;
  estimatedEffort?: number; // In hours
  labels: string[];
  comments: ITaskComment[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskCommentSchema = new Schema<ITaskComment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [160, 'Title cannot exceed 160 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Task must belong to a project'],
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['to_do', 'in_progress', 'in_review', 'completed', 'blocked'],
      default: 'to_do',
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    estimatedEffort: {
      type: Number,
      default: 1,
      min: 0,
    },
    labels: {
      type: [String],
      default: [],
    },
    comments: [TaskCommentSchema],
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ project: 1, status: 1 });
TaskSchema.index({ assignedTo: 1, status: 1 });

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
