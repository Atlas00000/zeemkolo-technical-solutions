import { LoadingState } from "@/components/feedback/UiState";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <LoadingState label="Loading store…" />
    </div>
  );
}
