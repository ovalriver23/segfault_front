type MenuTheme = "DEFAULT" | "MODERN" | "ELEGANT";

export default function MenuPoweredBy({ theme }: { theme: MenuTheme }) {
  const themeStyles = {
    DEFAULT: {
      text: "text-[#6b3b1f]/35",
      line: "bg-[#F8A45A]/30",
    },
    MODERN: {
      text: "text-white/25",
      line: "bg-white/15",
    },
    ELEGANT: {
      text: "text-[#5c4033]/35 font-serif",
      line: "bg-[#8b4513]/20",
    },
  };
  const styles = themeStyles[theme] || themeStyles.DEFAULT;

  return (
    <footer
      className={`flex items-center justify-center gap-3 py-6 ${styles.text}`}
      aria-label="Powered By EasyOrder"
    >
      <span className={`h-px w-8 ${styles.line}`} aria-hidden="true" />
      <span className="whitespace-nowrap text-xs font-medium tracking-[0.1em]">
        Powered By <span className="font-semibold">EasyOrder</span>
      </span>
      <span className={`h-px w-8 ${styles.line}`} aria-hidden="true" />
    </footer>
  );
}
