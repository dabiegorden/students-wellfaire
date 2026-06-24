import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
//@ts-ignore
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { UserProvider } from "@/context/user-context";
import { SocketProvider } from "@/context/socket-context";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/context/language-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CUG Students Wellfare",
  description:
    "Catholic University of Ghana Students Wellfare Information System — submit complaints, get support, and stay informed.",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <UserProvider>
              <SocketProvider>
                <TooltipProvider>{children}</TooltipProvider>
              </SocketProvider>
            </UserProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
