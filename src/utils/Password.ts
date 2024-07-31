import bcrypt from "bcrypt";

export class Password {
  static async toHash(password: string) {
    const hashedPassword = await bcrypt.hash(password, 12);
    return hashedPassword;
  }

  static async compare(hashedPassword: string, suppliedPassword: string) {
    const isMatch = await bcrypt.compare(suppliedPassword, hashedPassword);
    return isMatch;
  }
}

export function generateReferalCode(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";

  for (let index = 0; index < length; index++) {
    const element = characters[index];
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}
