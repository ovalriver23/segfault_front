/* THIS PAGE WILL BE OUR LANDING PAGE */


import Image from "next/image";
import StepCard from "../components/StepCard";
import PricingCard from "../components/PricingCard";
import FeatureCard from "../components/FeatureCard";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";


export default function Home() {
  return (
    <>
      {/* NAVBAR section - shows/hides on scroll */}
      <Navbar />
      {/* Add padding to prevent content from hiding behind fixed navbar */}
      <div className="pt-16">
      
      {/* First landing section with image STARTS here*/}

      <div className="flex flex-1 flex-col justify-baseline items-center bg-[url(../../public/images/landing/landing_image.png)] bg-bottom bg-cover md:min-h-128 sm:min-h-128 px-4 sm:px-8 lg:px-16 py-8 sm:py-12 text-background-500">
        <h2 className="mx-4 mb-6 sm:mb-8 text-3xl sm:text-4xl lg:text-5xl font-bold sm:mx-8 lg:mx-16 text-center max-w-xs sm:max-w-md lg:max-w-3xl leading-tight">Her masa için tek ihtiyacınız {<br></br>}Qrinyo</h2>
        <h3 className="mx-4 sm:mx-16 lg:mx-32 mb-8 sm:mb-12 font-normal text-background-200 text-center text-base sm:text-lg lg:text-xl max-w-sm sm:max-w-2xl lg:max-w-4xl leading-relaxed">Müşterilerinizin menü ve sipariş işlemleri için yenilikçi çözüm</h3>
        <button className="rounded-2xl btn btn-outline hover:bg-primary-600 hover:border-primary-600 text-base sm:text-lg font-medium">Hemen Başla</button>
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
            description="Donec malesuada aliquam neque nec faucibus. Phasellus dictum enim eget porta bibendum. In molestie"
          />
          <FeatureCard 
            icon="/images/landing/basket.svg"
            title="Dijital menü üzerinden sipariş oluşturma"
            description="Donec malesuada aliquam neque nec faucibus. Phasellus dictum enim eget porta bibendum. In molestie"
          />
          <FeatureCard 
            icon="/images/landing/stats.svg"
            title="Restoranınız için veri analizi"
            description="Donec malesuada aliquam neque nec faucibus. Phasellus dictum enim eget porta bibendum. In molestie"
          />
        </div>

        {/* Learn More Button */}
        {/* Belki bu butona basınca tüm sistemin detaylıca anlatıldığı
            bir dokümantasyon sayfası hazırlanabilir */}
        <button className="btn bg-accent-500 text-background-500 border-2 border-background-200 hover:bg-accent-500/90 rounded-2xl px-8 text-xl font-bold">
          Learn More
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
        <h2 className="text-center text-text-500 text-4xl sm:text-5xl font-bold mb-16">
          FİYATLAR
        </h2>
        
        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-stretch gap-8 lg:gap-6 xl:gap-8 max-w-7xl mx-auto">
          <PricingCard 
            title="Free Trial"
            price="0tl"
            period="per user, per month"
            features={[
              "5 Social Profiles",
              "5 Scheduled Posts Per Profile",
              "400+ Templates",
              "Calendar View",
              "24/7 Support"
            ]}
            buttonText="Start"
            highlighted={false}
            buttonStyle="outline"
          />
          
          <PricingCard 
            title="1 Franchise"
            price="300tl"
            period="per user, per month"
            features={[
              "10 Social Profiles",
              "25 Scheduled Posts Per Profile",
              "400+ Templates",
              "Calendar View",
              "24/7 VIP Support"
            ]}
            buttonText="Learn More"
            highlighted={true}
            buttonStyle="filled"
          />
          
          <PricingCard 
            title="Multiple Restoran"
            price="1200tl"
            period="per user, per month"
            features={[
              "100 Social Profiles",
              "100 Scheduled Posts Per Profile",
              "400+ Templates",
              "Calendar View",
              "24/7 VIP Support"
            ]}
            buttonText="Start"
            highlighted={false}
            buttonStyle="outline"
          />
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
