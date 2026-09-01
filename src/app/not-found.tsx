import { cookies } from "next/headers";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Home,
  LayoutDashboard,
  QrCode,
  SearchX,
  ShoppingBasket,
  Utensils,
} from "lucide-react";

const dashboardItems = [
  { icon: LayoutDashboard, label: "Genel" },
  { icon: QrCode, label: "Masalar" },
  { icon: Utensils, label: "Menü", active: true },
  { icon: BarChart3, label: "İstatistik" },
];

const menuItems = [
  { name: "Cheese Burger", price: "180 TL", position: "0% 0%" },
  { name: "Limonata", price: "90 TL", position: "0% 100%" },
];

export default async function NotFound() {
  const cookieStore = await cookies();
  const isLoggedIn = Boolean(cookieStore.get("JWT_TOKEN")?.value);

  return (
    <div className="min-h-screen overflow-hidden bg-gray-50 text-gray-900">
      <header className="mx-auto flex w-full max-w-7xl items-center px-5 py-6 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-500"
          aria-label="EasyOrder ana sayfa"
        >
          <span className="text-2xl font-bold tracking-[-0.03em] text-gray-950 sm:text-[1.7rem]">EasyOrder</span>
          <span
            className="mt-1 h-2.5 w-2.5 rounded-full bg-secondary-500 transition-transform motion-safe:group-hover:scale-125"
            aria-hidden="true"
          />
        </Link>
      </header>

      <main className="relative isolate px-5 pb-12 pt-5 sm:px-8 sm:pb-16 sm:pt-8 lg:px-10 lg:pt-10">
        <div className="pointer-events-none absolute -left-24 top-12 -z-10 h-64 w-64 rounded-full bg-primary-100/60 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-72 w-72 rounded-full bg-secondary-100/60 blur-3xl" aria-hidden="true" />

        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14 xl:gap-20">
          <section className="max-w-xl text-center lg:text-left" aria-labelledby="not-found-title">
            <div className="badge h-auto gap-2 border-orange-200 bg-orange-50 px-3 py-2 font-semibold text-orange-700">
              <SearchX className="h-4 w-4" aria-hidden="true" />
              404 · Sayfa bulunamadı
            </div>

            <p className="mt-6 text-sm font-bold uppercase tracking-[0.24em] text-secondary-500">Sipariş alınamadı</p>
            <h1
              id="not-found-title"
              className="mt-3 text-balance text-4xl font-bold leading-tight tracking-[-0.04em] text-gray-950 sm:text-5xl lg:text-[3.5rem]"
            >
              Bu sayfa şu an
              <span className="block text-orange-500">menüde görünmüyor.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-gray-600 lg:mx-0">
              Bağlantı değişmiş, kaldırılmış veya yanlış yazılmış olabilir. Ana sayfaya dönerek kaldığınız yerden devam edin.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/"
                className="btn h-12 min-h-12 rounded-xl border-none bg-secondary-500 px-6 text-base font-semibold text-white shadow-lg shadow-pink-200/60 hover:bg-secondary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                Ana Sayfaya Dön
              </Link>
              <Link
                href={isLoggedIn ? "/dashboard" : "/log-in"}
                className="btn h-12 min-h-12 rounded-xl border-gray-300 bg-white px-6 text-base font-semibold text-gray-700 shadow-sm hover:border-orange-300 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                {isLoggedIn ? "Panele Git" : "Giriş Yap"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>

          <div className="relative mx-auto w-full max-w-2xl pb-8 sm:pb-12" aria-hidden="true">
            <div className="card overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_28px_70px_-34px_rgba(17,24,39,0.35)]">
              <div className="flex h-14 items-center justify-between border-b border-gray-100 px-4 sm:px-5">
                <div>
                  <p className="text-[10px] text-gray-400">Yönetim Paneli</p>
                  <p className="text-sm font-bold text-gray-800">Restoranım</p>
                </div>
                <span className="badge badge-sm border-green-200 bg-green-50 font-semibold text-green-700">Çevrimiçi</span>
              </div>

              <div className="flex min-h-[390px] bg-gray-50 sm:min-h-[440px]">
                <aside className="hidden w-36 shrink-0 border-r border-gray-100 bg-white p-3 sm:block">
                  <ul className="menu w-full gap-1 p-0">
                    {dashboardItems.map(({ icon: Icon, label, active }) => (
                      <li key={label}>
                        <div className={`flex h-10 gap-2 rounded-xl px-2.5 text-xs font-semibold ${active ? "bg-orange-50 text-orange-600" : "text-gray-400"}`}>
                          <Icon className="h-4 w-4" />
                          {label}
                        </div>
                      </li>
                    ))}
                  </ul>
                </aside>

                <div className="min-w-0 flex-1 p-4 sm:p-5">
                  <div className="mb-4 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400">Bugünün özeti</p>
                      <p className="text-base font-bold text-gray-800 sm:text-lg">Genel Bakış</p>
                    </div>
                    <span className="badge badge-sm border-pink-200 bg-pink-50 text-[10px] font-semibold text-secondary-600">Canlı</span>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="stat min-w-0 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                      <div className="stat-title text-[9px] text-gray-400 sm:text-[10px]">Aktif masa</div>
                      <div className="stat-value mt-1 text-xl text-orange-500 sm:text-2xl">12</div>
                    </div>
                    <div className="stat min-w-0 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                      <div className="stat-title text-[9px] text-gray-400 sm:text-[10px]">Yeni sipariş</div>
                      <div className="stat-value mt-1 text-xl text-secondary-500 sm:text-2xl">8</div>
                    </div>
                  </div>

                  <div className="card flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-[#fffaf6] p-5 text-center shadow-sm sm:min-h-60">
                    <div>
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                        <SearchX className="h-7 w-7" strokeWidth={1.8} />
                      </div>
                      <p className="mt-4 text-4xl font-bold tracking-[-0.06em] text-gray-800">404</p>
                      <p className="mt-1 text-sm font-semibold text-gray-700">Kayıt bulunamadı</p>
                      <p className="mt-1 text-xs text-gray-400">Aradığınız sayfa bu listede yer almıyor.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card absolute -bottom-1 right-2 w-[46%] min-w-[185px] max-w-[230px] overflow-hidden rounded-[1.75rem] border-[5px] border-gray-900 bg-white shadow-[0_24px_55px_-22px_rgba(0,0,0,0.55)] sm:-bottom-2 sm:right-5 sm:border-[6px]">
              <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-gray-900" />
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] text-gray-400">Masa 12</p>
                    <p className="text-base font-bold text-gray-900">Menü</p>
                  </div>
                  <div className="btn btn-circle btn-xs border-none bg-orange-50 text-orange-600">
                    <QrCode className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="mt-3 rounded-full bg-gray-100 px-3 py-2 text-[8px] text-gray-400">Menüde ara...</div>
                <div className="mt-3 flex gap-1.5 overflow-hidden">
                  <span className="badge badge-xs border-none bg-primary-500 px-2 text-[7px] text-white">Tümü</span>
                  <span className="badge badge-xs border-none bg-primary-100 px-2 text-[7px] text-orange-700">Burger</span>
                  <span className="badge badge-xs border-none bg-primary-100 px-2 text-[7px] text-orange-700">İçecek</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {menuItems.map((item) => (
                    <div key={item.name} className="card card-compact overflow-hidden rounded-xl bg-white shadow-md">
                      <div
                        className="aspect-square bg-cover bg-no-repeat"
                        style={{
                          backgroundImage: "url('/images/landing/menu-preview-foods.png')",
                          backgroundPosition: item.position,
                          backgroundSize: "200% 200%",
                        }}
                      />
                      <div className="p-1.5">
                        <p className="truncate text-[7px] font-semibold text-gray-800">{item.name}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-[7px] font-bold text-gray-900">{item.price}</span>
                          <span className="btn btn-circle h-4 min-h-4 w-4 border-none bg-secondary-500 p-0 text-[10px] text-white">+</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary-500 px-2.5 py-2 text-white shadow-md">
                  <div>
                    <p className="text-[7px] font-semibold">2 Ürün</p>
                    <p className="text-[8px] font-bold">270 TL</p>
                  </div>
                  <ShoppingBasket className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
