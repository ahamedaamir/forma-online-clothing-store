import PaymentResult from "../PaymentResult";

export const metadata = {
  title: "Payment status | FORMA",
};

function parseOrderId(raw: string | string[] | undefined): string {
  if (Array.isArray(raw)) {
    return (raw[0] || "").split(",")[0].trim();
  }
  if (typeof raw === "string") {
    return raw.split(",")[0].trim();
  }
  return "";
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string | string[] }>;
}) {
  const params = await searchParams;
  const orderId = parseOrderId(params.order_id);
  return <PaymentResult mode="success" orderId={orderId} />;
}