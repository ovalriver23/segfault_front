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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${pontanoSans.className} ${playfairDisplay.variable} bg-background-500 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
