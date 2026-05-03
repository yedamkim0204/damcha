import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Nav } from "@/components/nav";

const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

const vitroCore = localFont({
  src: "../fonts/VitroCore.woff",
  variable: "--font-display",
  display: "swap",
});

const gangwonEdu = localFont({
  src: [
    { path: "../fonts/GangwonEduBold.woff", weight: "400", style: "normal" },
    { path: "../fonts/GangwonEduBold.woff", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DAMCHA",
  description: "예담의 영화 · 책 · 전시 기록",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`h-full antialiased ${pretendard.variable} ${vitroCore.variable} ${gangwonEdu.variable}`}>
      <body className="min-h-full flex flex-col font-sans">
        <Nav />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
