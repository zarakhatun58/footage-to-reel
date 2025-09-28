import { AnimatePresence, motion } from "framer-motion";
import {
  Upload,
  FileText,
  Heart,
  Sparkles,
  Video,
  Share2,
  Edit3,
  Search,
  Mic,
  MessageSquare,
  Play,
  Camera,
  Eye,
  ThumbsUp,
  TrendingUp,
  ArrowRight,
  Folder
} from "lucide-react";
import AnimatedWorkflowDemo from "./AnimatedWorkflowDemo";
import { useEffect, useState } from "react";
import { FeaturesSection } from "./FeaturesSection";
import { useNavigate } from "react-router-dom";

const ProcessSteps = () => {

  const navigate = useNavigate();

  const steps = [
    {
      title: "Upload Media",
      description: "First, import images or videos from Google Photos or your device gallery.",
      icon: Camera,
      color: "from-blue-500 to-cyan-500",
      step: "01",
      delay: 0.1
    },
    {
      title: "AI Transcript",
      description: "Automatically generate a transcript from your media using AI speech-to-text.",
      icon: Mic,
      color: "from-purple-500 to-violet-500",
      step: "02",
      delay: 0.2
    },
    {
      title: "Emotion Tagging",
      description: "The AI analyzes your content to detect emotions and moods.",
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      step: "03",
      delay: 0.3
    },
    {
      title: "Generate Story",
      description: "AI creates a compelling narrative from your content, which you can search by prompts.",
      icon: Sparkles,
      color: "from-amber-500 to-orange-500",
      step: "04",
      delay: 0.4
    },
    {
      title: "Create Video",
      description: "Professionally edit the video and apply transitions for a polished result.",
      icon: Video,
      color: "from-emerald-500 to-teal-500",
       step: "05",
      delay: 0.5
    },
    {
      title: "Social Share",
      description: "Publish your video with analytics to track its performance on social media.",
      icon: Share2,
      color: "from-red-500 to-pink-500",
      step: "06",
      delay: 0.6
    },
    {
      title: "Track Performance",
      description: "Gain insights into views, likes, and engagement metrics for your shared content.",
      icon: TrendingUp,
      color: "from-indigo-500 to-purple-500",
      step: "07",
      delay: 0.7
    },
    {
      title: "Smart Editor",
      description: "Use advanced editing tools to refine and enhance your videos further.",
      icon: Edit3,
      color: "from-violet-500 to-purple-600",
      step: "08",
      delay: 0.8
    }
  ];


  const [activeStep, setActiveStep] = useState(0);
  const current = steps[activeStep];
  const CurrentIcon = current.icon;
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-8 relative overflow-hidden bg-white">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white" />

      <div className="container mx-auto px-4 relative">
         <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-8 my-8"
        >
          <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl cursor-pointer" onClick={() => navigate('/upload')}>
            <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Media</h4>
            <p className="text-gray-600">Start creating amazing stories by uploading your videos, photos, and audio files</p>
          </div>

          <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl cursor-pointer" onClick={() => navigate('/projects')}>
            <Video className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Generate Videos</h4>
            <p className="text-gray-600">Built-in Photos, Videos, Stories and Memories</p>
          </div>

          <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl cursor-pointer" onClick={() => navigate('/search')}>
            <Search className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Smart Discovery</h4>
            <p className="text-gray-600">Find content by emotion, transcript, or story theme</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-gray-900">
            How AI <span className="gradient-text">Video Stories</span> Works?
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
            Complete workflow from upload to viral content - discover how our innovative AI transforms
            your photos and videos into engaging stories with social sharing and analytics.
          </p>

          {/* Animated Workflow Demo */}
          <AnimatedWorkflowDemo />
        </motion.div>
     

        {/* Steps Grid */}
        <section className="max-w-7xl mx-8 py-16 rounded-3xl border border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-12 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;

              // check if not last item in its row
              const isLastInRow =
                (index + 1) % 2 === 0 && window.innerWidth < 640 ||
                (index + 1) % 3 === 0 && window.innerWidth >= 640 && window.innerWidth < 1024 ||
                (index + 1) % 4 === 0 && window.innerWidth >= 1024;

              return (
                <div key={index} className="relative flex flex-col items-center text-center">
                  {/* Connector line (only if not last in row) */}
                  {!isLastInRow && (
                    <div className="absolute top-8 left-1/2 right-[-50%] z-0">
                      <div className="h-1 bg-gray-200 relative">
                        <motion.div
                          className="absolute top-0 left-0 h-full"
                          style={{ background: "var(--gradient-primary)" }}
                          initial={{ width: 0 }}
                          animate={{
                            width: index < activeStep ? "100%" : "0%",
                          }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step Circle */}
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ duration: 0.4 }}
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${step.color} ${isActive ? "ring-4 ring-offset-2 ring-primary z-10" : "z-10"
                      }`}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>

                  {/* Title */}
                  <h4 className={`mt-3 font-semibold ${isActive ? "text-gray-900" : "text-gray-500"}`}>
                    {step.title}
                  </h4>
                  <p className="text-xs text-gray-400">{step.step}</p>
                </div>
              );
            })}
          </div>
        </section>
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 pt-8 border-t border-gray-200"
        >
          <p className="text-sm text-gray-500 mb-6 text-center">More than 50+ creators trusted us worldwide</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-teal-300 mb-1 sm:mb-2">10K+</div>
              <div className="text-xs sm:text-sm text-gray-600">Stories Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-teal-300 mb-1 sm:mb-2">50M+</div>
              <div className="text-xs sm:text-sm text-gray-600">Views Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-teal-300 mb-1 sm:mb-2">95%</div>
              <div className="text-xs sm:text-sm text-gray-600">User Satisfaction</div>
            </div>
          </div>
        </motion.div> */}

        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          viewport={{ once: true }}
          className="text-center my-8 mx-8 border border-gray-200 rounded-md p-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-teal-300 to-red-600 text-white px-12 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 group"
            onClick={() => window.location.href = '/upload'}
          >
            Start Creating Now
            <ArrowRight className="inline w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <p className="text-gray-500 mt-4 text-md">
            Join thousands of creators transforming their content into viral stories
          </p>
        </motion.div> */}
      </div>
    </section>
  );
};

export default ProcessSteps;