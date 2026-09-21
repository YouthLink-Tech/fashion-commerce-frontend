import { getServerSession } from "next-auth";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";
import { authOptions } from "@/app/utils/authOptions";
import SecurityForm from "@/app/components/user/security/SecurityForm";

export const dynamic = "force-dynamic";

export default async function Security() {
  const session = await getServerSession(authOptions);

  let userData;

  if (session?.user?.email) {
    try {
      const result = await tokenizedFetch(
        `/api/customer/single/${session?.user?.email}`,
      );

      userData = result.data || {};
    } catch (error) {
      console.error("FetchError (security/userData):", error.message);
    }
  };

  return (
    <SecurityForm
      name={userData?.name}
      googleName={userData?.google_name}
      isLinkedWithCredentials={userData?.is_linked_with_credentials}
      isLinkedWithGoogle={userData?.is_linked_with_google}
    />
  );
}
