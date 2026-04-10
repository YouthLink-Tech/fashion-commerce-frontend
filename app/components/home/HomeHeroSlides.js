"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { FaArrowRightLong } from "react-icons/fa6";
import squigglyShape from "@/public/shapes/squiggly.png";
import arrowShape from "@/public/shapes/arrow.png";
import TransitionLink from "@/app/components/ui/TransitionLink";
import { getImage } from "@/app/lib/cloudinaryUtils";

const transitionDuration = 1000; // Duration of the fade animation
const transitionDelay = 150; // Base delay for staggering animations

export default function HomeHeroSlides({
  isEnabled,
  slideInterval,
  leftSlides = [],
  centerSlides = [],
  rightSlides = [],
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const canSlide = centerSlides && centerSlides.length > 1;

  const nextSlide = useCallback(() => {
    if (canSlide) {
      setCurrentIndex((prev) => (prev + 1) % centerSlides.length);
    }
  }, [canSlide, centerSlides?.length]);

  // Auto-slide logic
  useEffect(() => {
    if (isEnabled && canSlide) {
      const intervalId = setInterval(
        nextSlide,
        slideInterval * transitionDuration, // Interval between slide changes
      );
      return () => clearInterval(intervalId);
    }
  }, [isEnabled, canSlide, slideInterval, nextSlide]);

  const getImageStyle = (index, delayMultiplier = 0) => {
    const isActive = index === currentIndex;
    return {
      opacity: isActive ? 1 : 0,
      visibility: isActive ? "visible" : "hidden",
      transitionProperty: "opacity, visibility",
      transitionTimingFunction: "ease-in-out",
      transitionDuration: `${transitionDuration}ms`,
      transitionDelay: isActive ? `${transitionDelay * delayMultiplier}ms` : "0ms",
      WebkitBackfaceVisibility: "hidden",
    }
  };

  return (
    <div className="relative flex h-svh flex-col px-5 pb-6 pt-[106px] sm:h-[65svh] sm:px-8 sm:pt-32 lg:px-12 xl:mx-auto xl:max-w-[1200px] xl:px-0 2xl:pb-[6vh] 2xl:pt-[calc(88px+6vh)] portrait:md:h-[75svh] portrait:lg:h-[60svh] landscape:h-svh">
      {/* Text Content and CTA */}
      <div>
        <div className="relative flex items-center justify-evenly">
          <div className="size-8 max-sm:absolute max-sm:left-0 max-sm:top-[30%] sm:size-12 sm:-translate-y-1/2 lg:size-14">
            <Image src={squigglyShape} alt="Squiggly shape" />
          </div>
          <div className="max-w-[88%] sm:max-w-[60%] md:max-w-lg lg:max-w-screen-sm">
            <h1 className="text-center text-3xl font-semibold text-neutral-600 md:text-4xl lg:text-5xl portrait:[@media_(max-height:_700px)]:text-2xl">
              Discover{" "}
              <span className="bg-[linear-gradient(to_right,theme(colors.green.600),theme(colors.emerald.400))] bg-clip-text text-transparent">
                Unique
              </span>{" "}
              Styles for This Season
            </h1>
            <p className="py-6 text-center text-neutral-500 portrait:[@media_(max-height:_700px)]:text-sm">
              Uncover the latest trends with our one-of-a-kind men&apos;s
              fashion. Each item is uniquely designed and available in limited
              numbers.
            </p>
          </div>
          <div className="size-8 max-sm:absolute max-sm:right-0 max-sm:top-[30%] sm:size-12 sm:-translate-y-1/2 lg:size-14">
            <Image src={arrowShape} alt="Arrow shape" />
          </div>
        </div>
        <div className="flex items-center justify-center">
          <TransitionLink
            href="/shop"
            className="flex cursor-pointer items-center gap-2 text-sm font-semibold transition-[gap] duration-300 ease-in-out hover:gap-3"
          >
            Shop Now{" "}
            <span className="rounded-full border border-black p-2">
              <FaArrowRightLong size={12} />
            </span>
          </TransitionLink>
        </div>
      </div>
      {/* Image Sections */}
      <div className="hero-images pointer-events-none flex grow min-h-0 justify-center gap-2 max-sm:mt-7 max-sm:flex-wrap max-sm:h-[50svh] md:-mt-2 md:gap-3 xl:-mt-3 xl:justify-between xl:gap-4 landscape:mt-auto landscape:max-h-[550px]">
        {/* Left Images */}
        <div className="relative flex overflow-hidden">
          {leftSlides?.map((leftImgUrl, index) => (
            <Image
              key={`left-hero-img-${leftImgUrl}-${index}`}
              // src={leftImgUrl}
              src={getImage(leftImgUrl, 400)}
              alt={`Hero section left side image ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover rounded-md"
              style={getImageStyle(index, 0)} // No delay for left images
            />
          ))}
        </div>
        {/* Center Images */}
        <div className="relative flex overflow-hidden">
          {centerSlides?.map((centerImgUrl, index) => (
            <Image
              key={`center-hero-img-${centerImgUrl}-${index}`}
              // src={centerImgUrl}
              src={getImage(centerImgUrl, 1000)}
              alt={`Hero section center image ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-bottom rounded-md"
              style={getImageStyle(index, 1)} // Base delay for center images
            />
          ))}
        </div>
        {/* Right Images */}
        <div className="relative flex overflow-hidden">
          {rightSlides?.map((rightImgUrl, index) => (
            <Image
              key={`right-hero-img-${rightImgUrl}-${index}`}
              // src={rightImgUrl}
              src={getImage(rightImgUrl, 400)}
              alt={`Hero section right side image ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover rounded-md"
              style={getImageStyle(index, 2)} // Double delay for right images
            />
          ))}
        </div>
      </div>
    </div>
  );
}
