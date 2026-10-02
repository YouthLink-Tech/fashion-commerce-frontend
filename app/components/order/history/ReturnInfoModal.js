import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { LuMessagesSquare } from "react-icons/lu";
import ReturnInfoModalInfo from "./ReturnInfoModalInfo";
import ReturnInfoModalItems from "./ReturnInfoModalItems";
import ReturnInfoModalProofImages from "./ReturnInfoModalProofImages";

const getReturnBannerMessage = (returnInfo, orderStatus) => {
  const items = returnInfo?.items || [];
  if (!items.length) {
    return "We've received your return request. Here's what you submitted.";
  }

  const acceptedCount = items.filter(
    (i) => i?.status?.toLowerCase() === "accepted"
  ).length;

  const rejectedCount = items.filter(
    (i) => i?.status?.toLowerCase() === "rejected"
  ).length;

  const pendingCount = items.filter(
    (i) => !i?.status || i?.status?.toLowerCase() === "pending"
  ).length;

  // Partial: Both accepted and rejected items exist
  if (acceptedCount > 0 && rejectedCount > 0) {
    const acceptedText =
      acceptedCount === 1
        ? "One item in your return request was accepted"
        : "Some items in your return request were accepted";
    const rejectedText =
      rejectedCount === 1 ? "one was declined" : "some were declined";
    return `${acceptedText} and ${rejectedText}. See details below, or contact us if you have questions.`;
  }

  // All Rejected: Every item was declined
  if (rejectedCount > 0 && acceptedCount === 0 && pendingCount === 0) {
    return "Your return request was declined. See the details below, or contact us if you have questions.";
  }

  // All Accepted: All items approved / processed
  if (acceptedCount > 0 && rejectedCount === 0) {
    const status = orderStatus?.toLowerCase();
    if (status === "refunded") {
      return "Your refund has been completed. Details are below.";
    }
    if (status === "return_initiated") {
      return "Your return has been processed and forwarded to accounts for refund.";
    }
    return "Your return has been processed. Details are below.";
  }

  // Pending: Still awaiting store review
  return "We've received your return request. Here's what you submitted.";
};

export default function ReturnInfoModal({
  isReturnInfoModalOpen,
  setIsReturnInfoModalOpen,
  activeReturnOrder,
}) {
  const { order_number, order_status, return: returnInfo,
    items: orderItems, } = activeReturnOrder || {};

  // Checking if any item in this return has been reviewed (accepted or rejected)
  const hasReviewedReturnItems = returnInfo?.items?.some((item) => {
    const status = item?.status?.toLowerCase();
    return status === "accepted" || status === "rejected";
  });

  return (
    <Modal
      isOpen={isReturnInfoModalOpen}
      onOpenChange={setIsReturnInfoModalOpen}
      size="xl"
      scrollBehavior="inside"
      className="rounded-md"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="uppercase">
              Return Overview (Order #{order_number})
            </ModalHeader>
            <ModalBody className="-mt-5">
              <p className="mb-5 text-sm text-neutral-500">
                {getReturnBannerMessage(returnInfo, order_status)}
              </p>
              <ReturnInfoModalInfo
                orderStatus={order_status}
                returnInfo={returnInfo}
              />
              <ReturnInfoModalItems returnItems={returnInfo?.items} orderItems={orderItems} />
              <ReturnInfoModalProofImages
                returnProofImgUrls={returnInfo?.image_urls}
              />
            </ModalBody>
            <ModalFooter>
              {hasReviewedReturnItems && (
                <a
                  href={`/contact-us?orderNumber=${order_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-fit items-center gap-2 rounded-[4px] bg-[var(--color-primary-500)] px-4 py-2.5 text-sm font-semibold text-neutral-600 transition-[background-color] duration-300 hover:bg-[var(--color-primary-700)]"
                >
                  Contact Us
                  <LuMessagesSquare size={17} />
                </a>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
