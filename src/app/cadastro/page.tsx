"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TypeformFlow from "@/components/TypeformFlow";

function CadastroContent() {
  const searchParams = useSearchParams();

  const initialData = {
    name: searchParams.get("name") || undefined,
    email: searchParams.get("email") || undefined,
    phone: searchParams.get("phone") || undefined,
  };

  const hasInitialData = Object.values(initialData).some(Boolean);

  return (
    <TypeformFlow
      initialData={hasInitialData ? initialData : undefined}
    />
  );
}

export default function CadastroPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CadastroContent />
    </Suspense>
  );
}
