import Image from "next/image";
import { LuFacebook } from "react-icons/lu";
import { TbBrandTiktok } from "react-icons/tb";
import { FaInstagram, FaXTwitter } from "react-icons/fa6";
import { COMPANY_NAME } from "@/app/config/company";
import TransitionLink from "@/app/components/ui/TransitionLink";
import { getImage } from "@/app/lib/cloudinaryUtils";

export default function CompanyInfo({ logoWithTextSrc }) {
  return (
    <div className="max-sm:col-span-full sm:col-span-1">
      <TransitionLink href="/">
        <Image
          className="h-12 w-auto"
          // src={logoWithTextSrc}
          src={getImage(logoWithTextSrc, 400)}
          alt={`${COMPANY_NAME} logo`}
          height={0}
          width={0}
          sizes="250px"
        />
      </TransitionLink>
      <p className="mb-7 mt-2 text-[13px]/[1.35] sm:max-w-64 lg:mb-9 lg:max-w-60 lg:text-sm xl:max-w-72">
        <strong>{COMPANY_NAME}</strong> is a Bangladesh-based e-commerce platform committed to quality products, secure checkout, and dependable delivery with customer-first support.
      </p>
      <div>
        <ul className="social-links flex items-center gap-x-2">
          <li>
            <TransitionLink
              href="https://www.facebook.com/fashion-commerce/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LuFacebook />
            </TransitionLink>
          </li>
          <li>
            <TransitionLink
              href="https://www.instagram.com/fashion-commerce/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </TransitionLink>
          </li>
          <li>
            <TransitionLink
              href="https://www.twitter.com/fashion-commerce/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaXTwitter />
            </TransitionLink>
          </li>
          <li>
            <TransitionLink
              href="https://www.tiktok.com/fashion-commerce/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <TbBrandTiktok />
            </TransitionLink>
          </li>
        </ul>
      </div>
    </div>
  );
}
