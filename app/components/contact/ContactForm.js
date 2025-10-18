"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useLoading } from "@/app/contexts/loading";
import { rawFetch } from "@/app/lib/fetcher/rawFetch";

export default function ContactForm({ userData, orderId, isOrderNumberLegit }) {
  const router = useRouter();
  const { setIsPageLoading } = useLoading();
  const isFromOrderHistoryPage = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      topic: isOrderNumberLegit ? `Refund Rejected (Order #${orderId})` : "",
      message: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (isOrderNumberLegit) isFromOrderHistoryPage.current = true;

    router.replace("/contact-us", undefined, {
      shallow: true,
      scroll: false,
    });
  }, [isOrderNumberLegit, router]);

  useEffect(() => {
    reset({
      name: userData?.userInfo?.personalInfo?.customerName || "",
      email: userData?.email || "",
      phone: userData?.userInfo?.personalInfo?.phoneNumber || "",
      topic: getValues("topic") || "",
      message: getValues("message") || "",
    });
  }, [getValues, reset, userData]);

  const onSubmit = async (data) => {
    setIsPageLoading(true);

    try {
      const result = await rawFetch("/api/customer-support/contact", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (result.ok) {
        toast.success(result.message);
      } else {
        console.error(
          "SubmissionError (contactForm):",
          result.message || "Failed to submit contact form.",
        );
        toast.error(result.message || "Failed to submit contact form.");
      }
    } catch (error) {
      console.error("SubmissionError (contactForm):", error.message || error);
      toast.error("Failed to submit contact form.");
    } finally {
      reset({
        name: userData?.userInfo?.personalInfo?.customerName || "",
        email: userData?.email || "",
        phone: userData?.userInfo?.personalInfo?.phoneNumber || "",
        topic: "",
        message: "",
      });
      setIsPageLoading(false);
    }
  };

  const onError = (errors) => {
    const errorTypes = Object.values(errors).map((error) => error.type);

    if (errorTypes.includes("required"))
      toast.error("Please fill up the required fields.");
    else if (errorTypes.includes("pattern") || errorTypes.includes("minLength"))
      toast.error("Please provide valid information.");
    else toast.error("Something went wrong. Please try again.");
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit, onError)}
      className="flex grow flex-col justify-between gap-y-5"
    >
      <div className="space-y-5 font-semibold">
        <div className="max-sm:space-y-4 sm:flex sm:gap-x-4">
          <div className="relative w-full space-y-2">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="h-10 w-full rounded-[4px] border-2 border-neutral-200 bg-white/20 px-3 text-xs text-neutral-700 outline-none backdrop-blur-2xl transition-[background-color,border-color] duration-300 ease-in-out placeholder:text-neutral-400 md:text-[13px] [&:not(:read-only):focus]:border-[var(--color-secondary-500)] [&:not(:read-only):focus]:bg-white/75"
              placeholder="Enter your full name"
              readOnly={!!userData}
              {...register("name", {
                pattern: {
                  value: /^[a-zA-Z\s'-]{3,}$/,
                  message: "Full name is not valid.",
                },
                required: {
                  value: true,
                  message: "Full name is required.",
                },
              })}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name?.message}</p>
            )}
          </div>
          <div className="relative w-full space-y-2">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="h-10 w-full rounded-[4px] border-2 border-neutral-200 bg-white/20 px-3 text-xs text-neutral-700 outline-none backdrop-blur-2xl transition-[background-color,border-color] duration-300 ease-in-out placeholder:text-neutral-400 md:text-[13px] [&:not(:read-only):focus]:border-[var(--color-secondary-500)] [&:not(:read-only):focus]:bg-white/75"
              placeholder="Enter your email"
              readOnly={!!userData}
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
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email?.message}</p>
            )}
          </div>
        </div>
        <div className="max-sm:space-y-4 sm:flex sm:gap-x-4">
          <div className="relative w-full space-y-2">
            <label htmlFor="mobile-number">Mobile Number</label>
            <input
              id="mobile-number"
              type="tel"
              className="h-10 w-full rounded-[4px] border-2 border-neutral-200 bg-white/20 px-3 text-xs text-neutral-700 outline-none backdrop-blur-2xl transition-[background-color,border-color] duration-300 ease-in-out placeholder:text-neutral-400 md:text-[13px] [&:not(:read-only):focus]:border-[var(--color-secondary-500)] [&:not(:read-only):focus]:bg-white/75"
              placeholder="Enter your mobile number"
              {...register("phone", {
                pattern: {
                  value: /^01\d{9}$/,
                  message: "Mobile number is invalid.",
                },
                required: {
                  value: true,
                  message: "Mobile number is required.",
                },
              })}
              onInput={(event) =>
                (event.target.value = event.target.value.replace(/\D/g, ""))
              }
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone?.message}</p>
            )}
          </div>
          <div className="relative w-full space-y-2">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              className="h-10 w-full rounded-[4px] border-2 border-neutral-200 bg-white/20 px-3 text-xs text-neutral-700 outline-none backdrop-blur-2xl transition-[background-color,border-color] duration-300 ease-in-out placeholder:text-neutral-400 [&:not(:read-only):focus]:border-[var(--color-secondary-500)] [&:not(:read-only):focus]:bg-white/75"
              placeholder="Enter the subject"
              {...register("topic", {
                required: {
                  value: true,
                  message: "Subject is required.",
                },
                minLength: {
                  value: 5,
                  message: "Subject must have at least 5 characters.",
                },
              })}
              readOnly={isFromOrderHistoryPage.current}
            />
            {errors.topic && (
              <p className="text-xs text-red-500">{errors.topic?.message}</p>
            )}
          </div>
        </div>
        <div className="relative w-full space-y-2">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            rows={7}
            className="h-40 w-full resize-none rounded-[4px] border-2 border-neutral-200 bg-white/20 px-3 py-3 text-xs text-neutral-700 outline-none backdrop-blur-2xl transition-[background-color,border-color] duration-300 ease-in-out placeholder:text-neutral-400 sm:h-72 md:text-[13px] lg:h-80 xl:h-36 min-[1800px]:h-64 [&:not(:read-only):focus]:border-[var(--color-secondary-500)] [&:not(:read-only):focus]:bg-white/75"
            placeholder="Describe what you want to talk about"
            {...register("message", {
              required: "Message is required.",
              minLength: {
                value: 25,
                message: "Message must have at least 25 characters.",
              },
            })}
          />
          {errors.message && (
            <p className="text-xs text-red-500">{errors.message?.message}</p>
          )}
        </div>
      </div>
      <button className="w-fit rounded-[4px] bg-[var(--color-primary-500)] px-5 py-3 text-xs font-semibold text-neutral-600 transition-[background-color] duration-300 hover:bg-[var(--color-primary-700)] md:text-sm">
        Send Message
      </button>
    </form>
  );
}
