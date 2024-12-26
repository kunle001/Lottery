import { IThirdPartyPayment } from "../../interfaces/payment";
import { catchAsync } from "../catchAsync";
import axios from "axios";

export interface ITransferRecipient {
  type: string;
  name: string;
  account_number: string;
  bank_code: string;
  currency: string;
}

export interface TransferRecipientResponse {
  status: boolean;
  message: string;
  data: TransferRecipientData;
}

export interface TransferRecipientDetails {
  authorization_code: string | null;
  account_number: string;
  account_name: string;
  bank_code: string;
  bank_name: string;
}

export interface TransferRecipientData {
  active: boolean;
  createdAt: string;
  currency: string;
  domain: string;
  id: number;
  integration: number;
  name: string;
  recipient_code: string;
  type: string;
  updatedAt: string;
  is_deleted: boolean;
  details: TransferRecipientDetails;
}

export interface IinitiateTransfer {
  source: string;
  reason: string;
  amount: string;
  recipient: string;
}

export interface TransferOTPResponse {
  status: boolean;
  message: string;
  data: TransferOTPData;
}

export interface TransferOTPData {
  integration: number;
  domain: string;
  amount: number;
  currency: string;
  source: string;
  reason: string;
  recipient: number;
  status: string;
  transfer_code: string;
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface NameEnquiryResponse {
  status: boolean;
  message: string;
  data: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
}

export interface NameEnquiryRequest {
  accountNumber: string;
  bankCode: string;
}

export class Paystack implements IThirdPartyPayment {
  public createTransferRecipient = async (
    data: ITransferRecipient
  ): Promise<TransferRecipientResponse> => {
    try {
      const url = "https://api.paystack.co/transferrecipient";
      const recipient = await axios.post<TransferRecipientResponse>(url, data, {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_KEY}` },
      });
      console.log(recipient.data);
      return recipient.data;
    } catch (e) {
      console.log(e);
      throw new Error("Transfer failed");
    }
  };

  public transferMoney = async (
    data: IinitiateTransfer
  ): Promise<TransferOTPResponse> => {
    try {
      const url = "https://api.paystack.co/transfer";
      const response = await axios.post<TransferOTPResponse>(url, data, {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_KEY}` },
      });
      console.log(response.data);
      return response.data;
    } catch (e) {
      console.error("Error transferring money:", e);
      throw new Error("Transfer failed");
    }
  };

  public NameEnquiry = async (
    data: NameEnquiryRequest
  ): Promise<NameEnquiryResponse> => {
    try {
      const url = `https://api.paystack.co/bank/resolve?account_number=${data.accountNumber}&bank_code=${data.bankCode}`;
      const response = await axios.get<NameEnquiryResponse>(url, {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_KEY}` },
      });
      return response.data;
    } catch (e) {
      throw new Error("Name Enquiry Failed");
    }
  };
}
