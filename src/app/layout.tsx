import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Client Project Tracker",
  description:
    "Track client projects, monitor progress, and manage priorities for your digital agency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
