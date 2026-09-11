import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  return (
    <>
      <h1 className="font-display text-4xl text-brand-ink md:text-5xl">
        Operations
      </h1>
      <p className="mt-3 max-w-2xl text-brand-steel/80">
        Matrics, consultations, orders, inventory, forum locks, and audit trail.
      </p>
      <div className="mt-10">
        <AdminDashboard />
      </div>
    </>
  );
}
