import { useEffect, useRef, useState, type ReactNode } from "react";
import { Play, Pause, Maximize2 } from "lucide-react";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";

export interface VideoPlayerProps {
  videoId: string;
  autoplay?: boolean;
  muted?: boolean;
  aspect?: string; // tailwind aspect class e.g. "aspect-video" | "aspect-[9/14]"
  showFullscreen?: boolean;
  onComplete?: () => void;
  onProgress?: (info: { currentTime: number; duration: number; progress: number }) => void;
  /** Extra overlay elements rendered above the player (e.g. back button, end-card). */
  overlay?: ReactNode;
  /** Forwarded so parents can read currentTime/seek via the same hook instance — see useExternalPlayer below. */
  controlsRef?: (api: ReturnType<typeof useYouTubePlayer>) => void;
}

export default function VideoPlayer({
  videoId,
  autoplay = true,
  muted = false,
  aspect = "aspect-video",
  showFullscreen = true,
  onComplete,
  onProgress,
  overlay,
  controlsRef,
}: VideoPlayerProps) {
  const player = useYouTubePlayer(videoId, { autoplay, muted, onEnded: onComplete });
  const {
    containerRef, isPlaying, isReady, progress, currentTime, duration,
    formattedCurrent, formattedDuration, togglePlayPause, seekToPercent,
  } = player;

  const [flash, setFlash] = useState<null | "play" | "pause">(null);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const scrubbingRef = useRef(false);

  useEffect(() => { controlsRef?.(player); });

  useEffect(() => {
    if (onProgress) onProgress({ currentTime, duration, progress });
  }, [currentTime, duration, progress, onProgress]);

  const resetHideTimer = () => {
    setShowControls(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowControls(false), 3000);
  };
  useEffect(() => () => { if (hideTimer.current) window.clearTimeout(hideTimer.current); }, []);

  const handleTap = () => {
    if (!isReady) return;
    setFlash(isPlaying ? "pause" : "play");
    togglePlayPause();
    window.setTimeout(() => setFlash(null), 600);
    resetHideTimer();
  };

  const scrubFromEvent = (e: React.PointerEvent<HTMLDivElement> | PointerEvent, el: HTMLDivElement) => {
    const rect = el.getBoundingClientRect();
    const x = ("clientX" in e ? e.clientX : 0) - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    seekToPercent(pct);
  };

  const onScrubStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const el = e.currentTarget;
    scrubbingRef.current = true;
    scrubFromEvent(e, el);
    const move = (ev: PointerEvent) => { if (scrubbingRef.current) scrubFromEvent(ev, el); };
    const up = () => {
      scrubbingRef.current = false;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const goFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const el = wrapperRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.();
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${aspect} bg-black overflow-hidden select-none text-white`}>
      {/* YT iframe mount */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Tap layer */}
      <div onClick={handleTap} className="absolute inset-0 z-10" />

      {/* Loading spinner */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        </div>
      )}

      {/* Flash icon */}
      {flash && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center animate-[fadeOut_.7s_ease-out_forwards]">
            {flash === "pause" ? <Pause className="w-7 h-7" fill="white" /> : <Play className="w-7 h-7" fill="white" />}
          </div>
        </div>
      )}

      {/* Overlay slot (back buttons, end-card, etc.) */}
      {overlay && <div className="absolute inset-0 z-30 pointer-events-none [&>*]:pointer-events-auto">{overlay}</div>}

      {/* Controls bar */}
      <div
        className={`absolute bottom-0 inset-x-0 z-40 transition-opacity duration-200 ${showControls || !isPlaying ? "opacity-100" : "opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div
          onPointerDown={onScrubStart}
          className="px-3 pb-1 cursor-pointer"
        >
          <div className="relative h-1.5 rounded-full bg-white/30">
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${progress}%`, background: "#FF0000" }} />
            <div className="absolute -top-1.5 w-4 h-4 rounded-full bg-white shadow" style={{ left: `calc(${progress}% - 8px)` }} />
          </div>
        </div>
        <div className="px-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleTap(); }}
              className="w-8 h-8 flex items-center justify-center"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5" fill="white" /> : <Play className="w-5 h-5" fill="white" />}
            </button>
            <span className="text-[11px] font-medium tabular-nums">
              {formattedCurrent} / {formattedDuration}
            </span>
          </div>
          {showFullscreen && (
            <button onClick={goFullscreen} className="w-8 h-8 flex items-center justify-center" aria-label="Fullscreen">
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <style>{`@keyframes fadeOut { 0% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0; transform: scale(.8); } }`}</style>
    </div>
  );
}
