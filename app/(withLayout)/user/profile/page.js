import { getServerSession } from "next-auth";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";
import { authOptions } from "@/app/utils/authOptions";
import PersonalInfo from "@/app/components/user/profile/PersonalInfo";
import DeliveryAddresses from "@/app/components/user/profile/DeliveryAddresses";
import { rawFetch } from "@/app/lib/fetcher/rawFetch";
import { extractData } from "@/app/lib/extractData";

export default async function Profile() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  const promises = [
    userEmail ? tokenizedFetch(`/api/customer/single/${userEmail}`) : Promise.resolve(null),
    rawFetch("/api/city/public-options"),
    rawFetch("/api/thana/all", { next: { revalidate: 3600 } }),
  ];

  const [userDataRes, cityRes, thanaRes] = await Promise.allSettled(promises);

  const userData = extractData(userDataRes, null, "profile/userData");
  const cities = extractData(cityRes, [], "profile/cities");
  const thanas = extractData(thanaRes, [], "profile/thanas");

  return (
    <div className="user-info min-h-full grow space-y-4 rounded-md border-2 border-neutral-50/20 bg-white/40 p-3.5 shadow-[0_0_20px_0_rgba(0,0,0,0.05)] backdrop-blur-2xl lg:p-5 [&_input]:text-sm [&_label]:text-sm [&_label]:text-neutral-500">
      <PersonalInfo serverUserData={userData} cities={cities} />
      <DeliveryAddresses serverUserData={userData} userEmail={userEmail} cities={cities} thanas={thanas} />
    </div>
  );
}
