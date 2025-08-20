import { Eye, Share2, BarChart3, ThumbsUp, Download, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { UploadedMedia } from './VideoUploadArea';


type MediaStatsBarProps = {
  media: UploadedMedia;
  BASE_URL: string;
};

const SocialShareLinks = {
  facebook: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  twitter: (url: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, // X
  linkedin: (url: string) => `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}`,
  whatsapp: (url: string) => `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`,
  youtube: (url: string) => `https://www.youtube.com/watch?v=${encodeURIComponent(url)}`, // for linking a video
};

export const MediaStatsBar: React.FC<MediaStatsBarProps> = ({ media, BASE_URL }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stats, setStats] = useState({
    likes: media.likes || 0,
    shares: media.shares || 0,
    views: media.views || 0,
    rank: media.rankScore || 0,
  });
  const [shareOpen, setShareOpen] = useState(false);
  const [shortUrl, setShortUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  // Helper: update stats in localStorage
  const updateLocalStorage = (updatedStats: typeof stats) => {
    const savedVideos = localStorage.getItem('videos');
    if (savedVideos) {
      const videos = JSON.parse(savedVideos);
      const updated = videos.map((v: any) => (v._id === media.id ? { ...v, ...updatedStats } : v));
      localStorage.setItem('videos', JSON.stringify(updated));
    }
  };

  // --- Engagement Handlers ---
  const handleViewCount = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/media/${media.id}/view`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const updatedStats = { ...stats, views: data.views, rank: data.rankScore };
        setStats(updatedStats);
        updateLocalStorage(updatedStats);
      }
    } catch (err) {
      console.error('Failed to count view', err);
    }
  };

  const handleLike = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/media/${media.id}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const updatedStats = { ...stats, likes: data.likes, rank: data.rankScore };
        setStats(updatedStats);
        updateLocalStorage(updatedStats);
      }
    } catch (err) {
      console.error('Failed to like', err);
    }
  };

const handleShareClick = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/media/${media.id}/share`, { method: 'POST' });
    const data = await res.json();

    if (data.success) {
      const updatedStats = { ...stats, shares: data.shares, rank: data.rankScore };
      setStats(updatedStats);
      updateLocalStorage(updatedStats);

      setShortUrl(data.shortUrl || media.storyUrl); // ✅ will always be available
      setShareOpen(true);
    }
  } catch (err) {
    console.error('Failed to share', err);
  }
};



  useEffect(() => {
    if (!videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            handleViewCount();
            // Optional: unobserve so we count only once per load
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [videoRef.current]);

  // --- Social Share ---
  const shareOnSocial = (platform: keyof typeof SocialShareLinks) => {
    if (!shortUrl) return;
    const shareLink = SocialShareLinks[platform](shortUrl);
    window.open(shareLink, '_blank', 'noopener,noreferrer');
    setShareOpen(false);
  };

  // --- Copy link ---
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch {
      setCopySuccess('Failed to copy');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 border rounded-md shadow-md bg-white">
      <video
        ref={videoRef}
        controls
        src={media.storyUrl}
        className="w-full rounded-md"
      />

      <div className="flex gap-3 items-center justify-between text-sm mt-4 text-gray-700">
        <button onClick={handleLike} className="flex items-center gap-1 hover:text-green-600 transition-colors" aria-label="Like video">
          <ThumbsUp className="w-4 h-4" />
          {stats.likes}
        </button>

        <div className="relative">
          <button onClick={handleShareClick} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors" aria-haspopup="true" aria-expanded={shareOpen}>
            <Share2 className="w-4 h-4" />
          </button>

          {shareOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20" role="menu">
              <button className="block w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => shareOnSocial('facebook')}>Facebook</button>
              <button className="block w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => shareOnSocial('twitter')}>Twitter</button>
              <button className="block w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => shareOnSocial('linkedin')}>LinkedIn</button>
              <button className="block w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => shareOnSocial('whatsapp')}>WhatsApp</button>
              <button className="block w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => shareOnSocial('youtube')}>YouTube</button>

              <button className="block w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between" onClick={copyToClipboard}>
                Copy Link
                <Copy className="w-4 h-4 ml-2" />
              </button>
              {copySuccess && <div className="text-xs text-green-600 px-4 py-1">{copySuccess}</div>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1" title="Views">
          <Eye className="w-4 h-4 text-purple-500" />
          {stats.views}
        </div>

        <div className="flex items-center gap-1" title="Rank">
          <BarChart3 className="w-4 h-4 text-pink-500" />
         {stats.rank}
        </div>

        <a target="_blank" href={media.storyUrl} download className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors" aria-label="Download video">
          <Download className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
