import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/layout/SessionProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-polysans" });

export const metadata: Metadata = {
  title: "StudyDraft — Analytics Console for Academic Reports",
  description: "Generate structured academic reports with AI-powered analytics. Upload references, generate subtopics, and export professional documents.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ff682c" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
        <SessionProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
