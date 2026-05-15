export enum UserState {
  WAITING_NAME = 'WAITING_NAME',
  WAITING_PHONE = 'WAITING_PHONE',
  COMPLETED = 'COMPLETED',
}

export interface IMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface IUser {
  telegramId: number;
  username?: string;
  fullName: string;
  phoneNumber: string;
  completedAt?: Date;
  state: UserState;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}
