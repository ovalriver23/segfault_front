// src/app/menu/page.tsx
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image"; // Resimleriniz hazır olduğunda bu component'i kullanacaksınız

// --- SAHTE VERİ (Mock Data) ---
const MOCK_MENU = [
  {
    category: "Burger",
    categoryImageUrl: "/images/cat-burger.png",
    items: [
      { id: "1", name: "Cheeseburger", price: 120, imageUrl: "/images/burger.png" },
      { id: "2", name: "BBQ Burger", price: 135, imageUrl: "/images/burger.png" },
    ],
  },
  {
    category: "Wings",
    categoryImageUrl: "/images/cat-wings.png",
    items: [
      { id: "3", name: "Acılı Kanat", price: 95, imageUrl: "/images/wings.png" },
      { id: "4", name: "BBQ Kanat", price: 100, imageUrl: "/images/wings.png" },
    ],
  },
  {
    category: "Pizza",
    categoryImageUrl: "/images/cat-pizza.png",
    items: [
      { id: "5", name: "Pepperoni Pizza", price: 150, imageUrl: "/images/pizza.png" },
    ],
  },
  {
    category: "Kahve",
    categoryImageUrl: "/images/cat-coffee.png",
    items: [
      { id: "6", name: "Cappuccino", price: 90, imageUrl: "/images/cappuccino.png" },
      { id: "7", name: "Latte", price: 60, imageUrl: "/images/latte.png" },
    ],
  },
  {
    category: "Salata",
    categoryImageUrl: "/images/cat-salad.png",
    items: [
      { id: "8", name: "Sezar Salata", price: 150, imageUrl: "/images/salata.png" },
      { id: "9", name: "Akdeniz Salata", price: 140, imageUrl: "/images/salata.png" },
    ],
  },
];

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
        {/* <Image src={product.imageUrl} alt={product.name} width={120} height={120} className="rounded-xl" /> */}
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
      {/* "All" butonu */}
      <button
        key="all"
        onClick={() => onSelectCategory("All")}
        className={`flex flex-col items-center shrink-0 w-20 ${
          selectedCategory !== "All" ? "opacity-70" : ""
        }`}
      >
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-md mb-2 ${
            selectedCategory === "All" 
              ? "bg-[#FF9F5A]"   // Aktif renk (Sizin renginiz)
              : "bg-orange-200" // Pasif renk
          }`}>
           <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
             <span className="text-gray-400 text-xs">Resim</span>
           </div>
        </div>
        <span className="font-semibold text-gray-800">All</span>
      </button>

      {/* Dinamik kategoriler */}
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
                ? "bg-[#FF9F5A]"   // Aktif renk (Sizin renginiz)
                : "bg-orange-200" // Pasif renk
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

// 3. Sepet Özeti (GÜNCELLENDİ: Dış 'fixed' wrapper kaldırıldı)
function CartSummary({
  itemCount,
  totalPrice,
}: {
  itemCount: number;
  totalPrice: number;
}) {
  return (
    // 'fixed' wrapper buradan kaldırıldı. Pozisyonlamayı ana component yapacak.
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
export default function MenuPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const [isCategoryFilterVisible, setIsCategoryFilterVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const menuData = MOCK_MENU;

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const mainContainerRef = useRef<HTMLDivElement>(null);

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
    setCart((prevCart) => [...prevCart, { ...product, quantity: 1 }]);
  };
  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
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

  // --- Doğru Kaydırma Mantığı ---
  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    const main = mainContainerRef.current;
    if (!main) return;

    const firstCategoryName = menuData[0]?.category;
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
    return menuData.map(section => ({
      name: section.category,
      imageUrl: section.categoryImageUrl
    }));
  }, [menuData]); 

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


  // --- RENDER BÖLÜMÜ (GÜNCELLENDİ) ---
  return (
    <div 
      ref={mainContainerRef}
      // pb-32'yi pb-4'e düşürdük, böylece altta gereksiz boşluk kalmaz
      className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl h-screen overflow-y-auto relative pb-4 scroll-smooth"
    >
      {/* YAPIŞKAN BAŞLIKLAR: */}
      <header className="p-6 flex justify-between items-center sticky top-0 bg-white z-10 h-[88px] border-b border-gray-100">
        <h1 className="text-4xl font-bold text-gray-900">Menü</h1>
        <div className="flex items-center space-x-1 text-gray-600 font-semibold">
          <span>Burger King</span>
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

      {/* Ana İçerik Alanı */}
      <main className="px-6">
        
        {/* Arama Çubuğu */}
        <div className={`sticky top-[88px] bg-white pt-2 pb-4 z-5 h-20 transition-transform duration-300 flex justify-center ${
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

        {/* Kategori Filtresi */}
        <div className={`sticky top-[168px] bg-white pt-2 pb-1 z-5 h-[124px] transition-transform duration-300 ${
          isCategoryFilterVisible ? 'translate-y-0' : '-translate-y-[200%]'
        }`}>
          <CategoryFilter
            categories={categoriesForFilter}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryClick}
          />
        </div>

        {/* Menü Bölümleri */}
        <div className="space-y-8 pt-4">
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

      {/* Sepet Özeti (Footer) (GÜNCELLENDİ) */}
      {cartSummary.itemCount > 0 && (
        // Bu wrapper, sepeti ana kapsayıcıya göre konumlandırır ve
        // yatay padding (px-6) vererek içerikle hizalar.
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