import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { PageHeader } from "@/design/shells/PageHeader";

export default function AdminPage() {
  return (
    <div data-admin-dashboard>
      <PageHeader
        eyebrow="Operations"
        title="Admin desk"
        description="Matrics, consultations, orders, inventory, forum locks, and audit trail."
      />
      <div className="mt-10 border-t border-[var(--ln-signal)] pt-8">
        <AdminDashboard />
      </div>
    </div>
  );
}
