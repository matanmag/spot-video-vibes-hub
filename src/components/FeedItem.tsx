import React, { useRef } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Map,
} from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";

interface FeedVideo {
  id: string;
  title: string;
  video_url: string;
  optimized_url?: string | null;
  thumbnail_url?: string | null;
  description?: string | null;
  views?: number | null;
  spots?: {
    name: string;
  } | null;
  profiles?: {
    email: string;
  } | null;
  created_at: string;
}

export interface FeedItemProps {
  video: FeedVideo;
  comments: number;
  bookmarks: number;
  shares: number;
  onLike?: () => void;
  onComment?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onSearchClick?: () => void;
}

const FeedItem: React.FC<FeedItemProps> = ({
  video,
  comments,
  bookmarks,
  shares,
  onLike,
  onComment,
  onBookmark,
  onShare,
  onSearchClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const spot = video.spots?.name ?? "Pipeline, HI";
  const username = video.profiles?.email?.split('@')[0] || 'surfer';
  const caption = video.description || '';
  const likes = video.views || 0;
  
  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#071b2d] text-white overflow-hidden">
      <VideoPlayer video={video} containerRef={containerRef} />
      <div className="absolute inset-0 bg-black/40" />

      {/* header */}
      <header className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 font-sans z-10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#00e0ff]/20">
            <Map className="w-5 h-5 text-[#00e0ff]" />
          </div>
          <span className="text-xl font-bold">Surfable</span>
        </div>
        <button 
          onClick={onSearchClick} 
          className="rounded-full bg-white/10 p-2 backdrop-blur-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 text-[#00e0ff]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.35-4.35"
            />
          </svg>
        </button>
      </header>

      {/* footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end pb-24 z-10">
        <div className="space-y-2 max-w-[70%]">
          <span className="text-sm bg-black/40 px-2 py-0.5 rounded-md text-[#00e0ff]">
            {spot}
          </span>
          <h2 className="font-semibold">@{username}</h2>
          <p className="text-sm text-white/80 break-words">{caption}</p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <ActionButton icon={Heart} count={likes} onClick={onLike} color="#ff546e" />
          <ActionButton icon={MessageCircle} count={comments} onClick={onComment} color="#00e0ff" />
          <ActionButton icon={Bookmark} count={bookmarks} onClick={onBookmark} color="#00e0ff" />
          <ActionButton icon={Share2} count={shares} onClick={onShare} color="#00e0ff" />
        </div>
      </footer>
    </div>
  );
};

interface BtnProps {
  icon: React.ElementType;
  count: number;
  onClick?: () => void;
  color: string;
}
const ActionButton: React.FC<BtnProps> = ({ icon: Icon, count, onClick, color }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center p-3 rounded-full bg-white/10 backdrop-blur-md w-14 h-14 hover:bg-white/20 active:scale-90 transition-transform"
  >
    <Icon className="w-6 h-6" style={{ color }} />
    <span className="text-xs text-white/80 mt-0.5">{count}</span>
  </button>
);

export default FeedItem;
