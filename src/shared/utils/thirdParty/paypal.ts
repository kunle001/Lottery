import axios from "axios";
import AppError from "../appError";

interface Amount {
  value: string;
  currency: string;
}

interface Item {
  recipient_type: "EMAIL" | "PHONE" | "PAYPAL_ID";
  amount: Amount;
  note: string;
  sender_item_id: string;
  receiver: string;
  notification_language?: string;
}

interface SenderBatchHeader {
  sender_batch_id: string;
  email_subject: string;
  email_message: string;
}

interface PayoutBatch {
  sender_batch_header: SenderBatchHeader;
  items: Item[];
}

interface Amount {
  currency: string;
  value: string;
}

interface RecipientName {
  prefix: string;
  given_name: string;
  surname: string;
  middle_name: string;
  suffix: string;
  alternate_full_name: string;
  full_name: string;
}

interface SinglePayout {
  note: string;
  receiver: string;
  sender_item_id: string;
  recipient_type: "EMAIL" | "PAYPAL_ID" | "PHONE";
  amount: Amount;
  recipient_name: RecipientName;
  recipient_wallet: "PAYPAL" | "VENMO";
}

interface SenderBatchHeader {
  sender_batch_id: string;
  email_subject: string;
  email_message: string;
}

interface BatchHeaderResponse {
  sender_batch_header: SenderBatchHeader;
  payout_batch_id: string;
  batch_status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
}

const url = "https://api-m.paypal.com/v1/payments/payouts";
export class Paypal {
  public batchPayout = async (
    data: PayoutBatch
  ): Promise<BatchHeaderResponse> => {
    try {
      const resp = await axios.post<BatchHeaderResponse>(url, data);
      return resp.data;
    } catch (e) {
      console.log(e);
      throw new AppError("could not process the batch payment", 500);
    }
  };
  public singlePayout = async (data: SinglePayout) => {};
}
