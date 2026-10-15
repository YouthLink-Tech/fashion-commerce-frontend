import Image from "next/image";
import TransitionLink from "@/app/components/ui/TransitionLink";
import { getImage } from "@/app/lib/cloudinaryUtils";

export default function TopFooterBanner({ bannerImg }) {

  const imageId = bannerImg?.publicId || bannerImg?.url;

  // Cleanly unmount if no active banner is configured (prevents empty 160px gap)
  if (!imageId) return null;

  return (
    <TransitionLink
      className={`relative block h-40 w-full ${bannerImg?.position === "right" ? "order-last" : ""}`}
      href="/shop?filterBy=On+Sale"
    >
      <Image
        src={getImage(imageId, 1200)}
        className="h-full w-full object-contain"
        alt="Marketing Banner"
        height={0}
        width={0}
        sizes="100dvw"
      />
    </TransitionLink>
  );
}
