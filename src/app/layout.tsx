import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HUP Sales App - Harcourts Ulverstone & Penguin",
  description: "Property listing automation powered by AI",
  icons: {
    icon: "https://resources.cloudhi.io/favicon/favicon-32x32.png",
    apple: "https://resources.cloudhi.io/favicon/apple-touch-icon.png",
  },
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
