import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Share2, ThumbsUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';


 const UploadedMediaCard = ({ media, onGenerate, onLike, onShare }) => {
  const [editableTranscript, setEditableTranscript] = useState(media.transcript || '');
  const [editableTitle, setEditableTitle] = useState(media.title || '');
    const [loadingVideo, setLoadingVideo] = useState(false);



  return (
    <div className="border rounded-xl p-4 bg-background shadow-md space-y-4">
      <div className="flex gap-4 items-start">
        {media.type === 'image' ? (
          <img src={media.thumbnail} alt="preview" className="w-40 h-40 object-cover rounded-md" />
        ) : (
          <ReactPlayer src={media.storyUrl || media.thumbnail} controls width="100%" />
        )}

        <div className="flex-1 space-y-2">
          <Input
            value={editableTitle}
            onChange={e => setEditableTitle(e.target.value)}
            placeholder="Enter title"
            className="font-bold text-lg"
          />
          <Textarea
            value={editableTranscript}
            onChange={e => setEditableTranscript(e.target.value)}
            className="h-24"
          />
          <Button
            onClick={() => onGenerate({ ...media, title: editableTitle, transcript: editableTranscript })}
            variant="ai"
          >
            Generate Story
          </Button>

          {media.story && (
            <>
              <p className="text-muted-foreground whitespace-pre-line">{media.story}</p>
              <p><strong>Tags:</strong> {media.tags?.join(', ')}</p>
              <p><strong>Emotions:</strong> {media.emotions}</p>
            </>
          )}

          <div className="flex gap-4 pt-2">
            <Button size="sm" variant="ghost" onClick={() => onLike(media.id)}>
              <ThumbsUp className="w-4 h-4 mr-1" /> Like
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onShare(media.id)}>
              <Share2 className="w-4 h-4 mr-1" /> Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadedMediaCard;