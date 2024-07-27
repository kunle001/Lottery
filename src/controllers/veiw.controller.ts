import { View } from "../models/views";
import { catchAsync } from "../utils/catchAsync";
import { Request, Response } from "express";
import { sendSuccess } from "../utils/response";
import { Advert } from "../models/advert";

export class ViewController {
  public AddView = catchAsync(async (req: Request, res: Response) => {
    const veiw = await View.create({
      advertId: req.params.id,
      user: req.currentUser!.id,
    });

    sendSuccess(res, 200, veiw);
  });
}
