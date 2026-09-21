"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useLoading } from "@/app/contexts/loading";
import { rawFetch } from "@/app/lib/fetcher/rawFetch";

export default function ResetPasswordForm({ token, email }) {
  const router = useRouter();
  const { setIsPageLoading } = useLoading();
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: email,
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
      const result = await rawFetch("/api/customer/reset-password", {
        method: "PUT",
        body: JSON.stringify({
          token,
          newPassword: data.newPassword,
        }),
      });

      if (result.ok) {
        toast.success(result.message);
        router.push("/");
      } else {
        console.error(
          "SubmissionError (resetPasswordForm):",
          result.message || "Failed to reset password.",
        );
        toast.error(result.message);
      }
    } catch (error) {
      console.error(
        "SubmissionError (resetPasswordForm):",
        error.message.message || error,
      );
      toast.error("Failed to reset password.");
    } finally {
      reset({ newPassword: "", confirmPassword: "" });
      setIsPageLoading(false);
    }
  };

  const onError = (errors) => {
    const errorTypes = Object.values(errors).map((error) => error.type);

    if (errorTypes.includes("required"))
      toast.error("Please fill up the required fields.");
    else if (errorTypes.includes("pattern") || errorTypes.includes("validate"))
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
      className="space-y-4 read-only:[&_input]:border-0 read-only:[&_input]:bg-neutral-50 read-only:[&_input]:text-neutral-400"
      onSubmit={handleSubmit(onSubmit, onError)}
      noValidate
    >
      {/* Email Input Field */}
      <div className="w-full space-y-2 font-semibold">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          {...register("email", {
            readOnly: true,
            required: {
              value: true,
              message: "Email is required.",
            },
          })}
          className="h-10 w-full rounded-[4px] border-2 border-neutral-200 bg-white/20 px-3 text-xs text-neutral-700 outline-none backdrop-blur-2xl transition-[background-color,border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-[var(--color-secondary-500)] focus:bg-white/75 md:text-[13px]"
          readOnly
          required
        />
        {errors.email && (
          <p className="text-xs font-semibold text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>
      {/* New Password Input Field */}
      <div className="w-full space-y-2 font-semibold">
        <label htmlFor="new-password">Password</label>
        <div className="relative">
          <input
            id="new-password"
            type={isNewPasswordVisible ? "text" : "password"}
            placeholder="••••••••••••••"
            {...register("newPassword", {
              pattern: {
                value: /^.{8,}$/,
                message: "Password must contain at least 8 characters.",
              },
              required: {
                value: true,
                message: "Password is required.",
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
            className="h-10 w-full rounded-[4px] border-2 border-neutral-200 bg-white/20 px-3 text-xs text-neutral-700 outline-none backdrop-blur-2xl transition-[background-color,border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-[var(--color-secondary-500)] focus:bg-white/75 md:text-[13px]"
            required
          />
          <div
            className="absolute right-3 top-1/2 w-4 -translate-y-1/2 cursor-pointer"
            onClick={() => setIsNewPasswordVisible((prevState) => !prevState)}
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
            {errors.newPassword.message}
          </p>
        )}
      </div>
      {/* Confirm Password Input Field */}
      <div className="w-full space-y-2 font-semibold">
        <label htmlFor="confirm-password">Confirm Password</label>
        <div className="relative">
          <input
            id="confirm-password"
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
                  if (fieldValue === newPassword) clearErrors("newPassword");

                  return (
                    !newPassword ||
                    newPassword === fieldValue ||
                    "Passwords do not match."
                  );
                },
              },
            })}
            className="h-10 w-full rounded-[4px] border-2 border-neutral-200 bg-white/20 px-3 text-xs text-neutral-700 outline-none backdrop-blur-2xl transition-[background-color,border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-[var(--color-secondary-500)] focus:bg-white/75 md:text-[13px]"
            required
          />
          <div
            className="absolute right-3 top-1/2 w-4 -translate-y-1/2 cursor-pointer"
            onClick={() =>
              setIsConfirmPasswordVisible((prevState) => !prevState)
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
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
      {/* Form Submission Button  */}
      <button className="relative z-[1] !mt-8 w-full rounded-[4px] bg-[var(--color-primary-500)] py-2.5 text-xs font-semibold text-neutral-700 transition-[background-color] duration-300 hover:bg-[var(--color-primary-700)] md:text-sm">
        Reset Password
      </button>
    </form>
  );
}
