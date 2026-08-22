import Image from "next/image";
import { generateCardRotations } from "@/app/utils/generateCardRotations";
import { getImage } from "@/app/lib/cloudinaryUtils";

const SMALL_CARD_WIDTH = 100;
const SMALL_CARD_OFFSET = SMALL_CARD_WIDTH / 2;
const LARGE_CARD_WIDTH = 192;
const LARGE_CARD_OFFSET = LARGE_CARD_WIDTH / 2;

export default function StoryHero({
  gsap,
  useGSAP,
  Draggable,
  setSelectedDept,
  departments,
}) {
  const cardRotations = generateCardRotations(departments.length);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          isMobile: "(max-width: 639px)",
          isSmallTablet: "(min-width: 640px) and (max-width: 767px)",
          isMediumTablet: "(min-width: 768px) and (max-width: 1023px)",
          isLargeTablet: "(min-width: 1024px) and (max-width: 1279px)",
          isDesktop: "(min-width: 1280px)",
        },
        (ctx) => {
          const { isMobile, isDesktop } = ctx.conditions;
          const cardWidth = isMobile ? SMALL_CARD_WIDTH : LARGE_CARD_WIDTH;
          const cardOffset = isMobile ? SMALL_CARD_OFFSET : LARGE_CARD_OFFSET;

          const tl = gsap.timeline({
            delay: 0.5,
            scrollTrigger: {
              trigger: "#story-hero",
              start: `top center`,
              end: `bottom top`,
              toggleActions: "restart reset restart reset",
            },
            defaults: { autoAlpha: 0, duration: 0.5, ease: "power1.inOut" },
          });

          tl.set("#story-hero", { autoAlpha: 1 })
            .set("#cards-container", { marginRight: -cardWidth })
            .from("#story-hero h1", { y: 35 })
            .from(
              "#cards-container",
              { y: "50svh", rotate: 60, duration: 0.75 },
              "<",
            )
            .fromTo(
              ".hero-card",
              {
                autoAlpha: 1,
                rotate: 0,
                marginLeft: -cardWidth,
                stagger: { amount: 0.5 },
              },
              {
                autoAlpha: 1,
                rotate: (i) => (!isDesktop ? -12 : cardRotations[i]),
                marginLeft: -cardOffset,
                stagger: { amount: 0.5 },
              },
            )
            .fromTo(
              "#cards-container",
              { autoAlpha: 1, marginRight: -cardWidth },
              { autoAlpha: 1, marginRight: -cardOffset },
              "<0.25",
            )
            .from("#story-hero p", { y: 35 });

          // Drag/swipe support on smaller screens only
          if (!isDesktop) {
            const containerEl = document.getElementById("cards-container");
            const cardCount = departments.length;
            const padding = cardOffset + 16;
            const totalWidth =
              cardWidth +
              (cardCount - 1) * (cardWidth - cardOffset) +
              padding * 2;

            requestAnimationFrame(() => {
              const visibleWidth = containerEl.offsetWidth;
              const maxDrag = Math.max(totalWidth - visibleWidth, 0);

              gsap.set(containerEl, {
                paddingLeft: padding,
                paddingRight: padding,
              });

              Draggable.create(containerEl, {
                type: "x",
                inertia: true,
                edgeResistance: 0.5,
                dragResistance: 0.15,
                bounds: { minX: -maxDrag, maxX: 0 },
                cursor: "grab",
                activeCursor: "grabbing",
                throwProps: true,
              });
            });
          }
        },
      );
    },
    { dependencies: [cardRotations, departments.length] },
  );

  const handleSectionTransition = (dept) => {
    gsap.to(window, {
      duration: 0.6,
      scrollTo: 0,
      ease: "power4.out",
      onComplete: () => {
        gsap.to("#story-hero h1, #story-hero p", {
          y: -50,
          autoAlpha: 0,
          stagger: { amount: 0.5 },
          duration: 0.5,
          ease: "power1.inOut",
        });

        gsap.to(".hero-card", {
          xPercent: 2,
          autoAlpha: 0,
          stagger: { amount: 0.5 },
          duration: 0.5,
          ease: "power1.inOut",
          onComplete: () => setSelectedDept(dept),
        });
      },
    });
  };

  return (
    <div
      id="story-hero"
      className="invisible relative flex h-[calc(100svh-(var(--header-height-xs)+var(--section-padding-double)))] w-full items-center justify-center overflow-hidden sm:h-[calc(100svh-(var(--header-height-sm)+var(--section-padding-double)))] lg:h-[calc(100svh-(var(--header-height-lg)+var(--section-padding-double)))]"
    >
      <div className="z-[1] mx-5 sm:mx-8 md:mx-12 xl:mx-auto xl:max-w-[1200px]">
        <h1 className="mx-auto mb-14 max-w-2xl text-center text-3xl font-semibold text-neutral-700 [clip-path:polygon(0_0,100%_0,100%_100%,0_100%)] sm:text-6xl">
          Providing the{" "}
          <span className="bg-[linear-gradient(to_right,#804D3A,#D86F4D,#F3A761)] bg-clip-text text-transparent">
            Ultimate
          </span>{" "}
          Solution Needed.
        </h1>
        <div
          id="cards-container"
          className="flex items-center xl:justify-center [&:has(img:hover)_:not(div:hover)_img]:grayscale"
          style={{
            "--small-card-width": `${SMALL_CARD_WIDTH}px`,
            "--large-card-width": `${LARGE_CARD_WIDTH}px`,
          }}
        >
          {departments.map((dept, index) => {
            return (
              <div
                key={dept.id}
                onClick={() => handleSectionTransition(dept)}
                className="hero-card relative shrink-0 transition-[transform] delay-150 duration-500 ease-in-out [&:has(img:hover)>div]:delay-[500ms] [&:has(img:hover)>h4]:opacity-100 [&:has(img:hover)>h4]:delay-[500ms] [&:has(img:hover)>img]:w-[calc(var(--small-card-width)*1.33334)] sm:[&:has(img:hover)>img]:w-[calc(var(--large-card-width)*1.66667)] [&:has(img:hover)]:z-[1] [&:has(img:hover)]:-translate-y-3 [&:has(img:hover)_div]:opacity-100"
              >
                <Image
                  src={getImage(dept.cover.public_id, 400)}
                  alt={`Image ${index + 1}`}
                  width={0}
                  height={0}
                  sizes="350px"
                  className="size-[var(--small-card-width)] cursor-pointer rounded-md object-cover transition-[width,filter] delay-150 duration-500 ease-in-out sm:size-[var(--large-card-width)]"
                />
                <div className="absolute -top-5 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-full rotate-45 bg-[var(--color-secondary-400)] opacity-0 transition-opacity duration-300 ease-in-out"></div>
                <h4 className="pointer-events-none absolute -top-6 left-0 w-[calc(var(--small-card-width)*1.33334)] -translate-y-full rounded-md bg-[var(--color-secondary-400)] p-2 text-center text-neutral-700 opacity-0 transition-opacity duration-300 ease-in-out sm:w-[calc(var(--large-card-width)*1.66667)]">
                  {dept.work_summary}
                </h4>
              </div>
            );
          })}
        </div>
        <p className="mb-5 mt-20 text-center">
          Become a part of our journey. Let&apos;s conquer the world together.
        </p>
      </div>
    </div>
  );
}
