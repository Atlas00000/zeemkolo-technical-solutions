import type { Metadata } from "next";
import { Activity, Gauge } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import {
  Badge,
  Button,
  Icon,
  Input,
  Surface,
  Text,
} from "@/design/primitives";
import { StateCrossfade } from "@/design/motion";
import { ActionRail, PageHeader } from "@/design/shells";
import {
  EmptyState,
  MetricStrip,
  SkeletonBlock,
  SkeletonMetric,
} from "@/design/patterns";
import {
  consultationTone,
  gateTone,
  orderTone,
  zoneTone,
} from "@/design/map/backend-status";

export const metadata: Metadata = {
  title: "UI system | Zeemkolo",
  description:
    "Ledger Noir + Signal Teal foundation reference — tokens, primitives, shells.",
};

/**
 * Foundation proof surface (UI-T09). Section product pages inherit chrome only;
 * this route demonstrates the modular design language end-to-end.
 */
export default function UiFoundationPage() {
  return (
    <AppShell
      rail={
        <ActionRail
          title="System"
          items={[
            {
              id: "tokens",
              label: "Tokens",
              hint: "Color · type · motion",
              href: "#tokens",
              active: true,
            },
            {
              id: "primitives",
              label: "Primitives",
              hint: "Surface → Badge",
              href: "#primitives",
            },
            {
              id: "backend",
              label: "Backend map",
              hint: "Zone · lifecycle · gate",
              href: "#backend",
            },
          ]}
          footer={
            <Text variant="meta">
              Foundations only — section overhauls come later.
            </Text>
          }
        />
      }
    >
      <PageHeader
        eyebrow="Design foundations"
        title="Ledger Noir + Signal Teal"
        description="Executive trading-OS language for Zeemkolo. Dark canvas, hairline structure, teal only for signal and CTA."
        actions={
          <>
            <Button variant="secondary" size="sm" asChild>
              <a href="/">Home</a>
            </Button>
            <Button size="sm" asChild>
              <a href="/store">Open store</a>
            </Button>
          </>
        }
      />

      <section id="tokens" className="mt-10 space-y-4">
        <Text variant="eyebrow">Live metrics</Text>
        <MetricStrip
          items={[
            {
              id: "orders",
              label: "Orders (demo)",
              value: 1284,
              tone: "signal",
              hint: "orderTone PAID",
            },
            {
              id: "pending",
              label: "Pending consults",
              value: 7,
              tone: "warn",
              hint: "consultationTone PENDING",
            },
            {
              id: "halt",
              label: "Blocked gates",
              value: 2,
              tone: "halt",
              hint: "gateTone halt",
            },
          ]}
        />
      </section>

      <section id="primitives" className="mt-12 grid gap-6 lg:grid-cols-2">
        <Surface>
          <Text variant="title">Primitives</Text>
          <Text variant="muted" className="mt-2">
            Surface, Text, Button, Input, Badge, Icon — compose later section
            work from these, not one-off page CSS.
          </Text>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button>Primary CTA</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Halt</Button>
          </div>
          <div className="mt-4">
            <Input placeholder="Matric or search…" aria-label="Demo input" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="signal">Allow</Badge>
            <Badge tone="warn">Pending</Badge>
            <Badge tone="halt">Blocked</Badge>
            <Badge tone="skip">Skip</Badge>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[var(--ln-signal)]">
            <Icon label="Activity">
              <Activity />
            </Icon>
            <Icon label="Gauge">
              <Gauge />
            </Icon>
            <Text variant="meta">Icon wrapper — no emoji</Text>
          </div>
        </Surface>

        <Surface variant="inset">
          <Text variant="title">Empty + skeleton</Text>
          <div className="mt-4 space-y-4">
            <EmptyState
              title="No positions in this zone"
              description="When a list is empty, show copy and optional action — never clip art."
              action={
                <Button size="sm" variant="secondary">
                  Refresh feed
                </Button>
              }
            />
            <div className="border border-[var(--ln-hairline)]">
              <SkeletonMetric />
              <SkeletonBlock className="h-16 border-t border-[var(--ln-hairline)]" />
            </div>
          </div>
        </Surface>
      </section>

      <section id="backend" className="mt-12">
        <Text variant="eyebrow">Backend ↔ UI</Text>
        <Text variant="title" className="mt-2">
          Enum → tone map
        </Text>
        <Text variant="muted" className="mt-2 max-w-xl">
          Zone (Role), lifecycle (ConsultationStatus / OrderStatus), and gate
          decisions map to visual tones. Token names match{" "}
          <code className="ln-tabular text-[var(--ln-signal)]">
            design/map/backend-status.ts
          </code>
          .
        </Text>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {(
            [
              ["PUBLIC_VISITOR", zoneTone("PUBLIC_VISITOR")],
              ["GENERAL_CUSTOMER", zoneTone("GENERAL_CUSTOMER")],
              ["ZEEMBLE_STUDENT", zoneTone("ZEEMBLE_STUDENT")],
              ["ADMIN", zoneTone("ADMIN")],
            ] as const
          ).map(([label, tone]) => (
            <StateCrossfade key={label} stateKey={label} tone={tone}>
              <Surface
                variant="flat"
                padding="sm"
                className="flex items-center justify-between"
              >
                <Text variant="meta">zone · {label}</Text>
                <Badge tone={tone}>{tone}</Badge>
              </Surface>
            </StateCrossfade>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(
            [
              ["PENDING", consultationTone("PENDING")],
              ["CONFIRMED", consultationTone("CONFIRMED")],
              ["COMPLETED", consultationTone("COMPLETED")],
              ["CANCELLED", consultationTone("CANCELLED")],
            ] as const
          ).map(([label, tone]) => (
            <Surface
              key={label}
              variant="flat"
              padding="sm"
              className="flex items-center justify-between"
            >
              <Text variant="meta">consultation · {label}</Text>
              <Badge tone={tone}>{tone}</Badge>
            </Surface>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {(
            [
              ["PAID", orderTone("PAID")],
              ["allow", gateTone("allow")],
              ["halt", gateTone("halt")],
            ] as const
          ).map(([label, tone]) => (
            <Surface
              key={label}
              variant="flat"
              padding="sm"
              className="flex items-center justify-between"
            >
              <Text variant="meta">{label}</Text>
              <Badge tone={tone}>{tone}</Badge>
            </Surface>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
