"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useLoading } from "@/app/contexts/loading";
import { rawFetch } from "@/app/lib/fetcher/rawFetch";

export default function TopFooterNewsletter({ userEmail, isUserSubscribed }) {
  const router = useRouter();
  const { setIsPageLoading } = useLoading();
  const { register, handleSubmit, reset, setValue } = useForm({
    mode: "onSubmit",
  });

  setValue("newsletterEmail", userEmail || "");

  const onSubmit = async (data) => {
    setIsPageLoading(true);

    try {
      const result = await rawFetch("/api/newsletter/add", {
        method: "POST",
        body: JSON.stringify({
          email: data.newsletterEmail,
        }),
      });

      if (result.ok) {
        toast.success("Subscribed to newsletter successfully.");
        router.refresh();
        reset();
      } else {
        console.error(
          "SubmissionError (footer/newsletter):",
          result.message.message || "Failed to subscribe to newsletter.",
        );
        toast.error(result.message.message || "Failed to subscribe to newsletter.");
      }
    } catch (error) {
      console.error(
        "SubmissionError (footer/newsletter):",
        error.message || error,
      );
      toast.error("Failed to subscribe to newsletter.");
    }
    setIsPageLoading(false);
  };

  const onError = (errors) => {
    const errorTypes = Object.values(errors).map((error) => error.type);

    if (errorTypes.includes("required")) toast.error("Email is required.");
    else if (errorTypes.includes("pattern")) toast.error("Email is not valid.");
    else toast.error("Something went wrong. Please try again.");
  };

  if (!isUserSubscribed)
    return (
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit, onError)}
        className="w-full max-w-md"
      >
        <p className="mb-4 text-center text-xs text-neutral-700 md:text-sm">
          Subscribe to our newsletter to get more offers daily!
        </p>
        <div className="flex gap-1.5">
          <input
            type="email"
            className="h-10 w-full rounded-[4px] border-2 border-neutral-200/50 bg-white/90 px-3 text-xs text-neutral-700 outline-none backdrop-blur-2xl transition-[border-color] duration-300 ease-in-out placeholder:text-neutral-500 focus:border-white/50 md:text-sm"
            placeholder="Enter your email address"
            {...register("newsletterEmail", {
              required: true,
              pattern:
                /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/,
            })}
          />
          <button className="block w-fit self-end text-nowrap rounded-[4px] bg-[var(--color-primary-700)] px-5 py-2.5 text-center text-sm font-semibold text-neutral-800 transition-[background-color] duration-300 ease-in-out hover:bg-[var(--color-primary-500)]">
            Subscribe
          </button>
        </div>
      </form>
    );
}
