import express, { NextFunction, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import { v2 as cloudinary } from "cloudinary";
import { catchAsync } from "./catchAsync";
import fs from "fs";

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith("image") || file.mimetype.startsWith("video")) {
    cb(null, true);
  } else {
    cb(new Error("This is not an image"));
  }
};

const uploadS = multer({
  fileFilter: multerFilter,
  dest: "uploads/",
});

export const uploadMultipleFile = uploadS.fields([
  { name: "image", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

export const uploadSingleImage = multer({ dest: "uploads/" });

// Set up multer for file upload
export const upload = multer({ dest: "uploads/" });

// Define the route for uploading videos

export const uploadVideo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { file } = req;

    if (!file) {
      return next();
    }

    // Upload file to Cloudinary
    console.log("Uploading to clodinary........");
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "video",
    });

    req.body.url = result.url;

    fs.unlinkSync(file.path);
    next();
  }
);

export const uploadImage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { file } = req;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload file to Cloudinary
    await cloudinary.uploader
      .upload(file.path, { resource_type: "image" })
      .then(async (result) => {
        req.body.image = result.url;
      });

    fs.unlinkSync(file.path);
    next();
  }
);

export const uploadMultipleFiles = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files;
    if (!files) {
      next();
    }

    if (typeof files == "object") {
      const file_values: Express.Multer.File[][] = Object.values(files);

      for (let i = 0; i < file_values.length; i++) {
        let element = file_values[i];
        for (let i = 0; i < element.length; i++) {
          if (element[i].mimetype.startsWith("video")) {
            await cloudinary.uploader
              .upload(element[i].path, { resource_type: "video" })
              .then(async (result) => {
                req.body.url = result.url;
                fs.unlinkSync(element[i].path);
              });
          } else {
            await cloudinary.uploader
              .upload(element[i].path, { resource_type: "image" })
              .then(async (result) => {
                req.body.image = result.url;
                fs.unlinkSync(element[i].path);
              });
          }
        }
      }
    }
    next();
  }
);
