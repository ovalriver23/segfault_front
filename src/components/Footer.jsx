import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-background-500 py-8 px-4">
      {/* DaisyUI Divider at the top */}
      <div className="divider divider-neutral"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4 py-6">
          {/* Logo/Brand */}
          <div className="text-3xl md:text-4xl font-bold text-accent-500">
            Qrinyo
          </div>
          
          {/* Navigation Links */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-16 text-center md:text-left">
            <Link href="#" className="text-accent-500 hover:text-primary-500 transition-colors text-lg">
              Hakkımızda
            </Link>
            <Link href="#" className="text-accent-500 hover:text-primary-500 transition-colors text-lg">
              İletişim
            </Link>
          </div>
          
          {/* Copyright */}
          <div className="text-text-500 text-base md:text-lg">
            ©2025 Qrinyo. Tüm haklar saklıdır.
          </div>
        </div>
      </div>
    </footer>
  );
}
