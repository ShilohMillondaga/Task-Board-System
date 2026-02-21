import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Board System",
  description: "A task management system with multiple boards and tasks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
