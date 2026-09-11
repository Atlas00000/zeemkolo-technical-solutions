import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-16">
      <p className="mb-6 font-display text-sm tracking-[0.2em] text-brand-signal uppercase">
        Zeemkolo
      </p>
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none border border-brand-steel/15",
          },
        }}
        forceRedirectUrl="/claim-matric"
      />
    </main>
  );
}
