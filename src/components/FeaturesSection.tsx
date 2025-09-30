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
import { useEffect, useState } from "react";
import { BASE_URL } from "@/services/apis";



export const FeaturesSection = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { label: "Stories Created", value: "0", icon: Sparkles },
    { label: "Video Published", value: "0", icon: Video },
    { label: "Views Generated", value: "0", icon: Zap },
    { label: "User Satisfaction", value: "0", icon: User },
  ]);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("authToken");

        // Stories count
        let storiesData = { count: 0 };
        try {
          const storiesRes = await fetch(`${BASE_URL}/api/generate`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (storiesRes.ok) storiesData = await storiesRes.json();
        } catch { }

        // Videos count
        let videosData = { count: 0 };
        try {
          const videosRes = await fetch(`${BASE_URL}/api/apivideo/all-generate-video`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (videosRes.ok) videosData = await videosRes.json();
        } catch { }

        // Views count
        let viewsData = { totalViews: 0 };
        try {
          const viewsRes = await fetch(`${BASE_URL}/api/media/views/total`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (viewsRes.ok) viewsData = await viewsRes.json();
        } catch { }

        // User count (example: total users)
        let userData = { totalUsers: 0 };
        try {
          const userRes = await fetch(`${BASE_URL}/api/auth/profile`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (userRes.ok) {
            const data = await userRes.json();
            userData.totalUsers = data?.totalUsers || 1; // fallback
          }
        } catch { }

        setStats([
          { label: "Stories Created", value: String(storiesData?.count ?? "0"), icon: Sparkles },
          { label: "Video Published", value: String(videosData?.count ?? "0"), icon: Video },
          { label: "Views Generated", value: String(viewsData?.totalViews ?? "0"), icon: Zap },
          { label: "User Satisfaction", value: String(userData?.totalUsers ?? "0"), icon: User },
        ]);

      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
  }, []);



  return (
    <section
      id="features"
      className="relative overflow-hidden bg-white"
    >
      <div className="max-w-7xl relative z-10 py-8 border border-gray-200  mx-4 sm:mx-12 my-2 sm:my-4 rounded-lg">
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
                  {stat.value}+
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