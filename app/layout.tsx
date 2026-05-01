import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import DarkVeil from "@/components/ui/DarkVeil";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prepify",
  description: "An AI powered platform for preparing for mock interviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className=" dark">
      <body
        className={`${monaSans.className} antialiased pattern relative`}
      >
        <div className="fixed inset-0 -z-10 h-screen w-screen">
          <DarkVeil
            hueShift={32}
            speed={1}
            scanlineFrequency={0.5}
            warpAmount={5}
          />
        </div>
        {children}  
        <Toaster />
      </body>
    </html>
  );
}
