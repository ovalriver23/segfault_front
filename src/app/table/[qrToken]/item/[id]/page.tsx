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

// Theme configuration for item detail page
const themeConfig = {
  DEFAULT: {
    gradientFrom: "#F8A45A",
    gradientTo: "#FF8C3A",
    headerBtnBg: "bg-white/20",
    headerBtnStroke: "white",
    headerText: "text-white",
    imageBorderBg: "bg-white/30",
    priceText: "text-white",
    cardBg: "bg-white",
    cardRounded: "rounded-t-[70px]",
    nameText: "text-black",
    categoryText: "text-[#a6a1a1]",
    descriptionText: "text-black",
    quantityLabel: "text-black",
    quantityText: "text-black",
    decreaseBtnBg: "bg-[#fbd2e1]",
    decreaseBtnStroke: "#e7429c",
    increaseBtnBg: "bg-[#fbd2e1]",
    increaseBtnStroke: "#e7429c",
    totalLabel: "text-[#a6a1a1]",
    totalPrice: "text-[#e7429c]",
    addToCartBg: "bg-[#e7429c] hover:bg-[#d13888]",
    addToCartText: "text-white",
    outOfStockBg: "bg-gray-300",
    outOfStockText: "text-gray-600",
    pageBg: "bg-white",
  },
  MODERN: {
    gradientFrom: "#1f1f1f",
    gradientTo: "#2d2d2d",
    headerBtnBg: "bg-white/10",
    headerBtnStroke: "white",
    headerText: "text-white",
    imageBorderBg: "bg-white/10",
    priceText: "text-orange-400",
    cardBg: "bg-[#1f1f1f]",
    cardRounded: "rounded-t-[70px]",
    nameText: "text-gray-100",
    categoryText: "text-gray-400",
    descriptionText: "text-gray-300",
    quantityLabel: "text-gray-100",
    quantityText: "text-gray-100",
    decreaseBtnBg: "bg-[#ea580c]/20",
    decreaseBtnStroke: "#ea580c",
    increaseBtnBg: "bg-[#ea580c]/20",
    increaseBtnStroke: "#ea580c",
    totalLabel: "text-gray-400",
    totalPrice: "text-[#ea580c]",
    addToCartBg: "bg-[#ea580c] hover:bg-[#c2410c]",
    addToCartText: "text-white",
    outOfStockBg: "bg-gray-700",
    outOfStockText: "text-gray-400",
    pageBg: "bg-[#1f1f1f]",
  },
  ELEGANT: {
    gradientFrom: "#8b4513",
    gradientTo: "#9C6644",
    headerBtnBg: "bg-white/20",
    headerBtnStroke: "white",
    headerText: "text-white",
    imageBorderBg: "bg-white/20",
    priceText: "text-[#fdfbf7]",
    cardBg: "bg-[#f5f5dc]",
    cardRounded: "rounded-t-[70px]",
    nameText: "text-[#5c4033] font-serif",
    categoryText: "text-[#8b4513]/60",
    descriptionText: "text-[#5c4033] font-serif",
    quantityLabel: "text-[#5c4033] font-serif",
    quantityText: "text-[#5c4033]",
    decreaseBtnBg: "bg-[#d2b48c]/40",
    decreaseBtnStroke: "#8b4513",
    increaseBtnBg: "bg-[#d2b48c]/40",
    increaseBtnStroke: "#8b4513",
    totalLabel: "text-[#8b4513]/60",
    totalPrice: "text-[#8b4513]",
    addToCartBg: "bg-[#9C6644] hover:bg-[#7f5539]",
    addToCartText: "text-[#fdfbf7]",
    outOfStockBg: "bg-[#d2b48c]/50",
    outOfStockText: "text-[#8b4513]/60",
    pageBg: "bg-[#f5f5dc]",
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
        // Get the menu theme from sessionStorage
        const storedTheme = sessionStorage.getItem('menuTheme') as MenuTheme | null;
        if (storedTheme && (storedTheme === 'DEFAULT' || storedTheme === 'MODERN' || storedTheme === 'ELEGANT')) {
          setTheme(storedTheme);
        }
      } catch (error) {
        console.error("Error loading menu item:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItem();
  }, [itemId]);

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
      <div className={`fixed inset-0 z-50 max-w-md mx-auto min-h-screen flex items-center justify-center ${styles.pageBg}`} style={{ background: `linear-gradient(to bottom, ${styles.gradientFrom}, ${styles.gradientTo})` }}>
        <div className="loading loading-spinner loading-lg text-white"></div>
      </div>
    );
  }

  if (!menuItem) {
    return (
      <div className="fixed inset-0 z-50 max-w-md mx-auto min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(to bottom, ${styles.gradientFrom}, ${styles.gradientTo})` }}>
        <div className="text-white text-center">
          <p className="text-xl mb-4">Ürün bulunamadı</p>
          <button
            onClick={handleBack}
            className={`px-6 py-2 rounded-full font-semibold ${styles.cardBg} ${styles.totalPrice}`}
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 max-w-md mx-auto shadow-2xl h-screen overflow-y-auto ${styles.pageBg}`}>
      <div className="w-full min-h-full flex flex-col" style={{ background: `linear-gradient(to bottom, ${styles.gradientFrom}, ${styles.gradientTo})` }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-[49px] shrink-0">
          <button
            onClick={handleBack}
            className={`${styles.headerBtnBg} rounded-full w-10 h-10 flex items-center justify-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke={styles.headerBtnStroke}
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
          <div className={`${styles.imageBorderBg} rounded-full p-10 backdrop-blur-sm`}>
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
        <div className="flex items-center justify-end px-8 mt-917px] shrink-0">
          <div className={`${styles.priceText} text-2xl font-normal`}>
            {menuItem.price} ₺
          </div>
        </div>

        {/* White Card Container */}
        <div className={`${styles.cardBg} ${styles.cardRounded} shadow-2xl pt-[50px] px-9 pb-8 grow flex flex-col`}>
          {/* Product Name */}
          <h2 className={`${styles.nameText} text-[22px] font-normal mb-0.5`}>
            {menuItem.name}
          </h2>

          {/* Category */}
          <p className={`${styles.categoryText} text-[14px] font-normal mb-3`}>
            {menuItem.categoryName}
          </p>

          {/* Description */}
          <p className={`${styles.descriptionText} text-[13px] font-normal leading-[19.5px] mb-[37px]`}>
            {menuItem.description||""}
          </p>

          {/* Spacer */}
          <div className="grow"></div>

          {/* Quantity Section */}
          <div className="mb-8">
            <h3 className={`${styles.quantityLabel} text-[16px] font-normal mb-2.5`}>Adet</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={decreaseQuantity}
                  className={`${styles.decreaseBtnBg} rounded-full w-10 h-10 flex items-center justify-center`}
                  disabled={quantity <= 1}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke={styles.decreaseBtnStroke}
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
                  className={`${styles.increaseBtnBg} rounded-full w-10 h-10 flex items-center justify-center`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke={styles.increaseBtnStroke}
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
                <p className={`${styles.totalLabel} text-xs font-normal mb-1`}>Toplam</p>
                <p className={`${styles.totalPrice} text-2xl font-normal`}>{totalPrice} ₺</p>
              </div>
            </div>
          </div>

          {/* Add to Cart Button - Only show if item is available */}
          {menuItem.available ? (
            <button
              onClick={handleAddToCart}
              className={`w-full ${styles.addToCartBg} ${styles.addToCartText} py-4 rounded-3xl text-xl font-normal transition-colors shadow-lg`}
            >
              Sepete Ekle
            </button>
          ) : (
            <div className={`w-full ${styles.outOfStockBg} ${styles.outOfStockText} py-4 rounded-3xl text-xl font-normal text-center`}>
              Stokta Yok
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
