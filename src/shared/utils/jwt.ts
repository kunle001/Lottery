import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_KEY } from "../../config";
export class JWT {
  static sign(data: any): string {
    const token = jwt.sign(data, JWT_KEY!, { expiresIn: JWT_EXPIRES_IN });
    return token;
  }
}
