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
let modalBird = null; // Track currently selected bird in the detail modal

// Initialize app when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  setupOfflineBanner();
  renderGrid();
  setupModalListeners();
});

// Setup online/offline event listeners and banners
function setupOfflineBanner() {
  const offlineAlert = document.getElementById("offline-alert");
  const dismissBtn = document.getElementById("dismiss-offline");
  const offlinePill = document.getElementById("offline-pill");

  function updateStatus() {
    if (!navigator.onLine) {
      if (offlineAlert) offlineAlert.classList.remove("hidden");
      if (offlinePill) offlinePill.classList.remove("hidden");
      // Stop playback if offline
      if (audioRef) {
        audioRef.pause();
      }
      resetAllCards();
    } else {
      if (offlineAlert) offlineAlert.classList.add("hidden");
      if (offlinePill) offlinePill.classList.add("hidden");
      hidePlaybackError();
    }
  }

  window.addEventListener("online", updateStatus);
  window.addEventListener("offline", updateStatus);
  
  if (dismissBtn) {
    dismissBtn.addEventListener("click", () => {
      if (offlineAlert) offlineAlert.classList.add("hidden");
    });
  }

  // Set initial status
  updateStatus();
}

function showPlaybackError(message) {
  const errorAlert = document.getElementById("playback-error");
  const errorMessage = document.getElementById("error-message");
  if (errorMessage) errorMessage.textContent = message;
  if (errorAlert) errorAlert.classList.remove("hidden");
}

function hidePlaybackError() {
  const errorAlert = document.getElementById("playback-error");
  if (errorAlert) errorAlert.classList.add("hidden");
}

// Bind close button of error toast
document.getElementById("dismiss-error")?.addEventListener("click", () => {
  hidePlaybackError();
});

// Setup events for the Details Modal
function setupModalListeners() {
  const closeBtn = document.getElementById("modal-close");
  const modalOverlay = document.getElementById("details-modal");
  const playTrigger = document.getElementById("modal-play-trigger");

  if (closeBtn) {
    closeBtn.addEventListener("click", closeDetailsModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        closeDetailsModal();
      }
    });
  }

  if (playTrigger) {
    playTrigger.addEventListener("click", () => {
      if (modalBird) {
        handleCardClick(modalBird);
      }
    });
  }
}

// Render the entire grid of birds programmatically
function renderGrid() {
  const gridContainer = document.getElementById("birds-grid");
  if (!gridContainer) return;

  gridContainer.innerHTML = "";

  BIRDS_DATA.forEach((bird) => {
    const imageUrl = bird.imageUrl;

    const card = document.createElement("div");
    card.id = `card-${bird.id}`;
    card.className = "bird-card";

    card.innerHTML = `
      <!-- Background Image -->
      <img
        src="${imageUrl}"
        alt="${bird.name}"
        referrerpolicy="no-referrer"
        class="bird-card-img"
      />

      <!-- Vignette Overlay -->
      <div class="bird-vignette"></div>

      <!-- Glowing active/hover border (animated via CSS) -->
      <div class="card-glow-border"></div>

      <!-- Content Container -->
      <div class="card-details">
        <div class="card-title-row">
          <!-- Bird Name -->
          <h3 class="card-name">
            ${bird.name}
          </h3>
          <!-- Info button inline at the right of the name -->
          <button class="card-info-trigger" type="button" title="View Details">
            <i data-lucide="info" style="width: 13px; height: 13px;"></i>
          </button>
        </div>
      </div>
    `;

    // Click on the overall card triggers play logic
    card.addEventListener("click", () => handleCardClick(bird));

    // Click on the Info icon triggers Details Modal (and stops propagation to prevent play)
    const infoBtn = card.querySelector(".card-info-trigger");
    if (infoBtn) {
      infoBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openDetailsModal(bird);
      });
    }

    gridContainer.appendChild(card);
  });

  // Hydrate with Lucide SVGs
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Open Details Modal and populate with JSON details
function openDetailsModal(bird) {
  modalBird = bird;
  const modal = document.getElementById("details-modal");
  if (!modal) return;

  // Set hero image
  const modalImage = document.getElementById("modal-image");
  if (modalImage) {
    modalImage.src = bird.imageUrl;
    modalImage.alt = bird.name;
  }

  // Populate textual fields
  const pScientific = CALL_PHONETICS[bird.id] || bird.callType;
  document.getElementById("modal-scientific").innerHTML = `<span>${bird.scientificName}</span>`;
  document.getElementById("modal-title").textContent = bird.name;
  document.getElementById("modal-family").textContent = bird.family || "N/A";
  document.getElementById("modal-region").textContent = bird.region || "N/A";
  document.getElementById("modal-habitat").textContent = bird.habitat || "N/A";
  document.getElementById("modal-calltype").textContent = `${bird.callType} ("${pScientific}")`;
  document.getElementById("modal-desc").textContent = bird.description || "";
  document.getElementById("modal-funfact-text").textContent = bird.funFact || "";

  // Synchronize modal play button state
  updateModalPlayButtonUI();

  // Display overlay
  modal.classList.add("active");

  // Re-hydrate Lucide icons for the newly loaded modal buttons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Close Details Modal
function closeDetailsModal() {
  const modal = document.getElementById("details-modal");
  if (modal) {
    modal.classList.remove("active");
  }
  modalBird = null;
}

// Synchronize play button UI state inside modal
function updateModalPlayButtonUI() {
  const playTrigger = document.getElementById("modal-play-trigger");
  if (!playTrigger || !modalBird) return;

  const isCurrentBirdPlaying = (activeBirdId === modalBird.id && isPlaying);
  const playText = document.getElementById("modal-play-text");

  if (isCurrentBirdPlaying) {
    playTrigger.classList.add("playing");
    if (playText) playText.textContent = "Pause Call";
    // Change icon to pause
    playTrigger.innerHTML = `
      <i data-lucide="pause" style="width: 14px; height: 14px; fill: currentColor;"></i>
      <span id="modal-play-text">Pause Call</span>
    `;
  } else {
    playTrigger.classList.remove("playing");
    if (playText) playText.textContent = "Listen to Call";
    // Change icon to play
    playTrigger.innerHTML = `
      <i data-lucide="play" style="width: 14px; height: 14px; fill: currentColor;"></i>
      <span id="modal-play-text">Listen to Call</span>
    `;
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Reset visual states of all cards back to idle
function resetAllCards() {
  BIRDS_DATA.forEach((bird) => {
    const card = document.getElementById(`card-${bird.id}`);
    if (card) {
      card.classList.remove("active");
    }
  });
  activeBirdId = null;
  isPlaying = false;
  updateModalPlayButtonUI();
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

  if (playing) {
    card.classList.add("active");
  } else {
    card.classList.remove("active");
  }

  // Update modal play button UI in case the modal of the playing bird is currently open
  updateModalPlayButtonUI();
}
