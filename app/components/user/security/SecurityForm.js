"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useLoading } from "@/app/contexts/loading";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import GoogleSignInButton from "@/app/components/layout/header/auth/GoogleSignInButton";

export default function SecurityForm({
  email,
  name,
  isLinkedWithCredentials,
  isLinkedWithGoogle,
}) {
  const router = useRouter();
  const { setIsPageLoading } = useLoading();
  const [isOldPasswordVisible, SetIsOldPasswordVisible] = useState(false);
  const [isNewPasswordVisible, SetIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, SetIsConfirmPasswordVisible] =
    useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  const onSubmit = async (data) => {
    setIsPageLoading(true);

    try {
      const method = isLinkedWithCredentials ? "PUT" : "POST";
      const payload = {
        email,
        ...(isLinkedWithCredentials && {
          oldPassword: data.oldPassword,
        }),
        newPassword: data.newPassword,
      };

      const result = await routeFetch("/api/password", {
        method,
        body: JSON.stringify(payload),
      });

      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else {
        console.error(
          `PasswordError (security/${isLinkedWithCredentials ? "update" : "set"}):`,
          result.message.message ||
          `Failed to ${isLinkedWithCredentials ? "update" : "set"} password.`,
        );
        toast.error(result.message.message);
      }
    } catch (error) {
      console.error("Password update error:", error);

      // Default fallback message
      let errorMessage = `Failed to ${isLinkedWithCredentials ? "update" : "set"} password.`;

      // Case 1: Axios-style error with response
      if (error.response?.data) {
        const data = error.response.data;

        // Prefer detailed validation messages if available
        if (Array.isArray(data.details) && data.details.length > 0) {
          errorMessage = data.details[0]; // show first validation error
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      // Case 2: ZodError came as raw string
      else if (error.message?.includes("ZodError")) {
        errorMessage = "Invalid input. Please check your password fields.";
      }

      toast.error(errorMessage);
    } finally {
      setIsPageLoading(false);
      reset();
    }
  };

  const onError = (errors) => {
    const errorTypes = Object.values(errors).map((error) => error.type);

    if (errorTypes.includes("required"))
      toast.error("Please fill up the required fields.");
    else if (errorTypes.includes("pattern"))
      toast.error("Please provide valid information.");
    else if (
      errorTypes.includes("notMatchingWithConfirm") ||
      errorTypes.includes("notMatchingWithNew")
    )
      toast.error("Passwords do not match.");
    else toast.error("Something went wrong. Please try again.");
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit, onError)}
      className="user-info grow rounded-md border-2 border-neutral-50/20 bg-white/40 p-5 shadow-[0_0_20px_0_rgba(0,0,0,0.05)] backdrop-blur-2xl max-lg:space-y-4 sm:gap-4 lg:flex"
    >
      <section className="w-full space-y-4 rounded-[4px] border-2 border-neutral-200 p-5">
        <h2 className="text-lg font-semibold uppercase md:text-xl">
          {isLinkedWithCredentials ? "Update" : "Set"} Password
        </h2>
        <div className="space-y-4">
          {isLinkedWithCredentials && (
            <div className="w-full space-y-2 font-semibold">
              <label htmlFor="old-password">Current Password</label>
              <div className="relative">
                <input
                  id="old-password"
                  name="oldPassword"
                  type={isOldPasswordVisible ? "text" : "password"}
                  placeholder="••••••••••••••"
                  {...register("oldPassword", {
                    required: {
                      value: isLinkedWithCredentials,
                      message: "Old password is required.",
                    },
                  })}
                  className="h-11 w-full rounded-[4px] border-2 border-neutral-200 px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[var(--color-secondary-500)] focus:bg-white md:text-[13px]"
                  required
                />
                <div
                  className="absolute right-3 top-1/2 w-4 -translate-y-1/2 cursor-pointer"
                  onClick={() =>
                    SetIsOldPasswordVisible((preState) => !preState)
                  }
                >
                  {isOldPasswordVisible ? (
                    <AiOutlineEye className="text-neutral-700" />
                  ) : (
                    <AiOutlineEyeInvisible className="text-neutral-400" />
                  )}
                </div>
              </div>
              {errors.oldPassword && (
                <p className="text-xs font-semibold text-red-500">
                  {errors.oldPassword?.message}
                </p>
              )}
            </div>
          )}
          <div className="w-full space-y-2 font-semibold">
            <label htmlFor="new-password">New Password</label>
            <div className="relative">
              <input
                id="new-password"
                name="newPassword"
                type={isNewPasswordVisible ? "text" : "password"}
                placeholder="••••••••••••••"
                {...register("newPassword", {
                  pattern: {
                    value: /^.{8,}$/,
                    message: "Password must contain at least 8 characters.",
                  },
                  required: {
                    value: true,
                    message: "New password is required.",
                  },
                  validate: {
                    notMatchingWithConfirm: (fieldValue) => {
                      if (fieldValue === confirmPassword)
                        clearErrors("confirmPassword");
                      return (
                        !confirmPassword ||
                        confirmPassword === fieldValue ||
                        "Passwords do not match."
                      );
                    },
                  },
                })}
                className="h-11 w-full rounded-[4px] border-2 border-neutral-200 px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[var(--color-secondary-500)] focus:bg-white md:text-[13px]"
                required
              />
              <div
                className="absolute right-3 top-1/2 w-4 -translate-y-1/2 cursor-pointer"
                onClick={() => SetIsNewPasswordVisible((preState) => !preState)}
              >
                {isNewPasswordVisible ? (
                  <AiOutlineEye className="text-neutral-700" />
                ) : (
                  <AiOutlineEyeInvisible className="text-neutral-400" />
                )}
              </div>
            </div>
            {errors.newPassword && (
              <p className="text-xs font-semibold text-red-500">
                {errors.newPassword?.message}
              </p>
            )}
          </div>
          <div className="w-full space-y-2 font-semibold">
            <label htmlFor="confirm-new-password">Confirm New Password</label>
            <div className="relative">
              <input
                id="confirm-new-password"
                name="confirmNewPassword"
                type={isConfirmPasswordVisible ? "text" : "password"}
                placeholder="••••••••••••••"
                {...register("confirmPassword", {
                  pattern: {
                    value: /^.{8,}$/,
                    message: "Password must contain at least 8 characters.",
                  },
                  required: {
                    value: true,
                    message: "Confirm password is required.",
                  },
                  validate: {
                    notMatchingWithNew: (fieldValue) => {
                      if (fieldValue === newPassword)
                        clearErrors("newPassword");
                      return (
                        !newPassword ||
                        newPassword === fieldValue ||
                        "Passwords do not match."
                      );
                    },
                  },
                })}
                className="h-11 w-full rounded-[4px] border-2 border-neutral-200 px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[var(--color-secondary-500)] focus:bg-white md:text-[13px]"
                required
              />
              <div
                className="absolute right-3 top-1/2 w-4 -translate-y-1/2 cursor-pointer"
                onClick={() =>
                  SetIsConfirmPasswordVisible((preState) => !preState)
                }
              >
                {isConfirmPasswordVisible ? (
                  <AiOutlineEye className="text-neutral-700" />
                ) : (
                  <AiOutlineEyeInvisible className="text-neutral-400" />
                )}
              </div>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs font-semibold text-red-500">
                {errors.confirmPassword?.message}
              </p>
            )}
          </div>
          <button className="block h-fit w-full self-end rounded-[4px] bg-[var(--color-primary-500)] px-5 py-2.5 text-center text-sm font-semibold text-neutral-700 transition-[background-color] duration-300 hover:bg-[var(--color-primary-700)]">
            {isLinkedWithCredentials ? "Update" : "Set"} Password
          </button>
        </div>
      </section>
      <section className="w-full space-y-4 rounded-[4px] border-2 border-neutral-200 p-5">
        <h2 className="text-lg font-semibold uppercase md:text-xl">
          Stay Connected
        </h2>
        <p className="!mb-10">
          Get connected with your Google account for better security.
          You&apos;ll get some additional rewards for connecting with the
          account.
        </p>
        <GoogleSignInButton
          isLinkedWithGoogle={isLinkedWithGoogle}
          ctaText={isLinkedWithGoogle ? name : "Connect to Google"}
        />
      </section>
    </form>
  );
}
