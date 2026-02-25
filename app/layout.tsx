import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

import QueryProvider from "@/components/QueryProvider";
import ThemeProvider from "@/components/ThemeProvider";

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
  title: "Supersquad",
  description: "Supersquad – experiences and events",
  icons: {
    icon: "https://admin.gosupersquad.com/vite.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider>
            {children}
            <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
          </ThemeProvider>

          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </QueryProvider>
      </body>
    </html>
  );
}
