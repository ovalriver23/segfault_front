/**
 * MenuView Component - Reusable Restaurant Menu Display
 * 
 * This component displays a restaurant menu with search, category filtering,
 * and shopping cart functionality.
 * 
 * Props:
 * - apiData: ApiResponse - The complete API response from /api/public/table/scan
 * 
 * Features:
 * - Sticky header with restaurant name
 * - Search functionality
 * - Category filtering with smooth scroll
 * - Shopping cart with quantity management
 * - Responsive design optimized for mobile
 * - Auto-hide search/filter on scroll
 */

"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  getBasket,
  addItemToBasket,
  updateItemQuantity as updateBasketItemQuantity,
  updateItemNote,
  updateGeneralNote,
  clearBasket,
  prepareOrderRequest,
  type Basket,
  type BasketItem
} from "../lib/services/basketService";
import CartModal from "./CartModal";

// --- API Response Types (Based on Section 9.3) ---
export type MenuItem = {
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

export type Category = {
  id: number;
  name: string;
  imageUrl: string | null;
  menuItems: MenuItem[];
  restaurantId: string;
};

export type Table = {
  id: string;
  name: string;
  qrToken: string;
  capacity: number;
  status: string;
  restaurantId: string;
};

export type ApiResponse = {
  table: Table;
  restaurantName: string;
  restaurantLocation: string;
  restaurantLatitude: number;
  restaurantLongitude: number;
  menu: Category[];
};

// --- Internal Types for UI ---
type Product = {
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

type CartItem = Product & { quantity: number };

type MenuSection = {
  categoryId: number;
  categoryName: string;
  items: Product[];
};

type CategoryFilterItem = {
  id: number;
  name: string;
  imageUrl: string | null;
}

// --- Alt Bileşenler ---

// 1. Ürün Kartı
function ProductCard({
  product,
  itemInCart,
  onAddToCart,
  onUpdateQuantity,
  qrToken,
}: {
  product: Product;
  itemInCart?: CartItem;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  qrToken: string;
}) {
  const router = useRouter();
  // Check if product is popular (you can adjust this logic based on your data)
  const isPopular = product.style === 'popular' || false; // Modify based on your actual data structure

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    
    // Don't navigate if product is not available
    if (!product.available) {
      return;
    }
    
    // Store product data in sessionStorage
    sessionStorage.setItem(`menuItem_${product.id}`, JSON.stringify(product));
    
    // Navigate to detail page
    router.push(`/table/${qrToken}/item/${product.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`relative bg-white rounded-2xl shadow-md overflow-hidden w-full transition-shadow ${
        product.available ? 'cursor-pointer hover:shadow-lg' : 'cursor-default opacity-75'
      }`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute top-2 right-2 bg-[#E8C5B8] text-gray-800 px-3 py-1 rounded-full text-xs font-medium z-10">
          Popüler
        </div>
      )}
      
      {/* Product Image */}
      <div className="w-full h-32 relative overflow-hidden">
        <Image 
          src={product.imageUrl || "/images/cappucino.webp"} 
          alt={product.name} 
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
          loading="eager"
        />
      </div>

      {/* Product Info */}
      <div className="p-3 pb-3">
        <h3 className="text-base font-semibold text-gray-900 mb-1 min-h-10 line-clamp-2 leading-snug">
          {product.name}
        </h3>
        
        {/* Price and Action */}
        <div className="flex justify-between items-center">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-gray-900">
              {product.price}
            </span>
            <span className="text-xs font-medium text-gray-500">TL</span>
          </div>
          
          {!product.available ? (
            <div className="text-red-500 text-xs font-medium px-2 py-1 bg-red-50 rounded-md">
              Tükendi
            </div>
          ) : (
            <>
              {!itemInCart ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  className="w-8 h-8 bg-pink-500 hover:bg-pink-600 rounded-xl flex items-center justify-center transition-colors shadow-md"
                >
                  <span className="text-2xl text-white font-light">+</span>
                </button>
              ) : (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center bg-pink-500 rounded-xl shadow-md h-8"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateQuantity(product.id, itemInCart.quantity - 1);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-white hover:bg-pink-600 rounded-xl transition-colors"
                  >
                    {itemInCart.quantity === 1 ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    ) : (
                      <span className="text-2xl font-light">−</span>
                    )}
                  </button>
                  <span className="px-2 text-white font-bold text-xs min-w-6 text-center">
                    {itemInCart.quantity}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateQuantity(product.id, itemInCart.quantity + 1);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-white hover:bg-pink-600 rounded-xl transition-colors"
                  >
                    <span className="text-2xl font-light">+</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// 2. Kategori Filtresi
function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: {
  categories: CategoryFilterItem[];
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
}) {
  return (
    <div className="flex space-x-4 overflow-x-auto pb-4 mb-4">
      {/* "All" butonu */}
      <button
        key="all"
        onClick={() => onSelectCategory("All")}
        className={`flex flex-col items-center shrink-0 w-20 ${
          selectedCategory !== "All" ? "opacity-70" : ""
        }`}
      >
        <div 
          className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-md mb-2 ${
            selectedCategory === "All" 
              ? "border-2 border-secondary-500"
              : ""
          }`}
          style={{ backgroundColor: selectedCategory === "All" ? "#F8A45A" : "#FFC898" }}
        >
           <Image src="/images/burger.png" alt="All" width={63} height={63} className="rounded-lg" />
        </div>
        <span className="font-semibold text-gray-800 text-sm">Tümü</span>
      </button>

      {/* Dinamik kategoriler */}
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.name)}
          className={`flex flex-col items-center shrink-0 w-20 ${
            selectedCategory !== cat.name ? "opacity-70" : ""
          }`}
        >
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-md mb-2 overflow-hidden ${
              selectedCategory === cat.name
                ? "border-2 border-secondary-500"
                : ""
            }`}
            style={{ backgroundColor: selectedCategory === cat.name ? "#F8A45A" : "#FFC898" }}
          >
            {cat.imageUrl ? (
              <div className="relative w-16 h-16">
                <Image 
                  src={cat.imageUrl} 
                  alt={cat.name} 
                  fill
                  className="mask mask-squircle object-cover" 
                />
              </div>
            ) : (
              <Image 
                src="/images/burger.png" 
                alt={cat.name} 
                width={63} 
                height={63} 
                className="mask mask-squircle" 
              />
            )}
          </div>
          <span className="font-semibold text-gray-800 text-sm">{cat.name}</span>
        </button>
      ))}
    </div>
  );
}

// 3. Sepet Özeti
function CartSummary({
  itemCount,
  totalPrice,
  onClick,
}: {
  itemCount: number;
  totalPrice: number;
  onClick: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className="bg-pink-500 text-white p-4 rounded-2xl flex justify-between items-center shadow-lg w-full hover:bg-pink-600 transition-colors"
    >
      <div className="text-left">
        <span className="font-semibold">{itemCount} Items</span>
        <p className="text-lg font-bold">Total: {totalPrice.toFixed(2)} tl</p>
      </div>
      <div className="btn btn-circle btn-lg bg-white text-pink-500 border-2 border-pink-600 hover:bg-gray-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={3}
          stroke="currentColor"
          className="w-6 h-6 rotate-180"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>
    </button>
  );
}

// --- ANA COMPONENT ---
export interface MenuViewProps {
  apiData: ApiResponse;
}

export default function MenuView({ apiData }: MenuViewProps) {
  const qrToken = apiData.table.qrToken;
  const [cart, setCart] = useState<CartItem[]>([]);
  const [generalNote, setGeneralNote] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const [isCategoryFilterVisible, setIsCategoryFilterVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // API verisini MenuSection formatına dönüştür
  const menuData: MenuSection[] = useMemo(() => {
    return apiData.menu.map(category => ({
      categoryId: category.id,
      categoryName: category.name,
      items: category.menuItems
    }));
  }, [apiData]);

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // --- Load basket from localStorage on mount ---
  useEffect(() => {
    const basket = getBasket(qrToken);
    setGeneralNote(basket.generalNote || "");
    
    // Convert basket items to cart items with product details
    const cartItems: CartItem[] = basket.items
      .map((basketItem: BasketItem) => {
        // Find the product in the menu
        for (const category of apiData.menu) {
          const product = category.menuItems.find(item => item.id === basketItem.menuItemId);
          if (product) {
            return {
              ...product,
              quantity: basketItem.quantity
            };
          }
        }
        return null;
      })
      .filter((item): item is CartItem => item !== null);
    
    setCart(cartItems);
  }, [qrToken, apiData.menu]);

  // --- Scroll Handler for Search and Category Filter Visibility ---
  useEffect(() => {
    const handleScroll = () => {
      const main = mainContainerRef.current;
      if (!main) return;

      const currentScrollY = main.scrollTop;
      const scrollDifference = currentScrollY - lastScrollY;
      
      // Always show when near the top
      if (currentScrollY < 50) {
        setIsSearchVisible(true);
        setIsCategoryFilterVisible(true);
      }
      // Show search and category filter when scrolling up significantly, hide when scrolling down
      else if (scrollDifference < -30) { // Scrolled up at least 30px
        setIsSearchVisible(true);
        setIsCategoryFilterVisible(true);
      } else if (scrollDifference > 30 && currentScrollY > 100) { // Scrolled down at least 30px
        setIsSearchVisible(false);
        setIsCategoryFilterVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    const main = mainContainerRef.current;
    if (main) {
      main.addEventListener('scroll', handleScroll, { passive: true });
      return () => main.removeEventListener('scroll', handleScroll);
    }
  }, [lastScrollY]);

  // --- Sepet İşlemleri ---
  const handleAddToCart = (product: Product) => {
    // Update localStorage
    addItemToBasket(qrToken, product.id, 1);
    
    // Update local state
    setCart((prevCart) => [...prevCart, { ...product, quantity: 1 }]);
  };
  
  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    // Update localStorage
    updateBasketItemQuantity(qrToken, productId, newQuantity);
    
    // Update local state
    if (newQuantity <= 0) {
      setCart((prevCart) =>
        prevCart.filter((item) => item.id !== productId)
      );
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleUpdateGeneralNote = (note: string) => {
    setGeneralNote(note);
  };

  const handleSubmitOrder = async () => {
    const orderData = prepareOrderRequest(qrToken);
    
    try {
      const response = await fetch('/api/public/table/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok) {
        // Clear basket and reset state
        clearBasket(qrToken);
        setCart([]);
        setGeneralNote("");
        
        // Close modal
        const modal = document.getElementById('cart_modal') as HTMLDialogElement;
        modal?.close();
        //showing with alert will be changed at next improvements.
        // Show success message
        alert(`✅ ${data.message || 'Sipariş başarıyla alındı'}\nSipariş No: ${data.orderId}`);
      } else {
        // Show error message from backend
        alert(`❌ ${data.error || 'Sipariş gönderilemedi'}`);
      }
    } catch (error) {
      alert('❌ Sipariş gönderilemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleOpenCart = () => {
    const modal = document.getElementById('cart_modal') as HTMLDialogElement;
    modal?.showModal();
  };

  // --- Doğru Kaydırma Mantığı ---
  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    const main = mainContainerRef.current;
    if (!main) return;

    const firstCategoryName = menuData[0]?.categoryName;
    if (categoryName === "All" || categoryName === firstCategoryName) {
      main.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const section = sectionRefs.current[categoryName];
    if (section) {
      const STICKY_OFFSET = 292; 
      const sectionTop = section.getBoundingClientRect().top;
      const containerTop = main.getBoundingClientRect().top;
      const currentScrollTop = main.scrollTop;
      const newScrollTop = currentScrollTop + (sectionTop - containerTop) - STICKY_OFFSET;
      main.scrollTo({ top: newScrollTop, behavior: 'smooth' });
    }
  };

  // Kategori Filtresi için Veri Türetme
  const categoriesForFilter = useMemo((): CategoryFilterItem[] => {
    return apiData.menu.map(category => ({
      id: category.id,
      name: category.name,
      imageUrl: category.imageUrl || null
    }));
  }, [apiData]); 

  // Sadece arama sorgusuna göre filtreler
  const filteredMenu = useMemo(() => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      return menuData
        .map((section) => ({
          ...section,
          items: section.items.filter((item) =>
            item.name.toLowerCase().includes(lowerQuery)
          ),
        }))
        .filter((section) => section.items.length > 0);
    }
    return menuData;
  }, [searchQuery, menuData]);

  // --- Intersection Observer for Auto-updating Category on Scroll ---
  useEffect(() => {
    const main = mainContainerRef.current;
    if (!main) return;

    const observerOptions = {
      root: main,
      rootMargin: '-100px 0px -60% 0px', // Trigger when section is in the upper 40% of the viewport
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Filter only intersecting entries and sort by position in viewport
      const visibleEntries = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => {
          return a.boundingClientRect.top - b.boundingClientRect.top;
        });

      // Select the topmost visible section
      if (visibleEntries.length > 0) {
        const categoryName = visibleEntries[0].target.getAttribute('data-category');
        if (categoryName) {
          setSelectedCategory(categoryName);
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    Object.values(sectionRefs.current).forEach(section => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, [filteredMenu]);

  // Sepet Özeti
  const cartSummary = useMemo(() => {
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return { itemCount, totalPrice };
  }, [cart]);

  const cartMap = useMemo(() => {
    return new Map(cart.map((item) => [item.id, item]));
  }, [cart]);

  // --- RENDER ---
  return (
    <div 
      ref={mainContainerRef}
      className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl h-screen overflow-y-auto relative pb-4 scroll-smooth"
    >
      {/* YAPIŞKAN BAŞLIKLAR: */}
      <header className="pt-6 pl-6 pr-6 pb-4 flex justify-between items-start sticky top-0 bg-white z-10 border-b border-gray-100">
        <h1 className="text-4xl font-bold text-gray-900 mt-2">Menü</h1>
        
        
        
        <div className="flex flex-col items-end text-right">
          <div className="flex items-center space-x-1 text-gray-800 font-bold text-lg">
            <span>{apiData.restaurantName}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-gray-400"
            >
              <path
                fillRule="evenodd"
                d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9.796 17 6.042 13.866 3 10 3S3 6.042 3 9.796c0 2.697 1.698 5.192 3.57 6.79.829.799 1.654 1.381 2.274 1.765.31.193.57.337.757.433.096.049.19.099.281.14l.018.008.006.003zM10 11.25a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-sm text-gray-500 font-medium mt-1">{apiData.table.name}</span>
        </div>
      </header>

      {/* Ana İçerik Alanı */}
      <main className="px-2">
        
        {/* Arama Çubuğu */}
        <div className={`sticky w-full top-[88px] bg-white pt-2 pb-4 z-5 h-20 transition-transform duration-300 flex justify-center ${
          isSearchVisible ? 'translate-y-0' : '-translate-y-[200%]'
        }`}>
          <label className="input input-bordered flex items-center gap-2 bg-orange-100/70 rounded-full h-14 border-none w-full scale-[0.9]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-5 h-5 opacity-70 text-orange-900"
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              className="grow bg-transparent placeholder-orange-900/60 text-[#6b3b1f]"
              placeholder="Ara"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>

        {/* Kategori Filtresi */}
        <div className={`sticky w-full top-[168px] bg-white pt-2 pb-1 z-5 h-[124px] transition-transform duration-300 ${
          isCategoryFilterVisible ? 'translate-y-0' : '-translate-y-[200%]'
        }`}>
          <CategoryFilter
            categories={categoriesForFilter}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryClick}
          />
        </div>

        {/* Menü Bölümleri */}
        <div className="space-y-8 pt-4 px-4 pb-32">
          {filteredMenu.map((section) => (
            <section
              key={section.categoryId}
              data-category={section.categoryName}
              ref={(el) => {
                sectionRefs.current[section.categoryName] = el;
              }}
            >
              <div className="relative mb-4">
                <div className="absolute left-0 right-0 top-1/2 h-0.5" style={{ backgroundColor: '#f8a45a' }} />
                <h2 className="relative inline-block bg-white pr-4 text-2xl font-normal text-gray-800" style={{ fontFamily: 'Pontano Sans, sans-serif' }}>
                  {section.categoryName}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                {section.items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    itemInCart={cartMap.get(product.id)}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleUpdateQuantity}
                    qrToken={qrToken}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Sepet Özeti (Footer) */}
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-6 z-20 max-w-md w-full transition-all duration-300 ease-in-out ${
        cartSummary.itemCount > 0 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-20 pointer-events-none'
      }`}>
        <CartSummary
          itemCount={cartSummary.itemCount}
          totalPrice={cartSummary.totalPrice}
          onClick={handleOpenCart}
        />
      </div>

      {/* Cart Modal */}
      <CartModal
        modalId="cart_modal"
        qrToken={qrToken}
        items={cart}
        generalNote={generalNote}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdateGeneralNote={handleUpdateGeneralNote}
        onSubmitOrder={handleSubmitOrder}
      />
    </div>
  );
}
