"use client";
/* THIS PAGE WILL BE OUR LANDING PAGE */

import Image from "next/image";
import { useRouter } from "next/navigation";
import StepCard from "../components/StepCard";
import PricingCard from "../components/PricingCard";
import FeatureCard from "../components/FeatureCard";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Snowfall } from "react-snowfall";

export default function Home() {
  const router = useRouter();
  const date = new Date();
  //snow will fall if the date is between 20 december and 10 january
  const isSnowFall = date.getMonth() === 11 && date.getDate() >= 20 || date.getMonth() === 0 && date.getDate() <= 10;

  return (
    <>
      {isSnowFall && <Snowfall />}
      {/* NAVBAR section - shows/hides on scroll */}
      <Navbar />
      {/* Add padding to prevent content from hiding behind fixed navbar */}
      <div className="pt-16">

        {/* First landing section with image STARTS here*/}

        <div className="flex flex-1 flex-col justify-baseline items-center bg-[url(/images/landing/landing_image.png)] bg-bottom bg-cover md:min-h-128 sm:min-h-128 px-4 sm:px-8 lg:px-16 py-8 sm:py-12 text-background-500">
          <h2 className="mx-4 mb-6 sm:mb-8 text-3xl sm:text-4xl lg:text-5xl font-bold sm:mx-8 lg:mx-16 text-center max-w-xs sm:max-w-md lg:max-w-3xl leading-tight">Her masa için tek ihtiyaç</h2>
          <h3 className="mx-4 sm:mx-16 lg:mx-32 mb-8 sm:mb-12 font-normal text-background-200 text-center text-base sm:text-lg lg:text-xl max-w-sm sm:max-w-2xl lg:max-w-4xl leading-relaxed">Müşterilerinizin menü ve sipariş süreçlerini kolaylaştıran dijital çözüm.</h3>
          <button
            type="button"
            onClick={() => router.push("/sign-up")}
            className="rounded-2xl btn btn-outline hover:bg-primary-600 hover:border-primary-600 text-base sm:text-lg font-medium"
          >
            Hemen Başla
          </button>
        </div>
        {/* First landing section with image ENDS here */}


        { /* Main Features part STARTS here  */}
        <div id="features_skeleton" className="flex flex-1 flex-col justify-center items-center py-16 px-4 sm:px-8 lg:px-16">
          <h2 id="header" className="mx-4 mb-10 text-3xl sm:text-4xl lg:text-5xl font-bold text-text-500 sm:mx-8 lg:mx-16 text-center max-w-xs sm:max-w-md lg:max-w-3xl leading-tight">
            Ana Özellikler
          </h2>


          {/* Feature Cards */}
          <div id="feature_cards" className="flex flex-col  md:flex-row gap-8 justify-center items-center w-full max-w-7xl mb-12">
            <FeatureCard
              icon="/images/landing/menu.svg"
              title="QR Menü"
              description="Her masaya özel QR kodu ile müşterileriniz menünüze kolayca erişebilir."
            />
            <FeatureCard
              icon="/images/landing/basket.svg"
              title="Dijital menü üzerinden sipariş oluşturma"
              description="Müşterileriniz QR kodu okutarak menünüze erişir ve siparişlerini kolayca oluşturabilir."
            />
            <FeatureCard
              icon="/images/landing/stats.svg"
              title="Restoranınız için veri analizi"
              description="Restoranınızın performansını artırmak için kapsamlı veri analizi ve raporlama araçları sunar."
            />
          </div>

          {/* Learn More Button */}
          {/* Belki bu butona basınca tüm sistemin detaylıca anlatıldığı
            bir dokümantasyon sayfası hazırlanabilir */}
          <button
            onClick={() => router.push('/LearnMore')}
            className="btn bg-accent-500 text-background-500 border-2 border-background-200 hover:bg-accent-500/90 rounded-2xl px-8 text-lg font-bold">
            Detaylı Bilgi
          </button>
        </div>
        { /* Main Features part ENDS here  */}


        {/* How It Works section STARTS here */}
        <div className="bg-primary-500 py-16 px-4 sm:px-8 lg:px-16">
          <h2 className="text-center text-text-500 text-4xl sm:text-5xl font-bold mb-16">
            Nasıl Çalışır?
          </h2>

          <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-12 lg:gap-8 xl:gap-16 max-w-7xl mx-auto">
            <StepCard
              stepNumber={1}
              title="PLANINI SEÇ"
              description="Restoranına/kafene en uygun planı seç ve mağaza konumunu gir."
              middleCircleVariant={4}
            />
            <StepCard
              stepNumber={2}
              title="MASALARI TANIMLA"
              description="Masa adedini gir ve her masa için özel oluşturduğumuz QR kodu masalarına yerleştir."
              middleCircleVariant={1}
            />
            <StepCard
              stepNumber={3}
              title="MENÜYÜ HAZIRLA"
              description="Farklı tarzlarla menünü istediğin şekilde hazırlayabilirsin."
              middleCircleVariant={2}
            />
            <StepCard
              stepNumber={4}
              title="HER ŞEY TAMAM"
              description="İstediğin cihazdan hesabına giriş yap ve siparişleri yönetmeye başla"
              middleCircleVariant={3}
            />
          </div>
        </div>
        {/* How It Works section ENDS here */}

        {/* Pricing section STARTS here */}
        <div className="bg-background-500 py-16 px-4 sm:px-8 lg:px-16">
          <h2 className="text-center text-text-500 text-4xl sm:text-5xl font-bold mb-4">
            FİYATLAR
          </h2>
          <p className="text-center text-text-400 text-lg mb-16 max-w-2xl mx-auto">
            İşletmenize en uygun planı seçin. Tüm planlar 14 günlük ücretsiz deneme ile başlar.
          </p>

          <div className="flex flex-col lg:flex-row justify-center items-center lg:items-stretch gap-8 lg:gap-6 xl:gap-8 max-w-7xl mx-auto">
            {/* Ücretsiz Deneme - Yakında */}
            <div className="relative opacity-60 pointer-events-none group">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500 rounded-full blur-md opacity-60 animate-pulse"></div>
                  <span className="relative flex items-center gap-2 bg-orange-500 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg border border-orange-300/50">
                    <svg className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Yakında
                  </span>
                </div>
              </div>
              <div className="pointer-events-auto opacity-100">
                <PricingCard
                  title="Ücretsiz Deneme"
                  price="₺0"
                  period="14 gün boyunca"
                  features={[
                    "Sınırsız masa tanımlama",
                    "QR menü oluşturma",
                    "Gerçek zamanlı sipariş takibi",
                    "Detaylı analiz & raporlar",
                    "Personel yönetimi",
                    "7/24 destek"
                  ]}
                  buttonText="Ücretsiz Başla"
                  highlighted={false}
                  buttonStyle="outline"
                />
              </div>
            </div>

            {/* Aylık Üyelik - Yakında */}
            <div className="relative opacity-60 pointer-events-none group">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500 rounded-full blur-md opacity-60 animate-pulse"></div>
                  <span className="relative flex items-center gap-2 bg-orange-500 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg border border-orange-300/50">
                    <svg className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Yakında
                  </span>
                </div>
              </div>
              <div className="pointer-events-auto opacity-100">
                <PricingCard
                  title="Aylık Üyelik"
                  price="₺499"
                  period="aylık"
                  features={[
                    "Sınırsız masa tanımlama",
                    "QR menü oluşturma",
                    "Gerçek zamanlı sipariş takibi",
                    "Detaylı analiz & raporlar",
                    "Personel yönetimi",
                    "7/24 destek"
                  ]}
                  buttonText="Hemen Başla"
                  highlighted={true}
                  buttonStyle="filled"
                />
              </div>
            </div>

            {/* Kurumsal / Anlaşmalı - Yakında */}
            <div className="relative opacity-60 pointer-events-none group">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500 rounded-full blur-md opacity-60 animate-pulse"></div>
                  <span className="relative flex items-center gap-2 bg-orange-500 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg border border-orange-300/50">
                    <svg className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Yakında
                  </span>
                </div>
              </div>
              <div className="pointer-events-auto opacity-100">
                <PricingCard
                  title="Kurumsal / Anlaşmalı"
                  price="Görüşelim"
                  period="özel fiyatlandırma"
                  features={[
                    "Sınırsız masa tanımlama",
                    "QR menü oluşturma",
                    "Gerçek zamanlı sipariş takibi",
                    "Detaylı analiz & raporlar",
                    "Personel yönetimi",
                    "7/24 destek"
                  ]}
                  buttonText="İletişime Geç"
                  highlighted={false}
                  buttonStyle="outline"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Pricing section ENDS here */}

        {/* Footer section STARTS here */}
        <Footer />
        {/* Footer section ENDS here */}

      </div>
    </>
  )

}
