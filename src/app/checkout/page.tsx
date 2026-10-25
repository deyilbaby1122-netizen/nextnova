import { CheckoutView } from "@/components/checkout-view";

export const metadata = {
  title: "Checkout",
  description: "Complete your NextNova order — shipping details and payment.",
  alternates: { canonical: "/checkout" },
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <CheckoutView />
    </div>
  );
}
