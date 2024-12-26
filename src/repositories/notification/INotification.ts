import { NotificationAttr, NotificationDoc } from "../../models/notification";
import { IpopulateFields } from "../user/IUser";

export interface INotificationRepository {
  findById(
    id: string,
    populateFields?: IpopulateFields[]
  ): Promise<NotificationDoc | null>;
  findOne(
    query: Record<string, any>, // Corrected syntax
    populateFields?: IpopulateFields[]
  ): Promise<NotificationDoc | null>;
  findAll(): Promise<NotificationDoc[]>;
  create(Notification: NotificationAttr): Promise<NotificationDoc>;
  update(
    id: string,
    Notification: IUpdateNotification
  ): Promise<NotificationDoc | null>;
  delete(id: string): Promise<boolean>;
}

export interface IUpdateNotification {
  user?: string;
  accountNumber?: string;
  accountName?: string;
  bankCode?: string;
  paystackAccountId?: string;
}
