import { rawFetch } from "@/app/lib/fetcher/rawFetch";
import HomeHeroSlides from "./HomeHeroSlides";

export default async function HomeHero() {
  let sliderData;

  try {
    const result = await rawFetch("/api/hero-banner/all", {
      next: {
        revalidate: 86400, // 24 hours — changes very rarely
        tags: ['hero-banner']
      }
    });
    sliderData = result.data || [];
  } catch (error) {
    console.error("FetchError (home/sliderData):", error.message);
  }

  const [
    {
      isEnabled,
      slideInterval,
      sliders: { leftSlides, centerSlides, rightSlides } = {},
    } = {},
  ] = sliderData || [];

  return (
    <div className="relative">
      {/* Mesh Gradients */}
      <div className="absolute inset-0 h-full overflow-hidden">
        <div className="absolute left-[5%] top-[60%] animate-blob bg-[var(--color-moving-bubble-secondary)] max-sm:hidden" />
        <div className="absolute left-[30%] top-[30%] animate-blob bg-[var(--color-moving-bubble-primary)] [animation-delay:1.5s]" />
        <div className="absolute left-[55%] top-[70%] animate-blob bg-[var(--color-moving-bubble-secondary)] [animation-delay:0.5s] max-sm:left-[5%] sm:bg-[var(--color-moving-bubble-primary)]" />
        <div className="absolute left-[80%] top-1/3 animate-blob bg-[var(--color-moving-bubble-secondary)] [animation-delay:2s] max-sm:hidden" />
      </div>
      <HomeHeroSlides
        isEnabled={isEnabled}
        slideInterval={slideInterval}
        leftSlides={leftSlides}
        centerSlides={centerSlides}
        rightSlides={rightSlides}
      />
    </div>
  );
}
