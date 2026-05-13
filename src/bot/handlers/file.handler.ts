import path from 'path';
import fs from 'fs';
import { Context } from 'telegraf';
import { Message, PhotoSize } from 'telegraf/typings/core/types/typegram';
import axios from 'axios';
import { UserModel } from '../../models/user.model';
import { UserState } from '../../types';
import { config } from '../../config';
import { logMessage } from '../helpers/log-message';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

async function downloadFile(
  fileId: string,
  destPath: string,
  ctx: Context,
): Promise<void> {
  const fileInfo = await ctx.telegram.getFile(fileId);
  const filePath = fileInfo.file_path;

  if (!filePath) {
    throw new Error('Telegram did not return a file_path');
  }

  const url = `${config.telegramApiBase}/file/bot${config.botToken}/${filePath}`;
  const response = await axios.get<NodeJS.ReadableStream>(url, {
    responseType: 'stream',
  });

  await new Promise<void>((resolve, reject) => {
    const writer = fs.createWriteStream(destPath);
    (response.data as NodeJS.ReadableStream).pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

export async function fileHandler(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const user = await UserModel.findOne({ telegramId });

  const acceptableStates = [UserState.WAITING_PAYMENT, UserState.COMPLETED];
  if (!user || !acceptableStates.includes(user.state)) {
    const replyText = 'Boshlash uchun /start yuboring.';
    await ctx.reply(replyText);
    await logMessage(telegramId, 'bot', replyText);
    return;
  }

  let fileId: string;
  let fileSize: number | undefined;
  let originalFilename: string;
  let fileType: 'photo' | 'document';

  const msg = ctx.message as
    | Message.PhotoMessage
    | Message.DocumentMessage
    | undefined;

  if (!msg) return;

  if ('photo' in msg && msg.photo && msg.photo.length > 0) {
    // Use the largest photo size
    const photos = msg.photo as PhotoSize[];
    const largest = photos.reduce((prev, curr) =>
      (curr.file_size ?? 0) > (prev.file_size ?? 0) ? curr : prev,
    );
    fileId = largest.file_id;
    fileSize = largest.file_size;
    originalFilename = `photo_${Date.now()}.jpg`;
    fileType = 'photo';
    await logMessage(telegramId, 'user', '[photo uploaded]');
  } else if ('document' in msg && msg.document) {
    const doc = msg.document;
    fileId = doc.file_id;
    fileSize = doc.file_size;
    originalFilename = doc.file_name ?? `document_${Date.now()}`;
    fileType = 'document';
    await logMessage(telegramId, 'user', `[document uploaded: ${originalFilename}]`);
  } else {
    return;
  }

  // Check file size
  if (fileSize !== undefined && fileSize > MAX_FILE_SIZE_BYTES) {
    const replyText =
      'Fayl hajmi juda katta (maksimum 5 MB). Iltimos, kichikroq fayl yuboring.';
    await ctx.reply(replyText);
    await logMessage(telegramId, 'bot', replyText);
    return;
  }

  // Ensure uploads directory exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const timestamp = Date.now();
  const safeFilename = originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const destFilename = `${telegramId}_${timestamp}_${safeFilename}`;
  const destPath = path.join(UPLOADS_DIR, destFilename);
  const relativeFilePath = path.join('uploads', destFilename);

  try {
    await downloadFile(fileId, destPath, ctx);
  } catch (err) {
    console.error('File download error:', err);
    const replyText = 'Faylni yuklab olishda xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.';
    await ctx.reply(replyText);
    await logMessage(telegramId, 'bot', replyText);
    return;
  }

  const isFirstFile = user.state === UserState.WAITING_PAYMENT;

  await UserModel.findOneAndUpdate(
    { telegramId },
    {
      $push: {
        files: { path: relativeFilePath, type: fileType, uploadedAt: new Date() },
      },
      ...(isFirstFile && {
        $set: { state: UserState.COMPLETED, completedAt: new Date() },
      }),
    },
  );

  const replyText = isFirstFile
    ? 'To\'lovingiz qabul qilindi! Rahmat. Jamoamiz tez orada ko\'rib chiqadi.'
    : 'Qo\'shimcha fayl qabul qilindi!';
  await ctx.reply(replyText);
  await logMessage(telegramId, 'bot', replyText);
}
