import { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Global tracker so only one player has audio at a time.
let globalActivePlayer: any = null;
let apiLoadingPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (apiLoadingPromise) return apiLoadingPromise;

  apiLoadingPromise = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!document.querySelector('script[data-yt-iframe-api]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.setAttribute("data-yt-iframe-api", "true");
      document.head.appendChild(tag);
    }
  });
  return apiLoadingPromise;
}

export interface UseYouTubePlayerOptions {
  autoplay?: boolean;
  muted?: boolean; // useful for grids where browsers block audio autoplay
  onEnded?: () => void;
}

export function useYouTubePlayer(videoId: string | undefined, opts: UseYouTubePlayerOptions = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const endedFiredRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const { autoplay = true, muted = false, onEnded } = opts;
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    endedFiredRef.current = false;

    const build = () => {
      if (cancelled || !containerRef.current || !window.YT?.Player) return;

      // Destroy any existing instance
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch { /* noop */ }
        playerRef.current = null;
      }
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // YT replaces the target element — give it a fresh inner div
      const host = document.createElement("div");
      host.style.width = "100%";
      host.style.height = "100%";
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(host);

      playerRef.current = new window.YT.Player(host, {
        videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          controls: 0,
          disablekb: 1,
          mute: muted ? 1 : 0,
        },
        events: {
          onReady: () => {
            if (cancelled) return;
            setIsReady(true);
            try {
              setDuration(playerRef.current.getDuration() || 0);
              if (muted) playerRef.current.mute();
              if (autoplay) playerRef.current.playVideo();
            } catch { /* noop */ }

            intervalRef.current = window.setInterval(() => {
              if (!playerRef.current) return;
              try {
                const cur = playerRef.current.getCurrentTime() || 0;
                const dur = playerRef.current.getDuration() || 0;
                setCurrentTime(cur);
                setDuration(dur);
                setProgress(dur > 0 ? (cur / dur) * 100 : 0);
              } catch { /* noop */ }
            }, 500);
          },
          onStateChange: (e: any) => {
            const S = window.YT.PlayerState;
            if (e.data === S.PLAYING) {
              if (globalActivePlayer && globalActivePlayer !== playerRef.current) {
                try { globalActivePlayer.pauseVideo(); } catch { /* noop */ }
              }
              globalActivePlayer = playerRef.current;
              setIsPlaying(true);
            } else if (e.data === S.PAUSED) {
              setIsPlaying(false);
            } else if (e.data === S.ENDED) {
              setIsPlaying(false);
              setProgress(100);
              if (!endedFiredRef.current) {
                endedFiredRef.current = true;
                onEndedRef.current?.();
              }
            }
          },
        },
      });
    };

    loadYouTubeAPI().then(build);

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (playerRef.current) {
        if (globalActivePlayer === playerRef.current) globalActivePlayer = null;
        try { playerRef.current.destroy(); } catch { /* noop */ }
        playerRef.current = null;
      }
      setIsReady(false);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
    };
  }, [videoId, autoplay, muted]);

  const togglePlayPause = useCallback(() => {
    if (!playerRef.current || !isReady) return;
    try {
      if (isPlaying) playerRef.current.pauseVideo();
      else playerRef.current.playVideo();
    } catch { /* noop */ }
  }, [isPlaying, isReady]);

  const seekTo = useCallback((seconds: number) => {
    if (!playerRef.current || !isReady) return;
    try {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
      if (duration > 0) setProgress((seconds / duration) * 100);
    } catch { /* noop */ }
  }, [isReady, duration]);

  const seekToPercent = useCallback((pct: number) => {
    if (!playerRef.current || !isReady || !duration) return;
    const t = (pct / 100) * duration;
    seekTo(t);
  }, [isReady, duration, seekTo]);

  const setVolume = useCallback((vol: number) => {
    if (!playerRef.current || !isReady) return;
    try { playerRef.current.setVolume(vol); } catch { /* noop */ }
  }, [isReady]);

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return {
    containerRef,
    isPlaying,
    isReady,
    progress,
    currentTime,
    duration,
    formattedCurrent: formatTime(currentTime),
    formattedDuration: formatTime(duration),
    togglePlayPause,
    seekTo,
    seekToPercent,
    setVolume,
  };
}
