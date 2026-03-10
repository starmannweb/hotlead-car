"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { FAQ_ITEMS } from "@/lib/constants";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 md:py-32 bg-white dark:bg-gray-900 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/3 rounded-full blur-[120px]" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Dúvidas frequentes
          </span>
          <h2 className="section-title">
            Perguntas <span className="gradient-text">frequentes</span>
          </h2>
          <p className="section-subtitle">
            Tire suas dúvidas sobre o processo de venda
          </p>
        </div>

        <div className="mt-14 space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={index}
              className={`rounded-2xl overflow-hidden border transition-all duration-300 ${openIndex === index
                  ? "bg-white dark:bg-gray-800 border-primary/20 shadow-lg shadow-primary/5"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
                }`}
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="w-full flex items-center justify-between p-6 text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle
                    className={`w-5 h-5 shrink-0 transition-colors duration-300 ${openIndex === index
                        ? "text-primary"
                        : "text-gray-300 dark:text-gray-600"
                      }`}
                  />
                  <span className="text-base font-semibold text-gray-900 dark:text-white pr-4">
                    {item.question}
                  </span>
                </div>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${openIndex === index
                      ? "bg-primary text-white rotate-180"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                    }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? "max-h-48 pb-6" : "max-h-0"
                  }`}
              >
                <p className="px-6 pl-14 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
