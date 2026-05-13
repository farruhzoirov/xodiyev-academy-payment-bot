import { Schema, model, Document } from 'mongoose';

export interface IVoucherParticipant extends Document {
  telegramId: number;
  username?: string;
  fullName: string;
  registeredAt: Date;
}

const VoucherParticipantSchema = new Schema<IVoucherParticipant>(
  {
    telegramId: { type: Number, required: true, unique: true, index: true },
    username: { type: String },
    fullName: { type: String, required: true },
    registeredAt: { type: Date, index: true },
  },
  { timestamps: true },
);

export const VoucherParticipantModel = model<IVoucherParticipant>(
  'VoucherParticipant',
  VoucherParticipantSchema,
);
