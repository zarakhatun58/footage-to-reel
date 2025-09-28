import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      <div className="container mx-auto px-4 relative z-10 text-center mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center px-2 py-2 bg-[#2ee1d8]/10 rounded-full gradient-text text-xs sm:px-6 sm:py-3 sm:text-sm font-medium mb-8 border border-[#2ee1d8]"
        >
          <Sparkles className="w-4 h-4 mr-2 text-teal-300" />
          Transform Your Videos Into Stories
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight text-gray-900"
        >
          Transform Your{" "}
          <span className="gradient-text">
            Video<br /> Process
          </span><br />
          with AI Stories
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0"
        >
          Discover how our innovative AI transforms your photos and videos into compelling stories,
          enables social sharing, and delivers viral content quickly. Experience efficiency and creativity like never before.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Button
            size="lg"
            className=" text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
            onClick={() => window.location.href = '/upload'}
          >
            Start Creating Now
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="border-2 border-gray-300 text-gray-700 hover:border-teal-300 px-8 py-4 text-lg font-semibold transition-all duration-300 group"
            onClick={() => window.location.href = '/demo'}
          >
            <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Watch Demo
          </Button>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;