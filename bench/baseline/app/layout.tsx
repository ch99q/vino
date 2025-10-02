import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vino Todo - Task Management Made Simple",
  description: "A Next.js baseline for benchmarking against Vino Todo app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
