import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  Clock3,
  LayoutDashboard,
  QrCode,
  ShoppingBasket,
  Smartphone,
  Store,
  Users,
  Utensils,
} from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const capabilities = [
  { icon: QrCode, label: "Masaya özel QR menü" },
  { icon: Bell, label: "Anlık sipariş akışı" },
  { icon: BarChart3, label: "Restoran analitiği" },
];

const features = [
  {
    icon: Smartphone,
    eyebrow: "Müşteri deneyimi",
    title: "Sipariş vermek birkaç dokunuş kadar kolay",
    description:
      "Müşterileriniz QR kodu okutur, menüyü inceler ve siparişini doğrudan masasından oluşturur.",
    accent: "bg-orange-50 text-orange-600",
  },
  {
    icon: LayoutDashboard,
    eyebrow: "Operasyon yönetimi",
    title: "Salonun tamamı tek ekranda",
    description:
      "Masaları, sipariş durumlarını ve ekip akışını sade bir yönetim panelinden anlık olarak takip edin.",
    accent: "bg-pink-50 text-secondary-600",
  },
  {
    icon: BarChart3,
    eyebrow: "İşletme içgörüsü",
    title: "Kararlarınızı gerçek verilerle alın",
    description:
      "Yoğun saatleri, öne çıkan ürünleri ve restoran performansını anlaşılır raporlarla görün.",
    accent: "bg-amber-50 text-amber-700",
  },
];

const setupSteps = [
  {
    icon: Store,
    title: "Hesabını oluştur",
    description: "Restoran bilgilerini ekle ve işletme hesabını dakikalar içinde hazırla.",
  },
  {
    icon: Utensils,
    title: "Menünü hazırla",
    description: "Kategorilerini, ürünlerini ve tercih ettiğin menü temasını düzenle.",
  },
  {
    icon: QrCode,
    title: "QR kodları yerleştir",
    description: "Her masaya özel oluşturulan QR kodlarını indirip masalarına ekle.",
  },
  {
    icon: ShoppingBasket,
    title: "Siparişleri yönet",
    description: "Gelen siparişleri ve servis akışını tek panelden yönetmeye başla.",
  },
];

function DashboardPreview() {
  return (
    <figure className="relative mx-auto min-h-[390px] w-full max-w-[660px] sm:min-h-[470px]" aria-label="EasyOrder yönetim paneli ve QR menü önizlemesi">
      <div className="card absolute left-0 top-5 w-[88%] overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white shadow-[0_28px_70px_-30px_rgba(104,56,23,0.38)] sm:top-8">
        <div className="flex h-11 items-center justify-between border-b border-gray-100 px-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-secondary-500" />
            <span className="text-xs font-semibold text-gray-800 sm:text-sm">EasyOrder</span>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
            <span className="h-6 w-6 rounded-full bg-orange-100" />
          </div>
        </div>

        <div className="flex min-h-[285px] sm:min-h-[350px]">
          <div className="hidden w-28 shrink-0 border-r border-gray-100 bg-gray-50/70 p-3 sm:block">
            <div className="mb-5 h-7 rounded-lg bg-orange-100" />
            {["Masalar", "Menü", "İstatistik", "Personel"].map((item, index) => (
              <div key={item} className={`mb-2 rounded-lg px-2 py-2 text-[10px] ${index === 0 ? "bg-orange-50 font-semibold text-orange-600" : "text-gray-400"}`}>
                {item}
              </div>
            ))}
          </div>

          <div className="min-w-0 flex-1 bg-gray-50 p-3 sm:p-5">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[9px] text-gray-400 sm:text-[10px]">Bugünün özeti</p>
                <p className="text-sm font-bold text-gray-800 sm:text-lg">Restoran Paneli</p>
              </div>
              <span className="badge badge-xs border-green-200 bg-green-50 font-semibold text-green-700 sm:badge-sm">Açık</span>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2">
              {[
                ["12", "Aktif masa"],
                ["8", "Sipariş"],
                ["5", "Personel"],
              ].map(([value, label], index) => (
                <div key={label} className="stat min-w-0 rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm sm:p-3">
                  <div className={`mb-2 h-1 w-7 rounded-full ${index === 1 ? "bg-secondary-500" : "bg-primary-500"}`} />
                  <p className="text-base font-bold text-gray-800 sm:text-xl">{value}</p>
                  <p className="truncate text-[8px] text-gray-400 sm:text-[9px]">{label}</p>
                </div>
              ))}
            </div>

            <div className="card rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-semibold text-gray-700 sm:text-xs">Son siparişler</p>
                <span className="text-[8px] font-medium text-secondary-500 sm:text-[9px]">Tümünü gör</span>
              </div>
              {[
                ["Masa 08", "Hazırlanıyor", "₺420"],
                ["Masa 12", "Yeni sipariş", "₺285"],
                ["Masa 04", "Servise hazır", "₺190"],
              ].map(([table, status, total], index) => (
                <div key={table} className="flex items-center justify-between border-t border-gray-50 py-2 first:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${index === 0 ? "bg-primary-500" : index === 1 ? "bg-secondary-500" : "bg-green-500"}`} />
                    <span className="text-[9px] font-semibold text-gray-700 sm:text-[10px]">{table}</span>
                  </div>
                  <span className="hidden text-[8px] text-gray-400 sm:block">{status}</span>
                  <span className="text-[9px] font-semibold text-gray-700 sm:text-[10px]">{total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 w-[46%] max-w-[220px] rounded-[2rem] border-[5px] border-gray-900 bg-white p-2 shadow-[0_25px_60px_-24px_rgba(0,0,0,0.5)] sm:border-[7px] sm:p-3">
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-gray-900" />
        <div className="mb-3 flex items-start justify-between px-1">
          <div>
            <p className="text-[9px] text-gray-400">Masa 12</p>
            <p className="text-sm font-bold text-gray-800 sm:text-base">Menü</p>
          </div>
          <span className="rounded-lg bg-orange-50 p-1.5 text-orange-600">
            <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
        <div className="mb-3 rounded-full bg-gray-100 px-3 py-2 text-[8px] text-gray-400">Menüde ara...</div>
        <div className="mb-3 flex gap-1.5 overflow-hidden">
          {["Tümü", "Burger", "İçecek"].map((item, index) => (
            <span key={item} className={`badge badge-xs whitespace-nowrap border-none px-2 text-[7px] ${index === 0 ? "bg-secondary-500 text-white" : "bg-gray-100 text-gray-500"}`}>
              {item}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "Cheese Burger", price: "180", position: "0% 0%" },
            { name: "Çıtır Tavuk", price: "145", position: "100% 0%" },
            { name: "Limonata", price: "90", position: "0% 100%" },
            { name: "Cappuccino", price: "110", position: "100% 100%" },
          ].map((item) => (
            <div key={item.name} className="card card-compact overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <div
                className="aspect-square w-full bg-cover bg-no-repeat"
                style={{
                  backgroundImage: "url('/images/landing/menu-preview-foods.png')",
                  backgroundPosition: item.position,
                  backgroundSize: "200% 200%",
                }}
              />
              <div className="p-1.5">
                <p className="truncate text-[7px] font-semibold text-gray-700">{item.name}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[7px] font-bold text-gray-700">₺{item.price}</span>
                  <span className="btn btn-circle btn-xs pointer-events-none h-4 min-h-4 w-4 border-none bg-secondary-500 p-0 text-[10px] leading-none text-white">+</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary-500 px-2.5 py-2 text-white">
          <span className="text-[8px] font-semibold">2 ürün</span>
          <span className="text-[8px] font-bold">Sepeti Gör</span>
        </div>
      </div>
    </figure>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-gray-900">
      <Navbar />

      <main>
        <section className="relative isolate overflow-hidden bg-[#fffaf6] px-4 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-32 lg:px-16 lg:pb-24 lg:pt-36">
          <div className="pointer-events-none absolute -left-32 top-24 -z-10 h-80 w-80 rounded-full bg-primary-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 top-8 -z-10 h-96 w-96 rounded-full bg-secondary-100/60 blur-3xl" />

          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:gap-10 xl:gap-16">
            <div className="max-w-2xl">
              <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-[-0.03em] text-gray-950 sm:text-5xl lg:text-6xl xl:text-[4.35rem]">
                Masadan yönetime,
                <span className="block bg-linear-to-r from-primary-600 via-orange-500 to-secondary-600 bg-clip-text text-transparent">
                  siparişin en kolay hali.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600 sm:text-xl">
                EasyOrder; QR menü, dijital sipariş, masa yönetimi ve restoran analizlerini tek bir sade deneyimde buluşturur.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/sign-up" className="btn h-12 min-h-12 rounded-xl border-none bg-secondary-500 px-6 text-base font-semibold text-white shadow-lg shadow-pink-200/70 hover:bg-secondary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500">
                  Hemen Başla
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/#how-it-works" className="btn h-12 min-h-12 rounded-xl border-gray-300 bg-white px-6 text-base font-semibold text-gray-800 shadow-sm hover:border-primary-400 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">
                  Nasıl Çalışır?
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-gray-600">
                {["Kolay kurulum", "Mobil uyumlu", "Anlık takip"].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <DashboardPreview />
          </div>

          <div className="stats stats-vertical mx-auto mt-14 grid max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-orange-100 bg-white/90 shadow-sm backdrop-blur sm:stats-horizontal sm:grid-cols-3">
            {capabilities.map(({ icon: Icon, label }, index) => (
              <div key={label} className={`stat min-w-0 px-5 py-4 ${index < capabilities.length - 1 ? "border-b border-orange-100 sm:border-b-0 sm:border-r" : ""}`}>
                <div className="stat-figure m-0 text-secondary-500">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="stat-title whitespace-normal text-sm font-semibold text-gray-700">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="scroll-mt-24 px-4 py-20 sm:px-8 sm:py-24 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-secondary-600">Tek platform, iki güçlü deneyim</p>
              <h2 className="text-balance text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                Müşteriniz kolayca sipariş verir, ekibiniz anında yönetir
              </h2>
              <p className="mt-5 text-lg leading-8 text-gray-600">
                Masadaki ilk taramadan yöneticinin performans raporuna kadar tüm akış birbiriyle bağlantılı çalışır.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {features.map(({ icon: Icon, eyebrow, title, description, accent }) => (
                <article key={title} className="card rounded-3xl border border-gray-200 bg-white shadow-[0_16px_40px_-28px_rgba(17,24,39,0.35)] transition duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_22px_50px_-28px_rgba(17,24,39,0.45)]">
                  <div className="card-body gap-0 p-7 sm:p-8">
                    <div className={`mb-6 flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-2xl ${accent}`}>
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="badge badge-ghost mb-3 h-auto border-pink-100 bg-pink-50 px-3 py-1 text-xs font-bold text-secondary-600">{eyebrow}</p>
                    <h3 className="text-2xl font-bold leading-tight text-gray-900">{title}</h3>
                    <p className="mt-4 grow leading-7 text-gray-600">{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-950 px-4 py-20 text-white sm:px-8 sm:py-24 lg:px-16">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary-400">Bağlantılı sipariş akışı</p>
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Masadaki seçim, mutfağa hazır bir sipariş olarak ulaşır</h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-gray-300">
                EasyOrder müşterinin menü deneyimini, garsonun servis akışını ve yöneticinin kontrol panelini aynı sistemde buluşturur.
              </p>
              <Link href="/LearnMore" className="link link-hover mt-8 inline-flex items-center gap-2 text-base font-bold text-primary-400 hover:text-primary-300 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-400">
                Tüm özellikleri incele
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="relative grid gap-4 md:grid-cols-3">
              {[
                { icon: Smartphone, number: "01", title: "Müşteri seçer", text: "QR menüyü açar ve siparişini oluşturur." },
                { icon: Bell, number: "02", title: "Ekip haberdar olur", text: "Yeni sipariş anında servis ekranına düşer." },
                { icon: BarChart3, number: "03", title: "Yönetici izler", text: "Süreç ve performans tek panelden takip edilir." },
              ].map(({ icon: Icon, number, title, text }, index) => (
                <article key={title} className="card relative rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur">
                  {index < 2 && <ArrowRight className="absolute -right-7 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-primary-400 md:block" aria-hidden="true" />}
                  <div className="card-body gap-0 p-6">
                    <div className="mb-8 flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500 text-gray-950">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="badge badge-ghost border-white/10 bg-white/5 text-xs font-bold text-gray-400">{number}</span>
                    </div>
                    <h3 className="card-title text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-400">{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 bg-[#fffaf6] px-4 py-20 sm:px-8 sm:py-24 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 max-w-3xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-secondary-600">Nasıl çalışır?</p>
              <h2 className="text-balance text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">Dört adımda sipariş almaya başlayın</h2>
              <p className="mt-5 text-lg leading-8 text-gray-600">Teknik karmaşa olmadan restoranınızı, menünüzü ve masalarınızı hazırlayın.</p>
            </div>

            <ol className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {setupSteps.map(({ icon: Icon, title, description }, index) => (
                <li key={title} className="card relative rounded-3xl border border-orange-100 bg-white shadow-sm">
                  <div className="card-body gap-0 p-6">
                    <div className="mb-8 flex items-center justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <span className="text-3xl font-bold text-orange-100">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="card-title text-xl font-bold text-gray-900">{title}</h3>
                    <p className="mt-3 leading-7 text-gray-600">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-24 px-4 py-20 sm:px-8 sm:py-24 lg:px-16">
          <div className="hero mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-orange-200 bg-linear-to-br from-orange-50 via-white to-pink-50 px-6 py-12 text-center shadow-[0_24px_60px_-36px_rgba(225,19,131,0.45)] sm:px-12 sm:py-16">
            <div className="hero-content flex-col p-0">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-secondary-500 shadow-sm">
                <Clock3 className="h-8 w-8" aria-hidden="true" />
              </div>
              <span className="badge h-auto rounded-full border-orange-200 bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">Fiyatlandırma yakında</span>
              <h2 className="mt-1 text-balance text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">Size uygun planlar çok yakında</h2>
              <p className="max-w-2xl text-lg leading-8 text-gray-600">Fiyatlandırma seçeneklerimizi hazırlıyoruz. Detaylar yakında burada paylaşılacak.</p>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-8 sm:pb-24 lg:px-16">
          <div className="hero relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-secondary-500 px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-14">
            <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full border-[38px] border-white/10" />
            <div className="hero-content relative flex w-full max-w-none flex-col items-start justify-between gap-8 p-0 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <div className="mb-4 flex items-center gap-2 text-sm font-bold text-pink-100">
                  <Users className="h-5 w-5" aria-hidden="true" />
                  Ekibiniz için daha sade bir iş akışı
                </div>
                <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Restoranınızın sipariş deneyimini bugün yenileyin.</h2>
                <p className="mt-4 text-lg leading-8 text-pink-50">Menüden masaya, siparişten rapora kadar ihtiyaç duyduğunuz araçlar EasyOrder’da.</p>
              </div>
              <Link href="/sign-up" className="btn h-12 min-h-12 shrink-0 rounded-xl border-none bg-white px-6 text-base font-bold text-secondary-600 shadow-lg hover:bg-pink-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                Hemen Başla
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
