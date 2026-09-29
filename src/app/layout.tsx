import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aerolink · Response command",
  description:
    "Wayanad landslide response decision-support UI prototype. All operational data is simulated.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
