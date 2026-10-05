import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RideX - Your Ride, Your Way",
  description: "Uber Clone built with Next.js, Node.js, and MongoDB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
