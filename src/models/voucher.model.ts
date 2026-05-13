import { Schema, model, Document } from 'mongoose';

export interface IVoucherParticipant extends Document {
  telegramId: number;
  username?: string;
  fullName: string;
  phoneNumber: string;
  registeredAt: Date;
}

const VoucherParticipantSchema = new Schema<IVoucherParticipant>(
  {
    telegramId: { type: Number, required: true, unique: true, index: true },
    username: { type: String },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, default: '' },
    registeredAt: { type: Date },
  },
  { timestamps: true },
);

export const VoucherParticipantModel = model<IVoucherParticipant>(
  'VoucherParticipant',
  VoucherParticipantSchema,
);
