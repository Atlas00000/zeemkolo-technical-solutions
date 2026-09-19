import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { StoreCatalog } from "@/components/store/StoreCatalog";

export const metadata: Metadata = {
  title: "Store | Zeemkolo",
  description:
    "Lab kits and digital handbooks from Zeemkolo. Prices in NGN or USD.",
};

export default function StorePage() {
  return (
    <AppShell>
      <main>
        <StoreCatalog />
      </main>
    </AppShell>
  );
}
