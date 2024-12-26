// IUserRepository.ts

import { UserDoc } from "../../models/user";

export interface IUserRepository {
  findById(
    id: string,
    populateFields?: IpopulateFields[]
  ): Promise<UserDoc | null>;
  findOne(
    field: string,
    value: string,
    populateFields?: IpopulateFields[]
  ): Promise<UserDoc | null>;
  findAll(
    page?: number,
    pageSize?: number,
    populateFields?: IpopulateFields[]
  ): Promise<UserDoc[]>;
  create(user: UserDoc): Promise<UserDoc>;
  update(id: string, user: IUpdateUser): Promise<UserDoc | null>;
  delete(query: Record<string, any>): Promise<boolean>;
}

export interface IUpdateUser {
  email?: string;
  username?: string;
  avatar?: string;
  password?: string;
  interest?: string[];
  fullName?: string;
  ismailVerified?: boolean;
  country?: string;
  state?: string;
  zipCode?: string;
  phoneNumber?: string;
  address?: string;
  evt?: String; //email verification token
  mtExpiresAt?: Date; //mail token expiresAt
  sex?: "Male" | "Female";
  deviceId?: string;
  interests?: string[];
  prt?: string;
  tokenExpiresAt?: Date;
  twofasecret?: string;
  referalBalance?: number;
  walletBalance?: number;
  isBlocked?: boolean;
}

export interface IpopulateFields {
  fieldName: string;
  fieldSubFields?: string[];
}

export interface Isignup {
  fullName: string;
  username: string;
  email: string;
  password: string;
  zipCode: string;
  address: string;
  phoneNumber: string;
  country: string;
  deviceId: string;
  referalCode?: string;
  evt?: string;
  refereeId?: string;
  mtExpiresAt?: Date;
}

export interface ISignupResponse {
  jwt: string;
  user: UserDoc;
}

export interface IResetPassword {
  email: string;
  token: string;
  password: string;
}
