import PaymentResult from "../PaymentResult";

export const metadata = {
  title: "Payment cancelled | FORMA",
};

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id: orderId = "" } = await searchParams;
  return <PaymentResult mode="cancel" orderId={orderId} />;
}