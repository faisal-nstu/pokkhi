import { BIRDS_DATA } from "./birdsData.js";

// Precise phonetic vocalizations matching the aesthetic of Bangladeshi birds
const CALL_PHONETICS = {
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

let activeBirdId = null;
let isPlaying = false;
let audioRef = null;

// Initialize app when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  setupOfflineBanner();
  renderGrid();
});

// Setup online/offline event listeners and banners
function setupOfflineBanner() {
  const offlineAlert = document.getElementById("offline-alert");
  const dismissBtn = document.getElementById("dismiss-offline");
  const offlinePill = document.getElementById("offline-pill");

  function updateStatus() {
    if (!navigator.onLine) {
      offlineAlert.classList.remove("hidden");
      offlinePill.classList.remove("hidden");
      offlinePill.classList.add("flex");
      // Stop playback if offline
      if (audioRef) {
        audioRef.pause();
      }
      resetAllCards();
    } else {
      offlineAlert.classList.add("hidden");
      offlinePill.classList.add("hidden");
      offlinePill.classList.remove("flex");
      hidePlaybackError();
    }
  }

  window.addEventListener("online", updateStatus);
  window.addEventListener("offline", updateStatus);
  
  if (dismissBtn) {
    dismissBtn.addEventListener("click", () => {
      offlineAlert.classList.add("hidden");
    });
  }

  // Set initial status
  updateStatus();
}

function showPlaybackError(message) {
  const errorAlert = document.getElementById("playback-error");
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = message;
  errorAlert.classList.remove("hidden");
}

function hidePlaybackError() {
  const errorAlert = document.getElementById("playback-error");
  errorAlert.classList.add("hidden");
}

// Bind close button of error toast
document.getElementById("dismiss-error")?.addEventListener("click", () => {
  hidePlaybackError();
});

// Render the entire grid of birds programmatically
function renderGrid() {
  const gridContainer = document.getElementById("birds-grid");
  if (!gridContainer) return;

  gridContainer.innerHTML = "";

  BIRDS_DATA.forEach((bird) => {
    const phonetic = CALL_PHONETICS[bird.id] || bird.callType;
    const imageUrl = bird.imageUrl;

    const card = document.createElement("div");
    card.id = `card-${bird.id}`;
    card.className = `relative w-full aspect-square overflow-hidden group cursor-pointer select-none rounded-sm border border-stone-800/80 hover:border-stone-700 hover:shadow-lg transition-all duration-300`;

    card.innerHTML = `
      <!-- Background Image -->
      <img
        src="${imageUrl}"
        alt="${bird.name}"
        referrerpolicy="no-referrer"
        class="absolute inset-0 w-full h-full object-cover grayscale-[10%] sepia-[5%] contrast-[1.04] brightness-[0.78] transition-all duration-300 group-hover:brightness-90"
      />

      <!-- Vignette Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent mix-blend-multiply opacity-90"></div>

      <!-- Glowing active border (grows in dynamically) -->
      <div class="absolute inset-0 border-2 border-emerald-500 z-20 pointer-events-none opacity-0 transition-opacity duration-300 active-border"></div>

      <!-- Content Container -->
      <div class="absolute bottom-4 left-4 right-4 z-10 flex flex-col text-left pointer-events-none">
        
        <!-- Call phonetic -->
        <span class="font-mono text-[8px] sm:text-[9px] tracking-[0.2em] text-stone-400 uppercase mb-1.5 block truncate">
          ${phonetic}
        </span>

        <!-- Bird Name -->
        <h3 class="font-sans font-black text-sm sm:text-base tracking-tight uppercase leading-[1.0] text-white group-hover:text-emerald-400 transition-colors duration-200">
          ${bird.name}
        </h3>

        <!-- Scientific Name & Avatar -->
        <div class="flex items-center gap-1.5 mt-2">
          <div class="w-4 h-4 rounded-full border border-white/20 overflow-hidden bg-stone-900 flex-shrink-0">
            <img
              src="${imageUrl}"
              alt=""
              referrerpolicy="no-referrer"
              class="w-full h-full object-cover scale-110"
            />
          </div>
          <span class="text-[9px] sm:text-[10px] text-stone-300 font-sans tracking-wide truncate">
            by <span class="italic">${bird.scientificName}</span>
          </span>
        </div>

      </div>

      <!-- Top Right Indicator Overlay -->
      <div class="absolute top-3 right-3 z-10 pointer-events-none">
        <!-- Static Play Icon (Visible on hover) -->
        <div class="play-indicator p-1 rounded-full bg-black/40 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <i data-lucide="play" class="w-3 h-3 fill-white text-white ml-[1px]"></i>
        </div>

        <!-- Equalizer Sound Wave (Hidden by default) -->
        <div class="equalizer-indicator hidden items-end justify-center gap-[2px] w-7 h-7 bg-emerald-500 text-black shadow-md rounded-full p-[6px] overflow-hidden">
          <span class="w-[2.5px] bg-black rounded-full animate-sound-bar-1" style="height: 4px;"></span>
          <span class="w-[2.5px] bg-black rounded-full animate-sound-bar-2" style="height: 4px;"></span>
          <span class="w-[2.5px] bg-black rounded-full animate-sound-bar-3" style="height: 4px;"></span>
          <span class="w-[2.5px] bg-black rounded-full animate-sound-bar-4" style="height: 4px;"></span>
        </div>
      </div>
    `;

    // Attach play logic click event
    card.addEventListener("click", () => handleCardClick(bird));

    gridContainer.appendChild(card);
  });

  // Hydrate with Lucide SVGs
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Reset visual states of all cards back to idle
function resetAllCards() {
  BIRDS_DATA.forEach((bird) => {
    const card = document.getElementById(`card-${bird.id}`);
    if (card) {
      card.classList.remove("border-emerald-500", "shadow-[0_10px_20px_rgba(0,0,0,0.5)]");
      card.classList.add("border-stone-800/80");

      const activeBorder = card.querySelector(".active-border");
      if (activeBorder) activeBorder.classList.add("opacity-0");

      const playIndicator = card.querySelector(".play-indicator");
      if (playIndicator) playIndicator.classList.remove("hidden");

      const equalizer = card.querySelector(".equalizer-indicator");
      if (equalizer) {
        equalizer.classList.add("hidden");
        equalizer.classList.remove("flex");
      }
    }
  });
  activeBirdId = null;
  isPlaying = false;
}

// Audio Engine
function handleCardClick(bird) {
  hidePlaybackError();

  if (!navigator.onLine) {
    showPlaybackError("Cannot stream audio while offline.");
    return;
  }

  // If clicked card is currently playing, pause it
  if (activeBirdId === bird.id) {
    if (isPlaying) {
      if (audioRef) audioRef.pause();
      isPlaying = false;
      updateCardPlaybackUI(bird.id, false);
    } else {
      if (audioRef) {
        audioRef.play().then(() => {
          isPlaying = true;
          updateCardPlaybackUI(bird.id, true);
        }).catch((err) => {
          console.warn("Playback failed:", err);
          showPlaybackError("Audio playback failed or was blocked by the browser.");
        });
      }
    }
  } else {
    // Stop and reset current audio
    if (audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
    }

    // Reset UI for all other cards first
    resetAllCards();

    // Setup new audio stream
    const audio = new Audio();
    try {
      audio.referrerPolicy = "no-referrer";
    } catch (e) {
      console.warn("Could not set referrerPolicy", e);
    }

    // Direct soundURL works flawlessly on GitHub pages
    audio.src = bird.soundUrl;
    audio.preload = "auto";
    audioRef = audio;

    audio.addEventListener("ended", () => {
      resetAllCards();
    });

    audio.addEventListener("error", () => {
      console.warn(`Audio loading error for ${bird.name}`);
      showPlaybackError("Failed to load recording. Please check your internet connection.");
      resetAllCards();
    });

    activeBirdId = bird.id;
    isPlaying = true;

    audio.play().then(() => {
      updateCardPlaybackUI(bird.id, true);
    }).catch((err) => {
      console.warn("Audio playback failed:", err);
      showPlaybackError("Audio playback failed. Please check your internet connection.");
      resetAllCards();
    });
  }
}

// Dynamically toggles active classes and equalizer indicators
function updateCardPlaybackUI(birdId, playing) {
  const card = document.getElementById(`card-${birdId}`);
  if (!card) return;

  const activeBorder = card.querySelector(".active-border");
  const playIndicator = card.querySelector(".play-indicator");
  const equalizer = card.querySelector(".equalizer-indicator");

  if (playing) {
    card.classList.add("border-emerald-500", "shadow-[0_10px_20px_rgba(0,0,0,0.5)]");
    card.classList.remove("border-stone-800/80");

    if (activeBorder) activeBorder.classList.remove("opacity-0");
    if (playIndicator) playIndicator.classList.add("hidden");
    if (equalizer) {
      equalizer.classList.remove("hidden");
      equalizer.classList.add("flex");
    }
  } else {
    // Paused state but keeps the active border/selection
    if (playIndicator) playIndicator.classList.remove("hidden");
    if (equalizer) {
      equalizer.classList.add("hidden");
      equalizer.classList.remove("flex");
    }
  }
}
