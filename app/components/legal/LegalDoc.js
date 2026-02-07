import FAQs from "./faqs";
import dynamic from "next/dynamic";
const RichTextRenderer = dynamic(() => import("../shared/RichTextRenderer"), {
  ssr: false,
});

export default function LegalDoc({ pageTitle, docContent, faqs }) {
  return (
    <div className="pt-header-h-full-section-pb min-h-svh pb-[var(--section-padding)]">
      {/* Document Title */}
      <h1 className="my-5 text-center text-[32px]/[35px]">{pageTitle}</h1>
      {/* Document Wrapper */}
      <div className="z-[1] mx-5 max-w-[900px] items-stretch overflow-hidden rounded-xl border-2 border-neutral-50/20 bg-white/40 shadow-[0_0_32px_0_rgba(0,0,0,0.0666)] backdrop-blur-2xl sm:mx-8 sm:shadow-[0_0_32px_0_rgba(0,0,0,0.0333)] lg:mx-auto lg:flex">
        {/* Document */}
        <section
          className={`p-5 sm:p-7 xl:p-9 [&_:is(h2,h3):not(:first-child)]:mt-10 [&_:is(h2,h3)]:mb-2 [&_a]:text-[var(--color-primary-900)] [&_a]:underline [&_a]:underline-offset-2 [&_h2]:text-xl [&_h3]:text-lg [&_li:not(:last-child)]:mb-2 [&_p]:mb-4 [&_p]:text-justify [&_ul]:-mt-1 [&_ul]:mb-4 [&_ul]:ml-10 [&_ul]:list-disc ${!faqs?.length ? "[&_p:last-child]:mb-0" : "[&_p:last-child]:mb-10"}`}
        >
          {/* Texts */}
          {/* <div
            dangerouslySetInnerHTML={{
              __html: docContent,
            }}
          ></div> */}
          <RichTextRenderer content={docContent} />
          {/* Accordions/FAQs (if any) */}
          {faqs?.length && <FAQs faqs={faqs} />}
        </section>
      </div>
    </div>
  );
}
