/* THIS PAGE WILL BE OUR LANDING PAGE */


import Image from "next/image";
import Link from "next/link";
import StepCard from "../components/StepCard";
import PricingCard from "../components/PricingCard";
import FeatureCard from "../components/FeatureCard";
import Footer from "../components/Footer";


export default function Home() {
  return (
    <>
      {/* NAVBAR section starts here */}
      {/* TODO:make navbar visible when user scrolls up even if the user did not react at the top of the page(with animation) */}

      <div className="navbar bg-background-500 shadow-sm">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl text-accent-500 hover:shadow-none hover:bg-background-500 hover:border-background-500">Qrinyo</a>
        </div>
        <div className="flex-none">
          <Link href={"/log-in"}>
            <button className="btn btn-sm btn-outline border-primary-500 bg-primary-500 hover:bg-primary-600 hover:border-primary-600 mx-2">
              Giriş Yap
            </button>
          </Link>
          <Link href={"/sign-up"}>
            <button className="btn btn-sm btn-outline border-secondary-500 text-secondary-500 hover:bg-secondary-500 hover:text-background-500">
              <svg width="16" height="16" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.14714 3.4904C4.76642 3.4904 3.64714 4.60969 3.64714 5.9904V14.3237C3.64714 15.7044 4.76642 16.8237 6.14714 16.8237H14.4805C15.8612 16.8237 16.9805 15.7044 16.9805 14.3237V10.9904C16.9805 10.5302 17.3536 10.1571 17.8138 10.1571C18.274 10.1571 18.6471 10.5302 18.6471 10.9904V14.3237C18.6471 16.6249 16.7817 18.4904 14.4805 18.4904H6.14714C3.84595 18.4904 1.98047 16.6249 1.98047 14.3237V5.9904C1.98047 3.68921 3.84595 1.82373 6.14714 1.82373H9.48047C9.94071 1.82373 10.3138 2.19683 10.3138 2.65706C10.3138 3.1173 9.94071 3.4904 9.48047 3.4904H6.14714Z" fill="currentColor" />
                <path fillRule="evenodd" clipRule="evenodd" d="M18.4031 2.06781C18.7285 2.39325 18.7285 2.92088 18.4031 3.24632L10.9031 10.7463C10.5776 11.0718 10.05 11.0718 9.72455 10.7463C9.39911 10.4209 9.39911 9.89325 9.72455 9.56781L17.2245 2.06781C17.55 1.74237 18.0776 1.74237 18.4031 2.06781Z" fill="currentColor" />
                <path fillRule="evenodd" clipRule="evenodd" d="M11.9805 2.65706C11.9805 2.19683 12.3536 1.82373 12.8138 1.82373H17.8138C18.274 1.82373 18.6471 2.19683 18.6471 2.65706V7.65706C18.6471 8.1173 18.274 8.4904 17.8138 8.4904C17.3536 8.4904 16.9805 8.1173 16.9805 7.65706V3.4904H12.8138C12.3536 3.4904 11.9805 3.1173 11.9805 2.65706Z" fill="currentColor" />
              </svg>
              Üye Ol
            </button>
          </Link>
        </div>
      </div>
      {/*NAVBAR section ends here*/}


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

    </>
  )

}
