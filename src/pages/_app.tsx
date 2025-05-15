import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from 'next/font/google';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {

  return (
    <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
      <Header />
      <main className="w-full pt-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <Component {...pageProps} />
        </div>
      </main>
    </div>
  );
}
