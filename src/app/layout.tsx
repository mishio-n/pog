import { Header } from "@/components/Header";
import { RaceScheduleSummaryProvider } from "@/components/RaceScheduleSummaryProvider";
import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "おうちPOG",
  description: "POG 集計アプリ",
  manifest: "/manifest.json",
  icons: [
    {
      rel: "icon",
      url: "/favicon.ico",
    },
    {
      rel: "apple-touch-icon",
      url: "/apple-touch-icon,png",
      sizes: "180x180",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: "/favicon-16x16.png",
    },
  ],
  metadataBase: new URL("https://ouchi-pog.vercel.app"),
  openGraph: {
    title: "おうちPOG",
    description: "POG 集計アプリ",
    images: "https://ouchi-pog.vercel.app/icon-256x256.png",
  },
};

export const viewport = {
  themeColor: "#374151",
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja" data-theme="cupcake">
      <body className="min-h-screen bg-slate-50">
        <div id="modal" />
        <RaceScheduleSummaryProvider>
          <Header />
        </RaceScheduleSummaryProvider>
        <main className="mx-auto max-w-3xl px-5 pt-2">{children}</main>
      </body>
    </html>
  );
};

export default RootLayout;
