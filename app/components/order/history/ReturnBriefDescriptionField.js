export default function ReturnBriefDescriptionField({ register, errors }) {
  return (
    <div className="w-full space-y-3 font-semibold">
      <label htmlFor="description">Brief Description</label>
      <textarea
        {...register("description", {
          required: "Brief description is required.",
          minLength: {
            value: 50,
            message: "Brief description must have at least 50 characters.",
          },
        })}
        rows={5}
        placeholder="Provide a brief description"
        className="w-full resize-none rounded-[4px] border-2 border-neutral-200 px-3 py-3 text-xs text-neutral-700 outline-none transition-[border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-[var(--color-secondary-500)] md:text-sm"
      ></textarea>
      {errors.description && (
        <p className="text-xs font-semibold text-red-500">
          {errors.description.message}
        </p>
      )}
    </div>
  );
}
