import { Schema, model, Document } from 'mongoose';
import { IUser, IMessage, IFile, UserState } from '../types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const FileSchema = new Schema<IFile>(
  {
    path: { type: String, required: true },
    type: { type: String, enum: ['photo', 'document'], required: true },
    uploadedAt: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const MessageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: ['user', 'bot'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: () => new Date(),
    },
  },
  { _id: false },
);

const UserSchema = new Schema<IUserDocument>(
  {
    telegramId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
    },
    fullName: {
      type: String,
      default: '',
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    files: {
      type: [FileSchema],
      default: [],
    },
    completedAt: {
      type: Date,
      index: true,
    },
    state: {
      type: String,
      enum: Object.values(UserState),
      default: UserState.WAITING_NAME,
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = model<IUserDocument>('User', UserSchema);
