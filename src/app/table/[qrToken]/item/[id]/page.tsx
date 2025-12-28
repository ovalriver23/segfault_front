"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { addItemToBasket } from "../../../../../lib/services/basketService";

// MenuItem type (matching the MenuView types)
type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  style: string | null;
  available: boolean;
  categoryId: number;
  categoryName: string;
};

type MenuTheme = 'DEFAULT' | 'MODERN' | 'ELEGANT';

// Theme configurations
const themeConfig = {
  DEFAULT: {
    gradientClass: "bg-linear-to-b from-[#F8A45A] to-[#FF8C3A]",
    headerBg: "bg-white/20",
    headerText: "text-white",
    cardBg: "bg-white",
    cardText: "text-black",
    categoryText: "text-[#a6a1a1]",
    descriptionText: "text-black",
    priceText: "text-white",
    totalPriceText: "text-[#e7429c]",
    buttonBg: "bg-[#fbd2e1]",
    buttonStroke: "#e7429c",
    addButtonBg: "bg-[#e7429c] hover:bg-[#d13888]",
    addButtonText: "text-white",
    quantityText: "text-black",
  },
  MODERN: {
    gradientClass: "bg-linear-to-b from-[#1f1f1f] to-[#2d2d2d]",
    headerBg: "bg-white/10",
    headerText: "text-white",
    cardBg: "bg-[#2d2d2d]",
    cardText: "text-white",
    categoryText: "text-gray-400",
    descriptionText: "text-gray-300",
    priceText: "text-[#ea580c]",
    totalPriceText: "text-[#ea580c]",
    buttonBg: "bg-[#ea580c]/20",
    buttonStroke: "#ea580c",
    addButtonBg: "bg-[#ea580c] hover:bg-[#c2410c]",
    addButtonText: "text-white",
    quantityText: "text-white",
  },
  ELEGANT: {
    gradientClass: "bg-linear-to-b from-[#9C6644] to-[#7f5539]",
    headerBg: "bg-white/20",
    headerText: "text-[#fdfbf7]",
    cardBg: "bg-[#fdfbf7]",
    cardText: "text-[#5c4033]",
    categoryText: "text-[#8b4513]",
    descriptionText: "text-[#5c4033]",
    priceText: "text-[#fdfbf7]",
    totalPriceText: "text-[#9C6644]",
    buttonBg: "bg-[#d2b48c]",
    buttonStroke: "#5c4033",
    addButtonBg: "bg-[#9C6644] hover:bg-[#7f5539]",
    addButtonText: "text-[#fdfbf7]",
    quantityText: "text-[#5c4033]",
  },
};

export default function MenuItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  const qrToken = params.qrToken as string;

  const [quantity, setQuantity] = useState(1);
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<MenuTheme>('DEFAULT');

  // Fetch menu item details and theme
  useEffect(() => {
    const fetchMenuItem = async () => {
      try {
        // Get the menu item from sessionStorage (set by MenuView)
        const storedItem = sessionStorage.getItem(`menuItem_${itemId}`);
        if (storedItem) {
          setMenuItem(JSON.parse(storedItem));
        }

        // First try sessionStorage, if not available fetch from API
        const storedTheme = sessionStorage.getItem('menuTheme');
        console.log('🎨 Tema sessionStorage:', storedTheme);

        if (storedTheme && ['DEFAULT', 'MODERN', 'ELEGANT'].includes(storedTheme)) {
          setTheme(storedTheme as MenuTheme);
          console.log('🎨 Tema ayarlandı (sessionStorage):', storedTheme);
        } else {
          // Fallback: fetch theme from API using qrToken
          console.log('🎨 SessionStorage boş, API\'dan çekiliyor...');
          try {
            const response = await fetch(`/api/public/table/scan?qrToken=${qrToken}`);
            if (response.ok) {
              const data = await response.json();
              const apiTheme = data.menuTheme || 'DEFAULT';
              console.log('🎨 API\'dan tema alındı:', apiTheme);
              if (['DEFAULT', 'MODERN', 'ELEGANT'].includes(apiTheme)) {
                setTheme(apiTheme as MenuTheme);
              }
            }
          } catch (apiError) {
            console.error('API tema hatası:', apiError);
          }
        }
      } catch (error) {
        console.error("Error loading menu item:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItem();
  }, [itemId, qrToken]);

  const handleBack = () => {
    // Clean up sessionStorage
    sessionStorage.removeItem(`menuItem_${itemId}`);
    router.back();
  };

  const handleAddToCart = () => {
    if (menuItem) {
      // Add to basket using the basket service
      addItemToBasket(qrToken, menuItem.id, quantity);
      // Clean up sessionStorage
      sessionStorage.removeItem(`menuItem_${itemId}`);
      // Go back to menu
      router.back();
    }
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const totalPrice = menuItem ? (menuItem.price * quantity).toFixed(2) : "0.00";
  const styles = themeConfig[theme];

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${styles.gradientClass}`}>
        <div className="loading loading-spinner loading-lg text-white"></div>
      </div>
    );
  }

  if (!menuItem) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${styles.gradientClass}`}>
        <div className="text-white text-center">
          <p className="text-xl mb-4">Ürün bulunamadı</p>
          <button
            onClick={handleBack}
            className="bg-white text-[#F8A45A] px-6 py-2 rounded-full font-semibold"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto shadow-2xl h-screen overflow-y-auto relative ${styles.cardBg}`}>
      <div className={`w-full min-h-full flex flex-col ${styles.gradientClass}`}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-[49px] shrink-0">
          <button
            onClick={handleBack}
            className={`${styles.headerBg} rounded-full w-10 h-10 flex items-center justify-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="white"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <h1 className={`${styles.headerText} text-xl font-normal`}>Detaylar</h1>
        </div>

        {/* Product Image Container */}
        <div className="mx-[18px] mt-2.5 shrink-0">
          <div className="bg-white/30 rounded-full p-10 backdrop-blur-sm">
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-lg">
              <Image
                src={menuItem.imageUrl || "/images/cappucino.webp"}
                alt={menuItem.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 90vw, 400px"
                priority
              />
            </div>
          </div>
        </div>

        {/* Price Display */}
        <div className="flex items-center justify-end px-8 mt-[17px] shrink-0">
          <div className={`${styles.priceText} text-2xl font-normal`}>
            {menuItem.price} ₺
          </div>
        </div>

        {/* Card Container */}
        <div className={`${styles.cardBg} rounded-t-[70px] shadow-2xl pt-[50px] px-9 pb-8 grow flex flex-col`}>
          {/* Product Name */}
          <h2 className={`${styles.cardText} text-[22px] font-normal mb-0.5 ${theme === 'ELEGANT' ? 'font-serif' : ''}`}>
            {menuItem.name}
          </h2>

          {/* Category */}
          <p className={`${styles.categoryText} text-[14px] font-normal mb-3`}>
            {menuItem.categoryName}
          </p>

          {/* Description */}
          <p className={`${styles.descriptionText} text-[13px] font-normal leading-[19.5px] mb-[37px]`}>
            {menuItem.description || ""}
          </p>

          {/* Spacer */}
          <div className="grow"></div>

          {/* Quantity Section */}
          <div className="mb-8">
            <h3 className={`${styles.cardText} text-[16px] font-normal mb-2.5`}>Adet</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={decreaseQuantity}
                  className={`${styles.buttonBg} rounded-full w-10 h-10 flex items-center justify-center`}
                  disabled={quantity <= 1}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke={styles.buttonStroke}
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 12h-15"
                    />
                  </svg>
                </button>
                <span className={`${styles.quantityText} text-xl font-normal w-10 text-center`}>
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  className={`${styles.buttonBg} rounded-full w-10 h-10 flex items-center justify-center`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke={styles.buttonStroke}
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </button>
              </div>

              {/* Total Price */}
              <div className="text-right">
                <p className={`${styles.categoryText} text-xs font-normal mb-1`}>Toplam</p>
                <p className={`${styles.totalPriceText} text-2xl font-normal`}>{totalPrice} ₺</p>
              </div>
            </div>
          </div>

          {/* Add to Cart Button - Only show if item is available */}
          {menuItem.available ? (
            <button
              onClick={handleAddToCart}
              className={`w-full ${styles.addButtonBg} ${styles.addButtonText} py-4 rounded-3xl text-xl font-normal transition-colors shadow-lg`}
            >
              Sepete Ekle
            </button>
          ) : (
            <div className="w-full bg-gray-300 text-gray-600 py-4 rounded-3xl text-xl font-normal text-center">
              Stokta Yok
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
