"use client";

import { ArrowRight } from "lucide-react";

interface MobileCTAProps {
  onClick: () => void;
}

export default function MobileCTA({ onClick }: MobileCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <button
        onClick={onClick}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base"
      >
        Receber propostas agora
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
