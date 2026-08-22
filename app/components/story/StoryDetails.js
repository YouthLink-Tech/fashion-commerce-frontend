"use client";

import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@nextui-org/react";
import { CgArrowUp } from "react-icons/cg";
import circleWithStarShape from "@/public/shapes/circle-with-star.svg";
import swirlyArrowShape from "@/public/shapes/swirly-arrow.svg";
import swirlyScribbledArrowShape from "@/public/shapes/swirly-scribbled-arrow.svg";
import RichTextRenderer from "../shared/RichTextRenderer";
import { getImage, getVideo } from "@/app/lib/cloudinaryUtils";

export default function StoryDetails({
  gsap,
  useGSAP,
  selectedDept,
  setSelectedDept,
}) {
  const [videoLoaded, setVideoLoaded] = useState({});

  useGSAP(() => {
    gsap.set("#story-details", { autoAlpha: 1 });

    // Animation for staff image (appears once)
    gsap.from("#staff-img", {
      autoAlpha: 0,
      x: -50,
      duration: 1,
      ease: "power2.out",
    });

    // Animation for the circle with star shape near the staff image (appears once)
    gsap.from("#staff-img img.absolute", {
      autoAlpha: 0,
      scale: 0.5,
      duration: 1,
      ease: "elastic.out(1,0.5)",
    });

    // Animation for the go back button (appears once)
    gsap.from("#go-back-to-hero", {
      autoAlpha: 0,
      scale: 0.5,
      duration: 1,
      ease: "elastic.out(1,0.5)",
    });

    // Animations for quote sections
    gsap.utils.toArray(".quote").forEach((element) => {
      gsap.from(element, {
        autoAlpha: 0,
        duration: 1,
        y: 75,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    });

    // Animations for media sections
    gsap.utils.toArray(".media").forEach((element) => {
      gsap.from(element, {
        autoAlpha: 0,
        duration: 1,
        x: element.classList.contains("ml-auto") ? -100 : 100,
        duration: 1,
        delay: 0.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    });

    // Animations for swirly and circle shapes
    gsap.utils.toArray(".swirly, .circle").forEach((element) => {
      gsap.from(element, {
        autoAlpha: 0,
        duration: 1,
        scale: 0.5,
        duration: 1,
        delay: 0.6,
        ease: "elastic.out(1,0.5)",
        scrollTrigger: {
          trigger: element,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    });

    // Animations for hashtag titles (h4)
    gsap.utils.toArray("#story-details h4").forEach((element) => {
      gsap.from(element, {
        autoAlpha: 0,
        duration: 1,
        xPercent: element.classList.contains("left-0") ? 15 : -15,
        duration: 1,
        delay: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    });
  }, {});

  const isSrcForVideo = (resourceType) => {
    return resourceType === "video";
  };

  return (
    <div
      id="story-details"
      className="invisible z-[1] grid grid-cols-5 justify-center md:space-x-5 md:max-xl:grid-cols-3 lg:space-x-12 xl:space-x-16"
    >
      <div
        id="staff-img"
        className="relative col-span-full mx-5 h-[calc(100svh-(var(--header-height-xs)+var(--section-padding)))] sm:mx-8 md:sticky md:top-5 md:col-span-1 md:mx-12 md:h-[calc(100svh-(var(--header-height-sm)+var(--section-padding)))] md:w-full md:max-w-[calc(1200px*2/5-64px/2)] lg:h-[calc(100svh-var(--section-padding-double))] xl:col-span-2 xl:ml-auto xl:mr-0"
      >
        {/* Shape/SVG (circle with star) */}
        <Image
          src={circleWithStarShape}
          alt="circle with star shape"
          className="absolute top-1/4 aspect-square w-52 object-contain opacity-90 max-md:rotate-90 max-sm:right-0 sm:w-64 sm:max-md:right-1/3 sm:max-md:translate-x-1/2 md:-left-7 md:top-1/3 md:w-44 lg:w-56 xl:left-[10%] xl:w-48 min-[1800px]:left-0 min-[1800px]:w-64"
          height={0}
          width={0}
          sizes="25vw"
        />
        {/* Staff Image */}
        <Image
          src={getImage(selectedDept.staffMedia.public_id, 400)}
          alt={selectedDept.staff_name}
          height={0}
          width={0}
          sizes="750px"
          className="relative h-full w-full object-contain"
        />
      </div>
      <div className="relative col-span-full overflow-hidden md:col-span-2 xl:col-span-3">
        <div
          id="dept-details"
          className="relative mx-5 sm:mx-8 md:mx-12 md:max-w-[calc(1200px*3/5-64px/2)] xl:ml-0 xl:mr-auto"
        >
          {selectedDept.sections?.map((section, index) => (
            <div
              key={"section-" + section.quote + index}
              className={`relative flex flex-col justify-center ${index !== 0 ? "min-h-svh gap-y-44" : "min-h-svh gap-y-44 md:min-h-[calc(100svh-(var(--header-height-sm)+var(--section-padding-double)))] md:gap-y-32 lg:min-h-[calc(100svh-(var(--header-height-lg)+var(--section-padding-double)))]"}`}
            >
              {/* Quote Section */}
              <div
                className={`quote relative max-w-2xl ${index % 2 === 0 ? "mr-auto text-left" : "ml-auto text-right"}`}
              >
                {/* Quote */}
                {/* <div
                  dangerouslySetInnerHTML={{
                    __html: section.quote,
                  }}
                  className="text-xl font-semibold text-neutral-600 sm:text-3xl [&_strong]:bg-[linear-gradient(to_right,#804D3A,#D86F4D,#F3A761)] [&_strong]:bg-clip-text [&_strong]:text-transparent"
                /> */}
                <RichTextRenderer
                  content={section.quote}
                  className="text-xl font-semibold text-neutral-600 sm:text-3xl [&_strong]:bg-[linear-gradient(to_right,#804D3A,#D86F4D,#F3A761)] [&_strong]:bg-clip-text [&_strong]:text-transparent"
                />
                {/* Shape/SVG (swirly arrow) */}
                <Image
                  src={
                    index % 2 === 0
                      ? swirlyScribbledArrowShape
                      : swirlyArrowShape
                  }
                  alt={`Swirly ${index % 2 === 0 ? "scribbled" : ""} arrow`}
                  className={`swirly absolute aspect-square w-20 min-w-20 object-contain opacity-30 ${index % 2 === 0 ? "-bottom-8 left-0 translate-x-1/2 translate-y-full rotate-90" : "-bottom-8 translate-x-1/2 translate-y-full max-sm:left-0 sm:-bottom-1/3 sm:right-0 sm:translate-x-1/4 sm:-rotate-45 md:translate-x-full"}`}
                  height={0}
                  width={0}
                  sizes="25vw"
                />
              </div>
              {/* Media (Video/Image) Section */}
              <div
                className={`media relative mb-[calc(12px+1.875rem*1.25)] aspect-video w-full sm:mb-[calc(12px+3.75rem*1.25)] sm:w-2/3 md:mb-[calc(12px+2.25rem*1.25)] md:max-lg:w-3/4 lg:mb-[calc(12px+3rem*1.25)] ${index % 2 === 0 ? "ml-auto" : "mr-auto"}`}
              >
                {isSrcForVideo(section.media.resource_type) ? (
                  <div className="relative z-[1] h-full w-full">
                    {/* Skeleton Placeholder */}
                    {!videoLoaded[index] && (
                      <Skeleton className="absolute inset-0 h-full w-full rounded-md" />
                    )}
                    {/* Video Element */}
                    <video
                      className={`media-video relative h-full w-full rounded-md object-cover transition-opacity duration-300 ease-in-out ${videoLoaded[index] ? "opacity-100" : "opacity-0"
                        }`}
                      autoPlay
                      muted
                      loop
                      onCanPlayThrough={() =>
                        setVideoLoaded((prev) => ({ ...prev, [index]: true }))
                      }
                    >
                      <source src={getVideo(section.media.public_id)} type="video/mp4" />
                    </video>
                  </div>
                ) : (
                  // Image Element
                  <Image
                    src={getImage(section.media.public_id, 600)}
                    alt={`Department Image ${index + 1}`}
                    className="media-image relative z-[1] aspect-video w-full rounded-md object-cover"
                    height={0}
                    width={0}
                    sizes="25vw"
                  />
                )}
                {/* Text Outline Effect */}
                <h4
                  className={`pointer-events-none absolute -bottom-3 z-[0] translate-y-full select-none bg-[linear-gradient(to_right,#804D3A,#D86F4D,#F3A761)] bg-clip-text text-3xl/[1.25] font-bold text-transparent sm:text-6xl/[1.25] md:text-4xl/[1.25] lg:text-5xl/[1.25] ${index % 2 === 0 ? "right-0" : "left-0"}`}
                >
                  {section.hashtag}
                </h4>
                {/* Shape/SVG (circle with star) */}
                <Image
                  src={circleWithStarShape}
                  alt="circle with star shape"
                  className="circle absolute right-0 top-0 aspect-square w-52 -translate-y-1/3 translate-x-1/3 -scale-x-100 object-contain opacity-90 sm:max-md:w-64"
                  height={0}
                  width={0}
                  sizes="25vw"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          id="go-back-to-hero"
          className="fixed bottom-3 left-3 z-[3] flex items-center justify-center gap-2 rounded-[4px] bg-neutral-50/20 p-2 font-semibold text-gray-700 backdrop-blur-lg transition-[color] duration-300 ease-in-out hover:text-black sm:left-6 md:left-auto"
          onClick={() => {
            gsap.to(window, {
              duration: 0.6,
              scrollTo: 0,
              ease: "power4.out",
              onComplete: () =>
                gsap.to(
                  "#staff-img > img, #dept-details .quote > div, #dept-details .quote > img, #dept-details .media, #go-back-to-hero",
                  {
                    yPercent: 10,
                    autoAlpha: 0,
                    stagger: { amount: 0.5 },
                    duration: 0.5,
                    ease: "power1.inOut",
                    onComplete: () => setSelectedDept(null),
                  },
                ),
            });
          }}
        >
          Go Back
          <span className="rounded-full border-1.5 border-gray-700 p-1 transition-[border-color] duration-300 ease-in-out hover:border-black">
            <CgArrowUp className="text-lg" />
          </span>
        </button>
      </div>
    </div>
  );
}
