#!/bin/sh
url="https://api.paystack.co/transferrecipient"
authorization="Authorization: Bearer YOUR_SECRET_KEY"
content_type="Content-Type: application/json"
data='{ 
  "type": "nuban",
  "name": "Tolu Robert",
  "account_number": "01000000010",
  "bank_code": "058",
  "currency": "NGN"
}'

curl "$url" -H "$authorization" -H "$content_type" -d "$data" -X POST


{
  "status": true,
  "message": "Transfer recipient created successfully",
  "data": {
    "active": true,
    "createdAt": "2021-11-05T11:27:53.131Z",
    "currency": "NGN",
    "domain": "test",
    "id": 20317609,
    "integration": 463433,
    "name": "Tolu Robert",
    "recipient_code": "RCP_m7ljkv8leesep7p",
    "type": "nuban",
    "updatedAt": "2021-11-05T11:27:53.131Z",
    "is_deleted": false,
    "details": {
      "authorization_code": null,
      "account_number": "01000000010",
      "account_name": "Tolu Robert",
      "bank_code": "058",
      "bank_name": "Guaranty Trust Bank"
    }
  }
}


#!/bin/sh
url="https://api.paystack.co/transfer"
authorization="Authorization: Bearer YOUR_SECRET_KEY"
content_type="Content-Type: application/json"
data='{ 
  "source": "balance", 
  "reason": "Calm down", 
  "amount":3794800, "recipient": "RCP_gx2wn530m0i3w3m"
}'

curl "$url" -H "$authorization" -H "$content_type" -d "$data" -X POST