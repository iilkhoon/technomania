'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  X,
  ExternalLink,
  Sparkles,
  Eye,
  Video,
} from './HeroIconsHub';
import {
  YouTubeVideo,
  DEFAULT_YOUTUBE_VIDEOS,
  DEFAULT_CHANNEL_URL,
  getLocalYouTubeVideos,
  fetchApiYouTubeVideos,
  getLocalChannelUrl,
} from '../utils/youtubeManager';

const YouTubeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

interface YouTubeReviewsSectionProps {
  isDarkMode?: boolean;
}

export default function YouTubeReviewsSection({
  isDarkMode = false,
}: YouTubeReviewsSectionProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [channelUrl, setChannelUrl] = useState<string>(DEFAULT_CHANNEL_URL);
  const [activeModalVideo, setActiveModalVideo] = useState<YouTubeVideo | null>(null);

  const loadVideos = async () => {
    try {
      const list = await fetchApiYouTubeVideos();
      const activeOnly = (list || []).filter(v => v.is_active !== false);
      setVideos(activeOnly.slice(0, 3));
      setChannelUrl(getLocalChannelUrl());
    } catch (e) {
      setVideos([]);
    }
  };

  useEffect(() => {
    loadVideos();
    window.addEventListener('storage', loadVideos);
    window.addEventListener('techno_youtube_updated', loadVideos);
    return () => {
      window.removeEventListener('storage', loadVideos);
      window.removeEventListener('techno_youtube_updated', loadVideos);
    };
  }, []);

  // Lock scroll when modal is open
  useEffect(() => {
    if (activeModalVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeModalVideo]);

  if (videos.length === 0) return null;

  return (
    <section className="w-full max-w-[1560px] mx-auto px-3 sm:px-5 lg:px-6 my-10 sm:my-14">
      {/* ═══ SECTION HEADER — Simple & Clean ═══ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 tracking-wider mb-1">
            <YouTubeIcon className="w-3.5 h-3.5" />
            <span>YouTube Kanalımız</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Texno icmallar ilə seçimini düzgün et
          </h2>
        </div>

        {/* Right CTA Button */}
        <div className="flex-shrink-0">
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-xs transition cursor-pointer"
          >
            <YouTubeIcon className="w-3.5 h-3.5" />
            <span>Kanalımıza keçid et</span>
            <ExternalLink className="w-3 h-3 text-white/80" />
          </a>
        </div>
      </div>

      {/* ═══ 3 VIDEOS GRID (1 ROW) ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {videos.slice(0, 3).map((video, idx) => {
          const thumbnail =
            video.thumbnail_url ||
            (video.video_id ? `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg` : '');

          return (
            <div
              key={video.id || idx}
              onClick={() => setActiveModalVideo(video)}
              className={`group cursor-pointer rounded-3xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 flex flex-col overflow-hidden ${isDarkMode
                ? 'bg-slate-900/90 border-slate-800 hover:border-[#4f533b]/60'
                : 'bg-white border-slate-200/90 hover:border-[#4f533b]/50'
                }`}
            >
              {/* Thumbnail Container with Play Button Overlay */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                <img
                  src={thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108 group-hover:opacity-90"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 group-hover:from-black/80 transition-colors" />

                {/* Centered Custom Play Button in Brand Color (#4f533b) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative flex items-center justify-center">
                    {/* Glowing pulse ring */}
                    <div className="absolute w-16 h-16 rounded-full bg-[#4f533b]/40 animate-ping opacity-60 group-hover:opacity-100" />

                    {/* Button Body */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#4f533b] hover:bg-[#3e4230] text-white flex items-center justify-center shadow-xl shadow-black/50 border-2 border-white/40 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-[#434731]">
                      <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-white translate-x-0.5" />
                    </div>
                  </div>
                </div>

                {/* Badges Overlay */}

                {video.views_count && (
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-slate-200 text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 border border-white/10">
                    <Eye className="w-3 h-3 text-slate-300" />
                    <span>{video.views_count}</span>
                  </div>
                )}

                {/* HD Review Tag */}
                <div className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-black tracking-wider px-2.5 py-0.5 rounded-md shadow-md flex items-center gap-1">
                  <Video className="w-3 h-3" />
                  <span>İcmal</span>
                </div>
              </div>

              {/* Video Title & Footer Info */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <h3 className="font-extrabold text-sm sm:text-base leading-snug line-clamp-2 text-slate-900 dark:text-white group-hover:text-[#4f533b] dark:group-hover:text-amber-300 transition-colors">
                  {video.title}
                </h3>

                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-bold flex items-center gap-1.5 text-[#4f533b] dark:text-amber-300/90">
                    <Play className="w-3 h-3 fill-current" />
                    Videoya bax
                  </span>
                  <span className="text-[11px]">Technomania</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ POP-UP VIDEO MODAL ═══ */}
      {activeModalVideo && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fadeIn">
          {/* Dark Glass Backdrop */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
            onClick={() => setActiveModalVideo(null)}
          />

          {/* Modal Content Box */}
          <div className="relative w-full max-w-4xl bg-slate-950 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 z-10 animate-scaleUp flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 min-w-0 pr-4">
                <div className="w-8 h-8 rounded-lg bg-rose-600/20 text-rose-500 flex items-center justify-center flex-shrink-0">
                  <YouTubeIcon className="w-5 h-5 text-rose-500" />
                </div>
                <h4 className="font-bold text-sm sm:text-base truncate text-slate-100">
                  {activeModalVideo.title}
                </h4>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={activeModalVideo.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition"
                >
                  <span>YouTube-da aç</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setActiveModalVideo(null)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-600 hover:text-white text-slate-300 flex items-center justify-center transition cursor-pointer"
                  aria-label="Bağla"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Responsive 16:9 YouTube Iframe Embed */}
            <div className="relative w-full aspect-video bg-black">
              {activeModalVideo.video_id ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeModalVideo.video_id}?autoplay=1&rel=0&modestbranding=1`}
                  title={activeModalVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 space-y-3">
                  <p className="text-sm">Video linki birbaşa açıla bilmədi.</p>
                  <a
                    href={activeModalVideo.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs"
                  >
                    YouTube-da bax →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
