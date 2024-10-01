import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { Notification } from "../models/notification";
import { sendSuccess } from "../utils/response";

export class NotificationController {
  static getUserNotification = catchAsync(
    async (req: Request, res: Response) => {
      var {
        page = "1",
        limit = "50",
        from_date,
        to_date,
        search_term,
      } = req.query;

      // Convert from_date and to_date to Date objects if they are provided as strings
      if (from_date) {
        from_date = new Date(from_date as string).toDateString();
      } else {
        // Default from_date to the first day of the current month
        from_date = new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        ).toDateString();
      }

      if (to_date) {
        to_date = new Date(to_date as string).toDateString();
      } else {
        // Default to_date to the first day of the next month
        to_date = new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          1
        ).toDateString();
      }

      // Convert page and limit to numbers
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      // Ensure valid numbers are used for pagination
      const skip = (pageNumber > 0 ? pageNumber - 1 : 0) * limitNumber;
      let query: any = {
        createdAt: {
          $gte: from_date,
          $lte: to_date,
        },
        user: req.params.id,
      };
      if (search_term) {
        const searchRegex = new RegExp(search_term as string, "i");
        query.$or = [{ message: searchRegex }];

        // If the search term can be a number, include number fields in the search as well
        const searchNumber = parseFloat(search_term as string);
        if (!isNaN(searchNumber)) {
          query.$or.push({ amount: searchNumber });
        }
      }

      const transactions = await Notification.find(query)
        .skip(skip)
        .limit(limitNumber);

      sendSuccess(res, 200, transactions);
    }
  );

  static createUserNotification = catchAsync(
    async (req: Request, res: Response) => {}
  );
}
