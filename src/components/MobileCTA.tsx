"use client";

import { ArrowRight } from "lucide-react";

interface MobileCTAProps {
  onClick: () => void;
}

export default function MobileCTA({ onClick }: MobileCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.15)]">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white font-black py-4 px-6 rounded-2xl text-base transition-all duration-200 active:scale-[0.96] shadow-xl shadow-primary/20 cursor-pointer"
      >
        RECEBER PROPOSTAS AGORA
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
