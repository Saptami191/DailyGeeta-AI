import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar"; 
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://daily-geeta-ai.vercel.app"),
  title: "Daily Geeta | Wisdom for the Modern World",
  description: "Read the Bhagavad Gita daily in Hindi and English with AI insights.",
  openGraph: {
    title: "Daily Geeta",
    description: "Daily Bhagavad Gita verses with AI insights.",
    url: "https://daily-geeta-ai.vercel.app",
    siteName: "Daily Geeta",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-orange-50 font-sans">
          <Navbar /> 

          <main className="flex-1 pt-16">
            {children}
          </main>
          <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        </body>
      </html>
    </ClerkProvider>
  );
}