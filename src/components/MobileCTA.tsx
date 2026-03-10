"use client";

import { ArrowRight } from "lucide-react";

interface MobileCTAProps {
  onClick: () => void;
}

export default function MobileCTA({ onClick }: MobileCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 p-3 shadow-[0_-4px_30px_rgba(0,0,0,0.12)]">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-white font-bold py-3.5 px-6 rounded-xl text-base transition-all duration-200 active:scale-[0.98] shadow-lg shadow-accent/30 cursor-pointer"
      >
        Receber propostas agora
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
