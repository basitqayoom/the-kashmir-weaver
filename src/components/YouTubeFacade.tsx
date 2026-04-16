"use client";

import { useState } from "react";

interface Props {
  videoId: string;
  title: string;
}

export default function YouTubeFacade({ videoId, title }: Props) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    );
  }

  return (
    <button
      type="button"
      className="group absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center bg-black"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
    >
      <img
        src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
        alt={title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-80"
      />
      {/* Play button */}
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-red-600 transition-transform duration-200 group-hover:scale-110 sm:h-20 sm:w-20">
        <svg
          className="ml-1 h-7 w-7 text-white sm:h-8 sm:w-8"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </button>
  );
}
