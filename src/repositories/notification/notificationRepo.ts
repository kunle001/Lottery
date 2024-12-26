import {
  NotificationAttr,
  NotificationDoc,
  NotificationModel,
} from "../../models/notification";
import AppError from "../../shared/utils/appError";
import { IpopulateFields } from "../user/IUser";
import { INotificationRepository } from "./INotification";

export class NotificationRepo implements INotificationRepository {
  private model: NotificationModel;

  constructor(model_: NotificationModel) {
    this.model = model_;
  }

  async findById(
    id: string,
    populateFields?: IpopulateFields[]
  ): Promise<NotificationDoc | null> {
    // Implementation to fetch Notification by ID from the database
    const query = this.model.findById(id);
    if (populateFields && populateFields.length > 0) {
      populateFields.forEach((pop) => {
        const populateOptions = pop.fieldSubFields
          ? `${pop.fieldName} ${pop.fieldSubFields.join(" ")}`
          : pop.fieldName;
        query.populate(populateOptions);
      });
    }
    const Notification = await query;
    return Notification;
  }

  async findOne(
    query: Record<string, any>,
    populateFields?: IpopulateFields[]
  ): Promise<NotificationDoc | null> {
    // Implementation to fetch Notification by ID from the database

    let query_ = this.model.findOne({
      ...query,
    });

    if (populateFields && populateFields.length > 0) {
      populateFields.forEach((pop) => {
        const populateOptions = pop.fieldSubFields
          ? `${pop.fieldName} ${pop.fieldSubFields.join(" ")}`
          : pop.fieldName;
        query.populate(populateOptions);
      });
    }
    const Notification = await query_;

    return Notification!;
  }

  async findMany(
    field: string,
    value: string,
    populateFields?: IpopulateFields[]
  ): Promise<NotificationDoc[] | null> {
    // Implementation to fetch Notification by ID from the database

    let query = this.model.find({
      [field]: value,
    });

    if (populateFields && populateFields.length > 0) {
      populateFields.forEach((pop) => {
        const populateOptions = pop.fieldSubFields
          ? `${pop.fieldName} ${pop.fieldSubFields.join(" ")}`
          : pop.fieldName;
        query.populate(populateOptions);
      });
    }
    const Notification = await query;

    return Notification!;
  }

  async findAll(): Promise<NotificationDoc[]> {
    const Notification = await this.model.find();

    return Notification;
  }

  async create(data: NotificationAttr): Promise<NotificationDoc> {
    try {
      const Notification = await this.model.create(data);

      return Notification;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
  }

  async update(
    id: string,
    Notification: NotificationDoc
  ): Promise<NotificationDoc | null> {
    try {
      const Notification_ = await this.model.findByIdAndUpdate(
        id,
        Notification
      );

      return Notification_;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
    // Implementation to update a Notification in the database
  }

  async delete(id: string): Promise<boolean> {
    try {
      const Notification = await this.model.findByIdAndDelete(id);
      if (!Notification) {
        return false;
      }
      return true;
    } catch (e: any) {
      throw new AppError(e, 500);
    }
  }
}
