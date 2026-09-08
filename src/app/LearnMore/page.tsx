'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// @ts-ignore - importing a .jsx component without TypeScript declarations
import Navbar from '../../components/Navbar';
// @ts-ignore - importing a .jsx component without TypeScript declarations
import Footer from '../../components/Footer';

export default function LearnMore() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const features = [
    {
      icon: '/images/landing/menu.svg',
      title: 'QR Menü Sistemi',
      description: 'Her masa için özel QR kodları oluşturun. Müşterileriniz telefon kamerasıyla QR kodu okutarak anında menünüze erişebilir.',
      benefits: [
        'Ürün ekleme',
        'Ürün görselleri',
        'Kategori bazlı menü düzenleme',
        'Anlık fiyat güncellemeleri'
      ]
    },
    {
      icon: '/images/landing/basket.svg',
      title: 'Sipariş Yönetimi',
      description: 'Müşterileriniz QR kodu okutarak doğrudan sipariş verebilir. Tüm siparişler gerçek zamanlı olarak sisteminize düşer.',
      benefits: [
        'Gerçek zamanlı sipariş bildirimleri',
        'Masa bazlı sipariş takibi',
        'Sipariş durumu güncelleme',
        'Sipariş geçmişi'
      ]
    },
    {
      icon: '/images/landing/stats.svg',
      title: 'Veri Analizi & Raporlama',
      description: 'Restoranınızın performansını detaylı raporlarla takip edin ve işletmenizi büyütün.',
      benefits: [
        'Günlük/haftalık/aylık satış raporları',
        'En çok satan ürün analizi',
        'Restoran yoğunluğu grafiği',
        'Müşteri tercihleri analizi',
        'Gelir takibi'
      ]
    },
    {
      icon: '/images/admin/tables-navbar.svg',
      title: 'Masa Yönetimi',
      description: 'Tüm masalarınızı tek bir panelden yönetin. Hangi masada ne sipariş var, anlık görün.',
      benefits: [
        'Masa tanımlama',
        'Her masa için özel QR kod',
        'Masa durumu takibi (boş/dolu/rezerve(Yakında))',
        'Masa bazlı hesap özeti'  
      ]
    },
    {
      icon: '/images/admin/staff-navbar.svg',
      title: 'Personel Yönetimi',
      description: 'Çalışanlarınızı sisteme ekleyin, yetkilendirin ve performanslarını takip edin.',
      benefits: [
        'Personel ekleme',
        'Garson Modülü',
        'Garsona ait etkileşimli görev paneli'
      ]
    },
    
  ];

  const faqs = [
    {
      question: 'EasyOrder nasıl çalışır?',
      answer: 'EasyOrder, restoranınızdaki her masa için benzersiz QR kodlar oluşturur. Müşterileriniz bu QR kodları okutarak menünüze erişir, sipariş verir ve garson ile ödeme yapabilir. Siz de tüm bu süreçleri web panelinizden yönetirsiniz.'
    },
    {
      question: 'Menüyü nasıl güncellerim?',
      answer: 'Web panelinizden istediğiniz zaman menünüzü güncelleyebilirsiniz. Eklediğiniz ürünler, fiyat değişiklikleri veya stok güncellemeleri anında QR menüye yansır. Fiziksel menü basmaya gerek kalmaz.'
    },
    {
      question: 'İnternet bağlantısı kesilirse ne olur?',
      answer: 'Müşteriler zaten kendi mobil verilerini kullanarak menüye erişir, bu yüzden restoranınızın WiFi\'sına bağımlı değillerdir.'
    },
    {
      question: 'Hangi ödeme yöntemlerini destekliyorsunuz?',
      answer: 'Şuanlık web siteden garson çağırarak ödeme alınabiliyor fakat web siteden direkt ödeme alınabilmesi için çalışıyoruz:)'
    },
    {
      question: 'Destek hizmeti var mı?',
      answer: 'EasyOrder kullanımına ilişkin destek seçenekleri sunulacaktır. Destek kapsamı ve iletişim kanallarıyla ilgili ayrıntılar yakında paylaşılacaktır.'
    },
    {
      question: 'Fiyatlandırma ne zaman açıklanacak?',
      answer: 'Fiyatlandırma seçeneklerimizi hazırlıyoruz. Plan ayrıntıları ve güncel bilgiler yakında web sitemizde paylaşılacaktır.'
    },
    {
      question: 'Verilerim güvende mi?',
      answer: 'Evet! Tüm verileriniz şifrelenmiş olarak bulut sunucularda saklanır. Düzenli yedekleme yapılır ve güvenlik standartlarına uygun olarak korunur. Verileriniz sadece sizin erişiminize açıktır.'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20">
        
        {/* Hero Section */}
        <div className="bg-linear-to-r from-primary-500 to-primary-600 py-20 px-4 sm:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              EasyOrder İle Neler Yapabilirsiniz?
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Restoranınızı dijital çağa taşıyacak tüm araçlar tek bir platformda. 
              İşte size sunduğumuz özellikler:
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-8 lg:px-16">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Kapsamlı Özellikler
          </h2>

          <div className="space-y-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } items-center gap-8 lg:gap-12`}
              >
                {/* Icon & Title */}
                <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
                  <div className="w-24 h-24 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      width={48}
                      height={48}
                      className="brightness-0"
                      style={{ filter: 'brightness(0)' }}
                    />
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 max-w-md">
                    {feature.description}
                  </p>
                </div>

                {/* Benefits List */}
                <div className="flex-1 bg-white rounded-2xl shadow-lg p-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Size Sunduklarımız:
                  </h4>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className="w-5 h-5 text-primary-500 mr-3 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white py-20 px-4 sm:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg">
              Merak ettiklerinizin cevapları burada
            </p>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-8">
                      {faq.question}
                    </span>
                    <svg
                      className={`w-6 h-6 text-primary-500 shrink-0 transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openFaq === index && (
                    <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
