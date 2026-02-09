import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import BackgroundWrapper from '@/components/visual/BackgroundWrapper';

const inter = Inter({
  variable: "--font-geist-sans", // Keeping var name to avoid breaking globals.css
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cyber-Command Memory Simulator",
  description: "Advanced Virtual Memory Visualization System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${mono.variable} antialiased`}
      >
        {/* Background Layer */}
        <BackgroundWrapper />

        {/* Global HUD Overlay */}
        <div className="fixed inset-0 pointer-events-none z-50">
          {/* Top Left Corner */}
          <div className="absolute top-4 left-4 w-32 h-32 border-l-2 border-t-2 border-cyan-500/50 rounded-tl-xl" />
          {/* Top Right Corner */}
          <div className="absolute top-4 right-4 w-32 h-32 border-r-2 border-t-2 border-cyan-500/50 rounded-tr-xl" />
          {/* Bottom Left Corner */}
          <div className="absolute bottom-4 left-4 w-32 h-32 border-l-2 border-b-2 border-cyan-500/50 rounded-bl-xl" />
          {/* Bottom Right Corner */}
          <div className="absolute bottom-4 right-4 w-32 h-32 border-r-2 border-b-2 border-cyan-500/50 rounded-br-xl" />

          {/* Scanlines / Grid Overlay (Optional texturing) */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[51] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
        </div>

        {/* Main Content */}
        <main className="relative z-10 min-h-screen flex flex-col p-8 pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
