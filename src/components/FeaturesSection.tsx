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
  ArrowRight,
  User
} from "lucide-react";
import { Button } from "./ui/button";

const stats = [
  { label: "Stories Created", value: "10,000+", icon:  Sparkles},
  { label: "Video Published", value: "50,000+", icon:  Video},
  { label: "Views Generated", value: "2,500+", icon: Zap },
  { label: "User Satisfaction", value: "25+", icon: User }
];

export const FeaturesSection = () => {
  const navigate = useNavigate();

  return (
<section
  id="features"
  className="relative overflow-hidden bg-white"
>
  <div className="max-w-7xl relative z-10 py-8 border border-gray-200 mx-12 my-2 rounded-lg">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-8 md:p-8 relative overflow-hidden"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold text-teal-300 mb-4">
          Trusted by Creators Worldwide
        </h3>
        <p className="text-gray-600">
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
              <stat.icon className="w-8 h-8 text-red-300 mx-auto group-hover:text-primary-glow transition-all" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-teal-200 mb-1 group-hover:text-primary-glow transition-colors">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-radial from-white/10 via-transparent to-transparent"></div>
    </motion.div>
  </div>
</section>



  );
};