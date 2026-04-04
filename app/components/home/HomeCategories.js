import Image from "next/image";
import { FaArrowRightLong } from "react-icons/fa6";
import { rawFetch } from "@/app/lib/fetcher/rawFetch";
import curvedDottedLineShape from "@/public/shapes/curved-dotted-line-categories.svg";
import rightArrowShape from "@/public/shapes/custom-arrow-right.png";
import TransitionLink from "@/app/components/ui/TransitionLink";
import { getImage } from "@/app/lib/cloudinaryUtils";

export default async function HomeCategories() {
  let categories;

  try {
    const result = await rawFetch("/api/category/all", {
      next: {
        revalidate: 7200,
        tags: ['categories']
      }
    });
    categories = result.data || [];
  } catch (error) {
    console.error("FetchError (home/categories):", error.message);
  }

  const featuredCategories = categories?.filter(
    (category) => category.isFeatured === true,
  );

  if (featuredCategories?.length)
    return (
      <div className="relative w-full overflow-hidden bg-[var(--color-secondary-300)]">
        <div className="absolute -bottom-24 h-[90%] w-[350%] opacity-50 sm:bottom-0 sm:top-0 sm:w-[150%] md:w-[125%] lg:top-1/2 lg:w-[125%] lg:-translate-y-1/2 xl:w-full 2xl:-bottom-10 2xl:top-[unset] 2xl:h-[105%] 2xl:translate-y-0">
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
        <div className="relative mx-auto px-5 py-8 md:py-10 lg:py-12 xl:max-w-[1200px] xl:px-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold md:text-2xl lg:text-3xl">
              Browse <span className="max-sm:hidden">Our</span> Categories
            </h1>
            <div className="relative">
              <TransitionLink
                className="flex items-center gap-2 text-[10px] transition-[gap] duration-300 ease-in-out hover:gap-3 md:text-base"
                href="/shop"
              >
                View All{" "}
                <span className="rounded-full border border-black p-1 md:p-2">
                  <FaArrowRightLong />
                </span>
              </TransitionLink>
              <div className="absolute -left-3 top-0 aspect-[2.1/1] w-14 -translate-x-full md:-left-7 md:w-16 lg:w-20 xl:-left-16">
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
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5 max-lg:[&>a:last-child]:hidden">
            {featuredCategories?.map((featuredCategory) => {
              return (
                <TransitionLink
                  key={"featured-category-" + featuredCategory?._id}
                  href={`/shop?category=${featuredCategory?.label?.split(" ")?.join("+")}`}
                  className="relative flex aspect-[4/5.5] w-full items-center justify-center overflow-hidden rounded-md text-2xl font-semibold text-white max-xl:aspect-[4/5] sm:max-lg:min-h-[250px]"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 ease-in-out after:absolute after:inset-0 after:h-full after:w-full after:bg-black after:bg-opacity-40 after:content-[''] hover:scale-[1.15]"
                    style={{
                      // backgroundImage: `url(${featuredCategory?.imageUrl})`,
                      backgroundImage: `url(${getImage(featuredCategory?.imageUrl, 600)})`,
                    }}
                  />
                  <p className="pointer-events-none z-[2] p-1 text-center">
                    {featuredCategory?.label}
                  </p>
                </TransitionLink>
              );
            })}
          </div>
        </div>
      </div>
    );
}
