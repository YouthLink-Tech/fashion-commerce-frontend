import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
} from "@nextui-org/react";
import toast from "react-hot-toast";
import { useLoading } from "@/app/contexts/loading";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import ReturnItemsField from "./ReturnItemsField";
import ReturnBriefDescriptionField from "./ReturnBriefDescriptionField";
import ReturnImagesField from "./ReturnImagesField";

export default function ReturnOrderModal({
  isReturnModalOpen,
  setIsReturnModalOpen,
  activeReturnOrder,
  legalPolicyPdfLinks,
  register,
  watch,
  control,
  handleSubmit,
  setValue,
  reset,
  trigger,
  errors,
}) {
  const router = useRouter();
  const { setIsPageLoading } = useLoading();
  const returnItems = watch("items");
  const [imgFiles, setImgFiles] = useState([]);
  const [returnImgUrls, setReturnImgUrls] = useState([]);
  const [isPolicyChecked, setIsPolicyChecked] = useState(true);
  const [isFormSubmissionRequested, setIsFormSubmissionRequested] =
    useState(false);
  const isUploadingRef = useRef(false);

  const isAnyProductSelected = returnItems?.some(
    (returnItem) => returnItem?.isRequested,
  );

  // Calculates exact net unit price taking promo, special offers, and regular discounts into account
  const calculateFinalPrice = (item) => {
    if (!item) return 0;

    const regularPrice = Number(item.regular_price || 0);
    const itemQty = Number(item.quantity || 1);
    const appliedOfferDiscount = Number(item.applied_offer_discount || 0);
    const appliedPromoDiscount = Number(activeReturnOrder?.applied_promo_discount || 0);

    const totalItemsCount = activeReturnOrder?.items?.length || 1;

    let finalPrice = regularPrice;

    if (appliedPromoDiscount > 0) {
      const basePrice =
        Number(item.discount_value || 0) > 0 && item.final_price_after_discount
          ? Number(item.final_price_after_discount)
          : regularPrice;
      const promoSharePerItem = appliedPromoDiscount / totalItemsCount;
      finalPrice = Math.max(0, basePrice - (promoSharePerItem / itemQty));
    } else if (appliedOfferDiscount > 0) {
      finalPrice = Math.max(0, regularPrice - (appliedOfferDiscount / itemQty));
    } else if (Number(item.discount_value || 0) > 0 && item.final_price_after_discount) {
      finalPrice = Number(item.final_price_after_discount);
    }
    return Math.round(Math.round(finalPrice * 10) / 10);
  };

  const calculateOrderAmount = () => {
    return (
      Number(activeReturnOrder?.total || 0) -
      Number(activeReturnOrder?.shipping_charge || 0)
    );
  };

  const calculateRefundAmount = () => {
    return (
      returnItems?.reduce((accumulator, returnItem, returnItemIndex) => {
        if (!returnItem?.isRequested) return accumulator;
        const item = activeReturnOrder?.items?.[returnItemIndex];
        return (
          accumulator +
          calculateFinalPrice(item) * Number(returnItem?.quantity || 0)
        );
      }, 0) || 0
    );
  };

  const orderAmount = calculateOrderAmount();
  const refundAmount = calculateRefundAmount();

  const onSubmit = async (data) => {
    if (!isPolicyChecked)
      return toast.error("You must agree with the return policy.");

    // Building pure PostgreSQL return request payload
    const selectedProducts = (activeReturnOrder?.items || [])
      .map((item, index) => {
        const formItem = data.items?.[index];
        if (!formItem?.isRequested) return null;
        return {
          order_item_id: item.id,
          quantity: Number(formItem.quantity),
          issues: formItem.issues || [],
        };
      })
      .filter(Boolean);

    if (!selectedProducts.length) {
      return toast.error("Please select at least one product to return.");
    }

    if (!returnImgUrls?.length) {
      return toast.error("Please upload at least one image as proof.");
    }

    const payload = {
      description: data.description?.trim(),
      image_urls: returnImgUrls,
      products: selectedProducts,
    };

    setIsPageLoading(true);

    try {
      const result = await routeFetch(
        `/api/order/${activeReturnOrder?.order_number}/return-request`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      if (result.success || result.ok) {
        toast.success("Return request submitted.");
        router.refresh();
        setIsReturnModalOpen(false);
      } else {
        toast.error(result.message || "Failed to submit return request");
        console.error("UpdateError (returnOrderModal):", result.message);
      }
    } catch (err) {
      toast.error(err?.message || "Failed to submit return request");
      console.error("UpdateError (returnOrderModal):", err);
    }
    finally {
      setIsPageLoading(false);
    }
  };

  const onError = (errors) => {
    const errorTypes = Object.values(errors).map(
      (error) =>
        error.type ||
        error
          ?.map((itemError) => itemError?.isRequested?.type)
          .filter((value) => !!value)[0],
    );

    // console.log("chk return error", {
    //   errors,
    //   itemsErrors: errors.items,
    //   errorTypes,
    // });

    if (errorTypes.includes("required"))
      toast.error("Please fill up the required fields.");
    else if (errorTypes.includes("pattern") || errorTypes.includes("minLength"))
      toast.error("Please provide valid information.");
    else if (errorTypes.includes("notSelectedProperly"))
      toast.error("Please select the products properly.");
    else if (errorTypes.includes("notValidFiles"))
      toast.error("Please provide the required images.");
    else toast.error("Please fill up the form properly.");
  };

  useEffect(() => {
    if (!isReturnModalOpen) {
      reset();
      setImgFiles([]);
      setReturnImgUrls([]);
    }
  }, [isReturnModalOpen, reset]);

  return (
    <Modal
      isOpen={isReturnModalOpen}
      onOpenChange={setIsReturnModalOpen}
      size="xl"
      scrollBehavior="inside"
      className="rounded-md"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="uppercase">
              Return Request (Order #{activeReturnOrder?.order_number})
            </ModalHeader>
            <ModalBody className="-mt-5">
              <p className="mb-5 text-sm text-neutral-500">
                If you found any issues with our products, you can request to
                return them. However, please note that it can be done within 7
                days after getting delivered and only once.
              </p>
              <form
                className="space-y-8 [&_label]:text-neutral-700"
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();

                  if (!isFormSubmissionRequested)
                    setIsFormSubmissionRequested(true);

                  handleSubmit(onSubmit, onError)();
                }}
              >
                <ReturnItemsField
                  activeReturnOrder={activeReturnOrder}
                  register={register}
                  control={control}
                  setValue={setValue}
                  errors={errors}
                  returnItems={returnItems}
                  orderAmount={orderAmount}
                  calculateFinalPrice={calculateFinalPrice}
                />
                <ReturnBriefDescriptionField
                  register={register}
                  errors={errors}
                />
                <ReturnImagesField
                  register={register}
                  trigger={trigger}
                  errors={errors}
                  isFormSubmissionRequested={isFormSubmissionRequested}
                  setIsFormSubmissionRequested={setIsFormSubmissionRequested}
                  isUploadingRef={isUploadingRef}
                  imgFiles={imgFiles}
                  setImgFiles={setImgFiles}
                  returnImgUrls={returnImgUrls}
                  setReturnImgUrls={setReturnImgUrls}
                />
                <div
                  className={`flex gap-x-2 [&_a]:underline [&_a]:underline-offset-2 [&_a]:transition-[color] [&_a]:duration-300 [&_a]:ease-in-out [&_span]:text-xs lg:[&_span]:text-[13px] ${isPolicyChecked ? "[&_a]:text-[var(--color-primary-900)] hover:[&_a]:text-[var(--color-primary-800)]" : "[&_a]:text-[#f31260]"}`}
                >
                  <Checkbox
                    className="[&_span::after]:rounded-[3px] [&_span::before]:rounded-[3px] [&_span:has(svg):after]:bg-[var(--color-primary-500)] [&_span:has(svg)]:text-neutral-700 [&_span]:rounded-[3px]"
                    defaultSelected
                    isRequired
                    isSelected={isPolicyChecked}
                    onValueChange={setIsPolicyChecked}
                    isInvalid={!isPolicyChecked}
                  >
                    I have read and agree to the{" "}
                    <Link
                      target="_blank"
                      rel="noopener noreferrer"
                      href={legalPolicyPdfLinks?.return?.url || "#"}
                    >
                      Return Policy
                    </Link>
                    {" & "}
                    <Link
                      target="_blank"
                      rel="noopener noreferrer"
                      href={legalPolicyPdfLinks?.refund?.url || "#"}
                    >
                      Refund Policy
                    </Link>
                    .
                  </Checkbox>
                </div>
              </form>
            </ModalBody>
            <ModalFooter
              className={
                isAnyProductSelected ? "items-center justify-between gap-0" : ""
              }
            >
              {isAnyProductSelected && (
                <p className="w-fit text-sm font-semibold">
                  Refund Amount: ৳ {refundAmount?.toLocaleString()}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  className="rounded-[4px]"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  onClick={(event) => {
                    event.preventDefault();

                    if (!isFormSubmissionRequested)
                      setIsFormSubmissionRequested(true);
                    handleSubmit(onSubmit, onError)();
                  }}
                  className="rounded-[4px] bg-[var(--color-primary-500)] px-5 py-3 text-xs font-semibold text-neutral-600 !opacity-100 transition-[background-color,color] duration-300 hover:bg-[var(--color-primary-700)] hover:text-neutral-700 md:text-sm"
                >
                  Submit
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
