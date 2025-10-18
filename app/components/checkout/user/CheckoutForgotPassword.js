import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import toast from "react-hot-toast";
import { rawFetch } from "@/app/lib/fetcher/rawFetch";

export default function CheckoutForgotPassword({ setIsPageLoading }) {
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);

  const {
    register: registerForForgotPassword,
    handleSubmit: handleSubmitForForgotPassword,
    reset: resetForForgotPassword,
    formState: { errors: errorsForForgotPassword },
  } = useForm({
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  // Function that handles form submission (send password reset email)
  const onSubmit = async (data) => {
    setIsPageLoading(true);

    try {
      const result = await rawFetch("/api/customer/request-password-reset", {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (result.ok) {
        resetForForgotPassword(); // Reset form
        toast.success(result.message);
        setIsForgotPasswordModalOpen(false);
      } else {
        console.error(
          "SubmissionError (checkoutForgotPassword):",
          result.message || "Failed to request for password reset.",
        );
        toast.error(result.message);
      }
    } catch (error) {
      console.error(
        "SubmissionError (checkoutForgotPassword):",
        error.message || error,
      );
      toast.error("Failed to request for password reset.");
    } finally {
      setIsPageLoading(false);
    }
  };

  // Function that handles form submission error (displays error messages)
  const onError = (errors) => {
    const errorTypes = Object.values(errors).map((error) => error.type);

    if (errorTypes.includes("required"))
      toast.error("Please enter your email address.");
    else if (errorTypes.includes("pattern"))
      toast.error("Please provide email address.");
    else toast.error("Something went wrong. Please try again.");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsForgotPasswordModalOpen(true)}
        className="text-xs font-semibold text-[var(--color-primary-900)] transition-[color] duration-300 ease-in-out hover:text-[var(--color-primary-800)]"
      >
        Forgot password?
      </button>
      <Modal
        isOpen={isForgotPasswordModalOpen}
        onOpenChange={setIsForgotPasswordModalOpen}
        scrollBehavior="inside"
        className="rounded-md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Reset Password
              </ModalHeader>
              <ModalBody className="-mt-5">
                <p className="mb-5 text-sm text-neutral-500">
                  Provide your email address to reset password.
                </p>
                <form
                  noValidate
                  onSubmit={handleSubmitForForgotPassword(onSubmit, onError)}
                  className="w-full"
                >
                  <div className="w-full space-y-2 font-semibold">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="john.doe@gmail.com"
                      autoComplete="email"
                      {...registerForForgotPassword("email", {
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
                    {/* Email Error Message */}
                    {errorsForForgotPassword.email && (
                      <p className="text-xs font-semibold text-red-500">
                        {errorsForForgotPassword.email?.message}
                      </p>
                    )}
                  </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  className="rounded-[4px]"
                >
                  Close
                </Button>
                <Button
                  onClick={() =>
                    handleSubmitForForgotPassword(onSubmit, onError)()
                  }
                  className="rounded-[4px] bg-[var(--color-primary-500)] px-5 py-3 text-xs font-semibold text-neutral-600 !opacity-100 transition-[background-color,color] duration-300 hover:bg-[var(--color-primary-700)] hover:text-neutral-700 md:text-sm"
                >
                  Send Email
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
