// src/app/table/[qrToken]/page.tsx
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { getUserLocation, LocationCoordinates, GeolocationError } from "../../lib/utils/geolocation";
import { scanTable, TableScanResponse, TableScanError } from "../../lib/services/tableService";

// --- Arayüz Tipleri ---
type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};
type CartItem = Product & { quantity: number };
type MenuSection = {
  category: string;
  categoryImageUrl: string;
  items: Product[];
};
type CategoryFilterItem = {
  name: string;
  imageUrl: string;
}

// --- Alt Bileşenler ---

// 1. Ürün Kartı
function ProductCard({
  product,
  itemInCart,
  onAddToCart,
  onUpdateQuantity,
}: {
  product: Product;
  itemInCart?: CartItem;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
}) {
  return (
    <div className="card bg-pink-100/50 shadow-sm rounded-2xl p-4 flex flex-col items-center">
      <figure className="mb-2">
        <div className="w-28 h-28 bg-gray-200 rounded-xl flex items-center justify-center">
          <span className="text-gray-400 text-xs">Resim</span>
        </div>
      </figure>
      <div className="card-body p-0 text-center w-full">
        <h2 className="font-bold text-gray-800 text-lg">{product.name}</h2>
        <p className="text-gray-600 mb-3">{product.price} tl</p>
        <div className="card-actions justify-center w-full">
          {!itemInCart ? (
            <button
              onClick={() => onAddToCart(product)}
              className="btn btn-circle btn-sm bg-white border-[#FF9F5A] text-[#FF9F5A] hover:bg-[#FF9F5A] hover:text-white"
            >
              <span className="text-xl font-light">+</span>
            </button>
          ) : (
            <div className="join bg-white rounded-full shadow-sm">
              <button
                onClick={() =>
                  onUpdateQuantity(product.id, itemInCart.quantity - 1)
                }
                className="btn join-item btn-sm bg-white border-none text-[#FF9F5A]"
              >
                −
              </button>
              <span className="join-item px-3 flex items-center bg-white text-gray-800 font-bold">
                {itemInCart.quantity}
              </span>
              <button
                onClick={() =>
                  onUpdateQuantity(product.id, itemInCart.quantity + 1)
                }
                className="btn join-item btn-sm bg-white border-none text-[#FF9F5A]"
              >
                +
              </button>
            </div>
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
      <button
        key="all"
        onClick={() => onSelectCategory("All")}
        className={`flex flex-col items-center shrink-0 w-20 ${
          selectedCategory !== "All" ? "opacity-70" : ""
        }`}
      >
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-md mb-2 ${
            selectedCategory === "All" 
              ? "bg-[#FF9F5A]"
              : "bg-orange-200"
          }`}>
           <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
             <span className="text-gray-400 text-xs">Resim</span>
           </div>
        </div>
        <span className="font-semibold text-gray-800">All</span>
      </button>

      {categories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => onSelectCategory(cat.name)}
          className={`flex flex-col items-center shrink-0 w-20 ${
            selectedCategory !== cat.name ? "opacity-70" : ""
          }`}
        >
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-md mb-2 ${
              selectedCategory === cat.name
                ? "bg-[#FF9F5A]"
                : "bg-orange-200"
            }`}
          >
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs">Resim</span>
            </div>
          </div>
          <span className="font-semibold text-gray-800">{cat.name}</span>
        </button>
      ))}
    </div>
  );
}

// 3. Sepet Özeti
function CartSummary({
  itemCount,
  totalPrice,
}: {
  itemCount: number;
  totalPrice: number;
}) {
  return (
    <div className="bg-pink-500 text-white p-4 rounded-2xl flex justify-between items-center shadow-lg">
      <div>
        <span className="font-semibold">{itemCount} Items</span>
        <p className="text-lg font-bold">Total: {totalPrice} tl</p>
      </div>
      <button className="btn btn-circle btn-lg bg-white text-pink-500 border-2 border-pink-600 hover:bg-gray-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={3}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>
    </div>
  );
}

// --- ANA SAYFA BİLEŞENİ ---
export default function TableMenuPage() {
  const params = useParams();
  const qrToken = params.qrToken as string;
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const [isCategoryFilterVisible, setIsCategoryFilterVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Geolocation & Table Scan State
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [menuData, setMenuData] = useState<TableScanResponse | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Capture geolocation when component mounts
  useEffect(() => {
    const captureLocation = async () => {
      if (!qrToken) {
        return;
      }

      setIsLoadingLocation(true);
      
      try {
        const location = await getUserLocation();
        setUserLocation(location);

        const tableData = await scanTable(qrToken, location);
        setMenuData(tableData);
        
      } catch (error) {
        const err = error as GeolocationError | TableScanError;
        
        if ('code' in err) {
          // Geolocation error
          setLocationError(err.message);
        } else {
          // Table scan error
          
          // TEMPORARY: Skip distance validation if restaurant location is not set
          // Remove this block once backend sets restaurant coordinates
          if (err.error && (err.error.includes('null') || err.error.includes('doubleValue'))) {
            setScanError('Restaurant location not configured. Contact the restaurant to set up geolocation verification.');
            return;
          }
          
          setScanError(err.error);
        }
      } finally {
        setIsLoadingLocation(false);
      }
    };

    captureLocation();
  }, [qrToken]);

  // --- Scroll Handler for Search and Category Filter Visibility ---
  useEffect(() => {
    const handleScroll = () => {
      const main = mainContainerRef.current;
      if (!main) return;

      const currentScrollY = main.scrollTop;
      const scrollDifference = currentScrollY - lastScrollY;
      
      if (currentScrollY < 50) {
        setIsSearchVisible(true);
        setIsCategoryFilterVisible(true);
      } else if (scrollDifference < -30) {
        setIsSearchVisible(true);
        setIsCategoryFilterVisible(true);
      } else if (scrollDifference > 30 && currentScrollY > 100) {
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
    setCart((prevCart) => [...prevCart, { ...product, quantity: 1 }]);
  };
  
  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // --- Doğru Kaydırma Mantığı ---
  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    const main = mainContainerRef.current;
    if (!main) return;

    const transformedMenu = menuData ? transformMenuData(menuData.menu) : [];
    const firstCategoryName = transformedMenu[0]?.category;
    
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

  // Transform backend menu data to match our frontend structure
  const transformMenuData = (backendMenu: TableScanResponse['menu']): MenuSection[] => {
    return backendMenu.map(category => ({
      category: category.name,
      categoryImageUrl: "/images/cat-default.png",
      items: category.menuItems
        .filter(item => item.available)
        .map(item => ({
          id: item.id.toString(),
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl || "/images/default-food.png"
        }))
    })).filter(section => section.items.length > 0);
  };

  // Kategori Filtresi için Veri Türetme
  const categoriesForFilter = useMemo((): CategoryFilterItem[] => {
    if (!menuData) return [];
    const transformed = transformMenuData(menuData.menu);
    return transformed.map(section => ({
      name: section.category,
      imageUrl: section.categoryImageUrl
    }));
  }, [menuData]); 

  // Sadece arama sorgusuna göre filtreler
  const filteredMenu = useMemo(() => {
    if (!menuData) return [];
    const transformed = transformMenuData(menuData.menu);
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      return transformed
        .map((section) => ({
          ...section,
          items: section.items.filter((item) =>
            item.name.toLowerCase().includes(lowerQuery)
          ),
        }))
        .filter((section) => section.items.length > 0);
    }
    return transformed;
  }, [searchQuery, menuData]);

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

  // Show loading state while capturing location
  if (isLoadingLocation) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-gray-600 text-lg">Konum alınıyor...</p>
          <p className="text-gray-400 text-sm mt-2">Lütfen konum erişimine izin verin</p>
        </div>
      </div>
    );
  }

  // Show error if geolocation failed
  if (locationError) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-500 text-6xl mb-4">📍</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Konum Erişimi Gerekli</h2>
          <p className="text-gray-600 mb-4">{locationError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn bg-[#FF9F5A] hover:bg-[#e88d48] text-white border-none"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  // Show error if table scan failed
  if (scanError) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Masa Doğrulama Hatası</h2>
          <p className="text-gray-600 mb-4">{scanError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn bg-[#FF9F5A] hover:bg-[#e88d48] text-white border-none"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  // Show prompt if no QR token
  if (!qrToken) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">QR Kod Gerekli</h2>
          <p className="text-gray-600">Lütfen masa üzerindeki QR kodu okutun</p>
        </div>
      </div>
    );
  }

  // Show prompt if menu not loaded yet
  if (!menuData) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-gray-600 text-lg">Menü yükleniyor...</p>
        </div>
      </div>
    );
  }

  // --- RENDER BÖLÜMÜ ---
  return (
    <div 
      ref={mainContainerRef}
      className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl h-screen overflow-y-auto relative pb-4 scroll-smooth"
    >
      <header className="p-6 flex justify-between items-center sticky top-0 bg-white z-10 h-[88px] border-b border-gray-100">
        <h1 className="text-4xl font-bold text-gray-900">Menü</h1>
        <div className="flex items-center space-x-1 text-gray-600 font-semibold">
          <span className="text-sm">{menuData.restaurantName}</span>
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
      </header>

      <main className="px-2">
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
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>

        <div className={`sticky w-full top-[168px] bg-white pt-2 pb-1 z-5 h-[124px] transition-transform duration-300 ${
          isCategoryFilterVisible ? 'translate-y-0' : '-translate-y-[200%]'
        }`}>
          <CategoryFilter
            categories={categoriesForFilter}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryClick}
          />
        </div>

        <div className="space-y-8 pt-4 px-4">
          {filteredMenu.map((section) => (
            <section
              key={section.category}
              ref={(el) => {
                sectionRefs.current[section.category] = el;
              }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {section.category}
              </h2>
              <div className="grid grid-cols-2 gap-4">
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

      {cartSummary.itemCount > 0 && (
        <div className="sticky bottom-4 px-6 z-10">
          <CartSummary
            itemCount={cartSummary.itemCount}
            totalPrice={cartSummary.totalPrice}
          />
        </div>
      )}
    </div>
  );
}
