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

export default function MenuItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  const qrToken = params.qrToken as string;
  
  const [quantity, setQuantity] = useState(1);
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch menu item details
  useEffect(() => {
    const fetchMenuItem = async () => {
      try {
        // Get the menu item from sessionStorage (set by MenuView)
        const storedItem = sessionStorage.getItem(`menuItem_${itemId}`);
        if (storedItem) {
          setMenuItem(JSON.parse(storedItem));
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#F8A45A] to-[#FF8C3A]">
        <div className="loading loading-spinner loading-lg text-white"></div>
      </div>
    );
  }

  if (!menuItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#F8A45A] to-[#FF8C3A]">
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
    <div className="max-w-md mx-auto bg-white shadow-2xl h-screen overflow-y-auto relative">
      <div className="w-full min-h-full flex flex-col bg-linear-to-b from-[#F8A45A] to-[#FF8C3A]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-[49px] shrink-0">
          <button
            onClick={handleBack}
            className="bg-white/20 rounded-full w-10 h-10 flex items-center justify-center"
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
          <h1 className="text-white text-xl font-normal">Detaylar</h1>
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
        <div className="flex items-center justify-end px-8 mt-917px] shrink-0">
          <div className="text-white text-2xl font-normal">
            {menuItem.price} ₺
          </div>
        </div>

        {/* White Card Container */}
        <div className="bg-white rounded-t-[70px] shadow-2xl pt-[50px] px-9 pb-8 grow flex flex-col">
          {/* Product Name */}
          <h2 className="text-black text-[22px] font-normal mb-0.5">
            {menuItem.name}
          </h2>

          {/* Category */}
          <p className="text-[#a6a1a1] text-[14px] font-normal mb-3">
            {menuItem.categoryName}
          </p>

          {/* Description */}
          <p className="text-black text-[13px] font-normal leading-[19.5px] mb-[37px]">
            {menuItem.description||""}
          </p>

          {/* Spacer */}
          <div className="grow"></div>

          {/* Quantity Section */}
          <div className="mb-8">
            <h3 className="text-black text-[16px] font-normal mb-2.5">Adet</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={decreaseQuantity}
                  className="bg-[#fbd2e1] rounded-full w-10 h-10 flex items-center justify-center"
                  disabled={quantity <= 1}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke="#e7429c"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 12h-15"
                    />
                  </svg>
                </button>
                <span className="text-black text-xl font-normal w-10 text-center">
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  className="bg-[#fbd2e1] rounded-full w-10 h-10 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke="#e7429c"
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
                <p className="text-[#a6a1a1] text-xs font-normal mb-1">Toplam</p>
                <p className="text-[#e7429c] text-2xl font-normal">{totalPrice} ₺</p>
              </div>
            </div>
          </div>

          {/* Add to Cart Button - Only show if item is available */}
          {menuItem.available ? (
            <button
              onClick={handleAddToCart}
              className="w-full bg-[#e7429c] text-white py-4 rounded-3xl text-xl font-normal hover:bg-[#d13888] transition-colors shadow-lg"
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
