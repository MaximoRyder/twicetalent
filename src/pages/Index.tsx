import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import PromiseSection from "@/components/PromiseSection";
import PipelineSection from "@/components/PipelineSection";
import MethodSection from "@/components/MethodSection";
import NotForEveryoneSection from "@/components/NotForEveryoneSection";
import PackagesSection from "@/components/PackagesSection";
import FinalCTASection from "@/components/FinalCTASection";
import DiagnosticSection from "@/components/DiagnosticSection";
import VideoSection from "@/components/VideoSection";
import Footer from "@/components/Footer";
import NetworkBackground from "@/components/NetworkBackground";
import Loader from "@/components/Loader";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const handleFinish = useCallback(() => setLoading(false), []);

  return (
    <main className="relative">
      <AnimatePresence>
        {loading && <Loader onFinish={handleFinish} />}
      </AnimatePresence>
      <NetworkBackground />
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <ProblemSection />
        <PromiseSection />
        <PipelineSection />
        <MethodSection />
        <NotForEveryoneSection />
        <PackagesSection />
        <FinalCTASection />
        <DiagnosticSection />
        <VideoSection />
        <Footer />
      </div>
    </main>
  );
};

export default Index;
