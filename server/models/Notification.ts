import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'task_assigned'
  | 'deadline_approaching'
  | 'task_completed'
  | 'member_added'
  | 'project_deadline'
  | 'system';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: NotificationType;
  message: string;
  relatedProject?: mongoose.Types.ObjectId;
  relatedTask?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'task_assigned',
        'deadline_approaching',
        'task_completed',
        'member_added',
        'project_deadline',
        'system',
      ],
      default: 'system',
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    relatedProject: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    relatedTask: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ recipient: 1, isRead: 1 });

export const Notification =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
