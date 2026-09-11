import Link from "next/link";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <p className="font-display text-sm tracking-[0.2em] text-brand-signal uppercase">
        Staff
      </p>
      <h1 className="mt-3 font-display text-4xl text-brand-ink">Admin portal</h1>
      <p className="mt-3 max-w-2xl text-brand-steel/80">
        Generate matric packs, update consultation status, track orders, and adjust store stock.
      </p>
      <div className="mt-10">
        <AdminDashboard />
      </div>
      <Link
        href="/"
        className="mt-12 inline-block text-sm text-brand-signal underline-offset-2 hover:underline"
      >
        ← Back home
      </Link>
    </main>
  );
}
