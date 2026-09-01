"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

const navigation = [
  { label: "Özellikler", href: "/#features" },
  { label: "Nasıl Çalışır?", href: "/#how-it-works" },
  { label: "Fiyatlandırma", href: "/#pricing" },
  { label: "Detaylı Bilgi", href: "/LearnMore" },
];

export default function Navbar({ isLoggedIn = false }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200/80 bg-white/90 backdrop-blur-xl">
      <nav className="navbar mx-auto h-20 max-w-7xl justify-between px-4 sm:px-8 lg:px-10" aria-label="Ana menü">
        <Link href="/" onClick={closeMenu} className="group inline-flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-500" aria-label="EasyOrder ana sayfa">
          <span className="text-2xl font-bold tracking-[-0.03em] text-gray-950 sm:text-[1.7rem]">EasyOrder</span>
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-secondary-500 transition-transform motion-safe:group-hover:scale-125" aria-hidden="true" />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn h-10 min-h-10 rounded-xl border-none bg-secondary-500 px-4 text-sm font-semibold text-white hover:bg-secondary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500">
              Panele Git
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link href="/log-in" className="btn btn-ghost h-10 min-h-10 rounded-xl px-4 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">
                Giriş Yap
              </Link>
              <Link href="/sign-up" className="btn h-10 min-h-10 rounded-xl border-none bg-secondary-500 px-4 text-sm font-semibold text-white hover:bg-secondary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500">
                Kayıt Ol
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </>
          )}
        </div>

        <button type="button" className="btn btn-ghost btn-square rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 lg:hidden" aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"} aria-expanded={isOpen} aria-controls="mobile-navigation" onClick={() => setIsOpen((open) => !open)}>
          {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </nav>

      <div id="mobile-navigation" className={`border-t border-gray-100 bg-white px-4 transition-[max-height,opacity] duration-300 lg:hidden ${isOpen ? "max-h-[32rem] opacity-100" : "pointer-events-none max-h-0 overflow-hidden opacity-0"}`} aria-hidden={!isOpen}>
        <div className="mx-auto max-w-7xl py-4">
          <ul className="menu menu-lg w-full gap-1 p-0">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={closeMenu} tabIndex={isOpen ? 0 : -1} className="rounded-xl px-4 py-3 text-base font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-primary-500">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-3 border-t border-gray-100 pt-4">
            {isLoggedIn ? (
              <Link href="/dashboard" onClick={closeMenu} tabIndex={isOpen ? 0 : -1} className="btn h-11 min-h-11 rounded-xl border-none bg-secondary-500 text-white hover:bg-secondary-600">
                Panele Git
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/log-in" onClick={closeMenu} tabIndex={isOpen ? 0 : -1} className="btn h-11 min-h-11 rounded-xl border-gray-300 bg-white text-gray-700 hover:bg-orange-50">Giriş Yap</Link>
                <Link href="/sign-up" onClick={closeMenu} tabIndex={isOpen ? 0 : -1} className="btn h-11 min-h-11 rounded-xl border-none bg-secondary-500 text-white hover:bg-secondary-600">Kayıt Ol</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
