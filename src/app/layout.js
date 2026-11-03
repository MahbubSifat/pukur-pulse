import { Inter, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

// Inter = English/UI text, Noto Sans Bengali = বাংলা ব্যাখ্যা (DBMS Explorer-এ লাগবে)
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const notoBn = Noto_Sans_Bengali({ variable: "--font-bn", subsets: ["bengali"], display: "swap" });

export const metadata = {
  title: { default: "Pukur Pulse", template: "%s · Pukur Pulse" },
  description: "Monitor Your Pond. Manage Your Costs. Maximize Your Profit.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${notoBn.variable} h-full antialiased`}>
      <body className="min-h-full bg-canvas font-sans text-ink">{children}</body>
    </html>
  );
}