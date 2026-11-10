import { Inter, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const bn = Noto_Sans_Bengali({ variable: "--font-bn", subsets: ["bengali"], display: "swap" });

export const metadata = {
  title: { default: "Pukur Pulse", template: "%s · Pukur Pulse" },
  description: "Track Your Pond. Understand Your Farm.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${bn.variable} h-full antialiased`}>
      <body className="min-h-full bg-canvas font-sans text-ink">{children}</body>
    </html>
  );
}
