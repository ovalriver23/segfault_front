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
import OrdersModal from "./OrdersModal";
import NotificationModal, { showNotification, type NotificationType } from "./NotificationModal";

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
  menuTheme: 'DEFAULT' | 'MODERN' | 'ELEGANT';
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
  theme
}: {
  product: Product;
  itemInCart?: CartItem;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  qrToken: string;
  theme: 'DEFAULT' | 'MODERN' | 'ELEGANT';
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

    router.push(`/table/${qrToken}/item/${product.id}`);
  };

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
      // Warm milky coffee (Sıcak sütlü kahve)
      buttonBg: "bg-[#9C6644] hover:bg-[#7f5539]",
      buttonHover: "hover:bg-[#7f5539]",
      buttonText: "text-[#fdfbf7]",
      badge: "bg-[#d2b48c] text-[#5c4033]"
    }
  };

  const styles = themeStyles[theme] || themeStyles.DEFAULT;

  return (
    <div
      onClick={handleCardClick}
      className={`relative rounded-2xl shadow-md overflow-hidden w-full transition-shadow ${styles.card} ${product.available ? 'cursor-pointer hover:shadow-lg' : 'cursor-default opacity-75'
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

// 2. Kategori Filtresi
function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  theme
}: {
  categories: CategoryFilterItem[];
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  theme: 'DEFAULT' | 'MODERN' | 'ELEGANT';
}) {
  const themeStyles = {
    DEFAULT: {
      bgActive: "#F8A45A",
      bgInactive: "#FFC898",
      border: "border-secondary-500",
      text: "text-gray-800",
      iconBg: ""
    },
    MODERN: {
      bgActive: "#ea580c",
      bgInactive: "#374151",
      border: "border-orange-500",
      text: "text-gray-200",
      // Rainbow gradient for inactive state (faint)
      iconBg: "bg-gradient-to-tr from-indigo-100/10 via-purple-100/10 to-pink-100/10"
    },
    ELEGANT: {
      bgActive: "#9C6644",
      bgInactive: "#d2b48c",
      border: "border-[#5c4033]",
      text: "text-[#5c4033]",
      iconBg: ""
    }
  };
  const styles = themeStyles[theme] || themeStyles.DEFAULT;

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4 mb-4">
      {/* "All" butonu */}
      <button
        key="all"
        onClick={() => onSelectCategory("All")}
        className={`flex flex-col items-center shrink-0 w-20 ${selectedCategory !== "All" ? "opacity-70" : ""
          }`}
      >
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-md mb-2 ${selectedCategory === "All"
            ? `border-2 ${styles.border}`
            : ""
            } ${theme === 'MODERN' && selectedCategory !== "All" ? styles.iconBg : ''}`}
          style={{ backgroundColor: selectedCategory === "All" ? styles.bgActive : (theme === 'MODERN' ? 'transparent' : styles.bgInactive) }}
        >
          <Image src="/images/burger.png" alt="All" width={63} height={63} className="rounded-lg" />
        </div>
        <span className={`font-semibold text-sm ${styles.text}`}>Tümü</span>
      </button>

      {/* Dinamik kategoriler */}
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.name)}
          className={`flex flex-col items-center shrink-0 w-20 ${selectedCategory !== cat.name ? "opacity-70" : ""
            }`}
        >
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-md mb-2 overflow-hidden ${selectedCategory === cat.name
              ? `border-2 ${styles.border}`
              : ""
              } ${theme === 'MODERN' && selectedCategory !== cat.name ? styles.iconBg : ''}`}
            style={{ backgroundColor: selectedCategory === cat.name ? styles.bgActive : (theme === 'MODERN' ? 'transparent' : styles.bgInactive) }}
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
          <span className={`font-semibold text-sm ${styles.text}`}>{cat.name}</span>
        </button>
      ))}
    </div>
  );
}

function CartSummary({
  itemCount,
  totalPrice,
  onClick,
  theme
}: {
  itemCount: number;
  totalPrice: number;
  onClick: () => void;
  theme: 'DEFAULT' | 'MODERN' | 'ELEGANT';
}) {
  const bgClass = theme === 'MODERN' ? 'bg-[#ea580c] hover:bg-[#c2410c]'
    : theme === 'ELEGANT' ? 'bg-[#9C6644] hover:bg-[#7f5539]'
      : 'bg-pink-500 hover:bg-pink-600';

  const borderClass = theme === 'MODERN' ? 'text-[#ea580c] border-[#ea580c]'
    : theme === 'ELEGANT' ? 'text-[#9C6644] border-[#9C6644]'
      : 'text-pink-500 border-pink-600';

  return (
    <button
      onClick={onClick}
      className={`${bgClass} text-white p-4 rounded-2xl flex justify-between items-center shadow-lg w-full transition-colors`}
    >
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
  const [ordersModalKey, setOrdersModalKey] = useState(0);
  const [notification, setNotification] = useState<{ type: NotificationType; message: string } | null>(null);
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [showWaiterConfirmModal, setShowWaiterConfirmModal] = useState(false);

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

        // Close cart modal
        const cartModal = document.getElementById('cart_modal') as HTMLDialogElement;
        cartModal?.close();

        // Refresh orders modal key to trigger refetch
        setOrdersModalKey(prev => prev + 1);

        // Open orders modal to show the new order
        setTimeout(() => {
          const ordersModal = document.getElementById('orders_modal') as HTMLDialogElement;
          ordersModal?.showModal();
        }, 300);
      } else {
        // Show error message with modal
        setNotification({ type: 'error', message: data.error || 'Sipariş gönderilemedi' });
        showNotification('notification_modal');
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Sipariş gönderilemedi. Lütfen tekrar deneyin.' });
      showNotification('notification_modal');
    }
  };

  const handleOpenCart = () => {
    const modal = document.getElementById('cart_modal') as HTMLDialogElement;
    modal?.showModal();
  };

  const handleOpenOrders = () => {
    const modal = document.getElementById('orders_modal') as HTMLDialogElement;
    modal?.showModal();
  };

  const handleShowWaiterConfirm = () => {
    setShowWaiterConfirmModal(true);
  };

  const handleConfirmCallWaiter = async () => {
    setShowWaiterConfirmModal(false);
    setIsCallingWaiter(true);

    try {
      const response = await fetch('/api/public/table/call-waiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken })
      });

      const data = await response.json();

      if (response.ok) {
        setWaiterCalled(true);
        // Reset after 30 seconds so user can call again
        setTimeout(() => setWaiterCalled(false), 30000);
      } else {
        setNotification({ type: 'error', message: data.error || 'Garson çağrılamadı' });
        showNotification('notification_modal');
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Garson çağrılırken bir hata oluştu' });
      showNotification('notification_modal');
    } finally {
      setIsCallingWaiter(false);
    }
  };

  const handleCancelWaiterConfirm = () => {
    setShowWaiterConfirmModal(false);
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
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
    return { itemCount, totalPrice };
  }, [cart]);

  const cartMap = useMemo(() => {
    return new Map(cart.map((item) => [item.id, item]));
  }, [cart]);

  // --- RENDER ---
  const theme = apiData.menuTheme || 'DEFAULT';

  const themeConfig = {
    DEFAULT: {
      bg: "bg-white",
      headerBg: "bg-white",
      text: "text-gray-900",
      searchBg: "bg-orange-100/70",
      searchInput: "placeholder-orange-900/60 text-[#6b3b1f]",
      searchIcon: "text-orange-900",
      callWaiterBg: "bg-secondary-100 active:bg-secondary-200 text-secondary-700",
      categoryFilterBg: "bg-white",
      ordersButton: "bg-primary-100 active:bg-primary-200 text-primary-700"
    },
    MODERN: {
      bg: "bg-[#1f1f1f]",
      headerBg: "bg-[#1f1f1f]",
      text: "text-white",
      searchBg: "bg-[#333333]", // Lighter, neutral gray
      searchInput: "placeholder-gray-400 text-white",
      searchIcon: "text-gray-400",
      callWaiterBg: "bg-gray-700 active:bg-gray-600 text-white",
      categoryFilterBg: "bg-[#1f1f1f]",
      categoryTitleBg: "bg-[#1f1f1f]", // Fix white box
      ordersButton: "bg-[#F8A45A] active:bg-[#e0914a] text-[#1f1f1f]" // Mustard yellow
    },
    ELEGANT: {
      bg: "bg-[#f5f5dc]",
      headerBg: "bg-[#f5f5dc]",
      text: "text-[#5c4033] font-serif",
      searchBg: "bg-[#e6dcc3]",
      searchInput: "placeholder-[#8b4513]/60 text-[#5c4033]",
      searchIcon: "text-[#8b4513]",
      callWaiterBg: "bg-[#d2b48c] active:bg-[#c1a073] text-[#5c4033]",
      categoryFilterBg: "bg-[#f5f5dc]",
      separatorColor: "#8b4513", // Brown for Elegant
      categoryTitleBg: "bg-[#f5f5dc]", // Match background
      ordersButton: "bg-[#d2b48c] active:bg-[#c1a073] text-[#5c4033]" // Coffee/Tan
    }
  };

  const currentThemeStyle = themeConfig[theme] || themeConfig.DEFAULT;
  // Default fallbacks for new properties if undefined in other themes
  const separatorColor = (currentThemeStyle as any).separatorColor || '#f8a45a';
  const categoryTitleBg = (currentThemeStyle as any).categoryTitleBg || 'bg-white';
  const categoryFontClass = theme === 'ELEGANT' ? 'font-serif' : '';
  const categoryFontStyle = theme === 'ELEGANT' ? {} : { fontFamily: 'Pontano Sans, sans-serif' };

  return (
    <div
      ref={mainContainerRef}
      className={`max-w-md mx-auto rounded-3xl shadow-2xl h-screen overflow-y-auto relative pb-4 scroll-smooth ${currentThemeStyle.bg}`}
    >
      {/* YAPIŞKAN BAŞLIKLAR: */}
      <header className={`pt-6 pl-6 pr-6 pb-4 flex justify-between items-center sticky top-0 z-10 border-b border-gray-100 ${currentThemeStyle.headerBg}`}>
        {/* Left: Menu Title */}
        <h1 className={`text-4xl font-bold ${theme === 'MODERN' ? 'text-[#ea580c]' : currentThemeStyle.text}`}>Menü</h1>

        {/* Center: Orders Button */}
        <button
          onClick={handleOpenOrders}
          className={`flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl absolute left-1/2 -translate-x-1/2 ${currentThemeStyle.ordersButton}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span className="text-xs sm:text-sm font-medium">Siparişlerim</span>
        </button>

        {/* Right: Restaurant Info */}
        <div className="flex flex-col items-end text-right">
          <div className={`flex items-center space-x-1 font-bold text-lg ${currentThemeStyle.text}`}>
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
          <span className="text-sm text-gray-500 font-medium mt-1">
            {apiData.table.name.length > 8 ? `${apiData.table.name.substring(0, 8)}...` : apiData.table.name}
          </span>
        </div>
      </header>

      {/* Ana İçerik Alanı */}
      <main className="px-2">

        {/* Search Bar and Call Waiter Button */}
        <div className={`sticky w-full top-[88px] pt-2 pb-4 z-5 h-20 transition-transform duration-300 flex gap-2 px-4 ${currentThemeStyle.headerBg} ${isSearchVisible ? 'translate-y-0' : '-translate-y-[200%]'
          }`}>
          {/* Search Bar (60%) */}
          <div className="w-[60%]">
            <label className={`input input-bordered flex items-center gap-2 rounded-full h-14 border-none w-full ${currentThemeStyle.searchBg}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className={`w-5 h-5 opacity-70 ${currentThemeStyle.searchIcon}`}
              >
                <path
                  fillRule="evenodd"
                  d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="text"
                className={`grow bg-transparent w-full ${currentThemeStyle.searchInput}`}
                placeholder="Ara"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
          </div>

          {/* Call Waiter Button (40%) */}
          <div className="w-[40%] h-14">
            {waiterCalled ? (
              <div className="w-full h-full flex items-center justify-center gap-1 bg-green-100 text-green-700 px-3 rounded-full shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">Çağrıldı</span>
              </div>
            ) : (
              <button
                onClick={handleShowWaiterConfirm}
                disabled={isCallingWaiter}
                className={`w-full h-full flex items-center justify-center gap-1 px-3 rounded-full transition-colors shadow-sm ${currentThemeStyle.callWaiterBg}`}
              >
                {isCallingWaiter ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 17.5 21.502" fill="none">
                    <g id="Group">
                      <path id="Vector" d="M16.75 20.752V14.778C16.75 13.828 16.75 13.354 16.592 12.98C16.3917 12.5071 16.0172 12.1293 15.546 11.925C15.173 11.764 14.699 11.76 13.75 11.752C13.75 16.752 8.75 18.752 8.75 18.752C8.75 18.752 3.75 16.752 3.75 11.752C2.818 11.752 2.352 11.752 1.985 11.904C1.74227 12.0044 1.5217 12.1516 1.33588 12.3373C1.15005 12.5229 1.00262 12.7434 0.902 12.986C0.75 13.354 0.750001 13.82 0.750001 14.752V20.752" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path id="Vector_2" d="M8.75 12.25L10.75 11.25V13.25L8.75 12.25ZM8.75 12.25L6.75 11.25V13.25L8.75 12.25ZM12.25 5.25V4.25C12.25 3.79037 12.1595 3.33525 11.9836 2.91061C11.8077 2.48597 11.5499 2.10013 11.2249 1.77513C10.8999 1.45012 10.514 1.19231 10.0894 1.01642C9.66475 0.84053 9.20963 0.75 8.75 0.75C8.29037 0.75 7.83525 0.84053 7.41061 1.01642C6.98597 1.19231 6.60013 1.45012 6.27513 1.77513C5.95012 2.10013 5.69231 2.48597 5.51642 2.91061C5.34053 3.33525 5.25 3.79037 5.25 4.25V5.25C5.25 5.70963 5.34053 6.16475 5.51642 6.58939C5.69231 7.01403 5.95012 7.39987 6.27513 7.72487C6.60013 8.04988 6.98597 8.30769 7.41061 8.48358C7.83525 8.65947 8.29037 8.75 8.75 8.75C9.20963 8.75 9.66475 8.65947 10.0894 8.48358C10.514 8.30769 10.8999 8.04988 11.2249 7.72487C11.5499 7.39987 11.8077 7.01403 11.9836 6.58939C12.1595 6.16475 12.25 5.70963 12.25 5.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  </svg>
                )}
                <span className="text-sm font-medium">Garson Çağır</span>
              </button>
            )}
          </div>
        </div>

        {/* Kategori Filtresi */}
        <div className={`sticky w-full top-[168px] pt-2 pb-1 z-5 h-[124px] transition-transform duration-300 ${currentThemeStyle.categoryFilterBg} ${isCategoryFilterVisible ? 'translate-y-0' : '-translate-y-[200%]'
          }`}>
          <CategoryFilter
            categories={categoriesForFilter}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryClick}
            theme={theme}
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
                    qrToken={qrToken}
                    theme={theme}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Sepet Özeti (Footer) */}
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-6 z-20 max-w-md w-full transition-all duration-300 ease-in-out ${cartSummary.itemCount > 0
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-20 pointer-events-none'
        }`}>
        <CartSummary
          itemCount={cartSummary.itemCount}
          totalPrice={cartSummary.totalPrice}
          onClick={handleOpenCart}
          theme={theme}
        />
      </div>


      {/* Cart Modal */}
      < CartModal
        modalId="cart_modal"
        qrToken={qrToken}
        items={cart}
        generalNote={generalNote}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdateGeneralNote={handleUpdateGeneralNote}
        onSubmitOrder={handleSubmitOrder}
        theme={theme}
      />

      {/* Orders Modal */}
      < OrdersModal
        key={ordersModalKey}
        modalId="orders_modal"
        qrToken={qrToken}
        theme={theme}
      />

      {/* Notification Modal */}
      {
        notification && (
          <NotificationModal
            modalId="notification_modal"
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )
      }

      {/* Waiter Confirmation Modal */}
      {
        showWaiterConfirmModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
                Garson çağırmak istediğinize emin misiniz?
              </h3>
              <p className="text-sm text-gray-600 mb-6 text-center">
                Unutmayın, siparişlerinizi menü üzerinden kolayca verebilirsiniz.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelWaiterConfirm}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleConfirmCallWaiter}
                  className="flex-1 py-3 px-4 bg-secondary-500 text-white rounded-xl font-bold hover:bg-secondary-600 transition-colors"
                >
                  Evet, Çağır
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
