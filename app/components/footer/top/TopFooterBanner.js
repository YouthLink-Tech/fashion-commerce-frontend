import Image from "next/image";
import TransitionLink from "@/app/components/ui/TransitionLink";
import { getImage } from "@/app/lib/cloudinaryUtils";

export default function TopFooterBanner({ bannerImg }) {
  return (
    <TransitionLink
      className={`relative block h-40 w-full ${bannerImg?.position === "right" ? "order-last" : ""}`}
      href="/shop?filterBy=On+Sale"
    >
      {!!bannerImg?.url && (
        <Image
          // src={bannerImg?.url}
          src={getImage(bannerImg?.url, 400)}
          className="h-full w-full object-contain"
          alt="Marketing Banner"
          height={0}
          width={0}
          sizes="100dvw"
        />
      )}
    </TransitionLink>
  );
}
