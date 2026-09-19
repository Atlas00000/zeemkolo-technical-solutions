import { SignUp } from "@clerk/nextjs";
import { AuthEntryField } from "@/components/auth/AuthEntryField";
import { Text } from "@/design/primitives/Text";

export default function SignUpPage() {
  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-[var(--ln-page-x)] py-16">
      <AuthEntryField word="JOIN" />
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center">
        <Text variant="eyebrow" className="mb-6">
          Zeemkolo
        </Text>
        <div
          className="w-full border-t border-[var(--ln-signal)] pt-8"
          data-auth-stage
        >
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border border-[var(--ln-hairline)] bg-[var(--ln-plane)]",
              },
            }}
            forceRedirectUrl="/claim-matric"
          />
        </div>
      </div>
    </main>
  );
}
