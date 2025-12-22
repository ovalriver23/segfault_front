/**
 * MenuPreview Component - Preview-friendly Restaurant Menu Display
 * 
 * This is a variant of MenuView designed specifically for embedding inside
 * a phone mockup preview container. Unlike MenuView which uses viewport-based
 * positioning (h-screen, fixed), this component uses container-relative
 * positioning to work correctly within a bounded parent element.
 * 
 * Props:
 * - apiData: ApiResponse - The complete API response from /api/public/table/scan
 * 
 * Key differences from MenuView:
 * - Uses h-full instead of h-screen
 * - Cart summary uses absolute positioning relative to container instead of fixed
 * - All scrolling and positioning is relative to the component root
 */

"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import type { ApiResponse, MenuItem, Category } from "./MenuView";

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

// --- Sub Components ---

// 1. Product Card (Preview version - no navigation)
function ProductCard({
  product,
  itemInCart,
  onAddToCart,
  onUpdateQuantity,
}: {
  product: Product;
  itemInCart?: CartItem;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
}) {
  const isPopular = product.style === 'popular' || false;

  return (
    <div 
      className={`relative bg-white rounded-2xl shadow-md overflow-hidden w-full ${
        product.available ? '' : 'opacity-75'
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

// 2. Category Filter
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
      {/* "All" button */}
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
           <Image src="/images/burger.png" alt="All" width={63} height={63} className="mask mask-squircle rounded-lg" />
        </div>
        <span className="font-semibold text-gray-800 text-sm">Tümü</span>
      </button>

      {/* Dynamic categories */}
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
                  sizes="(max-width: 768px) 50vw, 25vw"
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

// 3. Cart Summary (Preview version - relative positioning)
function CartSummary({
  itemCount,
  totalPrice,
}: {
  itemCount: number;
  totalPrice: number;
}) {
  return (
    <div className="bg-pink-500 text-white p-4 rounded-2xl flex justify-between items-center shadow-lg w-full">
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
    </div>
  );
}

// --- MAIN COMPONENT ---
export interface MenuPreviewProps {
  apiData: ApiResponse;
}

export default function MenuPreview({ apiData }: MenuPreviewProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const [isCategoryFilterVisible, setIsCategoryFilterVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Transform API data to MenuSection format
  const menuData: MenuSection[] = useMemo(() => {
    return apiData.menu.map(category => ({
      categoryId: category.id,
      categoryName: category.name,
      items: category.menuItems
    }));
  }, [apiData]);

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- Scroll Handler for Search and Category Filter Visibility ---
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) return;

      const currentScrollY = scrollContainer.scrollTop;
      const scrollDifference = currentScrollY - lastScrollY;
      
      // Always show when near the top
      if (currentScrollY < 50) {
        setIsSearchVisible(true);
        setIsCategoryFilterVisible(true);
      }
      // Show search and category filter when scrolling up significantly, hide when scrolling down
      else if (scrollDifference < -30) {
        setIsSearchVisible(true);
        setIsCategoryFilterVisible(true);
      } else if (scrollDifference > 30 && currentScrollY > 100) {
        setIsSearchVisible(false);
        setIsCategoryFilterVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [lastScrollY]);

  // --- Cart Operations (Preview only - no persistence) ---
  const handleAddToCart = (product: Product) => {
    if (!product.available) {
      return;
    }
    setCart((prevCart) => [...prevCart, { ...product, quantity: 1 }]);
  };
  
  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
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

  // --- Scroll to Category ---
  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const firstCategoryName = menuData[0]?.categoryName;
    if (categoryName === "All" || categoryName === firstCategoryName) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const section = sectionRefs.current[categoryName];
    if (section) {
      const STICKY_OFFSET = 292; 
      const sectionTop = section.getBoundingClientRect().top;
      const containerTop = scrollContainer.getBoundingClientRect().top;
      const currentScrollTop = scrollContainer.scrollTop;
      const newScrollTop = currentScrollTop + (sectionTop - containerTop) - STICKY_OFFSET;
      scrollContainer.scrollTo({ top: newScrollTop, behavior: 'smooth' });
    }
  };

  // Category Filter Data
  const categoriesForFilter = useMemo((): CategoryFilterItem[] => {
    return apiData.menu.map(category => ({
      id: category.id,
      name: category.name,
      imageUrl: category.imageUrl || null
    }));
  }, [apiData]); 

  // Filter by search query only
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
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const observerOptions = {
      root: scrollContainer,
      rootMargin: '-100px 0px -60% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const visibleEntries = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => {
          return a.boundingClientRect.top - b.boundingClientRect.top;
        });

      if (visibleEntries.length > 0) {
        const categoryName = visibleEntries[0].target.getAttribute('data-category');
        if (categoryName) {
          setSelectedCategory(categoryName);
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    Object.values(sectionRefs.current).forEach(section => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, [filteredMenu]);

  // Cart Summary
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
      className="relative flex flex-col bg-white rounded-3xl shadow-2xl h-full w-full overflow-hidden"
    >
      {/* Scrollable Content Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth pb-24">
        {/* STICKY HEADERS */}
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

        {/* Main Content Area */}
        <main className="px-2">
          
          {/* Search Bar */}
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

          {/* Category Filter */}
          <div className={`sticky w-full top-[168px] bg-white pt-2 pb-1 z-5 h-[124px] transition-transform duration-300 ${
            isCategoryFilterVisible ? 'translate-y-0' : '-translate-y-[200%]'
          }`}>
            <CategoryFilter
              categories={categoriesForFilter}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryClick}
            />
          </div>

          {/* Menu Sections */}
          <div className="space-y-8 pt-4 px-4 pb-8">
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
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>

      {/* Cart Summary (Footer) - Absolute positioning relative to container */}
      <div className={`absolute bottom-4 left-4 right-4 z-20 transition-all duration-300 ease-in-out ${
        cartSummary.itemCount > 0 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-20 pointer-events-none'
      }`}>
        <CartSummary
          itemCount={cartSummary.itemCount}
          totalPrice={cartSummary.totalPrice}
        />
      </div>
    </div>
  );
}
