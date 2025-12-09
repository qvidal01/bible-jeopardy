import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bible Jeopardy - JW Edition",
  description: "Classic Jeopardy-style Bible trivia game with Daily Doubles and Final Jeopardy. Based on teachings from jw.org",
  keywords: ["Bible", "Jeopardy", "trivia", "game", "JW", "multiplayer"],
  authors: [{ name: "Bible Jeopardy" }],
  openGraph: {
    title: "Bible Jeopardy - JW Edition",
    description: "Play Bible trivia Jeopardy-style with friends and family!",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1e3a8a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-blue-900`}
      >
        {children}
      </body>
    </html>
  );
}
