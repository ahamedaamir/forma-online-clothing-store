import PaymentResult from "../PaymentResult";

export const metadata = {
  title: "Payment status | FORMA",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id: orderId = "" } = await searchParams;
  return <PaymentResult mode="success" orderId={orderId} />;
}