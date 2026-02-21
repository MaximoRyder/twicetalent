import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import PromiseSection from "@/components/PromiseSection";
import PipelineSection from "@/components/PipelineSection";
import MethodSection from "@/components/MethodSection";
import NotForEveryoneSection from "@/components/NotForEveryoneSection";
import PackagesSection from "@/components/PackagesSection";
import FinalCTASection from "@/components/FinalCTASection";
import VideoSection from "@/components/VideoSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <PromiseSection />
      <PipelineSection />
      <MethodSection />
      <NotForEveryoneSection />
      <PackagesSection />
      <FinalCTASection />
      <VideoSection />
      <Footer />
    </main>
  );
};

export default Index;
