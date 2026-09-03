import Image from "next/image";
import { FaArrowRightLong } from "react-icons/fa6";
import rightArrowShape from "@/public/shapes/custom-arrow-right.png";
import TransitionLink from "@/app/components/ui/TransitionLink";
import HomeNewArrivalCards from "./HomeNewArrivalCards";

export default function HomeNewArrival({
  userData,
  isAnyTrendingProductAvailable,
  newlyArrivedProducts,
  specialOffers,
  notifyVariants,
}) {
  if (!!newlyArrivedProducts?.length)
    return (
      <section
        className={`relative w-full overflow-hidden ${isAnyTrendingProductAvailable ? "bg-[var(--color-secondary-300)]" : ""}`}
      >
        {/* Shape (curved dotted line) */}
        <div className="absolute inset-0 ml-auto bg-[url('/shapes/curved-dotted-line-new-arrival.svg')] bg-right-top bg-no-repeat opacity-50 max-lg:top-1/2 max-lg:-translate-y-7 max-lg:bg-contain lg:max-lg:w-2/3" />
        <div className="relative mx-auto px-5 py-8 md:py-10 lg:py-12 xl:max-w-[1200px] xl:px-0">
          <div className="mb-10 flex items-center justify-between">
            {/* Heading */}
            <h1 className="relative text-xl font-bold md:text-2xl lg:text-3xl">
              <span className="max-sm:hidden">Look at Our</span> New Arrivals
              <div className="absolute -right-3 top-0 aspect-[2.1/1] w-14 translate-x-full md:-right-7 md:w-20 lg:w-20">
                <Image
                  src={rightArrowShape}
                  alt="Right arrow shape"
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
              href="/shop?filterBy=New+Arrivals"
            >
              View All{" "}
              <span className="rounded-full border border-black p-1 md:p-2">
                <FaArrowRightLong />
              </span>
            </TransitionLink>
          </div>
          <HomeNewArrivalCards
            userData={userData}
            newlyArrivedProducts={newlyArrivedProducts}
            specialOffers={specialOffers}
            notifyVariants={notifyVariants}
          />
        </div>
      </section>
    );
}
