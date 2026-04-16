const items = [
  "Worldwide Shipping",
  "100% Pure GI-Tagged Pashmina",
  "Handwoven in Kashmir",
  "Artisan Crafted",
  "15th-Century Loom Traditions",
  "Authenticity Guaranteed",
  "Ships to USA, UK, Canada & Worldwide",
  "12–16 Micron Changthangi Fibre",
];

function MarqueeContent() {
  return (
    <>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-10 whitespace-nowrap sm:gap-14">
          <span className="font-accent text-[10px] font-light uppercase tracking-[0.3em] sm:text-xs">
            {item}
          </span>
          <span className="text-gold text-sm sm:text-base">◆</span>
        </span>
      ))}
    </>
  );
}

export default function MarqueeStrip() {
  return (
    <div
      className="bg-forest-green overflow-hidden py-4 sm:py-5"
      aria-hidden="true"
    >
      <div className="animate-marquee flex gap-10 sm:gap-14">
        <div className="flex gap-10 text-ivory sm:gap-14">
          <MarqueeContent />
        </div>
        <div className="flex gap-10 text-ivory sm:gap-14">
          <MarqueeContent />
        </div>
      </div>
    </div>
  );
}
