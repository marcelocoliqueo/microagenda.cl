import type { Metadata } from "next";
import { Inter, Montserrat, Cormorant_Garamond, Dancing_Script, Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthHandler } from "@/components/AuthHandler";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"]
});
const dancing = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing"
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"]
});
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"]
});

// Force all pages to be dynamic - no static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "agenda",
    "citas",
    "reservas",
    "profesionales",
    "manicurista",
    "barbero",
    "masajista",
    "psicólogo",
    "tatuador",
  ],
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="overflow-x-hidden">
      <body className={`${inter.variable} ${montserrat.variable} ${cormorant.variable} ${dancing.variable} ${playfair.variable} ${poppins.variable} font-sans`}>
        <ThemeProvider>
          <AuthHandler />
        {children}
        <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
