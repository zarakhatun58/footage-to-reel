import { Eye, Share2, BarChart3, ThumbsUp, Download, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BASE_URL } from '../services/apis';
import { UploadedMedia } from './VideoUploadArea';


type MediaStatsBarProps = {
  media:UploadedMedia;
  BASE_URL: string;
};

const SocialShareLinks = {
  facebook: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  twitter: (url: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
  linkedin: (url: string) => `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}`,
};

export const MediaStatsBar: React.FC<MediaStatsBarProps> = ({ media}) => {
   const videoRef = useRef(null);
  const [stats, setStats] = useState({
    likes: media.likes || 0,
    shares: media.shares || 0,
    views: media.views || 0,
    rank: media.rankScore || 0,
  });
 const [shareOpen, setShareOpen] = useState(false);
  const [shortUrl, setShortUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  // const handleStatUpdate = async (type: 'like' | 'share' | 'view') => {
  //   try {
  //     const res = await fetch(`${BASE_URL}/api/media/${media.id}/${type}`, { method: 'POST' });
  //     const data = await res.json();
  //     if (data.success) {
  //       setStats(prev => ({
  //         ...prev,
  //         [type + 's']: data[type + 's'],
  //         rank: data.rankScore
  //       }));
  //     }
  //   } catch (err) {
  //     console.error(`Failed to ${type} media`, err);
  //   }
  // };
 
 
    // Update views on play
  const handleVideoPlay = () => {
    fetch(`${BASE_URL}/api/media/${media.id}/view`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(prev => ({ ...prev, views: data.views, rank: data.rankScore }));
        }
      })
      .catch(console.error);
  };

  // Like handler
  const handleLike = () => {
    fetch(`${BASE_URL}/api/media/${media.id}/like`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(prev => ({ ...prev, likes: data.likes, rank: data.rankScore }));
        }
      })
      .catch(console.error);
  };

  // Share handler for updating count and opening dropdown
  const handleShareClick = () => {
    fetch(`${BASE_URL}/api/media/${media.id}/share`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(prev => ({ ...prev, shares: data.shares, rank: data.rankScore }));
          setShareOpen(true);
        }
      })
      .catch(console.error);
  };

  // Get short URL for sharing
  useEffect(() => {
    const fetchShortUrl = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/media/${media.id}/shorturl`);
        const data = await res.json();
        if (data.success && data.shortUrl) {
          setShortUrl(data.shortUrl);
        } else {
          setShortUrl(media.storyUrl);
        }
      } catch {
        setShortUrl(media.storyUrl);
      }
    };

    fetchShortUrl();
  }, [media.id, media.storyUrl, BASE_URL]);

  // Share on social
  const shareOnSocial = (platform) => {
    if (!shortUrl) return;

    const shareLink = SocialShareLinks[platform](shortUrl);
    window.open(shareLink, '_blank', 'noopener,noreferrer');
    setShareOpen(false);
  };

  // Copy link to clipboard
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
        onPlay={handleVideoPlay}
      />

      <div className="flex gap-6 items-center justify-between text-sm mt-4 text-gray-700">
        <button
          onClick={handleLike}
          className="flex items-center gap-1 hover:text-green-600 transition-colors"
          aria-label="Like video"
        >
          <ThumbsUp className="w-5 h-5" />
          {stats.likes}
        </button>

        <div className="relative">
          <button
            onClick={handleShareClick}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
            aria-haspopup="true"
            aria-expanded={shareOpen}
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>

          {shareOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="share-menu"
            >
              <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => shareOnSocial('facebook')}
              >
                Facebook
              </button>
              <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => shareOnSocial('twitter')}
              >
                Twitter
              </button>
              <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => shareOnSocial('linkedin')}
              >
                LinkedIn
              </button>
              <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                onClick={copyToClipboard}
              >
                Copy Link
                <Copy className="w-4 h-4 ml-2" />
              </button>
              {copySuccess && (
                <div className="text-xs text-green-600 px-4 py-1">
                  {copySuccess}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1" title="Views">
          <Eye className="w-5 h-5 text-purple-500" />
          {stats.views}
        </div>

        <div className="flex items-center gap-1" title="Rank">
          <BarChart3 className="w-5 h-5 text-pink-500" />
          Rank: {stats.rank}
        </div>

        <a
          href={media.storyUrl}
          download
          className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
          aria-label="Download video"
        >
          <Download className="w-5 h-5" />
          Download
        </a>
      </div>
    </div>
  );
};
