import { useEffect, useRef, useState } from "react";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { LuBadge } from "react-icons/lu";
import { MdOutlineNewReleases } from "react-icons/md";
import { TbRosetteDiscount } from "react-icons/tb";
import { TiStarOutline } from "react-icons/ti";

export default function ProductBadges({
  isTrending,
  isNewArrival,
  hasSpecialOffer,
  specialOffer,
  hasDiscount,
  discount,
}) {
  const [specialOfferTextWidth, setSpecialOfferTextWidth] = useState(0);
  const [discountTextWidth, setDiscountTextWidth] = useState(0);
  const canvasRef = useRef();

  useEffect(() => {
    if (hasSpecialOffer && specialOffer) {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }
      const context = canvasRef.current.getContext("2d");
      context.font = "12px 'Oxygen', sans-serif"; // Match the font styles

      // Extract badge title and value text
      const titleText = specialOffer.badge_title || "";
      const isPercentage =
        (specialOffer.discount_type || "").toLowerCase() === "percentage";
      const valueText = isPercentage
        ? `${specialOffer.discount_value}% OFF!`
        : `৳ ${specialOffer.discount_value} OFF!`;

      // Measure base widths
      let computedTitleWidth = context.measureText(titleText).width;
      let computedValueWidth = context.measureText(valueText).width;

      // Count digits
      const titleDigitCount = (titleText.match(/\d/g) || []).length;
      const ValueDigitCount = (valueText.match(/\d/g) || []).length;

      // Slightly increase widths based on number of digits
      computedTitleWidth += titleDigitCount * 0.1;
      computedValueWidth += ValueDigitCount * 0.1;

      // Take the maximum width between title and value text
      let measuredWidth = Math.max(computedTitleWidth, computedValueWidth);

      setSpecialOfferTextWidth(measuredWidth);
    }
  }, [specialOffer, hasSpecialOffer]);

  useEffect(() => {
    if (hasDiscount) {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }
      const context = canvasRef.current.getContext("2d");
      context.font = "12px 'Oxygen', sans-serif"; // Match the font styles
      let measuredWidth;

      // Measure the width of the computed discount text
      measuredWidth = context.measureText(discount.text + " OFF!").width;

      // Adjust width for "Flat" type for extra spacing
      if (discount.type === "Flat") {
        measuredWidth += 3; // Add buffer for visual spacing
      }

      setDiscountTextWidth(measuredWidth);
    }
  }, [discount, hasDiscount]);

  const baseWidth = 32; // Width for the icon
  const padding = 7; // Additional padding
  const expandedTrendingWidth = baseWidth + 52 + padding;
  const expandedNewArrivalWidth = baseWidth + 28 + padding;
  const expandedSpecialOfferWidth = baseWidth + specialOfferTextWidth + padding;
  const expandedDiscountWidth = baseWidth + discountTextWidth + padding;

  const isSpecialOfferPercentage =
    (specialOffer?.discount_type || "").toLowerCase() === "percentage";

  return (
    <div className="absolute left-3 top-3 z-[3] space-y-2">
      {isTrending && (
        <div
          className="relative size-8 overflow-hidden rounded-[3px] bg-[#cd4747] font-semibold text-white shadow-[1px_1px_12px_0_rgba(0,0,0,0.1)] transition-[width] hover:w-[var(--expanded-width)]"
          style={{
            "--expanded-width": `${expandedTrendingWidth}px`,
          }}
        >
          <div className="relative mx-1 h-8 w-6">
            <LuBadge className="h-full w-full object-contain" />
            <HiOutlineLightningBolt className="absolute left-1/2 top-1/2 h-full w-2/3 -translate-x-1/2 -translate-y-1/2 object-contain" />
          </div>
          <p className="absolute left-8 top-1/2 -translate-y-1/2 text-nowrap text-xs">
            Trending!
          </p>
        </div>
      )}
      {isNewArrival && (
        <div
          className="relative size-8 overflow-hidden rounded-[3px] bg-[#5c49d9] font-semibold text-white shadow-[1px_1px_12px_0_rgba(0,0,0,0.1)] transition-[width] hover:w-[var(--expanded-width)]"
          style={{
            "--expanded-width": `${expandedNewArrivalWidth}px`,
          }}
        >
          <MdOutlineNewReleases className="mx-1 h-8 w-6 object-contain" />
          <p className="absolute left-8 top-1/2 -translate-y-1/2 text-nowrap text-xs">
            New!
          </p>
        </div>
      )}
      {hasSpecialOffer && specialOffer ? (
        <div
          className="relative w-8 overflow-hidden rounded-[3px] bg-[#a138b1] font-semibold text-white shadow-[1px_1px_12px_0_rgba(0,0,0,0.1)] transition-[width] duration-300 hover:w-[var(--expanded-width)] [&:hover>div:last-child]:animate-[scroll_3s_linear_infinite]"
          style={{
            "--expanded-width": `${expandedSpecialOfferWidth}px`,
          }}
        >
          <div className="relative mx-1 h-8 w-6">
            <LuBadge className="h-full w-full object-contain" />
            <TiStarOutline className="absolute left-1/2 top-1/2 h-full w-2/3 -translate-x-1/2 -translate-y-1/2 object-contain" />
          </div>
          <div className="absolute left-8 top-2 flex flex-col gap-6 transition-transform duration-300 ease-in-out [&>p]:pointer-events-none [&>p]:text-nowrap [&>p]:text-xs">
            <p>{specialOffer.badge_title}</p>
            <p>
              {isSpecialOfferPercentage
                ? `${specialOffer.discount_value}% OFF!`
                : `৳ ${specialOffer.discount_value} OFF!`}
            </p>
          </div>
        </div>
      ) : (
        hasDiscount && (
          <div
            className="relative h-8 w-8 overflow-hidden rounded-[3px] bg-[#32aa54] font-semibold text-white shadow-[1px_1px_12px_0_rgba(0,0,0,0.1)] transition-all hover:w-[var(--expanded-width)]"
            style={{
              "--expanded-width": `${expandedDiscountWidth}px`,
            }}
          >
            <TbRosetteDiscount className="mx-1 h-8 w-6 object-contain" />
            <p className="absolute left-8 top-1/2 -translate-y-1/2 text-nowrap text-xs">
              {discount.text} OFF!
            </p>
          </div>
        )
      )}
    </div>
  );
}
