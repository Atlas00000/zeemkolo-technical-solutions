import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { IBM_Plex_Mono, IBM_Plex_Sans, Syne } from "next/font/google";
import { clientEnv } from "@/env";
import { cn } from "@/lib/utils";
import { themeBootstrapInline } from "@/design/theme-storage";
import "./globals.css";

void clientEnv.NEXT_PUBLIC_API_URL;

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
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
      <html
        lang="en"
        suppressHydrationWarning
        className={cn(
          display.variable,
          sans.variable,
          mono.variable,
          "font-sans",
        )}
        data-theme="light"
      >
        <head>
          <script
            dangerouslySetInnerHTML={{ __html: themeBootstrapInline() }}
          />
        </head>
        <body className="min-h-screen bg-background font-sans text-foreground antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
