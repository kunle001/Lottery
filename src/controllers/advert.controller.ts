import { Request, Response } from "express";
import { Advert } from "../models/advert";
import { sendSuccess } from "../utils/response";
import { catchAsync } from "../utils/catchAsync";

export class AdvertController {
  public createAdvert = catchAsync(async (req: Request, res: Response) => {
    const advert = await Advert.create({
      ...req.body,
    });

    sendSuccess(res, 200, advert);
  });

  public createManyAdverts = catchAsync(async (req: Request, res: Response) => {
    const advert = await Advert.insertMany(req.body);

    sendSuccess(res, 200, advert);
  });

  public getAdvert = catchAsync(async (req: Request, res: Response) => {
    const advert = await Advert.findById(req.params.id).populate("view");
    sendSuccess(res, 200, advert);
  });

  public getAdverts = catchAsync(async (req: Request, res: Response) => {
    const adverts = await Advert.find();
    sendSuccess(res, 200, adverts);
  });

  public updateAdvert = catchAsync(async (req: Request, res: Response) => {
    const advert = await Advert.findByIdAndUpdate(req.params.id, {
      ...req.body,
    });
    sendSuccess(res, 200, advert);
  });

  public deleteAdvert = catchAsync(async (req: Request, res: Response) => {
    const advert = await Advert.findByIdAndDelete(req.params.id);
    sendSuccess(res, 200, advert);
  });

  public quizmePolicy = catchAsync(async (req: Request, res: Response) => {
    res.redirect("https://quizmeapp.io/privacy-policy/");
  });

  public termsAndCondition = catchAsync(async (req: Request, res: Response) => {
    res.redirect("https://quizmeapp.io/terms-and-conditions/");
  });

  public GetAdvertViews = catchAsync(async (req: Request, res: Response) => {
    const veiw = await Advert.find({
      advertId: req.params.id,
    }).populate("");

    sendSuccess(res, 200, veiw);
  });
}
