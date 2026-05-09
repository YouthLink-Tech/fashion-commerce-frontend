import { rawFetch } from "@/app/lib/fetcher/rawFetch";
import StoryContents from "@/app/components/story/StoryContents";
import { COMPANY_NAME } from "@/app/config/company";
import { FRONTEND_URL } from "@/app/config/site";

export const metadata = {
  title: "Our Story",
  description: `Learn the story behind ${COMPANY_NAME} — our mission, values, and the vision driving our men's fashion brand in Bangladesh.`,
  keywords: [COMPANY_NAME, "our story", "men's fashion brand", "Bangladesh fashion", "about us"],
  robots: { index: true, follow: true },
  alternates: { canonical: `${FRONTEND_URL}/our-story` },
  openGraph: {
    title: `Our Story | ${COMPANY_NAME}`,
    description: `Learn the story behind ${COMPANY_NAME} — our mission, values, and vision.`,
    url: `${FRONTEND_URL}/our-story`,
    siteName: COMPANY_NAME,
    type: "website",
    images: [
      {
        url: `${FRONTEND_URL}/logo/logo.png`,
        width: 1200,
        height: 630,
        alt: `${COMPANY_NAME} Our Story`,
      },
    ],
  },
};

export default async function OurStory() {
  let departments;

  try {
    const result = await rawFetch("/api/story/all-frontend", {
      next: {
        revalidate: 86400,  // 24 hours
        tags: ['our-story']
      }
    });

    departments = result.data || [];
  } catch (error) {
    console.error("FetchError (story):", error.message);
  }

  if (!departments?.length) return null;

  return <StoryContents departments={departments} />;
}
