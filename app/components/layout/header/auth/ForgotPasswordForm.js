import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useLoading } from "@/app/contexts/loading";
import { rawFetch } from "@/app/lib/fetcher/rawFetch";

export default function ForgotPasswordForm({ setIsAuthModalOpen }) {
  const { setIsPageLoading } = useLoading();
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
        setIsAuthModalOpen(false);
      } else {
        console.error(
          "SubmissionError (forgotPasswordForm):",
          result.message || "Failed to request for password reset.",
        );
        toast.error(result.message);
      }
    } catch (error) {
      console.error(
        "SubmissionError (forgotPasswordForm):",
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
    <form
      noValidate
      onSubmit={handleSubmitForForgotPassword(onSubmit, onError)}
      className="space-y-3"
    >
      {/* Email Input Field */}
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
      {/* Reset Password Button */}
      <button
        type="submit"
        className="!mt-7 w-full rounded-[4px] bg-[var(--color-primary-500)] py-3 text-xs font-semibold text-neutral-700 transition-[background-color] duration-300 hover:bg-[var(--color-primary-700)] md:text-sm"
      >
        Send Email
      </button>
    </form>
  );
}
