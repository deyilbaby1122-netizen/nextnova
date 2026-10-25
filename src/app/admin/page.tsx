import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin dashboard",
  description: "Create, edit and delete products in the NextNova catalogue.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
