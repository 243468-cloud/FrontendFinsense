import type { Metadata, Viewport } from 'next';
import { Outfit, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ToastContainer } from '@/components/ui/Toast';
import { FinancialAdvisorBot } from '@/components/ui/FinancialAdvisorBot';
import { AppGuide } from '@/components/ui/AppGuide';
import { ThemeProvider } from '@/components/ThemeProvider';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { GlobalBottomSheet } from '@/components/ui/GlobalBottomSheet';

const outfit = Outfit({
 subsets: ['latin'],
 variable: '--font-syne',
 display: 'swap',
 weight: ['400', '500', '600', '700', '800', '900'],
});

const dmSans = DM_Sans({
 subsets: ['latin'],
 variable: '--font-dm',
 display: 'swap',
 weight: ['300', '400', '500', '600', '700'],
});

const jetBrainsMono = JetBrains_Mono({
 subsets: ['latin'],
 variable: '--font-mono',
 display: 'swap',
 weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
 title: {
 default: 'FinSense — Controla tu dinero',
 template: '%s | FinSense',
 },
 description:
 'Plataforma de gestión de economía personal para jóvenes de Tuxtla Gutiérrez. Metas gamificadas, gastos colaborativos y benchmarks locales.',
 keywords: [
 'finanzas personales',
 'ahorro',
 'presupuesto',
 'Tuxtla Gutiérrez',
 'Chiapas',
 'PWA',
 'metas financieras',
 ],
 authors: [{ name: 'FinSense Team' }],
 creator: 'FinSense',
 manifest: '/manifest.json',
 appleWebApp: {
 capable: true,
 statusBarStyle: 'default',
 title: 'FinSense',
 },
 openGraph: {
 type: 'website',
 title: 'FinSense — Controla tu dinero. A tu manera.',
 description: 'Gestión financiera personal para jóvenes en Tuxtla Gutiérrez, Chiapas.',
 siteName: 'FinSense',
 },
};

export const viewport: Viewport = {
 themeColor: '#0057FF',
 width: 'device-width',
 initialScale: 1,
 maximumScale: 1,
 userScalable: false,
 viewportFit: 'cover',
};

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <html
 lang="es-MX"
 className={`${outfit.variable} ${dmSans.variable} ${jetBrainsMono.variable}`}
 >
 <head>
 <link rel="apple-touch-icon" href="/icons/icon-192.png" />
 <meta name="mobile-web-app-capable" content="yes" />
 </head>
 <body className="font-dm bg-surface text-text-primary antialiased">
 <ThemeProvider>
 <div className="w-full relative min-h-screen">
 {children}
 </div>
 <ToastContainer />
 <FinancialAdvisorBot />
 <FloatingActionButton />
 <AppGuide />
 <GlobalBottomSheet />
 </ThemeProvider>
 </body>
 </html>
 );
}
