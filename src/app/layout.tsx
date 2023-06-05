import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "おうちPOG",
  description: "POG 集計アプリ",
  manifest: "/manifest.json",
  themeColor: "#374151",
  icons: [
    {
      rel: "icon",
      url: "/favicon.ico",
    },
    {
      rel: "apple-touch-icon",
      url: "/icon,png",
    },
  ],
  openGraph: {
    title: "おうちPOG",
    description: "POG 集計アプリ",
    images: "https://ouchi-pog.vercel.app/icon-256x256.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${inter.className} min-h-[100vh]`}>
        <div className="modal" />
        {children}
      </body>
    </html>
  );
}
