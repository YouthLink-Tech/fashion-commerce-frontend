import Image from "next/image";
import { getServerSession } from "next-auth";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import { authOptions } from "@/app/utils/authOptions";
import getUserStatusInfo from "@/app/utils/getUserStatusInfo";
import avatarImage from "/public/auth/user.webp";
import SidebarLinks from "./SidebarLinks";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";

export default async function UserSidebar() {
  const session = await getServerSession(authOptions);

  let userData;

  if (session?.user?.email) {
    try {
      const result = await tokenizedFetch(
        `/api/customer/single/${session?.user?.email}`,
      );

      userData = result.data || {};
    } catch (error) {
      console.error("FetchError (userSidebar/userData):", error.message);
    }
  }

  const userEmail = userData?.email;
  const userName = userData?.userInfo?.personalInfo?.customerName;

  const userStatus = !userData
    ? undefined
    : getUserStatusInfo(userData?.userInfo?.score);

  return (
    <section className="user-sidebar sticky top-[var(--section-padding)] z-[1] gap-3.5 rounded-md border-2 border-neutral-50/20 bg-white/60 p-3.5 py-4 shadow-[0_0_20px_0_rgba(0,0,0,0.1)] backdrop-blur-2xl max-sm:flex sm:max-h-[calc(100svh-var(--header-height-sm)-var(--section-padding))] sm:min-w-[275px] sm:p-5 sm:shadow-[0_0_20px_0_rgba(0,0,0,0.05)] lg:max-h-[calc(100svh-var(--header-height-lg)-var(--section-padding))] lg:min-w-[300px]">
      <Popover
        className="sm:hidden"
        classNames={{ content: ["rounded-[4px]"] }}
        placement="bottom-start"
        offset={12}
      >
        <PopoverTrigger className="sm:hidden">
          <div
            className="relative size-12 rounded-full border"
            style={{
              borderColor: userStatus?.imgColor || "#848484",
              backgroundColor: userStatus?.imgColor || "#848484",
            }}
          >
            <Image
              src={avatarImage}
              alt="User avatar"
              className="size-full rounded-full mix-blend-hard-light"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="items-start p-3.5 sm:hidden">
          <p
            className="w-fit rounded-[3px] border p-1 text-xs font-bold"
            style={{
              borderColor: userStatus?.borderColor || "#e5e5e5",
              color: userStatus?.textColor || "#525252",
              backgroundColor: userStatus?.backgroundColor || "#f5f5f5",
            }}
          >
            {userStatus?.title || "Unknown"}
          </p>
          <h5 className="mt-1 text-sm font-semibold text-neutral-600">
            {userName}
          </h5>
          <p className="text-xs font-semibold text-neutral-500">{userEmail}</p>
        </PopoverContent>
      </Popover>
      <div className="mb-7 flex w-full items-center gap-x-4 max-sm:hidden">
        <div
          className="relative size-14 rounded-full border"
          style={{
            borderColor: userStatus?.imgColor || "#848484",
            backgroundColor: userStatus?.imgColor || "#848484",
          }}
        >
          <Image
            src={avatarImage}
            alt="User avatar"
            className="size-full rounded-full mix-blend-hard-light"
          />
        </div>
        <div>
          <h5 className="text-sm font-semibold text-neutral-600">{userName}</h5>
          <p className="-mt-1 text-[11px] font-semibold text-neutral-500">
            {userEmail}
          </p>
          <p
            className="w-fit rounded-[3px] border p-[5px] text-[10px]/[10px] font-bold"
            style={{
              borderColor: userStatus?.borderColor || "#e5e5e5",
              color: userStatus?.textColor || "#525252",
              backgroundColor: userStatus?.backgroundColor || "#f5f5f5",
            }}
          >
            {userStatus?.title || "Unknown"}
          </p>
        </div>
      </div>
      <div className="min-h-full border-l-2 border-neutral-300 sm:hidden" />
      <SidebarLinks />
    </section>
  );
}
