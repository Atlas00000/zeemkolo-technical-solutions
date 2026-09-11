import Link from "next/link";

type EnrollBannerProps = {
  message?: string;
};

export function EnrollBanner({
  message = "Enroll in Zeemble to reply",
}: EnrollBannerProps) {
  return (
    <div className="border border-brand-signal/40 bg-orange-50 px-4 py-4 text-sm text-brand-ink">
      <p>{message}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <Link href="/sign-up" className="bg-brand-ink px-3 py-1.5 text-white">
          Sign up
        </Link>
        <Link href="/zeemble" className="border border-brand-steel/25 px-3 py-1.5">
          Browse courses
        </Link>
      </div>
    </div>
  );
}
