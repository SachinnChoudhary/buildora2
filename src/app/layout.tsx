import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BuildoraBot from "@/components/BuildoraBot";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buildora - Your Blueprint to Tech Excellence",
  description: "Build, Deploy, and Showcase Projects that Get You Hired.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground selection:bg-brand-purple selection:text-white font-sans flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <div className="flex-grow pt-16">
            {children}
          </div>
          <Footer />
          <BuildoraBot />
          <SpeedInsights />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
