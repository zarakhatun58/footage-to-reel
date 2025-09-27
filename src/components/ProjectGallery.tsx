import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Search,
    Filter,
    Grid3X3,
    List,
    Play,
    Calendar,
    Clock,
    Eye,
    Heart,
    Share2,
    MoreVertical,
    Edit,
    Trash2,
    Copy,
    Download
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import axios from "axios";
import { BASE_URL } from "@/services/apis";
import { MediaStatsBar } from "./MediaStatsBar";

export type VideoType = {
    _id: string;
    filename: string;
    transcript?: string;
    story?: string; // <-- title/description lives here
    tags?: string[];
    rankScore: number;
    storyUrl?: string;
    likes: number;
    views: number;
    shares: number;
    status: "generated" | "pending" | string;
    [key: string]: any;
};

export const ProjectGallery = () => {
    const [videos, setVideos] = useState<VideoType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedFilter, setSelectedFilter] = useState("all");

    useEffect(() => {
        const savedVideos = localStorage.getItem("heroVideos");

        if (savedVideos) {
            const cached = JSON.parse(savedVideos);
            const sortedCached = cached.sort(
                (a: VideoType, b: VideoType) => (b.rankScore || 0) - (a.rankScore || 0)
            );
            setVideos(sortedCached);
            setLoading(false);
        }

        axios
            .get(`${BASE_URL}/api/apivideo/all-generate-video`)
            .then((res) => {
                const videosArray = Array.isArray(res.data.videos)
                    ? res.data.videos
                    : [];

                const sortedVideos = videosArray.sort(
                    (a: VideoType, b: VideoType) => (b.rankScore || 0) - (a.rankScore || 0)
                );

                setVideos(sortedVideos);
                localStorage.setItem("heroVideos", JSON.stringify(sortedVideos));
            })
            .catch((err) => console.error("Failed to fetch videos:", err))
            .finally(() => setLoading(false));
    }, []);

    const formatViews = (views: number) =>
        views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views.toString();

    const getStatusColor = (status: string) => {
        switch (status) {
            case "generated": return "bg-green-500/20 text-green-700 dark:text-green-300";
            case "pending": return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300";
            default: return "bg-gray-500/20 text-gray-700 dark:text-gray-300";
        }
    };

    const filteredVideos = videos.filter((video) => {
        const filename = video.filename ?? "";
        const story = video.story ?? "";
        const tags = Array.isArray(video.tags) ? video.tags : [];

        const matchesSearch =
            filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
            story.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tags.some((tag) => (tag ?? "").toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesFilter = selectedFilter === "all" || video.status === selectedFilter;

        return matchesSearch && matchesFilter;
    });


    return (
        <div className="min-h-screen bg-background pt-16">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2">Your Videos</h1>
                    <p className="text-muted-foreground">
                        Manage and organize all your generated video projects.
                    </p>
                </motion.div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
                    <Input
                        placeholder="Search videos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-md"
                    />
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === "grid" ? "default" : "outline"}
                            onClick={() => setViewMode("grid")}
                            size="sm"
                        >
                            Grid
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "default" : "outline"}
                            onClick={() => setViewMode("list")}
                            size="sm"
                        >
                            List
                        </Button>
                    </div>
                </div>

                {/* Video Grid/List */}
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVideos.map((video, index) => (
                            <motion.div
                                key={video._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card overflow-hidden hover:scale-105 transition-transform group cursor-pointer shadow-lg"
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video bg-black overflow-hidden rounded group">
                                    {video.storyUrl ? (
                                        <video
                                            src={video.storyUrl}
                                            playsInline
                                            preload="metadata"
                                            controls
                                            className="w-full h-full object-cover"

                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                                            <Play className="w-12 h-12 text-white/70" />
                                        </div>
                                    )}

                                    <div className="absolute top-3 right-3">
                                        <Badge className={getStatusColor(video.status)} variant="secondary">
                                            {video.status}
                                        </Badge>
                                    </div>
                                </div>


                                {/* Content */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-sm truncate flex-1">
                                            {video.story ? video.story.split("\n")[0] : video.filename}
                                        </h3>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                                                <DropdownMenuItem><Copy className="w-4 h-4 mr-2" /> Duplicate</DropdownMenuItem>
                                                <DropdownMenuItem><Download className="w-4 h-4 mr-2" /> Download</DropdownMenuItem>
                                                <DropdownMenuItem className="text-primary">
                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                        {video.story || "No description available"}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex flex-wrap items-center justify-between text-sm text-muted-foreground gap-y-2">
                                        <MediaStatsBar media={video} BASE_URL={BASE_URL} />
                                        <div className="flex items-center space-x-1 pt-2">
                                            <Calendar className="w-3 h-3" />
                                            <span>{new Date(video.createdAt || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredVideos.map((video, index) => (
                            <motion.div
                                key={video._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card p-4 hover:bg-accent/30 transition-colors cursor-pointer"
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
                                    {/* Thumbnail */}
                                    {/* Thumbnail */}
                                    <div className="relative w-full h-40 sm:w-32 sm:h-20 bg-black overflow-hidden rounded flex-shrink-0 group">
                                        {video.storyUrl ? (
                                            <video
                                                src={video.storyUrl}
                                                playsInline
                                                preload="metadata"
                                                controls
                                                className="w-full h-full object-cover"

                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                                                <Play className="w-6 h-6 text-white/70" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-1">
                                            <h3 className="font-semibold text-sm truncate">
                                                {video.story ? video.story.split("\n")[0] : video.filename}
                                            </h3>
                                            <Badge className={getStatusColor(video.status)} variant="secondary">
                                                {video.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                                            {video.story || "No description available"}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                            <div className="flex items-center space-x-1">
                                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                    <MediaStatsBar media={video} BASE_URL={BASE_URL} />
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-1 pt-3">
                                                <Calendar className="w-3 h-3" />
                                                <span>{new Date(video.createdAt || Date.now()).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};