import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Checkbox,
} from "@nextui-org/react";
import toast from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import GoogleSignInButton from "../../layout/header/auth/GoogleSignInButton";
import { rawFetch } from "@/app/lib/fetcher/rawFetch";

export default function CheckoutRegister({
  onError,
  setIsPageLoading,
  isRegisterModalOpen,
  setIsRegisterModalOpen,
  legalPolicyPdfLinks,
}) {
  const router = useRouter();
  const [isNewPasswordVisible, SetIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, SetIsConfirmPasswordVisible] =
    useState(false);
  const [isPoliciesCheckboxSelected, setIsPoliciesCheckboxSelected] =
    useState(true);
  const [isNewsletterCheckboxSelected, setIsNewsletterCheckboxSelected] =
    useState(true);

  const {
    register: registerForRegister,
    handleSubmit: handleSubmitForRegister,
    reset: resetForRegister,
    watch: watchForRegister,
    clearErrors: clearErrorsForRegister,
    formState: { errors: errorsForRegister },
  } = useForm({
    defaultValues: {
      registerFullName: "",
      registerEmail: "",
      registerPassword: "",
      registerConfirmPassword: "",
    },
    mode: "onBlur",
  });

  const registerPassword = watchForRegister("registerPassword");
  const registerConfirmPassword = watchForRegister("registerConfirmPassword");

  const onSubmitForRegister = async (data) => {
    if (!isPoliciesCheckboxSelected)
      return toast.error(
        "You must first agree to the terms & conditions and privacy policy.",
      );

    setIsPageLoading(true);

    try {
      // Register user to backend
      const result = await rawFetch("/api/newsletter/customer-signup", {
        method: "POST",
        body: JSON.stringify({
          name: data.registerFullName,
          email: data.registerEmail,
          password: data.registerPassword,
          isNewsletterCheckboxSelected,
        }),
      });

      if (result.ok) {
        toast.success("Account created successfully.");

        // Login user with the credentials
        const signInResult = await signIn("credentials", {
          redirect: false,
          email: data.registerEmail,
          password: data.registerPassword,
        });

        if (signInResult?.error) {
          console.error(
            "LoginError (checkoutRegister/signIn):",
            signInResult.error,
          );
          toast.error(
            signInResult.error || "Failed to login. Please try again.",
          );
        } else {
          router.refresh();
        }
      } else {
        resetForRegister(
          {
            password: "",
            confirmPassword: "",
          },
          { keepValues: true },
        );
        console.error(
          "RegisterError (header/registerForm/signUpResult):",
          result.message || "Failed to register. Please try again.",
        );
        return toast.error(
          result.message || "Failed to register. Please try again.",
        );
      }

      resetForRegister(); // reset register form
      setIsRegisterModalOpen(false);
    } catch (error) {
      console.error(
        "RegisterError (checkoutRegister/catch):",
        error.message || error,
      );
      toast.error("Failed to register. Please try again.");
    } finally {
      setIsPageLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isRegisterModalOpen}
      onOpenChange={setIsRegisterModalOpen}
      size="2xl"
      scrollBehavior="inside"
      className="rounded-md"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="uppercase">Sign up</ModalHeader>
            <ModalBody className="-mt-5">
              <p className="mb-4 text-sm text-neutral-500">
                After you sign up, you can continue to checkout.
              </p>
              {/* Register Form */}
              <form
                className="space-y-4 read-only:[&_input]:border-0 read-only:[&_input]:bg-neutral-50 read-only:[&_input]:text-neutral-400"
                onSubmit={handleSubmitForRegister(onSubmitForRegister, onError)}
                noValidate
              >
                <div className="max-sm:space-y-4 sm:flex sm:gap-x-4">
                  {/* Full Name Input Field */}
                  <div className="w-full space-y-2 font-semibold">
                    <label htmlFor="register-full-name">Full Name</label>
                    <input
                      id="register-full-name"
                      type="text"
                      autoComplete="name"
                      placeholder="John Doe"
                      {...registerForRegister("registerFullName", {
                        pattern: {
                          value: /^[a-zA-Z\s'-]{3,}$/,
                          message: "Full name is not valid.",
                        },
                        required: {
                          value: true,
                          message: "Full name is required.",
                        },
                      })}
                      className="h-10 w-full rounded-[4px] border-2 border-neutral-200 px-3 text-xs text-neutral-700 outline-none transition-[border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-[var(--color-secondary-500)] md:text-[13px]"
                      required
                    />
                    {errorsForRegister.registerFullName && (
                      <p className="text-xs font-semibold text-red-500">
                        {errorsForRegister.registerFullName?.message}
                      </p>
                    )}
                  </div>
                  {/* Email Input Field */}
                  <div className="w-full space-y-2 font-semibold">
                    <label htmlFor="register-email">Email</label>
                    <input
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      placeholder="john.doe@gmail.com"
                      {...registerForRegister("registerEmail", {
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
                      className="h-10 w-full rounded-[4px] border-2 border-neutral-200 px-3 text-xs text-neutral-700 outline-none transition-[border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-[var(--color-secondary-500)] md:text-[13px]"
                      required
                    />
                    {errorsForRegister.registerEmail && (
                      <p className="text-xs font-semibold text-red-500">
                        {errorsForRegister.registerEmail?.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="max-sm:space-y-4 sm:flex sm:gap-x-4">
                  {/* Password Input Field */}
                  <div className="w-full space-y-2 font-semibold">
                    <label htmlFor="register-password">Password</label>
                    <div className="relative">
                      <input
                        id="register-password"
                        type={isNewPasswordVisible ? "text" : "password"}
                        placeholder="••••••••••••••"
                        {...registerForRegister("registerPassword", {
                          pattern: {
                            value: /^.{8,}$/,
                            message:
                              "Password must contain at least 8 characters.",
                          },
                          required: {
                            value: true,
                            message: "Password is required.",
                          },
                          validate: {
                            notMatchingWithConfirm: (fieldValue) => {
                              if (fieldValue === registerConfirmPassword)
                                clearErrorsForRegister(
                                  "registerConfirmPassword",
                                );

                              return (
                                !registerConfirmPassword ||
                                registerConfirmPassword === fieldValue ||
                                "Passwords do not match."
                              );
                            },
                          },
                        })}
                        className="h-10 w-full rounded-[4px] border-2 border-neutral-200 px-3 text-xs text-neutral-700 outline-none transition-[border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-[var(--color-secondary-500)] md:text-[13px]"
                        required
                      />
                      <div
                        className="absolute right-3 top-1/2 w-4 -translate-y-1/2 cursor-pointer"
                        onClick={() =>
                          SetIsNewPasswordVisible((prevState) => !prevState)
                        }
                      >
                        {isNewPasswordVisible ? (
                          <AiOutlineEye className="text-neutral-700" />
                        ) : (
                          <AiOutlineEyeInvisible className="text-neutral-400" />
                        )}
                      </div>
                    </div>
                    {errorsForRegister.registerPassword && (
                      <p className="text-xs font-semibold text-red-500">
                        {errorsForRegister.registerPassword?.message}
                      </p>
                    )}
                  </div>
                  {/* Confirm Password Input Field */}
                  <div className="w-full space-y-2 font-semibold">
                    <label htmlFor="register-confirm-password">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="register-confirm-password"
                        type={isConfirmPasswordVisible ? "text" : "password"}
                        placeholder="••••••••••••••"
                        {...registerForRegister("registerConfirmPassword", {
                          pattern: {
                            value: /^.{8,}$/,
                            message:
                              "Password must contain at least 8 characters.",
                          },
                          required: {
                            value: true,
                            message: "Confirm password is required.",
                          },
                          validate: {
                            notMatchingWithNew: (fieldValue) => {
                              if (fieldValue === registerPassword)
                                clearErrorsForRegister("registerPassword");

                              return (
                                !registerPassword ||
                                registerPassword === fieldValue ||
                                "Passwords do not match."
                              );
                            },
                          },
                        })}
                        className="h-10 w-full rounded-[4px] border-2 border-neutral-200 px-3 text-xs text-neutral-700 outline-none transition-[border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-[var(--color-secondary-500)] md:text-[13px]"
                        required
                      />
                      <div
                        className="absolute right-3 top-1/2 w-4 -translate-y-1/2 cursor-pointer"
                        onClick={() =>
                          SetIsConfirmPasswordVisible((prevState) => !prevState)
                        }
                      >
                        {isConfirmPasswordVisible ? (
                          <AiOutlineEye className="text-neutral-700" />
                        ) : (
                          <AiOutlineEyeInvisible className="text-neutral-400" />
                        )}
                      </div>
                    </div>
                    {errorsForRegister.registerConfirmPassword && (
                      <p className="text-xs font-semibold text-red-500">
                        {errorsForRegister.registerConfirmPassword?.message}
                      </p>
                    )}
                  </div>
                </div>
                {/* Policy Agreements */}
                <div
                  className={`!mt-7 flex gap-x-2 [&_a]:underline [&_a]:underline-offset-2 [&_a]:transition-[color] [&_a]:duration-300 [&_a]:ease-in-out [&_span]:text-xs lg:[&_span]:text-[13px] ${isPoliciesCheckboxSelected ? "[&_a]:text-[var(--color-primary-900)] hover:[&_a]:text-[var(--color-primary-800)]" : "[&_a]:text-[#f31260]"}`}
                >
                  <Checkbox
                    className="[&_span::after]:rounded-[3px] [&_span::before]:rounded-[3px] [&_span:has(svg):after]:bg-[var(--color-primary-500)] [&_span:has(svg)]:text-neutral-700 [&_span]:rounded-[3px]"
                    defaultSelected
                    isRequired
                    isSelected={isPoliciesCheckboxSelected}
                    onValueChange={setIsPoliciesCheckboxSelected}
                    isInvalid={!isPoliciesCheckboxSelected}
                  >
                    I agree to the{" "}
                    <Link
                      target="_blank"
                      href={legalPolicyPdfLinks?.terms || "#"}
                    >
                      Terms & Conditions
                    </Link>
                    {" and "}
                    <Link
                      target="_blank"
                      href={legalPolicyPdfLinks?.privacy || "#"}
                    >
                      Privacy Policy
                    </Link>
                  </Checkbox>
                </div>
                {/* Newsletter Agreement */}
                <div className="flex gap-x-2 [&_span]:text-xs lg:[&_span]:text-[13px]">
                  <Checkbox
                    className="[&_span::after]:rounded-[3px] [&_span::before]:rounded-[3px] [&_span:has(svg):after]:bg-[var(--color-primary-500)] [&_span:has(svg)]:text-neutral-700 [&_span]:rounded-[3px]"
                    isSelected={isNewsletterCheckboxSelected}
                    onValueChange={setIsNewsletterCheckboxSelected}
                  >
                    Be the first to know more about our trending & newest
                    products, and exclusive deals
                  </Checkbox>
                </div>
                {/* Register Button */}
                <div className="!mb-4 !mt-8 max-sm:space-y-4 sm:flex sm:items-end sm:gap-x-4">
                  <button
                    type="submit"
                    className="block h-fit w-full self-end rounded-[4px] bg-[var(--color-primary-500)] py-2.5 text-center text-sm font-semibold text-neutral-700 transition-[background-color] duration-300 hover:bg-[var(--color-primary-700)]"
                  >
                    Sign up
                  </button>
                  <GoogleSignInButton
                    ctaText="Sign up with Google"
                    isAuthModalOpen={isRegisterModalOpen}
                    setIsAuthModalOpen={setIsRegisterModalOpen}
                  />
                </div>
              </form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
