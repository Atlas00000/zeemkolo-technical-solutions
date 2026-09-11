import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

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
      <html lang="en" className={`${display.variable} ${sans.variable}`}>
        <body className="min-h-screen bg-brand-mist font-sans text-brand-ink antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
