"use client";

import Image from "next/image";

export type CategoryFilterItem = {
  id: number;
  name: string;
  imageUrl: string | null;
};

type MenuTheme = "DEFAULT" | "MODERN" | "ELEGANT";

function AllCategoriesCollage({ categories }: { categories: CategoryFilterItem[] }) {
  const categoriesWithImages = categories.filter((category) => category.imageUrl).slice(0, 4);

  if (categoriesWithImages.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Image src="/images/burger.png" alt="" width={48} height={48} className="rounded-xl" />
      </div>
    );
  }

  if (categoriesWithImages.length === 1) {
    return (
      <div className="relative h-full w-full">
        <Image
          src={categoriesWithImages[0].imageUrl!}
          alt=""
          fill
          sizes="60px"
          className="object-cover"
        />
      </div>
    );
  }

  if (categoriesWithImages.length === 2) {
    return (
      <div className="flex h-full w-full">
        {categoriesWithImages.map((category) => (
          <div key={category.id} className="relative h-full flex-1">
            <Image src={category.imageUrl!} alt="" fill sizes="30px" className="object-cover" />
          </div>
        ))}
      </div>
    );
  }

  if (categoriesWithImages.length === 3) {
    return (
      <div className="flex h-full w-full">
        <div className="relative h-full w-1/2">
          <Image
            src={categoriesWithImages[0].imageUrl!}
            alt=""
            fill
            sizes="30px"
            className="object-cover"
          />
        </div>
        <div className="flex h-full flex-1 flex-col">
          {categoriesWithImages.slice(1).map((category) => (
            <div key={category.id} className="relative flex-1">
              <Image src={category.imageUrl!} alt="" fill sizes="30px" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full w-full grid-cols-2 grid-rows-2">
      {categoriesWithImages.map((category) => (
        <div key={category.id} className="relative">
          <Image src={category.imageUrl!} alt="" fill sizes="30px" className="object-cover" />
        </div>
      ))}
    </div>
  );
}

export default function MenuCategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  theme,
}: {
  categories: CategoryFilterItem[];
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  theme: MenuTheme;
}) {
  const themeStyles = {
    DEFAULT: {
      bgActive: "#F8A45A",
      bgInactive: "#FFC898",
      border: "border-secondary-500",
      text: "text-gray-800",
      iconBg: "",
    },
    MODERN: {
      bgActive: "#ea580c",
      bgInactive: "#374151",
      border: "border-orange-500",
      text: "text-gray-200",
      iconBg: "bg-gradient-to-tr from-indigo-100/10 via-purple-100/10 to-pink-100/10",
    },
    ELEGANT: {
      bgActive: "#9C6644",
      bgInactive: "#d2b48c",
      border: "border-[#5c4033]",
      text: "text-[#5c4033]",
      iconBg: "",
    },
  };
  const styles = themeStyles[theme] || themeStyles.DEFAULT;

  return (
    <div
      className="scrollbar-hidden flex h-full snap-x snap-proximity items-start gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-4 pb-2 touch-pan-x"
      aria-label="Menü kategorileri"
    >
      <button
        type="button"
        onClick={() => onSelectCategory("All")}
        aria-pressed={selectedCategory === "All"}
        className={`flex w-[68px] shrink-0 snap-start flex-col items-center rounded-2xl outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-offset-2 ${selectedCategory !== "All" ? "opacity-70" : ""}`}
      >
        <div
          className={`flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-2xl shadow-sm transition-transform active:scale-95 ${selectedCategory === "All" ? `border-2 ${styles.border}` : ""}`}
          style={{
            backgroundColor:
              selectedCategory === "All"
                ? styles.bgActive
                : theme === "MODERN"
                  ? "transparent"
                  : styles.bgInactive,
          }}
        >
          <AllCategoriesCollage categories={categories} />
        </div>
        <span className={`mt-1.5 w-full truncate text-center text-[13px] font-semibold leading-5 ${styles.text}`}>
          Tümü
        </span>
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelectCategory(category.name)}
          aria-pressed={selectedCategory === category.name}
          title={category.name}
          className={`flex w-[68px] shrink-0 snap-start flex-col items-center rounded-2xl outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-offset-2 ${selectedCategory !== category.name ? "opacity-70" : ""}`}
        >
          <div
            className={`flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-2xl shadow-sm transition-transform active:scale-95 ${selectedCategory === category.name ? `border-2 ${styles.border}` : ""} ${theme === "MODERN" && selectedCategory !== category.name ? styles.iconBg : ""}`}
            style={{
              backgroundColor:
                selectedCategory === category.name
                  ? styles.bgActive
                  : theme === "MODERN"
                    ? "transparent"
                    : styles.bgInactive,
            }}
          >
            {category.imageUrl ? (
              <div className="relative h-[52px] w-[52px]">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  sizes="52px"
                  className="mask mask-squircle object-cover"
                />
              </div>
            ) : (
              <Image
                src="/images/burger.png"
                alt=""
                width={48}
                height={48}
                className="mask mask-squircle"
              />
            )}
          </div>
          <span className={`mt-1.5 w-full truncate text-center text-[13px] font-semibold leading-5 ${styles.text}`}>
            {category.name}
          </span>
        </button>
      ))}
    </div>
  );
}
