import { Eye, Share2, BarChart3, ThumbsUp, Download } from 'lucide-react';
import { useState } from 'react';
import { BASE_URL } from '../services/apis';

export const MediaStatsBar = ({ media}) => {
  const [stats, setStats] = useState({
    likes: media.likes || 0,
    shares: media.shares || 0,
    views: media.views || 0,
    rank: media.rankScore || 0,
  });

  const handleStatUpdate = async (type: 'like' | 'share' | 'view') => {
    try {
      const res = await fetch(`${BASE_URL}/api/media/${media.id}/${type}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStats(prev => ({
          ...prev,
          [type + 's']: data[type + 's'],
          rank: data.rankScore
        }));
      }
    } catch (err) {
      console.error(`Failed to ${type} media`, err);
    }
  };

  return (
    <div className="flex gap-6 items-center justify-between text-sm mt-4 text-gray-700">
      <button onClick={() => handleStatUpdate('like')} className="flex items-center gap-1">
        <ThumbsUp className="w-4 h-4 text-green-600" />
        {stats.likes}
      </button>
      <button onClick={() => handleStatUpdate('share')} className="flex items-center gap-1">
        <Share2 className="w-4 h-4 text-blue-600" />
        {stats.shares}
      </button>
      <div className="flex items-center gap-1">
        <Eye className="w-4 h-4 text-purple-500" />
        {stats.views}
      </div>
      <div className="flex items-center gap-1">
        <BarChart3 className="w-4 h-4 text-pink-500" />
        Rank: {stats.rank}
      </div>
       <a href={media.storyUrl} download className="flex items-center gap-1 text-red-600">
          <Download className="w-4 h-4" />
          Download
        </a>
    </div>
  );
};
