"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ExperienceFAQ } from "@/types";

const EventFaqs = ({ faqs }: { faqs: ExperienceFAQ[] }) => {
  if (!faqs?.length) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">FAQs</h2>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={`${faq.question}-${index}`}
            value={`faq-${index}`}
          >
            <AccordionTrigger className="cursor-pointer py-4 text-left">
              {faq.question}
            </AccordionTrigger>

            <AccordionContent className="text-muted-foreground pb-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default EventFaqs;
