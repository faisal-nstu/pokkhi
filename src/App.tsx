import React, { useState, useEffect, useRef } from "react";
import { BIRDS_DATA } from "./birdsData";
import { BirdSpecies } from "./types";
import { Play, AlertCircle } from "lucide-react";

// Precise phonetic vocalizations matching the aesthetic of Bangladeshi birds
const CALL_PHONETICS: Record<string, string> = {
  "oriental-pied-hornbill": "kek-kek-kek-kek-kek!",
  "greater-racket-tailed-drongo": "metallic clinks",
  "white-rumped-shama": "liquid flute whistles",
  "asian-koel": "ko-el! ko-el!",
  "white-throated-kingfisher": "descending rattle",
  "lineated-barbet": "kutroo... kutroo...",
  "common-iora": "wheee-cheee!",
  "red-junglefowl": "abrupt forest crow",
  "chestnut-headed-bee-eater": "trrip-trrip!",
  "puff-throated-babbler": "pretty-sweet-heart!",
  "asian-fairy-bluebird": "metallic we-tuu!",
  "black-drongo": "screaming rattles"
};

export default function App() {
  const [activeBirdId, setActiveBirdId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowOfflineAlert(false);
      setPlaybackError(null);
    };
    const handleOffline = () => {
      setIsOffline(true);
      setShowOfflineAlert(true);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setActiveBirdId(null);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Playback engine
  const handleCardClick = (bird: BirdSpecies) => {
    setPlaybackError(null);

    if (!navigator.onLine) {
      setIsOffline(true);
      setShowOfflineAlert(true);
      setPlaybackError("Cannot stream audio while offline.");
      return;
    }

    if (activeBirdId === bird.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
        setActiveBirdId(null);
      } else {
        audioRef.current?.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn("Playback failed:", err);
          setPlaybackError("Audio playback failed or was blocked by the browser.");
        });
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audio = new Audio();
      try {
        (audio as any).referrerPolicy = "no-referrer";
      } catch (e) {
        console.warn("Could not set referrerPolicy", e);
      }

      const isStaticDeployment = window.location.hostname.includes("github.io") || window.location.protocol === "file:";
      audio.src = isStaticDeployment
        ? bird.soundUrl
        : `/api/sound-stream?url=${encodeURIComponent(bird.soundUrl)}`;

      audio.preload = "auto";
      audioRef.current = audio;

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setActiveBirdId(null);
      });

      audio.addEventListener("error", () => {
        console.warn(`Audio loading error for ${bird.name}`);
        setPlaybackError("Failed to load recording. Please check your internet connection.");
      });

      setActiveBirdId(bird.id);
      setIsPlaying(true);

      audio.play().then(() => {
        setPlaybackError(null);
      }).catch((err) => {
        console.warn("Audio playback failed:", err);
        setPlaybackError("Audio playback failed. Please check your internet connection.");
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans flex flex-col justify-between selection:bg-emerald-800 selection:text-white">
      
      {/* Top Accent Strip */}
      <div className="h-[2px] bg-emerald-600 w-full" />

      {/* Header section with minimal title "Pokkhi" */}
      <header className="max-w-7xl mx-auto px-6 pt-10 pb-6 w-full flex flex-col sm:flex-row items-baseline justify-between gap-4">
        <div>
          <h1 className="font-sans font-black tracking-wider text-4xl sm:text-5xl uppercase text-white">
            Pokkhi
          </h1>
        </div>

        {/* Offline status pill */}
        <div className="flex flex-wrap items-center gap-3">
          {isOffline && (
            <div className="flex items-center gap-1.5 text-red-400 text-[9px] font-mono uppercase tracking-wider bg-red-950/40 px-2.5 py-1 rounded-sm border border-red-900/40 animate-pulse">
              <AlertCircle className="w-3 h-3" />
              <span>Offline Mode</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Container - Just the compact grid */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 pb-16">
        
        {/* Simple Toast-like alerts */}
        {showOfflineAlert && (
          <div className="mb-6 bg-red-950/60 border border-red-800/40 text-red-200 text-xs font-mono tracking-wider uppercase py-3 px-4 rounded-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>Offline: Stream playback requires an active internet connection.</span>
            </div>
            <button 
              type="button" 
              onClick={() => setShowOfflineAlert(false)}
              className="text-[10px] hover:text-white underline tracking-widest uppercase ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {playbackError && (
          <div className="mb-6 bg-amber-950/60 border border-amber-800/40 text-amber-200 text-xs font-mono tracking-wider uppercase py-3 px-4 rounded-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{playbackError}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setPlaybackError(null)}
              className="text-[10px] hover:text-white underline tracking-widest uppercase ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Small, Dense Contiguous Grid Layout (3-4 cells per row on md/lg screens) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
          {BIRDS_DATA.map((bird) => {
            const isCurrent = activeBirdId === bird.id;
            const isCurrentPlaying = isCurrent && isPlaying;
            const phonetic = CALL_PHONETICS[bird.id] || bird.callType;
            const displayImageUrl = bird.imageUrl;

            return (
              <div
                id={`card-${bird.id}`}
                key={bird.id}
                onClick={() => handleCardClick(bird)}
                className={`relative w-full aspect-square overflow-hidden group cursor-pointer select-none rounded-sm border transition-all duration-300 ${
                  isCurrentPlaying
                    ? "border-emerald-500 shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                    : "border-stone-800/80 hover:border-stone-700 hover:shadow-lg"
                }`}
              >
                {/* Fullbleed High-Contrast Background - NO ZOOM ON HOVER */}
                <img
                  src={displayImageUrl}
                  alt={bird.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover grayscale-[10%] sepia-[5%] contrast-[1.04] brightness-[0.78] transition-all duration-300 group-hover:brightness-90"
                />

                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent mix-blend-multiply opacity-90" />

                {/* Inline active glowing border */}
                {isCurrentPlaying && (
                  <div className="absolute inset-0 border-2 border-emerald-500 z-20 pointer-events-none" />
                )}

                {/* Bottom Card Labels */}
                <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col text-left pointer-events-none">
                  
                  {/* Subtle Call Type description */}
                  <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.2em] text-stone-400 uppercase mb-1.5 block truncate">
                    {phonetic}
                  </span>

                  {/* Bold Condensed Uppercase Header */}
                  <h3 className="font-sans font-black text-sm sm:text-base tracking-tight uppercase leading-[1.0] text-white group-hover:text-emerald-400 transition-colors duration-200">
                    {bird.name}
                  </h3>

                  {/* Scientific Name */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-4 h-4 rounded-full border border-white/20 overflow-hidden bg-stone-900 flex-shrink-0">
                      <img
                        src={displayImageUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover scale-110"
                      />
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-stone-300 font-sans tracking-wide truncate">
                      by <span className="italic">{bird.scientificName}</span>
                    </span>
                  </div>

                </div>

                {/* Playback indicator overlay top right */}
                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                  {isCurrentPlaying ? (
                    <div className="flex items-end justify-center gap-[2px] w-7 h-7 bg-emerald-500 text-black shadow-md rounded-full p-[6px] overflow-hidden">
                      <span className="w-[2.5px] bg-black rounded-full animate-sound-bar-1" style={{ height: "4px" }} />
                      <span className="w-[2.5px] bg-black rounded-full animate-sound-bar-2" style={{ height: "4px" }} />
                      <span className="w-[2.5px] bg-black rounded-full animate-sound-bar-3" style={{ height: "4px" }} />
                      <span className="w-[2.5px] bg-black rounded-full animate-sound-bar-4" style={{ height: "4px" }} />
                    </div>
                  ) : (
                    <div className="p-1 rounded-full bg-black/40 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </main>

      {/* Simple, clean Footer */}
      <footer className="bg-stone-950 border-t border-white/5 py-10 px-6 w-full text-stone-500 text-center">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
          <p className="font-mono text-[9px] tracking-[0.2em] text-stone-600 uppercase">
            © Pokkhi Acoustic Record • Sreemangal Conservatory, Bangladesh
          </p>
        </div>
      </footer>
    </div>
  );
}
