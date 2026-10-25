import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmation } from "@/components/order-confirmation";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Your NextNova order has been placed.",
  robots: { index: false },
};

interface SuccessPageProps {
  searchParams: Promise<{ order?: string }>;
}

export default function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted" role="status">
          Loading your order…
        </div>
      }
    >
      <OrderDetails searchParams={searchParams} />
    </Suspense>
  );
}

async function OrderDetails({ searchParams }: SuccessPageProps) {
  const { order } = await searchParams;
  return <OrderConfirmation orderId={order ?? null} />;
}
