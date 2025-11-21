import type { Metadata } from "next";
import { Raleway } from 'next/font/google';
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from './providers';

const raleway = Raleway({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-raleway',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: "CryptoWager - Decentralized Betting Platform",
  description: "Bet smart, win big. The ultimate crypto betting platform on Base chain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={raleway.variable}>
      <body className={raleway.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
