import { useState } from "react";
import RichTextRenderer from "../shared/RichTextRenderer";

export default function ProductInfoDetails({ productInfoDetails }) {
  const [activeTabKey, setActiveTabKey] = useState("productDetails");
  const predefinedTabs = {
    productDetails: "Item Details",
    ...(productInfoDetails?.sizeFit && { sizeFit: "Size & Fit" }),
    ...(productInfoDetails?.materialCare && {
      materialCare: "Material & Care",
    }),
  };

  return (
    <section className="my-4 flex min-h-0 grow flex-col">
      <div>
        {/* Tabs */}
        <ul className="mb-4 flex gap-1.5 font-semibold text-neutral-600 max-xl:overflow-x-auto">
          {Object.entries(predefinedTabs).map(([backendKey, frontendLabel]) => {
            return (
              <li
                key={"product-details-tab-" + backendKey + frontendLabel}
                className={`shrink-0 cursor-pointer text-nowrap rounded-[4px] border-2 border-neutral-200 px-3.5 py-2.5 text-sm/[1] transition-[background-color] duration-300 ease-in-out ${activeTabKey === backendKey ? "bg-neutral-200" : "bg-transparent hover:bg-neutral-100"}`}
                onClick={() => setActiveTabKey(backendKey)}
              >
                {frontendLabel}
              </li>
            );
          })}
        </ul>
      </div>
      {/* Tab Details Section */}
      <div className="custom-desktop-scrollbar mx-auto min-h-0 w-full flex-1 space-y-3.5 overflow-y-auto">
        {/* <div
          className="custom-desktop-scrollbar list-none overflow-y-auto text-neutral-500 [&_:is(h1,h2,h3,h4,h5,h6)]:mb-2 [&_:is(h1,h2,h3,h4,h5,h6)]:font-semibold"
          dangerouslySetInnerHTML={{ __html: productInfoDetails[activeTabKey] }}
        ></div> */}
        <RichTextRenderer
          content={productInfoDetails[activeTabKey]}
          className="custom-desktop-scrollbar list-none overflow-y-auto text-neutral-500 [&_:is(h1,h2,h3,h4,h5,h6)]:mb-2 [&_:is(h1,h2,h3,h4,h5,h6)]:font-semibold"
        />
      </div>
    </section>
  );
}
