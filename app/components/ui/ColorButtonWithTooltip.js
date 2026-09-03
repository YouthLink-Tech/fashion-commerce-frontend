"use client";

import { useEffect, useRef, useState } from "react";
import { Tooltip } from "@nextui-org/react";

export default function ColorButtonWithTooltip({
  color,
  colorIndex,
  toolLocation,
  selectedOptions,
  setSelectedOptions,
  setActiveImageIndex,
  setNumOfTimesThumbnailsMoved,
  activeColorIndex,
  setActiveColorIndex,
}) {
  const isActiveColor =
    toolLocation === "card"
      ? activeColorIndex === colorIndex
      : selectedOptions?.color.id === color.id;

  const [openTooltipId, setOpenTooltipId] = useState(null);
  const isTouchDevice =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    "ontouchstart" in window;

  const timeoutRef = useRef(null);

  const handleColorClick = (event) => {
    if (toolLocation === "page") {
      setActiveImageIndex(0);
      setNumOfTimesThumbnailsMoved(0);
    } else if (toolLocation === "card") {
      setActiveColorIndex(colorIndex);
    }

    if (toolLocation !== "card") {
      setSelectedOptions((prevOptions) => ({
        ...prevOptions,
        color: color,
        quantity: 1,
      }));
    }

    if (isTouchDevice) {
      // Toggle tooltip
      const isSame = openTooltipId === color.id;
      setOpenTooltipId(isSame ? null : color.id);

      // Clear existing timeout if any
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (!isSame) {
        // Auto-close after 3 seconds
        timeoutRef.current = setTimeout(() => {
          setOpenTooltipId(null);
        }, 3000);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Tooltip
      content={color.name}
      shouldFlip
      classNames={{
        content: [
          "px-3 rounded-[4px] py-2 shadow-[1px_1px_20px_0_rgba(0,0,0,0.15)]",
        ],
      }}
      isOpen={isTouchDevice ? openTooltipId === color.id : undefined}
      onOpenChange={(open) => {
        if (!isTouchDevice) {
          setOpenTooltipId(open ? color.id : null);
        }
      }}
    >
      {/* Button Wrapper */}
      <div
        className={`grid cursor-pointer place-items-center rounded-full border-2 transition-[border-color] duration-300 ease-in-out hover:border-[var(--color-secondary-900)] ${isActiveColor ? "border-[var(--color-secondary-900)]" : "border-transparent"} ${toolLocation === "card" ? "size-[26px]" : "size-8"}`}
        onClick={(event) => handleColorClick(event)}
      >
        {/* Color Button */}
        <button
          className={`rounded-full ring-1 ring-neutral-300 ${toolLocation === "card" ? "size-4" : "size-[22px]"}`}
          style={{
            background:
              color.name !== "Multicolor"
                ? color.hex
                : "linear-gradient(90deg, blue 0%, red 40%, green 80%)",
          }}
        ></button>
      </div>
    </Tooltip>
  );
}
