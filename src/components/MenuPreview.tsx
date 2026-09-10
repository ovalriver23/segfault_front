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
import type { ApiResponse } from "./MenuView";
import MenuCategoryFilter, { type CategoryFilterItem } from "./MenuCategoryFilter";
import MenuPoweredBy from "./MenuPoweredBy";

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

// --- Sub Components ---

// 1. Product Card (Preview version - no navigation)
function ProductCard({
  product,
  itemInCart,
  onAddToCart,
  onUpdateQuantity,
  theme
}: {
  product: Product;
  itemInCart?: CartItem;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  theme: 'DEFAULT' | 'MODERN' | 'ELEGANT';
}) {
  const isPopular = product.style === 'popular' || false;

  // Theme Styles
  const themeStyles = {
    DEFAULT: {
      card: "bg-white text-gray-900",
      price: "text-gray-900",
      buttonBg: "bg-pink-500 hover:bg-pink-600",
      buttonHover: "hover:bg-pink-600",
      buttonText: "text-white",
      badge: "bg-[#E8C5B8] text-gray-800"
    },
    MODERN: {
      card: "bg-[#2d2d2d] text-white",
      price: "text-orange-500",
      buttonBg: "bg-[#ea580c] hover:bg-[#c2410c]",
      buttonHover: "hover:bg-[#c2410c]",
      buttonText: "text-white",
      badge: "bg-[#ea580c] text-white"
    },
    ELEGANT: {
      card: "bg-[#fdfbf7] text-[#5c4033] border border-[#e6dcc3]",
      price: "text-[#8b4513]",
      // Warm milky coffee
      buttonBg: "bg-[#9C6644] hover:bg-[#7f5539]",
      buttonHover: "hover:bg-[#7f5539]",
      buttonText: "text-[#fdfbf7]",
      badge: "bg-[#d2b48c] text-[#5c4033]"
    }
  };

  const styles = themeStyles[theme] || themeStyles.DEFAULT;

  return (
    <div
      className={`relative rounded-2xl shadow-md overflow-hidden w-full ${styles.card} ${product.available ? '' : 'opacity-75'
        }`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium z-10 ${styles.badge}`}>
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
        <h3 className={`text-base font-semibold mb-1 min-h-10 line-clamp-2 leading-snug ${theme === 'MODERN' ? 'text-gray-100' : theme === 'ELEGANT' ? 'text-[#5c4033]' : 'text-gray-900'}`}>
          {product.name}
        </h3>

        {/* Price and Action */}
        <div className="flex justify-between items-center">
          <div className="flex items-baseline gap-1">
            <span className={`text-lg font-bold ${styles.price}`}>
              {product.price}
            </span>
            <span className={`text-xs font-medium ${theme === 'MODERN' ? 'text-gray-400' : 'text-gray-500'}`}>TL</span>
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
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shadow-md ${styles.buttonBg}`}
                >
                  <span className={`text-2xl font-light ${styles.buttonText}`}>+</span>
                </button>
              ) : (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={`inline-flex items-center rounded-xl shadow-md h-8 ${styles.buttonBg}`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateQuantity(product.id, itemInCart.quantity - 1);
                    }}
                    className={`w-8 h-8 flex items-center justify-center ${styles.buttonText} ${styles.buttonHover} rounded-xl transition-colors`}
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
                  <span className={`px-2 ${styles.buttonText} font-bold text-xs min-w-6 text-center`}>
                    {itemInCart.quantity}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateQuantity(product.id, itemInCart.quantity + 1);
                    }}
                    className={`w-8 h-8 flex items-center justify-center ${styles.buttonText} ${styles.buttonHover} rounded-xl transition-colors`}
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

// 2. Cart Summary (Preview version - relative positioning)
function CartSummary({
  itemCount,
  totalPrice,
  theme
}: {
  itemCount: number;
  totalPrice: number;
  theme: 'DEFAULT' | 'MODERN' | 'ELEGANT';
}) {
  const bgClass = theme === 'MODERN' ? 'bg-[#ea580c]'
    : theme === 'ELEGANT' ? 'bg-[#9C6644]'
      : 'bg-pink-500';

  const borderClass = theme === 'MODERN' ? 'text-[#ea580c] border-[#ea580c]'
    : theme === 'ELEGANT' ? 'text-[#9C6644] border-[#9C6644]'
      : 'text-pink-500 border-pink-600';

  return (
    <div className={`${bgClass} text-white p-4 rounded-2xl flex justify-between items-center shadow-lg w-full`}>
      <div className="text-left">
        <span className="font-semibold">{itemCount} Ürün</span>
        <p className="text-lg font-bold">Toplam: {totalPrice.toFixed(2)} tl</p>
      </div>
      <div className={`btn btn-circle btn-lg bg-white border-2 hover:bg-gray-100 ${borderClass}`}>
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
  const [restaurantLogoFailed, setRestaurantLogoFailed] = useState(false);
  const restaurantLogo = apiData.restaurantLogo?.trim() || null;

  useEffect(() => {
    setRestaurantLogoFailed(false);
  }, [restaurantLogo]);

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
      const STICKY_OFFSET = 264;
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

  // --- Theme Logic ---
  const theme = apiData.menuTheme || 'DEFAULT';

  const themeConfig = {
    DEFAULT: {
      bg: "bg-white",
      headerBg: "bg-white",
      text: "text-gray-900",
      searchBg: "bg-orange-100/70",
      searchInput: "placeholder-orange-900/60 text-[#6b3b1f]",
      searchIcon: "text-orange-900",
      categoryFilterBg: "bg-white",
      headerBorder: "border-orange-100/80",
      logoSurface: "bg-white ring-orange-100",
      mutedText: "text-gray-500"
    },
    MODERN: {
      bg: "bg-[#1f1f1f]",
      headerBg: "bg-[#1f1f1f]",
      text: "text-white",
      searchBg: "bg-[#333333]", // Lighter, neutral gray
      searchInput: "placeholder-gray-400 text-white",
      searchIcon: "text-gray-400",
      categoryFilterBg: "bg-[#1f1f1f]",
      categoryTitleBg: "bg-[#1f1f1f]", // Fix white box
      headerBorder: "border-white/10",
      logoSurface: "bg-white ring-white/15",
      mutedText: "text-gray-400"
    },
    ELEGANT: {
      bg: "bg-[#f5f5dc]",
      headerBg: "bg-[#f5f5dc]",
      text: "text-[#5c4033] font-serif",
      searchBg: "bg-[#e6dcc3]",
      searchInput: "placeholder-[#8b4513]/60 text-[#5c4033]",
      searchIcon: "text-[#8b4513]",
      categoryFilterBg: "bg-[#f5f5dc]",
      separatorColor: "#8b4513",
      categoryTitleBg: "bg-[#f5f5dc]",
      headerBorder: "border-[#d2b48c]/60",
      logoSurface: "bg-[#fdfbf7] ring-[#d2b48c]",
      mutedText: "text-[#8b4513]/70"
    }
  };

  const currentThemeStyle = themeConfig[theme] || themeConfig.DEFAULT;
  const separatorColor = (currentThemeStyle as any).separatorColor || '#f8a45a';
  const categoryTitleBg = (currentThemeStyle as any).categoryTitleBg || 'bg-white';
  const categoryFontClass = theme === 'ELEGANT' ? 'font-serif' : '';
  const categoryFontStyle = theme === 'ELEGANT' ? {} : { fontFamily: 'Pontano Sans, sans-serif' };

  // --- RENDER ---
  return (
    <div
      ref={mainContainerRef}
      className={`relative flex flex-col rounded-3xl shadow-2xl h-full w-full overflow-hidden ${currentThemeStyle.bg}`}
    >
      {/* Scrollable Content Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth pb-24">
        {/* STICKY HEADERS */}
        <header className={`sticky top-0 z-30 flex h-[88px] items-center border-b px-4 py-4 ${currentThemeStyle.headerBorder} ${currentThemeStyle.headerBg}`}>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {restaurantLogo && !restaurantLogoFailed && (
              <div className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-xl shadow-sm ring-1 ${currentThemeStyle.logoSurface}`}>
                <Image
                  src={restaurantLogo}
                  alt={`${apiData.restaurantName} logosu`}
                  fill
                  sizes="44px"
                  className="object-contain p-1.5"
                  onError={() => setRestaurantLogoFailed(true)}
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1
                className={`truncate text-lg font-bold leading-tight ${theme === 'MODERN' ? 'text-[#ea580c]' : currentThemeStyle.text}`}
                title={apiData.restaurantName}
              >
                {apiData.restaurantName}
              </h1>
              <p className={`mt-1 flex min-w-0 items-center gap-1 text-xs font-medium ${currentThemeStyle.mutedText}`}>
                <span className="truncate">Önizleme</span>
                <span className="shrink-0" aria-hidden="true">·</span>
                <span className="shrink-0">Menü</span>
              </p>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="px-2">

          {/* Search Bar */}
          <div className={`sticky top-[88px] z-20 flex h-[72px] w-full px-4 py-3 transition-[transform,opacity] duration-300 ${currentThemeStyle.headerBg} ${isSearchVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-[200%] opacity-0'
            }`}>
            <label className={`input input-bordered flex h-12 w-full items-center gap-2 rounded-2xl border-none px-3.5 shadow-sm ${currentThemeStyle.searchBg}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className={`h-5 w-5 shrink-0 opacity-70 ${currentThemeStyle.searchIcon}`}
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="text"
                aria-label="Menüde ara"
                className={`min-w-0 grow bg-transparent text-base outline-none ${currentThemeStyle.searchInput}`}
                placeholder="Menüde ara"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
          </div>

          {/* Category Filter */}
          <div className={`sticky top-[160px] z-20 h-[104px] w-full pt-2 transition-[transform,opacity] duration-300 ${currentThemeStyle.categoryFilterBg} ${isCategoryFilterVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-[200%] opacity-0'
            }`}>
            <MenuCategoryFilter
              categories={categoriesForFilter}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryClick}
              theme={theme}
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
                  <div className="absolute left-0 right-0 top-1/2 h-0.5" style={{ backgroundColor: separatorColor }} />
                  <h2 className={`relative inline-block pr-4 text-2xl font-normal ${categoryTitleBg} ${categoryFontClass} ${theme === 'MODERN' ? 'text-primary-500' : 'text-gray-800'}`} style={categoryFontStyle}>
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
                      theme={theme}
                    />
                  ))}
                </div>
              </section>
            ))}
            <MenuPoweredBy theme={theme} />
          </div>
        </main>
      </div>

      {/* Cart Summary (Footer) - Absolute positioning relative to container */}
      <div className={`absolute bottom-4 left-4 right-4 z-20 transition-all duration-300 ease-in-out ${cartSummary.itemCount > 0
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-20 pointer-events-none'
        }`}>
        <CartSummary
          itemCount={cartSummary.itemCount}
          totalPrice={cartSummary.totalPrice}
          theme={theme}
        />
      </div>
    </div>
  );
}
