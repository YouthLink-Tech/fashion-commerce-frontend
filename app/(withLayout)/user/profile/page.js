import { getServerSession } from "next-auth";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";
import { authOptions } from "@/app/utils/authOptions";
import PersonalInfo from "@/app/components/user/profile/PersonalInfo";
import DeliveryAddresses from "@/app/components/user/profile/DeliveryAddresses";

export default async function Profile() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  let userData;

  if (userEmail) {
    try {
      const result = await tokenizedFetch(
        `/api/customer/single/${userEmail}`,
      );

      userData = result.data || {};
    } catch (error) {
      console.error("FetchError (profile):", error.message);
    }
  }

  return (
    <div className="user-info min-h-full grow space-y-4 rounded-md border-2 border-neutral-50/20 bg-white/40 p-3.5 shadow-[0_0_20px_0_rgba(0,0,0,0.05)] backdrop-blur-2xl lg:p-5 [&_input]:text-sm [&_label]:text-sm [&_label]:text-neutral-500">
      <PersonalInfo serverUserData={userData} />
      <DeliveryAddresses serverUserData={userData} userEmail={userEmail} />
    </div>
  );
}
