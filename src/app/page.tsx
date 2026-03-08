"use client";

import { useState, useRef, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import Benefits from "@/components/Benefits";
import QualificationSection from "@/components/QualificationSection";
import MultiStepForm from "@/components/MultiStepForm";
import TrustSection from "@/components/TrustSection";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import MobileCTA from "@/components/MobileCTA";

export default function Home() {
  const [quickFormData, setQuickFormData] = useState<{
    vehicle_brand: string;
    vehicle_model: string;
    vehicle_year: string;
    city: string;
    phone: string;
  } | null>(null);

  const [showMobileCta, setShowMobileCta] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowMobileCta(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToForm = () => {
    const el = document.getElementById("formulario-completo");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleQuickSubmit = (data: {
    vehicle_brand: string;
    vehicle_model: string;
    vehicle_year: string;
    city: string;
    phone: string;
  }) => {
    setQuickFormData(data);
    setTimeout(() => scrollToForm(), 100);
  };

  return (
    <main className="pb-16 md:pb-0">
      <HeroSection onQuickSubmit={handleQuickSubmit} />
      <HowItWorks />
      <Benefits />
      <QualificationSection onStartForm={scrollToForm} />

      <div ref={formRef}>
        <MultiStepForm initialData={quickFormData || undefined} />
      </div>

      <TrustSection />
      <FAQ />
      <FinalCTA onCtaClick={scrollToForm} />
      <Footer />

      {showMobileCta && <MobileCTA onClick={scrollToForm} />}
    </main>
  );
}
