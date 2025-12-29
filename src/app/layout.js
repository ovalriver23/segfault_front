import { Pontano_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const pontanoSans = Pontano_Sans({
  variable: "--pontano-sans",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata = {
  title: "EasyOrder",
  description: "A new way of ordering from qr menu",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EasyOrder",
  },
  icons: {
    apple: "/images/landing/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${pontanoSans.className} ${playfairDisplay.variable} bg-background-500 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
