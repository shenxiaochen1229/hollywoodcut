import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineSnapshot - 电影片场瞬间",
  description: "与你最喜欢的电影角色生成一张幕后合照。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
