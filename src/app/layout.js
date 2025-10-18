import { Pontano_Sans } from "next/font/google";
import "./globals.css";

const pontanoSans = Pontano_Sans({
  variable: "--pontano-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Qrinyo",
  description: "A new way of ordering from qr menu",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${pontanoSans.className} bg-background-500  antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
