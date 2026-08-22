"use client";

import { Accordion, AccordionItem } from "@nextui-org/react";
import RichTextRenderer from "../shared/RichTextRenderer";

export default function FAQs({ faqs }) {
  return (
    <Accordion>
      {faqs?.map((faq) => {
        return (
          <AccordionItem
            key={faq.id}
            aria-label={faq.question}
            title={faq.question}
            className="[&_h2>button_span]:font-normal [&_h2]:!my-2"
          >
            {/* <div
              dangerouslySetInnerHTML={{
                __html: faq.answer,
              }}
            ></div> */}
            <RichTextRenderer content={faq.answer} />
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
