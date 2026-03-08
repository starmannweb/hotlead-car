"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import Benefits from "@/components/Benefits";
import QualificationSection from "@/components/QualificationSection";
import TrustSection from "@/components/TrustSection";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import MobileCTA from "@/components/MobileCTA";

export default function Home() {
  const router = useRouter();
  const [showMobileCta, setShowMobileCta] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowMobileCta(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const goToCadastro = () => {
    router.push("/cadastro");
  };

  const handleQuickSubmit = (data: {
    vehicle_brand: string;
    vehicle_model: string;
    vehicle_year: string;
    city: string;
    phone: string;
  }) => {
    const params = new URLSearchParams({
      brand: data.vehicle_brand,
      model: data.vehicle_model,
      year: data.vehicle_year,
      city: data.city,
      phone: data.phone,
    });
    router.push(`/cadastro?${params.toString()}`);
  };

  return (
    <main className="pb-16 md:pb-0">
      <HeroSection onQuickSubmit={handleQuickSubmit} />
      <HowItWorks />
      <Benefits />
      <QualificationSection onStartForm={goToCadastro} />
      <TrustSection />
      <FAQ />
      <FinalCTA onCtaClick={goToCadastro} />
      <Footer />

      {showMobileCta && <MobileCTA onClick={goToCadastro} />}
    </main>
  );
}
