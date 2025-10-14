import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";
import { rawFetch } from "@/app/lib/fetcher/rawFetch";
import { extractData } from "@/app/lib/extractData";
import TopFooterWrapper from "./TopFooterWrapper";
import TopFooterBanner from "./TopFooterBanner";
import TopFooterNewsletter from "./TopFooterNewsletter";

export default async function TopFooter({ userEmail }) {
  const promises = [
    rawFetch("/allMarketingBanners"),
    userEmail
      ? tokenizedFetch(`/api/newsletter/single/${userEmail}`)
      : Promise.resolve(null),
  ];

  const [bannerRes, newsletterRes] = await Promise.allSettled(promises);

  const [bannerImg] = extractData(bannerRes, [], "footer/marketingBanner");
  const isUserSubscribed = !!extractData(
    newsletterRes,
    null,
    "footer/newsletterByEmail",
  );

  return (
    <TopFooterWrapper bannerImgPosition={bannerImg?.position}>
      <TopFooterBanner bannerImg={bannerImg} />
      <TopFooterNewsletter
        userEmail={userEmail}
        isUserSubscribed={isUserSubscribed}
      />
    </TopFooterWrapper>
  );
}
