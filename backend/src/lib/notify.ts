import Notification from "../models/notification";
import { emitToUser } from "./socket";

type NotifyInput = {
  userId: string;
  title: string;
  message?: string;
  type?: "order" | "promo" | "wallet" | "system";
  relatedId?: string;
};

// Tier 2: persist a notification and push it to the user in real time.
export const notify = async ({
  userId,
  title,
  message = "",
  type = "system",
  relatedId,
}: NotifyInput) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      relatedId,
    });
    emitToUser(userId, "notification", notification);
    return notification;
  } catch (error) {
    console.log("notify error", error);
    return null;
  }
};
