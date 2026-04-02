import { rawFetch } from "@/app/lib/fetcher/rawFetch";
import StoryContents from "@/app/components/story/StoryContents";

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
