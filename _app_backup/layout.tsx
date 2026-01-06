import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import "../src/app/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { NextAuthProvider } from "@/providers/NextAuthProvider";
import NotificationProvider from "@/components/NotificationProvider";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
});

export const metadata: Metadata = {
  title: "Brainbell: An Ai Assistant For Students",
  description: "Accelerate your learning with AI-powered study plans and resources",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${lexend.variable} font-sans antialiased min-h-screen bg-background`}>
        <NextAuthProvider>
          <NotificationProvider>
            {children}
            <Toaster />
          </NotificationProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
