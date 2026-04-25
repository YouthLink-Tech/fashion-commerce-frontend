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
import customCurrentDateTimeFormat from "@/app/utils/customCurrentDateTimeFormat";
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

  const calculateFinalPrice = (productVariant) => {
    let finalPrice;

    if (!!activeReturnOrder?.promoInfo) {
      const unitPrice = !productVariant?.discountInfo
        ? Number(productVariant?.regularPrice)
        : Number(productVariant?.discountInfo.finalPriceAfterDiscount);
      const appliedPromoPerVariant =
        activeReturnOrder?.promoInfo?.appliedPromoDiscount /
        activeReturnOrder?.productInformation?.length;

      finalPrice =
        unitPrice - appliedPromoPerVariant / Number(productVariant?.sku);
    } else if (!!productVariant?.discountInfo)
      finalPrice = Number(productVariant?.discountInfo.finalPriceAfterDiscount);
    else if (!!productVariant?.offerInfo) {
      finalPrice =
        Number(productVariant?.regularPrice) -
        Number(productVariant?.offerInfo?.appliedOfferDiscount) /
        Number(productVariant?.sku);
    } else finalPrice = Number(productVariant?.regularPrice);

    return Math.round(Math.round(finalPrice * 10) / 10); // Round off, if it has decimal points
  };

  const calculateOrderAmount = () => {
    return (
      Number(activeReturnOrder?.total) -
      Number(activeReturnOrder?.shippingCharge)
    );
  };

  const calculateRefundAmount = () => {
    return returnItems?.reduce(
      (accumulator, returnItem, returnItemIndex) =>
        !returnItem?.isRequested
          ? accumulator
          : accumulator +
          calculateFinalPrice(
            activeReturnOrder?.productInformation[returnItemIndex],
          ) *
          returnItem?.quantity,
      0,
    );
  };

  const orderAmount = calculateOrderAmount();
  const refundAmount = calculateRefundAmount();

  const onSubmit = async (data) => {
    if (!isPolicyChecked)
      return toast.error("You must agree with the return policy.");

    const returnInfo = {
      dateTime: customCurrentDateTimeFormat(),
      description: data.description || null,
      products: activeReturnOrder.productInformation
        .map((product, index) =>
          !data.items[index].isRequested
            ? null
            : {
              ...product,
              sku: data.items[index].quantity,
              issues: data.items[index].issues,
              status: "Pending",
              finalUnitPrice: calculateFinalPrice(product),
            },
        )
        ?.filter((value) => !!value),
      imgUrls: returnImgUrls,
      orderAmount,
      refundAmount,
    };

    setIsPageLoading(true);

    const updatedActiveReturnOrder = {
      ...activeReturnOrder,
      orderStatus: "Return Requested",
      returnInfo,
    };

    try {
      const result = await routeFetch(
        `/api/order-status/${activeReturnOrder._id}`,
        {
          method: "PATCH",
          body: JSON.stringify(updatedActiveReturnOrder),
        },
      );

      if (result.ok) {
        toast.success("Return request submitted.");
        router.refresh();
        setIsReturnModalOpen(false);
      } else {
        toast.error(result.message);
        console.error("UpdateError (returnOrderModal):", result.message);
      }
    } catch (err) {
      toast.error(err?.message);
      console.error("UpdateError (returnOrderModal):", err);
    }

    setIsPageLoading(false);
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
              Return Request (Order #{activeReturnOrder?.orderNumber})
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
