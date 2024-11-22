import React from 'react';
import { Play } from 'lucide-react';

interface VideoLessonProps {
  videoUrl: string;
  title: string;
}

export default function VideoLesson({ videoUrl, title }: VideoLessonProps) {
  // Extract video ID from YouTube URL
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&\?]{10,12})/);
    return match?.[1] || '';
  };

  const videoId = getYouTubeId(videoUrl);

  if (!videoId) {
    return (
      <div className="bg-surface-light rounded-lg p-4">
        <p className="text-red-400">Invalid video URL</p>
      </div>
    );
  }

  return (
    <div className="aspect-video relative rounded-lg overflow-hidden bg-black">
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}