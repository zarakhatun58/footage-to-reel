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
  MessageSquare,
  Play,
  Camera,
  Eye,
  ThumbsUp,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import AnimatedWorkflowDemo from "./AnimatedWorkflowDemo";
import { useEffect, useState } from "react";
import { FeaturesSection } from "./FeaturesSection";

const ProcessSteps = () => {

  const steps = [
    {
      icon: Camera,
      title: "Upload from Gallery",
      description: "Import photos and videos from Google Photos, device gallery, or cloud storage",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      step: "01",
      delay: 0.1
    },
    {
      icon: FileText,
      title: "Generate Transcript",
      description: "AI automatically transcribes audio content and extracts key dialogues",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      step: "02",
      delay: 0.2
    },
    {
      icon: Heart,
      title: "Tag Emotions",
      description: "Smart emotion detection analyzes sentiment and mood throughout your content",
      color: "bg-gradient-to-br from-pink-500 to-pink-600",
      step: "03",
      delay: 0.3
    },
    {
      icon: MessageSquare,
      title: "Create Story by Prompt",
      description: "Generate custom stories using AI prompts or let AI create automatically",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      step: "04",
      delay: 0.4
    },
    {
      icon: Sparkles,
      title: "Generate AI Story",
      description: "Transform content into compelling narratives with perfect pacing and flow",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      step: "05",
      delay: 0.5
    },
    {
      icon: Video,
      title: "Generate Video",
      description: "AI automatically creates professional videos with smart editing and transitions",
      color: "bg-gradient-to-br from-teal-500 to-teal-600",
      step: "06",
      delay: 0.6
    },
    {
      icon: Share2,
      title: "Social Media Sharing",
      description: "Share across platforms with built-in analytics for likes, views, and engagement",
      color: "bg-gradient-to-br from-red-500 to-red-600",
      step: "07",
      delay: 0.7
    },
    {
      icon: TrendingUp,
      title: "Track Performance",
      description: "Monitor likes, views, shares, and ranking with detailed analytics dashboard",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      step: "08",
      delay: 0.8
    },
    {
      icon: Edit3,
      title: "Smart Video Editor",
      description: "Advanced editing tools with AI-powered suggestions and real-time preview",
      color: "bg-gradient-to-br from-violet-500 to-violet-600",
      step: "09",
      delay: 0.9
    },
    {
      icon: Search,
      title: "Smart Search",
      description: "Find videos by transcript, emotions, tags, or story content instantly",
      color: "bg-gradient-to-br from-amber-500 to-amber-600",
      step: "10",
      delay: 1.0
    },
    {
      icon: Play,
      title: "Play & Share Stories",
      description: "Interactive story player with engagement features and easy sharing options",
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      step: "11",
      delay: 1.1
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
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-gray-900">
            How AI Video Stories Works?
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
            Complete workflow from upload to viral content - discover how our innovative AI transforms
            your photos and videos into engaging stories with social sharing and analytics.
          </p>

          {/* Animated Workflow Demo */}
          <AnimatedWorkflowDemo />
        </motion.div>
        {/* Interactive Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
        >
          <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
            <Eye className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Real-time Analytics</h4>
            <p className="text-gray-600">Track views, engagement, and performance metrics</p>
          </div>

          <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
            <ThumbsUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Social Engagement</h4>
            <p className="text-gray-600">Built-in likes, shares, and viral ranking system</p>
          </div>

          <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
            <Search className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Smart Discovery</h4>
            <p className="text-gray-600">Find content by emotion, transcript, or story theme</p>
          </div>
        </motion.div>
        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-12 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 group"
            onClick={() => window.location.href = '/upload'}
          >
            Start Creating Now
            <ArrowRight className="inline w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <p className="text-gray-500 mt-4 text-sm">
            Join thousands of creators transforming their content into viral stories
          </p>
        </motion.div>
        <FeaturesSection />
        {/* Steps Grid */}
        <section className="max-w-7xl mx-auto py-16 rounded-3xl shadow-2xl ">
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
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${step.color} ${isActive ? "ring-4 ring-offset-2 ring-primary z-10" : "z-10"
                      }`}
                  >
                    <Icon className="w-7 h-7" />
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

      </div>
    </section>
  );
};

export default ProcessSteps;