import { Timestamp } from "@firebase/firestore";

export type Reminder = {
  id: string;
  type: "before" | "after";
  days: number;
  status: "pending" | "sent";
  sentAt: Timestamp | null;
};
