import mongoose, { Schema, Document } from 'mongoose';

export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

export interface IProject extends Document {
  title: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  startDate: Date;
  dueDate: Date;
  priority: ProjectPriority;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required'],
      index: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
      validate: {
        validator: function (this: any, value: Date) {
          if (!this.startDate || !value) return true;
          return value >= this.startDate;
        },
        message: 'Due date must be after or equal to the start date',
      },
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'],
      default: 'planning',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient member querying
ProjectSchema.index({ members: 1 });

export const Project = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
