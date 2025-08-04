import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { BASE_URL } from '@/services/apis';

export const RenderProgress = ({ renderId }: { renderId: string }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'queued' | 'rendering' | 'done' | 'failed'>('queued');

  useEffect(() => {
    if (!renderId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/speech/render-status/${renderId}`);
        const data = await res.json();

        if (data.status === 'done') {
          setStatus('done');
          setProgress(100);
          clearInterval(interval);
        } else if (data.status === 'failed') {
          setStatus('failed');
          clearInterval(interval);
        } else {
          setStatus(data.status); // 'queued' or 'rendering'
          setProgress(prev => Math.min(prev + 10, 95)); // simulate progress
        }
      } catch (err) {
        console.error('Polling failed:', err);
        setStatus('failed');
        clearInterval(interval);
      }
    }, 2000); // poll every 2s

    return () => clearInterval(interval);
  }, [renderId]);

  if (status === 'done') return <p className="text-green-600">✅ Render complete!</p>;
  if (status === 'failed') return <p className="text-red-500">❌ Render failed. Try again.</p>;

  return (
    <div className="w-full mt-4">
      <div className="flex items-center gap-2 mb-1 text-sm text-gray-600">
        <Loader2 className="animate-spin w-4 h-4" />
        {status === 'rendering' ? 'Rendering your video...' : 'Queued for rendering...'}
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-1">{progress}% complete</p>
    </div>
  );
};