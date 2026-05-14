import { UserModel } from "../../models/user.model";

export async function logMessage(
  telegramId: number,
  role: "user" | "bot",
  content: string,
): Promise<void> {
  await UserModel.findOneAndUpdate(
    { telegramId },
    {
      $push: {
        messages: {
          role,
          content,
          timestamp: new Date(),
        },
      },
    },
  );
}
