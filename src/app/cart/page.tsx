import { CartView } from "@/components/cart-view";

export const metadata = {
  title: "Your cart",
  description: "Review the technology you are about to buy on NextNova.",
  alternates: { canonical: "/cart" },
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <CartView />
    </div>
  );
}
