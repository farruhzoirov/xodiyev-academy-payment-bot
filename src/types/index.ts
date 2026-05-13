export enum UserState {
  WAITING_NAME = 'WAITING_NAME',
  WAITING_PHONE = 'WAITING_PHONE',
  WAITING_PAYMENT = 'WAITING_PAYMENT',
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
  filePath: string;
  fileType: 'photo' | 'document';
  state: UserState;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}
