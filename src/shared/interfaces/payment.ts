import {
  IinitiateTransfer,
  ITransferRecipient,
  NameEnquiryRequest,
  NameEnquiryResponse,
  TransferOTPResponse,
  TransferRecipientResponse,
} from "../utils/thirdParty/paystack";

export interface IThirdPartyPayment {
  createTransferRecipient(
    data: ITransferRecipient
  ): Promise<TransferRecipientResponse>;
  transferMoney(data: IinitiateTransfer): Promise<TransferOTPResponse>;
  NameEnquiry(data: NameEnquiryRequest): Promise<NameEnquiryResponse>;
}
