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
const STATUS_MESSAGES = {
  Processed: "Your return has been processed. Details are below.",
  Declined: "Your return request was declined. See the details below, or contact us if you have questions.",
};

const DEFAULT_MESSAGE =
  "We've received your return request. Here's what you submitted.";

export default function ReturnInfoModal({
  isReturnInfoModalOpen,
  setIsReturnInfoModalOpen,
  activeReturnOrder,
}) {
  const { order_number, order_status, return: returnInfo,
    items: orderItems, } = activeReturnOrder || {};

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
                {STATUS_MESSAGES[order_status] ?? DEFAULT_MESSAGE}
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
              {(order_status === "processed" || order_status === "declined") && (
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
