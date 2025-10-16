import Image from "next/image";
import { getServerSession } from "next-auth";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";
import { extractData } from "@/app/lib/extractData";
import { authOptions } from "@/app/utils/authOptions";
import callingImg from "@/public/contact/calling.svg";
import ContactForm from "@/app/components/contact/ContactForm";

export default async function ContactUs({ searchParams }) {
  const paramOrderNumber = searchParams.orderNumber;

  const session = await getServerSession(authOptions);

  let userData = {};
  let isParamOrderNumberLegit = false;

  if (session?.user?.email) {
    const promises = [
      tokenizedFetch(`/api/customer/single/${session?.user?.email}`),
      tokenizedFetch(`/api/order/customer?email=${session?.user?.email}`),
    ];

    const [userDataRes, userOrdersRes] = await Promise.allSettled(promises);

    userData = extractData(userDataRes, null, "contact/userData");

    const userOrders = extractData(userOrdersRes, [], "contact/userOrders");

    isParamOrderNumberLegit = userOrders.some(
      (order) =>
        order.orderNumber == paramOrderNumber &&
        (order.orderStatus == "Processed" || order.orderStatus == "Declined"),
    );
  }

  return (
    <main className="pt-header-h-full-section-pb relative overflow-hidden bg-[var(--product-default)] pb-[var(--section-padding)] text-sm text-neutral-500 md:text-base [&_h2]:text-neutral-600">
      <div className="absolute left-[5%] top-[60%] animate-blob bg-[var(--color-moving-bubble-primary)] max-sm:hidden" />
      <div className="absolute left-[5%] top-[15%] animate-blob bg-[var(--color-moving-bubble-secondary)] [animation-delay:1.5s] sm:left-[30%] xl:top-[30%]" />
      <div className="absolute left-[55%] top-[70%] animate-blob bg-[var(--color-moving-bubble-primary)] [animation-delay:0.5s] sm:bg-[var(--color-moving-bubble-secondary)]" />
      <div className="absolute left-[80%] top-1/3 animate-blob bg-[var(--color-moving-bubble-primary)] [animation-delay:2s] max-sm:hidden" />
      <div className="z-[1] mx-5 flex min-h-[calc(100svh-(var(--header-height-xs)+var(--section-padding-double)))] items-stretch gap-4 overflow-hidden rounded-md border-2 border-neutral-50/20 bg-white/40 backdrop-blur-2xl max-md:space-y-4 sm:mx-8 sm:min-h-[calc(100svh-(var(--header-height-sm)+var(--section-padding-double)))] md:mx-12 lg:min-h-[calc(100svh-(var(--header-height-lg)+var(--section-padding-double)))] xl:mx-auto xl:min-h-[calc(100svh-(var(--header-height-lg)+var(--section-padding-double)))] xl:max-w-[1200px]">
        <section className="flex grow flex-col gap-y-7 p-6 sm:gap-y-10 sm:p-9 md:order-last">
          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold">SEND A MESSAGE</h2>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
          </div>
          <ContactForm
            userData={userData}
            orderId={paramOrderNumber}
            isOrderNumberLegit={isParamOrderNumberLegit}
          />
        </section>
        <section className="flex w-[400px] flex-col gap-y-10 bg-white/5 p-7 backdrop-blur-xl max-xl:hidden sm:p-9 xl:w-[475px] min-[1800px]:w-[525px]">
          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold">WE LISTEN, WE CARE</h2>
            <p>Lorem ipsum dolor sit amet ipsum amet.</p>
          </div>
          <div className="grow">
            <Image
              className="h-full w-full object-contain opacity-80"
              src={callingImg}
              alt="Call with customer"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
