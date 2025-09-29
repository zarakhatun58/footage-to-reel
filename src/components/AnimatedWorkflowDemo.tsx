import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
    Upload,
    FileText,
    Heart,
    Sparkles,
    Video,
    Share2,
    Edit3,
    Search,
    Play,
    Camera,
    Eye,
    ThumbsUp,
    TrendingUp,
    Check,
    Loader2,
    Image as ImageIcon,
    Mic,
    Zap,
    Square
} from "lucide-react";
import femaleAI from "../assets/ai-female.png"

const AnimatedWorkflowDemo = () => {

    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [typedText, setTypedText] = useState("");
    const [playTrigger, setPlayTrigger] = useState(0);

    const steps = [
        {
            title: "Upload Media",
            description: "First, import images or videos from Google Photos or your device gallery.",
            icon: Camera,
            color: "from-blue-500 to-cyan-500",
            duration: 2000
        },
        {
            title: "AI Transcript",
            description: "Automatically generate a transcript from your media using AI speech-to-text.",
            icon: Mic,
            color: "from-purple-500 to-violet-500",
            duration: 2500
        },
        {
            title: "Emotion Tagging",
            description: "The AI analyzes your content to detect emotions and moods.",
            icon: Heart,
            color: "from-pink-500 to-rose-500",
            duration: 2000
        },
        {
            title: "Generate Story",
            description: "AI creates a compelling narrative from your content, which you can search by prompts.",
            icon: Sparkles,
            color: "from-amber-500 to-orange-500",
            duration: 2500
        },
        {
            title: "Create Video",
            description: "Professionally edit the video and apply transitions for a polished result.",
            icon: Video,
            color: "from-emerald-500 to-teal-500",
            duration: 3000
        },
        {
            title: "Social Share",
            description: "Publish your video with analytics to track its performance on social media.",
            icon: Share2,
            color: "from-red-500 to-pink-500",
            duration: 2000
        },
        {
            title: "Track Performance",
            description: "Gain insights into views, likes, and engagement metrics for your shared content.",
            icon: TrendingUp,
            color: "from-indigo-500 to-purple-500",
            duration: 2500
        },
        {
            title: "Smart Editor",
            description: "Use advanced editing tools to refine and enhance your videos further.",
            icon: Edit3,
            color: "from-violet-500 to-purple-600",
            duration: 2000
        }
    ];

    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
    }, []);

    useEffect(() => {
        if (!isPlaying) {
            window.speechSynthesis.cancel();
            return;
        }

        const currentStepData = steps[currentStep];
        if (!currentStepData) return;

        // Cancel previous speech
        window.speechSynthesis.cancel();

        // Setup utterance
        const utterance = new SpeechSynthesisUtterance(currentStepData.description);

        // Select female voice
        const femaleVoice =
            voices.find(
                (v) =>
                    v.name.toLowerCase().includes("female") ||
                    v.name.toLowerCase().includes("zira") || // Windows female
                    v.name.toLowerCase().includes("susan") // Mac example
            ) || voices.find((v) => v.lang === "en-US") || voices[0];

        if (femaleVoice) utterance.voice = femaleVoice;
        utterance.rate = 1;
        utterance.pitch = 1;

        // Speak
        window.speechSynthesis.speak(utterance);

        // Typing effect
        let i = 0;
        setTypedText("");
        const typingInterval = setInterval(() => {
            if (i < currentStepData.description.length) {
                setTypedText((prev) => prev + currentStepData.description.charAt(i));
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, 50);

        // Auto advance when speech ends
        utterance.onend = () => {
            clearInterval(typingInterval);
            if (currentStep < steps.length - 1 && isPlaying) {
                setCurrentStep((prev) => prev + 1);
            }
        };

        return () => {
            clearInterval(typingInterval);
            window.speechSynthesis.cancel();
        };
    }, [currentStep, isPlaying, voices]);
    const currentStepData = steps[currentStep];
    const CurrentIcon = currentStepData?.icon || Camera;

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };



    // ▶️ Play
    const handlePlay = () => {
        setIsPlaying(true);
        setPlayTrigger((prev) => prev + 1); // 👈 retriggers narration
    };

    // ⏹ Stop
    const handleStop = () => {
        setIsPlaying(false);
        window.speechSynthesis.cancel();
        setTypedText("");
    };
    return (
        <div className="w-full max-w-7xl h-full flex flex-col md:flex-row gap-8 px-4 sm:px-6 lg:px-8">


            {/* Left: Animated Workflow */}
            <div className="flex-1 min-w-0 bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-2xl overflow-hidden h-full border border-gray-200 ">
                <div className="aspect-video bg-gradient-to-br from-white to-gray-50 relative overflow-hidden flex justify-center items-center 
    w-[265px] min-h-[200px] 
    md:w-full"
                >
                    {/* Animated Background */}
                    <div className="absolute inset-0">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360], opacity: [0.1, 0.2, 0.1] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-20 -right-20  w-8 sm:w-6 h-8 sm:h-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0], opacity: [0.2, 0.1, 0.2] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-20 -left-20 w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl"
                        />
                    </div>

                    {/* Central Animation */}
                    <div className="z-10 flex flex-col items-center justify-center p-2"
                    >
                        {/* Central Icon */}
                        <motion.div
                            key={currentStep}
                            initial={{ scale: 0, rotate: -180, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            exit={{ scale: 0, rotate: 180, opacity: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={`w-16 h-16 sm:w-20 md:w-24 bg-gradient-to-br ${currentStepData?.color} rounded-3xl flex items-center justify-center shadow-2xl mb-8`}
                        >
                            <CurrentIcon className="w-8 h-8 sm:w-12 md:w-16 text-white" />
                        </motion.div>

                        {/* Outer Circular Icons */}
                        {steps.map((step, index) => {
                            const angle = (index / steps.length) * 2 * Math.PI; // distribute around circle
                            const radius = window.innerWidth < 768 ? 80 : 140;
                            const x = radius * Math.cos(angle);
                            const y = radius * Math.sin(angle);
                            const isActive = index === currentStep;

                            return (
                                <motion.div
                                    key={index}
                                    className={`absolute  w-8 h-8 
  sm:w-6 sm:h-6 
  md:w-12 md:h-12 
  rounded-full flex items-center justify-center shadow-md ${isActive ? "bg-primary text-white scale-125" : "bg-white text-gray-400"
                                        }`}
                                    style={{ left: `calc(47% + ${x}px)`, top: `calc(35% + ${y}px)` }}
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.6, 1, 0.6],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.1 }}
                                >
                                    <step.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Progress */}
                    <div className="absolute bottom-0 left-6 right-6  sm:bottom-6">
                        <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                                {steps.map((_, index) => (
                                    <motion.div
                                        key={index}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentStep ? 'bg-teal-300 shadow-lg' : 'bg-gray-300'}`}
                                        animate={{ scale: index === currentStep ? 1.2 : 1 }}
                                    />
                                ))}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={togglePlay}
                                className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-primary hover:bg-gray-50 transition-colors"
                            >
                                {isPlaying ? <div className="w-3 h-3 bg-current rounded-sm" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </motion.button>
                        </div>
                    </div>
                </div>
                {/* Current Step Info */}
                <div style={{ marginTop: "20px", margin: "20px" }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold gradient-text mb-1">{currentStepData?.title}</h4>
                                    <p className="text-sm text-gray-600">{currentStepData?.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Right: Female AI Assistant */}
            <div className="flex flex-col items-center justify-start w-full md:w-80 flex-shrink-0 bg-white/80 backdrop-blur-lg rounded-3xl p-4 sm:p-6 shadow-xl space-y-6 border border-gray-200">
                {/* Avatar */}
                <div className="w-36 h-36 rounded-full overflow-hidden border-8 border-[#2ec4bc] flex items-center justify-center mb-2">
                    <img src={femaleAI} alt="AI Assistant" className="w-full h-full object-cover" />
                </div>

                {/* Speech Bubble */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white border border-gray-200 rounded-2xl p-4 shadow-md text-gray-700 w-full mb-2"
                    >
                        <h4 className="font-semibold mb-1 gradient-text">{currentStepData.title}</h4>
                        <p className="text-sm">{currentStepData.description}</p>
                    </motion.div>
                </AnimatePresence>

                {/* Step Progress + Controls */}
                <div className="flex items-center justify-center w-full mb-4">
                    <div className="text-lg text-gray-400">
                        Step <span className="gradient-text">{currentStep + 1}</span> of <span className="gradient-text">{steps.length}</span>
                    </div>
                </div>
                <div className="flex space-x-6">
                    {/* Play */}
                    <div className="flex flex-col items-center">
                        <button
                            onClick={handlePlay}
                            className="p-3 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition"
                        >
                            <Play className="w-5 h-5" />
                        </button>
                        <span className="text-xs text-gray-600 mt-1">Play</span>
                    </div>

                    {/* Stop */}
                    <div className="flex flex-col items-center">
                        <button
                            onClick={handleStop}
                            className="p-3 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                        >
                            <Square className="w-5 h-5" />
                        </button>
                        <span className="text-xs text-gray-600 mt-1">Stop</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AnimatedWorkflowDemo;