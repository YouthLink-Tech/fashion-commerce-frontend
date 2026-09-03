import Image from "next/image";
import { FaArrowRightLong } from "react-icons/fa6";
import curvedDottedLineShape from "@/public/shapes/curved-dotted-line-trending.svg";
import thunderShape from "@/public/shapes/thunder-without-stroke.svg";
import TransitionLink from "@/app/components/ui/TransitionLink";
import HomeTrendingCards from "./HomeTrendingCards";

export default function HomeTrending({
  userData,
  trendingProducts,
  specialOffers,
  notifyVariants,
}) {
  if (!!trendingProducts?.length)
    return (
      <section className="relative w-full overflow-hidden">
        {/* Shape (curved dotted line) */}
        <div className="pointer-events-none absolute right-0 top-10 h-full w-[200%] opacity-50 sm:-top-14 min-[800px]:-top-4 lg:top-14 lg:w-2/3 xl:w-1/2">
          <Image
            src={curvedDottedLineShape}
            alt="Curved dotted line shape"
            className="object-contain lg:object-cover"
            height={0}
            width={0}
            sizes="100vw"
            fill
          />
        </div>
        <div className="relative mx-auto xl:max-w-[1200px]">
          {/* Mesh gradients */}
          <div className="[&_div]:z-[-1]">
            <div className="absolute left-[75%] top-[85%] h-[150px] w-[150px] translate-x-[-50%] translate-y-[-50%] rounded-full bg-[var(--color-static-bubble-secondary)] opacity-70 blur-[60px] md:left-[90%] md:blur-[40px] xl:h-[187px] xl:w-[214px] 2xl:left-[100%]" />
            <div className="absolute top-[40%] h-[150px] w-[150px] translate-x-[-50%] translate-y-[-50%] rounded-full bg-[var(--color-static-bubble-secondary)] opacity-70 blur-[60px] md:blur-[40px] lg:top-[35%] xl:h-[187px] xl:w-[214px]" />
            <div className="absolute left-[60%] top-[20%] h-[150px] w-[150px] translate-x-[-50%] translate-y-[-50%] rounded-full bg-[var(--color-static-bubble-primary)] opacity-70 blur-[60px] md:blur-[40px] xl:h-[187px] xl:w-[214px]" />
          </div>
          <div className="relative mx-auto px-5 py-8 md:py-10 lg:py-12 xl:max-w-[1200px] xl:px-0">
            <div className="mb-10 flex items-center justify-between">
              {/* Heading */}
              <h1 className="relative text-xl font-bold md:text-2xl lg:text-3xl">
                <span className="max-sm:hidden">See What&apos;s </span>Trending
                Now
                <div className="absolute -right-1.5 bottom-1/2 aspect-square w-7 translate-x-full sm:w-8 lg:w-9">
                  <Image
                    src={thunderShape}
                    alt="Thunder shape"
                    className="object-contain"
                    height={0}
                    width={0}
                    sizes="25vw"
                    fill
                  />
                </div>
              </h1>
              {/* View All Button */}
              <TransitionLink
                className="flex items-center gap-2 text-[10px] transition-[gap] duration-300 ease-in-out hover:gap-3 md:text-base"
                href="/shop?filterBy=Popular"
              >
                View All{" "}
                <span className="rounded-full border border-black p-1 md:p-2">
                  <FaArrowRightLong />
                </span>
              </TransitionLink>
            </div>
            <HomeTrendingCards
              userData={userData}
              trendingProducts={trendingProducts}
              specialOffers={specialOffers}
              notifyVariants={notifyVariants}
            />
          </div>
        </div>
      </section>
    );
}
