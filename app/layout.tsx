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
  description: "Gestiona reservas con una experiencia a la altura de tu marca. La alternativa simple a las agendas complicadas y caras. 40% más barato · 100% más fácil.",
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
    "agenda online",
    "sistema de reservas",
    "chile",
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://microagenda.cl'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: 'https://microagenda.cl',
    siteName: APP_NAME,
    title: APP_NAME,
    description: "Gestiona reservas con una experiencia a la altura de tu marca. La alternativa simple a las agendas complicadas y caras. 40% más barato · 100% más fácil.",
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: `${APP_NAME} Logo`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: "Gestiona reservas con una experiencia a la altura de tu marca. La alternativa simple a las agendas complicadas y caras.",
    images: ['/logo.png'],
  },
  icons: {
    icon: [
      // Next.js usa automáticamente app/icon.ico y app/favicon.ico
      // Estas referencias son para compatibilidad y como fallback
      { url: '/logo.png', type: 'image/png', sizes: '512x512' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/logo.png', type: 'image/png', sizes: '512x512' },
    ],
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
