"use client";

type ProgressBarProps = {
  percent: number;
};

export function ProgressBar({ percent }: ProgressBarProps) {
  const value = Math.max(0, Math.min(100, percent));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-brand-steel">
        <span>Course progress</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 bg-brand-steel/15">
        <div className="h-full bg-brand-signal" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
