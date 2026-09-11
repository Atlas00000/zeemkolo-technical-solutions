import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zeemkolo Technical Solutions",
  description:
    "Engineering product development, technical consulting, and the Zeemble Program.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-brand-mist text-brand-ink antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
