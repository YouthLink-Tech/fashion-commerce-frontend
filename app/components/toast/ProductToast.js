"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { HiCheckCircle, HiXCircle } from "react-icons/hi2";

export default function ProductToast({
  defaultToast,
  isSuccess,
  message,
  productImg,
  productTitle,
  variantSize,
  variantSizes,
  variantColor,
  variantColors,
}) {
  const [marginTop, setMarginTop] = useState(0);
  const toastRef = useRef(null);

  // console.log("variantColors", variantColors);

  // Scroll listener to update marginTop
  useEffect(() => {
    const updateMargin = () => {
      const header = document.querySelector("#header");
      if (!header) return;

      const headerHeight = header.offsetHeight;
      const offset = headerHeight - window.scrollY;
      const isHeaderOutOfViewport = offset < 0;
      const marginTopVal = isHeaderOutOfViewport ? 0 : offset;

      setMarginTop(marginTopVal);
    };

    updateMargin();
    window.addEventListener("scroll", updateMargin);
    return () => window.removeEventListener("scroll", updateMargin);
  }, []);

  // Animate visibility
  useEffect(() => {
    const el = toastRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.style.transform = `translateY(${defaultToast.visible ? "0px" : "-24px"})`;
      el.style.opacity = defaultToast.visible ? "1" : "0";
    });
  }, [defaultToast.visible]);

  return (
    <div
      ref={toastRef}
      className="z-[6] min-w-60 -translate-y-6 rounded-[4px] bg-white p-2.5 opacity-0 shadow-[4px_4px_16px_0_rgba(0,0,0,0.15)] transition-[opacity,transform] duration-400 ease-out"
      style={{ marginTop }}
    >
      {/* Confirmation of Addition to Cart */}
      <div className="flex items-center gap-1.5">
        {isSuccess ? (
          <HiCheckCircle className="size-5 text-green-500" />
        ) : (
          <HiXCircle className="size-5 text-red-500" />
        )}
        <p className="text-[15px]/[1] font-semibold text-neutral-600">
          {message}
        </p>
      </div>
      {/* Divider */}
      <hr className="my-2.5 h-0.5 w-full bg-neutral-100" />
      {/* Cart Item Information */}
      <div className="flex w-fit items-stretch justify-between gap-x-2.5">
        {/* Cart Item Image */}
        <div className="relative min-h-full grow overflow-hidden rounded-[4px] bg-[var(--product-default)] max-sm:w-16 sm:aspect-[1.1/1] sm:h-[52px]">
          <Image
            className="h-full w-full object-contain"
            src={productImg}
            alt={productTitle}
            fill
            sizes="15vh"
          />
        </div>
        <div className="space-y-1.5 font-semibold text-neutral-400 [&_:is(h4,h5,p)]:text-nowrap">
          {/* Cart Item Title */}
          <h4 className="text-sm/[1] text-neutral-500">{productTitle}</h4>
          {/* Cart Item Size */}
          <div className="flex gap-x-1.5 text-[11px]/[1] sm:text-xs/[1]">
            <h5>{variantSize ? "Size" : "Sizes"}:</h5>
            <span>{variantSize || variantSizes.join(", ")}</span>
          </div>
          {/* Cart Item Color */}
          <div className="flex gap-x-1.5 text-[11px]/[1] sm:text-xs/[1]">
            <h5>{variantColor ? "Color" : "Colors"}:</h5>
            {variantColor ? (
              <div className="flex items-center gap-x-1">
                <div
                  style={{
                    background:
                      variantColor?.label !== "Multicolor"
                        ? variantColor?.color
                        : "linear-gradient(90deg, blue 0%, red 40%, green 80%)",
                  }}
                  className="size-2.5 rounded-full ring-1 ring-neutral-300"
                />
                {variantColor?.label}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {variantColors.map((variantColor) => (
                  <div
                    key={`wishlist-toast-color-${variantColor}`}
                    style={{
                      background:
                        variantColor?.label !== "Multicolor"
                          ? variantColor?.color
                          : "linear-gradient(90deg, blue 0%, red 40%, green 80%)",
                    }}
                    className="size-2.5 rounded-full ring-1 ring-neutral-300"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
