"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

// Lazy load Accordion and its subcomponents for performance
const Accordion = dynamic(() => import("@/components/ui/accordion").then(mod => mod.Accordion), { ssr: false });
const AccordionItem = dynamic(() => import("@/components/ui/accordion").then(mod => mod.AccordionItem), { ssr: false });
const AccordionTrigger = dynamic(() => import("@/components/ui/accordion").then(mod => mod.AccordionTrigger), { ssr: false });
const AccordionContent = dynamic(() => import("@/components/ui/accordion").then(mod => mod.AccordionContent), { ssr: false });

interface FaqSectionProps {
  title: string;
  icon: ReactNode;
  questions: {
    question: string;
    answer: ReactNode;
  }[];
}

/**
 * FaqSection
 * Renders a titled, icon-labeled section of FAQ questions as an accessible accordion.
 * Optimized for performance and improved design.
 * Marked as a client component because it uses next/dynamic with ssr: false.
 */
export default function FaqSection({ title, icon, questions }: FaqSectionProps) {
  return (
    <section className="rounded-2xl border border-muted bg-background/80 shadow-sm p-6 md:p-8 transition hover:shadow-lg">
      <div className="flex items-center gap-3 mb-5">
        <div className="bg-primary/10 p-2 rounded-full flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {questions.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left text-lg font-medium transition hover:text-primary">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
} 