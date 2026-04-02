import Image from "next/image";
import { LuSend } from "react-icons/lu";
import { rawFetch } from "@/app/lib/fetcher/rawFetch";
import customerServiceImg from "@/public/help-center/customer-service.svg";
import { COMPANY_NAME } from "@/app/config/company";
import FAQs from "@/app/components/legal/faqs";
import TransitionLink from "@/app/components/ui/TransitionLink";
import RichTextRenderer from "@/app/components/shared/RichTextRenderer";

export default async function HelpCenter() {
  let pageTitle, faqDescription, faqs;

  try {
    const result = await rawFetch("/api/faq/all", {
      next: {
        revalidate: 86400, // 24 hours — FAQs change occasionally
        tags: ['faqs']
      }
    });
    const [faqData] = result.data || [];

    pageTitle = faqData?.pageTitle;
    faqDescription = faqData?.faqDescription;
    faqs = faqData?.faqs || [];
  } catch (error) {
    console.error("FetchError (faq):", error.message);
  }

  return (
    <main className="relative -mt-[calc(256*4px)] bg-neutral-100 text-sm text-neutral-500 max-sm:-mt-[calc(256*2px)] md:text-base [&_:is(h1,h2,h3,h4)]:font-semibold [&_:is(h1,h2,h3,h4)]:uppercase [&_:is(h1,h2,h3,h4)]:text-neutral-600">
      {/* Left Mesh Gradient */}
      <div className="sticky left-[5%] top-[55%] animate-blob bg-[var(--color-moving-bubble-secondary)] max-sm:hidden" />
      {/* Middle-Left Mesh Gradient */}
      <div className="sticky left-[30%] top-[5%] animate-blob bg-[var(--color-moving-bubble-primary)] [animation-delay:1.5s] max-sm:left-[5%]" />
      {/* Middle-Right Mesh Gradient */}
      <div className="sticky left-[55%] top-[60%] animate-blob bg-[var(--color-moving-bubble-secondary)] [animation-delay:0.5s] max-sm:left-3/4" />
      {/* Right Mesh Gradient */}
      <div className="sticky left-[80%] top-1/3 animate-blob bg-[var(--color-moving-bubble-primary)] [animation-delay:2s] max-sm:hidden" />
      <div className="pt-header-h-full-section-pb min-h-svh space-y-7 pb-[var(--section-padding)]">
        {/* Help Center Wrapper */}
        <div className="z-[1] mx-5 max-w-[900px] items-stretch overflow-hidden rounded-md border-2 border-neutral-50/20 bg-white/40 backdrop-blur-2xl sm:mx-8 lg:mx-auto lg:flex lg:flex-col">
          {/* Title Section */}
          <section className="flex flex-col items-center p-5 text-center sm:p-7 xl:p-9">
            <h1 className="mb-4 text-2xl/[1] sm:text-[32px]/[1]">
              Help Center
            </h1>
            <p className="sm:w-3/4">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nisi
              veritatis adipisci sit aut cumque provident voluptates quam
              perferendis.
            </p>
          </section>
          {/* Hero Section */}
          <section className="my-3 p-5 max-sm:space-y-5 sm:flex sm:items-center sm:gap-10 sm:p-7 lg:gap-16 xl:p-9">
            <Image
              className="object-contain opacity-80 sm:h-[260px] lg:h-[375px]"
              src={customerServiceImg}
              alt="Customer service"
            />
            <div>
              <h2 className="mb-4 text-base/[1] md:text-lg/[1] lg:text-xl/[1]">
                Welcome to {COMPANY_NAME} Help Center
              </h2>
              <p>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Fugiat
                veritatis iure expedita, nam suscipit et vitae. Officia minima
                sit necessitatibus?
              </p>
            </div>
          </section>
        </div>
        <div className="z-[1] mx-5 max-w-[900px] items-stretch overflow-hidden rounded-md border-2 border-neutral-50/20 bg-white/40 backdrop-blur-2xl sm:mx-8 lg:mx-auto lg:flex lg:flex-col">
          {/* FAQ Section */}
          <section className="p-5 sm:p-7 xl:p-9 [&_p]:-mt-2 [&_p]:pb-2">
            {/* FAQ Title */}
            <h2 className="mb-7 text-lg/[1] sm:text-center sm:text-2xl/[1]">
              {pageTitle}
            </h2>
            {/* FAQ Description */}
            {/* <div
              dangerouslySetInnerHTML={{
                __html: faqDescription,
              }}
            ></div> */}
            <RichTextRenderer content={faqDescription} />
            {/* Accordions/FAQs */}
            <FAQs faqs={faqs} />
          </section>
        </div>
        <div className="z-[1] mx-5 rounded-md border-2 border-neutral-50/20 bg-white/40 backdrop-blur-2xl sm:mx-8 lg:mx-auto lg:max-w-[575px]">
          {/* Contact Section */}
          <section className="flex flex-col items-center p-5 text-center sm:p-7 sm:text-center xl:p-9">
            <h3 className="text-lg/[1] sm:text-xl/[1]">
              Still have a question?
            </h3>
            <p className="mb-8 mt-3">
              We&apos;re happy to help. Contact our support team.
            </p>
            <TransitionLink
              href="/contact-us"
              className="flex w-fit items-center gap-2 rounded-[4px] bg-[var(--color-primary-500)] px-4 py-2.5 text-sm font-semibold text-neutral-600 transition-[background-color] duration-300 hover:bg-[var(--color-primary-700)]"
            >
              Contact Us
              <LuSend size={17} />
            </TransitionLink>
          </section>
        </div>
      </div>
    </main>
  );
}
