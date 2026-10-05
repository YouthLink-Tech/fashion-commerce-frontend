import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import TransitionLink from "../../ui/TransitionLink";
import { getImage } from "@/app/lib/cloudinaryUtils";

export default function ReturnInfoModalItems({ returnItems = [], orderItems = [] }) {

  const calculateTotalItems = () => {
    return returnItems.reduce(
      (accumulator, item) => Number(item.quantity || 0) + accumulator,
      0,
    );
  };

  return (
    <>
      <div className="mt-6 flex items-center gap-2.5 font-semibold">
        <h2 className="text-sm uppercase md:text-[15px]/[1]">
          Items Marked with Issues
        </h2>
        <span className="flex size-5 items-center justify-center rounded-full bg-neutral-200 text-[11px]/[1] font-semibold text-neutral-600 md:text-xs/[1]">
          {calculateTotalItems()}
        </span>
      </div>
      <div className="rounded-[4px] border-2 border-neutral-200 p-3 font-semibold sm:px-5 sm:py-4">
        <ul className="grid auto-rows-fr gap-5">
          {returnItems?.map((returnItem, index) => {

            const matchedItem = orderItems?.find(
              (i) => i.id === returnItem.order_item_id,
            );

            return (
              <li
                key={
                  "marked-return-item-" +
                  returnItem.id
                }
                className="flex w-full items-stretch justify-between gap-x-2.5"
              >
                <TransitionLink
                  href={`/product/${matchedItem?.product_slug}`}
                  className="relative block min-h-full w-[72px] shrink-0 overflow-hidden rounded-[4px] bg-[var(--product-default)] sm:w-20 md:w-28 xl:w-1/4"
                >
                  {!!matchedItem?.thumbnail_image_url && (
                    <Image
                      className="h-full w-full object-cover"
                      src={getImage(matchedItem?.thumbnail_image_url, 400)}
                      alt={`${matchedItem?.product_title} - Marked Return Item (${index + 1})`}
                      fill
                      sizes="15vh"
                    />
                  )}
                </TransitionLink>
                <div className="grow text-xs text-neutral-400 lg:text-sm">
                  <div className="h-full">
                    <div className="flex justify-between gap-x-2 sm:gap-x-5">
                      <div>
                        <TransitionLink
                          href={`/product/${matchedItem?.product_slug}`}
                          className="underline-offset-1 hover:underline"
                        >
                          <h4 className="line-clamp-1 text-neutral-600 md:text-[15px]">
                            {matchedItem?.product_title}
                          </h4>
                        </TransitionLink>
                        <div className="mt-1 flex gap-x-1.5 text-xs md:text-[13px]">
                          <h5>Unit Price:</h5>
                          <span>{Number(returnItem?.final_unit_price || 0).toLocaleString()}</span>
                        </div>
                        <div className="mt-1 flex gap-x-1.5 text-xs md:text-[13px]">
                          <h5>Size:</h5>
                          <span>{matchedItem?.size_name}</span>
                        </div>
                        <div className="mt-1 flex gap-x-1.5 text-xs md:text-[13px]">
                          <h5>Color:</h5>
                          <div className="flex items-center gap-x-1">
                            <div
                              style={{
                                backgroundColor: matchedItem?.color_hex || "#fff",
                              }}
                              className="size-3.5 max-h-3.5 max-w-3.5 rounded-full"
                            />
                            <p className="line-clamp-1">{matchedItem?.color_name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex h-fit shrink-0 gap-x-2">
                          <p className="w-full text-nowrap text-right text-neutral-600 md:text-[15px]">
                            ৳{" "}
                            {(
                              Number(returnItem?.final_unit_price || 0) *
                              Number(returnItem?.quantity || 0)
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <div className="flex gap-x-1.5 justify-self-end text-[13px] md:text-sm">
                            <h5 className="lg:hidden">Qty:</h5>
                            <h5 className="max-lg:hidden">Quantity:</h5>
                            <span>{returnItem?.quantity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-1 text-xs md:text-[13px]">
                      <h5 className="mr-1.5 inline text-nowrap">
                        Provided Issue{returnItem?.issues?.length > 1 ? "s" : ""}:
                      </h5>
                      <span>{returnItem?.issues?.join(", ")}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-x-1.5">
                      <h5 className="text-xs md:text-[13px]">Status:</h5>
                      <div
                        className={`h-fit w-fit cursor-default text-nowrap rounded-[3px] px-1.5 py-1 text-[10px]/[1] font-semibold capitalize md:text-[11px]/[1] ${returnItem?.status?.toLowerCase() === "pending" ? "bg-yellow-100 text-yellow-600" : returnItem?.status?.toLowerCase() === "accepted" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                      >
                        {returnItem?.status}
                      </div>
                      {!!returnItem?.decline_reason && (
                        <Popover
                          classNames={{
                            content: [
                              "p-3.5 max-w-[80dvw] rounded-[4px] sm:max-w-60 lg:max-w-80 shadow-[1px_1px_20px_0_rgba(0,0,0,0.15)] text-sm",
                            ],
                          }}
                          placement="bottom-start"
                        >
                          <PopoverTrigger className="!z-0 h-fit w-fit cursor-pointer text-[11px] font-semibold text-[var(--color-primary-900)] underline underline-offset-1 md:text-xs/[1]">
                            Why?
                          </PopoverTrigger>
                          <PopoverContent>
                            <p>{returnItem.decline_reason}</p>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
