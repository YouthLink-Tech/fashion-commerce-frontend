import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import toast from "react-hot-toast";
import { LuMoveLeft, LuSendHorizonal } from "react-icons/lu";
import { useLoading } from "@/app/contexts/loading";
import { rawFetch } from "@/app/lib/fetcher/rawFetch";

export default function NotifyMeModal({
  userEmail,
  isNotifyMeModalOpen,
  setIsNotifyMeModalOpen,
  notifyMeProduct,
}) {
  const router = useRouter();
  const { setIsPageLoading } = useLoading();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    setIsPageLoading(true);

    try {
      const result = await rawFetch("/api/notifications/add-notify-me", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          ...notifyMeProduct,
        }),
      });

      if (result.ok) {
        toast.success("Request submitted successfully.");
        router.refresh();
        setIsNotifyMeModalOpen(false);
      } else {
        console.error(
          "SubmissionError (notify/modal):",
          result.message || "Failed to submit request.",
        );
        toast.error(result.message || "Failed to submit request.");
      }
    } catch (error) {
      console.error("SubmissionError (notify/modal):", error.message || error);
      toast.error("Failed to submit request.");
    } finally {
      reset();
      setIsPageLoading(false);
    }
  };

  const onError = (errors) => {
    const errorTypes = Object.values(errors).map((error) => error.type);

    if (errorTypes.includes("required"))
      toast.error("Please enter your email address.");
    else if (errorTypes.includes("pattern"))
      toast.error("Please provide email address.");
    else toast.error("Something went wrong. Please try again.");
  };

  useEffect(() => {
    reset({
      email: userEmail || "",
    });
  }, [reset, userEmail]);

  return (
    <Modal
      isOpen={isNotifyMeModalOpen}
      onOpenChange={setIsNotifyMeModalOpen}
      scrollBehavior="inside"
      className="rounded-md"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              AVAILABILITY EMAIL NOTIFICATION
            </ModalHeader>
            <ModalBody className="-mt-5">
              <p className="mb-5 text-sm text-neutral-500">
                Please provide your email address to get notified as soon as the
                product is available again.
              </p>
              <form
                noValidate
                onSubmit={handleSubmit(onSubmit, onError)}
                className="w-full"
              >
                <div className="w-full space-y-2 font-semibold">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="john.doe@gmail.com"
                    autoComplete="email"
                    {...register("email", {
                      pattern: {
                        value:
                          /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/,
                        message: "Email is not valid.",
                      },
                      required: {
                        value: true,
                        message: "Email is required.",
                      },
                    })}
                    className="h-11 w-full rounded-[4px] border-2 border-neutral-200 px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[var(--color-secondary-500)] focus:bg-white md:text-[13px]"
                    required
                  />
                  {errors.email && (
                    <p className="text-xs font-semibold text-red-500">
                      {errors.email?.message}
                    </p>
                  )}
                </div>
              </form>
            </ModalBody>
            <ModalFooter>
              <button
                onClick={() => setIsNotifyMeModalOpen(false)}
                className="flex w-fit items-center gap-2 rounded-[4px] bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-600 transition-[background-color] duration-300 hover:bg-neutral-200"
              >
                <LuMoveLeft size={17} />
                Go Back
              </button>
              <button
                onClick={() => handleSubmit(onSubmit, onError)()}
                className="flex w-fit items-center gap-2 rounded-[4px] bg-[var(--color-secondary-500)] px-4 py-2.5 text-sm font-semibold text-neutral-600 transition-[background-color] duration-300 hover:bg-[var(--color-secondary-600)]"
              >
                Submit
                <LuSendHorizonal size={17} />
              </button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
