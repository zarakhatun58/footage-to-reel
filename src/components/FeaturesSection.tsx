import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Upload, 
  MessageSquare, 
  Sparkles, 
  Video, 
  Zap, 
  Brain,
  FileText,
  Share2,
  Layers,
  ArrowRight
} from "lucide-react";
import { Button } from "./ui/button";

const features = [
  {
    icon: Upload,
    title: "Smart Upload",
    description: "Drag & drop videos with intelligent preprocessing and automatic quality optimization",
    color: "from-blue-500 to-cyan-500",
    path: "/upload",
    action: "Start Uploading"
  },
  {
    icon: Brain,
    title: "AI Transcription", 
    description: "Advanced speech-to-text with speaker identification and emotion detection",
    color: "from-purple-500 to-pink-500",
    path: "/editor",
    action: "Try AI Features"
  },
  {
    icon: MessageSquare,
    title: "Story Generation",
    description: "Transform raw footage into compelling narratives with natural language prompts",
    color: "from-green-500 to-emerald-500",
    path: "/story-generator",
    action: "Create Stories"
  },
  {
    icon: Sparkles,
    title: "Auto Enhancement",
    description: "Intelligent color correction, stabilization, and audio enhancement",
    color: "from-yellow-500 to-orange-500",
    path: "/editor",
    action: "Enhance Videos"
  },
  {
    icon: Layers,
    title: "Multi-Track Editing",
    description: "Advanced timeline with unlimited tracks, transitions, and effects",
    color: "from-indigo-500 to-blue-500",
    path: "/editor",
    action: "Open Editor"
  },
  {
    icon: Share2,
    title: "One-Click Sharing",
    description: "Export and share across all platforms with optimized formats",
    color: "from-red-500 to-pink-500",
    path: "/projects",
    action: "View Projects"
  }
];

const stats = [
  { label: "Stories Created", value: "10,000+", icon: Video },
  { label: "Hours Processed", value: "50,000+", icon: Zap },
  { label: "Happy Creators", value: "2,500+", icon: Sparkles },
  { label: "Languages Supported", value: "25+", icon: FileText }
];

export const FeaturesSection = () => {
  const navigate = useNavigate();

  return (
    <section id="features" className="py-20 px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-xl animate-float-delayed"></div>
      
      {/* Additional floating elements for more attraction */}
      <motion.div
        animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 right-1/4 w-4 h-4 bg-primary/30 rounded-full"
      />
      <motion.div
        animate={{ x: [0, -80, 0], y: [0, 80, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 left-1/4 w-6 h-6 bg-accent/40 rounded-full"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Powerful AI Features for
            <span className="gradient-text block mt-2 animate-gradient">Video Storytelling</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our advanced AI technology transforms your raw footage into professional stories
            with just a few clicks. No editing experience required.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group relative cursor-pointer"
              onClick={() => navigate(feature.path)}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="glass-card p-8 h-full hover-lift hover-glow relative overflow-hidden">
                {/* Icon */}
                <div className="mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-primary-glow transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Action Button */}
                <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full group/btn"
                  >
                    {feature.action}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>

                {/* Hover Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-[shimmer_2s_ease-in-out_infinite]"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 md:p-12 relative overflow-hidden"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Trusted by Creators Worldwide
            </h3>
            <p className="text-muted-foreground">
              Join thousands of content creators who are already telling their stories with AI
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                className="text-center group cursor-pointer"
              >
                <div className="mb-3">
                  <stat.icon className="w-8 h-8 text-primary mx-auto group-hover:scale-110 group-hover:text-primary-glow transition-all pulse-glow" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-1 group-hover:text-primary-glow transition-colors">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>
        </motion.div>
      </div>
    </section>
  );
};