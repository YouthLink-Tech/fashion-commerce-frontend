import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import {
  FaSquareFacebook,
  FaXTwitter,
  FaFacebookMessenger,
  FaWhatsapp,
  FaLink,
} from "react-icons/fa6";

export default function ProductInfoFooter({ productId, productTitle }) {
  const pathname = usePathname();
  const [fullUrl, setFullUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFullUrl(window.location.origin + pathname);
    }
  }, [pathname]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy the link.");
    }
  };

  return (
    <section className="mb-1 flex justify-between gap-4 max-sm:flex-col sm:items-center md:max-lg:flex-col md:max-lg:items-start">
      {/* Product ID */}
      <div className="flex gap-x-1.5">
        <h4 className="font-semibold text-neutral-600">Product ID:</h4>
        <p className="text-neutral-500">{productId}</p>
      </div>
      {/* Social Share Buttons */}
      <div className="flex items-center gap-x-1.5">
        <h4 className="font-semibold text-neutral-600">Share:</h4>
        <ul className="social-icons flex gap-x-1.5 [&_a>svg]:w-3.5 [&_a]:size-[26px]">
          <li>
            <Link
              className="hover:bg-[#cfe6ff] hover:text-[#0080ff]"
              href={`https://www.facebook.com/sharer/sharer.php?u=${fullUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaSquareFacebook />
            </Link>
          </li>
          <li>
            <Link
              className="hover:bg-black hover:text-white"
              href={`https://twitter.com/intent/tweet?url=${fullUrl}&text=Check+out+this+${productTitle?.split(" ")?.join("+")}!`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaXTwitter />
            </Link>
          </li>
          <li className="[@media_(hover:hover)_and_(pointer:fine)]:hidden">
            <Link
              className="hover:bg-[#cce6ff] hover:text-[#168AFF]"
              href={`fb-messenger://share/?link=${fullUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebookMessenger />
            </Link>
          </li>
          <li>
            <Link
              className="hover:bg-[#25D366] hover:text-white"
              href={`https://api.whatsapp.com/send?text=Check+out+this+${productTitle?.split(" ")?.join("+")}!+${fullUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp />
            </Link>
          </li>
          <li
            className="flex size-[26px] cursor-pointer items-center justify-center rounded-[3px] bg-neutral-200 text-neutral-500 transition-colors duration-[400ms] ease-out hover:bg-black hover:text-white"
            onClick={handleCopyToClipboard}
          >
            <FaLink className="w-3.5" />
          </li>
        </ul>
      </div>
    </section>
  );
}
