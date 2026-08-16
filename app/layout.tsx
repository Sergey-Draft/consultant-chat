import type { Metadata } from "next";
import { Special_Elite } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

const displayFont = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Consultant Chat",
  description: "Consultant Chat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={displayFont.variable}>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}