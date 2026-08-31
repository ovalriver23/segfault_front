import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const productLinks = [
  { label: "Özellikler", href: "/#features" },
  { label: "Nasıl Çalışır?", href: "/#how-it-works" },
  { label: "Fiyatlandırma", href: "/#pricing" },
];

const companyLinks = [
  { label: "Detaylı Bilgi", href: "/LearnMore" },
  { label: "Hakkımızda & İletişim", href: "/AboutUs" },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-950 px-4 py-14 text-white sm:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="footer border-b border-white/10 pb-12 sm:footer-horizontal">
          <aside className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-400" aria-label="EasyOrder ana sayfa">
              <span className="text-3xl font-bold tracking-[-0.03em]">EasyOrder</span>
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-secondary-500" aria-hidden="true" />
            </Link>
            <p className="mt-5 leading-7 text-gray-400">QR menüden sipariş yönetimine, restoranınızın ihtiyaç duyduğu dijital deneyim tek yerde.</p>
          </aside>

          <nav>
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-gray-500">Ürün</h2>
            <ul className="mt-5 space-y-3">
              {productLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-gray-300 transition-colors hover:text-primary-400 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400">{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav>
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-gray-500">EasyOrder</h2>
            <ul className="mt-5 space-y-3">
              {companyLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-flex items-center gap-1.5 text-gray-300 transition-colors hover:text-primary-400 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400">
                    {item.label}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-7 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} EasyOrder. Tüm hakları saklıdır.</p>
          <div className="flex gap-5">
            <Link href="/log-in" className="transition-colors hover:text-gray-300">Giriş Yap</Link>
            <Link href="/sign-up" className="transition-colors hover:text-gray-300">Kayıt Ol</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
