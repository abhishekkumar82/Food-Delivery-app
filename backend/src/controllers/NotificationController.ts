import { Request, Response } from "express";
import Notification from "../models/notification";

// GET /api/my/notifications -> recent notifications + unread count
const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({
      user: req.userId,
      isRead: false,
    });
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// PATCH /api/my/notifications/:id/read
const markRead = async (req: Request, res: Response) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { isRead: true }
    );
    res.status(200).json({ message: "ok" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// PATCH /api/my/notifications/read-all
const markAllRead = async (req: Request, res: Response) => {
  try {
    await Notification.updateMany(
      { user: req.userId, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ message: "ok" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

export default {
  getMyNotifications,
  markRead,
  markAllRead,
};
