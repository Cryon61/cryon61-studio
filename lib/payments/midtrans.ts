import crypto from "crypto";

type MidtransItem = {
  product: {
    id: string;
    name: string;
  };
  finalPrice: number;
};

type MidtransSnapResponse = {
  token?: string;
  redirect_url?: string;
};

export async function midtrans(
  orderId: string,
  total: number,
  email: string,
  items: MidtransItem[]
): Promise<MidtransSnapResponse> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;

  if (!serverKey) {
    throw new Error("MIDTRANS_SERVER_KEY is not configured");
  }

  const isProduction =
    process.env.MIDTRANS_IS_PRODUCTION === "true";

  const baseUrl = isProduction
    ? "https://app.midtrans.com"
    : "https://app.sandbox.midtrans.com";

  const auth = Buffer.from(`${serverKey}:`).toString("base64");

  const transactionDetails = {
    order_id: orderId,
    gross_amount: total,
  };

  const itemDetails = items.map((item) => ({
    id: item.product.id,
    price: item.finalPrice,
    quantity: 1,
    name: item.product.name.slice(0, 50),
  }));

  const response = await fetch(
    `${baseUrl}/snap/v1/transactions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        transaction_details: transactionDetails,
        item_details: itemDetails,
        customer_details: {
          email,
        },
      }),
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data?.error_messages?.[0] === "string"
        ? data.error_messages[0]
        : "Midtrans transaction creation failed"
    );
  }

  return data;
}