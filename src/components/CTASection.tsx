import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Video } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20"></div>
        <div className="absolute top-10 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Floating Icons */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex justify-center gap-8 mb-8"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="float"
          >
            <Video className="w-12 h-12 text-primary glow" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            className="float-delayed"
          >
            <Sparkles className="w-16 h-16 text-accent pulse-glow" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 1 }}
            className="float"
          >
            <Video className="w-10 h-10 text-primary-glow" />
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Ready to Transform Your
            <span className="gradient-text block animate-gradient">
              Videos into Stories?
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of creators who are already using AI to turn their memories 
            into compelling narratives. Start your journey today.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Button
              variant="hero"
              size="lg"
              onClick={() => navigate("/upload")}
              className="hover-lift hover-glow group"
            >
              <Sparkles className="w-6 h-6 mr-3 group-hover:animate-spin" />
              Start Creating Now
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              size="lg"
              onClick={() => navigate("/projects")}
              className="hover-lift group"
            >
              <Video className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              View Gallery
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-12 pt-8 border-t border-white/10"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Trusted by content creators, filmmakers, and storytellers worldwide
            </p>
            <div className="flex justify-center items-center gap-8 opacity-60">
              <div className="text-xs font-medium">🎬 Professional Quality</div>
              <div className="text-xs font-medium">⚡ Lightning Fast</div>
              <div className="text-xs font-medium">🔒 Secure & Private</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};