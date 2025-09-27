import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/80 to-primary/5"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent/10 rounded-full blur-xl animate-float-delayed"></div>

      <div className="text-center relative z-10 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* 404 Display */}
          <div className="mb-8">
            <motion.h1 
              className="text-8xl md:text-9xl font-bold gradient-text animate-gradient mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              404
            </motion.h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Oops! The page you're looking for seems to have disappeared into the digital void.
            </p>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              variant="hero"
              size="lg"
              onClick={() => window.location.href = "/"}
              className="hover-lift hover-glow"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.history.back()}
              className="hover-lift"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>
          </motion.div>

          {/* Helpful Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-12 pt-8 border-t border-white/10"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Looking for something specific?
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <a 
                href="/story-generator" 
                className="text-primary hover:text-primary-glow transition-colors flex items-center gap-1"
              >
                <Search className="w-4 h-4" />
                Create Stories
              </a>
              <span className="text-white/20">•</span>
              <a 
                href="/#features" 
                className="text-primary hover:text-primary-glow transition-colors"
              >
                Features
              </a>
              <span className="text-white/20">•</span>
              <a 
                href="/demo" 
                className="text-primary hover:text-primary-glow transition-colors"
              >
                Demo
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;