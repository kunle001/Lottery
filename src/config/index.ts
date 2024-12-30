import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

export const INCREMENTED_CHANCES = Number(process.env.INCREMENTED_CHANCES) || 5;
export const MAXIMUM_CHANCES = Number(process.env.MAXIMUM_CHANCES) || 5;
export const JWT_KEY = process.env.JWT_KEY || "test_key112";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
export const APP_VERSION = process.env.APP_VERSION;
export const API_BASE_URL = process.env.API_BASE_URL;
export const APP_NAME = process.env.APP_NAME || "Quizme";
export const GAME_MAX_TIME = process.env.GAME_MAX_TIME || 60;
export const QUESTIONS_PERGAME = process.env.QUESTIONS_PERGAME;
export const ADVERTS_PERGAME = process.env.ADVERTS_PERGAME;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT = process.env.PORT || "3000";
export const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME;
export const CLOUDINARY_APIKEY = process.env.CLOUDINARY_APIKEY;
export const CLOUDINARY_APISECRET = process.env.CLOUDINARY_APISECRET;
export const DB_URL = process.env.DB_URL;
export const PROD_DB_URL = process.env.PROD_DB_URL!;

const requiredEnvVariables = [
  "CLOUDINARY_NAME",
  "PORT",
  "CLOUDINARY_APIKEY",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "CLOUDINARY_APISECRET",
];

// Load environment variables from the .env file
export const loadEnvVariables = (): void => {
  const result = dotenv.config();

  if (result.error) {
    console.error("Error loading environment variables from .env file");
    process.exit(1);
  }

  // Check if each required environment variable is set
  requiredEnvVariables.forEach((envVar) => {
    const value = process.env[envVar];
    if (!value) {
      console.error(`Environment variable ${envVar} is not set.`);
      process.exit(1);
    }
  });

  console.log("All required environment variables are set successfully.");
};
