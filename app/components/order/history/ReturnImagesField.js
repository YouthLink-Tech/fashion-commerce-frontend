import Image from "next/image";
import toast from "react-hot-toast";
import { MdCancel } from "react-icons/md";
import fileUploadSVG from "@/public/shapes/upload.svg";
import { useLoading } from "@/app/contexts/loading";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import { getImage } from "@/app/lib/cloudinaryUtils";

export default function ReturnImagesField({
  register,
  trigger,
  errors,
  isFormSubmissionRequested,
  setIsFormSubmissionRequested,
  isUploadingRef,
  imgFiles,
  setImgFiles,
  returnImgUrls,
  setReturnImgUrls,
}) {
  const { setIsPageLoading } = useLoading();

  const updateDropZoneStyles = (event, state) => {
    const dropZoneElement = event.currentTarget;
    const uploadImageElement = event.currentTarget.querySelector("img");

    if (state === "enter") {
      dropZoneElement.style.borderColor = "#a1c99c";
      dropZoneElement.style.backgroundColor = "#fafff9";
      uploadImageElement.style.opacity = "1";
    } else {
      dropZoneElement.style.borderColor = "#e5e5e5";
      dropZoneElement.style.backgroundColor = "transparent";
      uploadImageElement.style.opacity = "0.6";
    }
  };

  const uploadImagesToCloudinary = async (images) => {
    const imageUrls = [];

    try {
      const formData = new FormData();

      const files = Array.from(images); // 🔥 safety

      files.forEach((image) => formData.append("files", image));
      formData.append("type", "returnOrderImage");

      const result = await routeFetch("/api/upload-files", {
        method: "POST",
        body: formData,
      });

      if (result.ok && Array.isArray(result.data)) {
        const urls = result.data.map(item => item.public_id);
        imageUrls.push(...urls);
      } else {
        throw new Error("Invalid upload response");
      }

    } catch (error) {
      console.error("UploadError:", error);
      toast.error("Failed to upload images.");
    }

    return imageUrls;
  };

  const validateFiles = async (uploadedFiles) => {
    if (isUploadingRef.current) return true;

    try {
      isUploadingRef.current = true;

      const files = Array.from(uploadedFiles); // 🔥 FIX HERE

      if (!files.length) return "At least one image is required!";

      for (let file of files) {
        if (!file.type.startsWith("image/")) return "Only image formats allowed";
        if (imgFiles.some(f => f.name === file.name)) return "Duplicate images not allowed";
        if (file.size > 10 * 1024 * 1024) return `${file.name} exceeds 10MB`;
      }

      if (imgFiles.length + files.length > 5) return "Max 5 images allowed";

      setIsPageLoading(true);

      const newImgUrls = await uploadImagesToCloudinary(files);

      setReturnImgUrls(prev => [...new Set([...prev, ...newImgUrls])]);
      setImgFiles(prev => [...new Set([...prev, ...files])]);

      return true;

    } finally {
      isUploadingRef.current = false;
      setIsPageLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3 font-semibold">
      <label htmlFor="description">Upload Images as Proof</label>
      <div
        className="cursor-pointer rounded-[4px] border-3 border-dashed border-neutral-200 px-5 py-8 transition-[border-color,background-color] duration-300 ease-in-out"
        onDrop={(event) => {
          event.preventDefault();
          if (isFormSubmissionRequested) setIsFormSubmissionRequested(false);

          const inputElement = event.currentTarget.querySelector("input");

          inputElement.files = event.dataTransfer.files;
          inputElement.dispatchEvent(new Event("change", { bubbles: true }));
        }}
        onDragOver={(event) => {
          event.preventDefault();
          updateDropZoneStyles(event, "enter");
        }}
        onDragLeave={(event) => updateDropZoneStyles(event, "leave")}
        onMouseEnter={(event) => updateDropZoneStyles(event, "enter")}
        onMouseLeave={(event) => updateDropZoneStyles(event, "leave")}
        onClick={(event) => {
          if (isFormSubmissionRequested) setIsFormSubmissionRequested(false);

          const inputElement = event.currentTarget.querySelector("input");
          inputElement.value = "";
          inputElement.click();
        }}
      >
        <div className="flex flex-col items-center justify-center gap-2 text-neutral-500">
          <Image
            src={fileUploadSVG}
            alt="Upload image"
            className="size-16 opacity-60 transition-opacity duration-300 ease-in-out"
          />
          <p className="text-[13px]">
            <span className="text-[var(--color-primary-900)] underline underline-offset-2 transition-[color] duration-300 ease-in-out hover:text-[var(--color-primary-800)]">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="text-[11px]">Maximum file size is 10 MB</p>
        </div>
        <input
          id="img-input"
          type="file"
          {...register("images", {
            onChange: () => trigger("images"),
            required: "At least one image is required.",
            validate: {
              notValidFiles: (files) =>
                !isFormSubmissionRequested
                  ? validateFiles(files)
                  : !imgFiles.length
                    ? "At least one image is required."
                    : true,
            },
          })}
          multiple
          hidden
        />
      </div>
      {errors.images && (
        <p className="text-xs font-semibold text-red-500">
          {errors.images?.message}
        </p>
      )}
      {!!returnImgUrls?.length && (
        <ul className="!mb-8 !mt-5 flex flex-wrap gap-x-3 gap-y-5">
          {Array.from(returnImgUrls).map((returnImgUrl, urlIndex) => (
            <li className="relative" key={returnImgUrl + urlIndex}>
              {!!returnImgUrl && (
                <Image
                  // src={returnImgUrl}
                  src={getImage(returnImgUrl, 400)}
                  alt={`Image ${urlIndex + 1} as proof`}
                  className="size-20 rounded-[4px] border border-neutral-200 object-cover"
                  height={0}
                  width={0}
                  sizes="240px"
                />
              )}
              <MdCancel
                className="absolute right-0 top-0 size-[22px] -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full bg-white text-red-500 transition-[color] duration-300 ease-in-out hover:text-red-600"
                onClick={() => {
                  setImgFiles((prevImgFiles) =>
                    [...prevImgFiles].filter(
                      (prevFile, prevFileIndex) => prevFileIndex !== urlIndex,
                    ),
                  );

                  setReturnImgUrls((prevImgUrls) =>
                    [...prevImgUrls].filter(
                      (prevImgUrl) => prevImgUrl !== returnImgUrl,
                    ),
                  );
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
