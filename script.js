// Mobile navigation
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");

    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.textContent = isOpen ? "Close −" : "Menu +";
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "Menu +";
    });
  });
}

// Copyright year — only exists on the contact page
const year = document.getElementById("year");

if (year) {
  year.textContent = new Date().getFullYear();
}

// Custom inverted cursor
const supportsCustomCursor = window.matchMedia(
  "(hover: hover) and (pointer: fine)"
);

if (supportsCustomCursor.matches) {
  const cursor = document.createElement("div");
  cursor.className = "custom-cursor-dot";
  cursor.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursor);

  document.body.classList.add("custom-cursor");

  document.addEventListener("pointermove", (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.classList.add("visible");
  });

  document.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) {
      cursor.classList.remove("visible");
    }
  });

  document.querySelectorAll("a, button").forEach((element) => {
    element.addEventListener("pointerenter", () => {
      cursor.classList.add("hovering");
    });

    element.addEventListener("pointerleave", () => {
      cursor.classList.remove("hovering");
    });
  });
}

// Animated page transitions for the top navigation
const pageRoot = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let isLeaving = false;

// Remove the reveal class after the new page animation finishes.
pageRoot.addEventListener("animationend", (event) => {
  if (event.animationName === "circle-reveal") {
    pageRoot.classList.remove("page-reveal");
  }
});

document.querySelectorAll(
  ".nav a, .header-cta, .logo, .portfolio-card a"
).forEach((link) => {
  link.addEventListener("click", (event) => {
    // Keep normal browser behavior for new tabs, keyboard shortcuts,
    // downloads, and visitors who prefer reduced motion.
    if (
      reducedMotion.matches ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.hasAttribute("download") ||
      (link.target && link.target !== "_self")
    ) {
      return;
    }

    const destination = new URL(link.href, window.location.href);

    // Don't animate external links or links to the current page.
    if (
      destination.origin !== window.location.origin ||
      destination.href === window.location.href
    ) {
      return;
    }

    if (isLeaving) {
      event.preventDefault();
      return;
    }

    // Keyboard-activated links use the center of the link.
    const rect = link.getBoundingClientRect();
    const clickX = event.detail === 0
      ? rect.left + rect.width / 2
      : event.clientX;
    const clickY = event.detail === 0
      ? rect.top + rect.height / 2
      : event.clientY;

    const point = {
      x: (clickX / window.innerWidth) * 100,
      y: (clickY / window.innerHeight) * 100
    };

    // If storage is blocked, let the link navigate normally.
    try {
      sessionStorage.setItem("pageTransition", JSON.stringify(point));
    } catch (error) {
      return;
    }

    event.preventDefault();
    isLeaving = true;

    pageRoot.style.setProperty("--transition-x", point.x + "%");
    pageRoot.style.setProperty("--transition-y", point.y + "%");
    pageRoot.classList.remove("page-reveal");
    pageRoot.classList.add("page-leave");

    let navigated = false;

    function openNextPage() {
      if (navigated) return;
      navigated = true;
      window.location.href = destination.href;
    }

    pageRoot.addEventListener("animationend", (animationEvent) => {
      if (animationEvent.animationName === "circle-expand") {
        openNextPage();
      }
    }, { once: true });

    // Backup in case the animation event doesn't fire.
    setTimeout(openNextPage, 900);
  });
});
// Highlight only the gallery item currently under the mouse
let mouseX = -1;
let mouseY = -1;
let activeGalleryItem = null;

function updateGalleryHover() {
  const element = mouseX >= 0 && mouseY >= 0
    ? document.elementFromPoint(mouseX, mouseY)
    : null;

  const nextItem = element?.closest(".gallery-item") || null;

  if (nextItem === activeGalleryItem) return;

  if (activeGalleryItem) {
    activeGalleryItem.classList.remove("scroll-hover");
  }

  activeGalleryItem = nextItem;

  if (activeGalleryItem) {
    activeGalleryItem.classList.add("scroll-hover");
  }
}

document.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse") return;

  mouseX = event.clientX;
  mouseY = event.clientY;
  updateGalleryHover();
});

window.addEventListener("scroll", updateGalleryHover, { passive: true });

document.addEventListener("pointerout", (event) => {
  if (!event.relatedTarget) {
    mouseX = -1;
    mouseY = -1;
    updateGalleryHover();
  }
});

// =========================================
// Home page — scroll-driven video showreel
// =========================================

const showreel = document.querySelector(".home-showreel");

if (showreel) {
  const stage = showreel.querySelector(".home-showreel-stage");
  const frames = [...showreel.querySelectorAll(".home-video-frame")];
  const videos = [...showreel.querySelectorAll("video")];
  const scrollHint = showreel.querySelector(".home-scroll-hint");

  let showreelFrameRequested = false;
  let smoothProgress = 0;
  let showreelVisible = true;

  const desktopPositions = [
    [-0.31, -0.26],
    [ 0.30, -0.24],
    [-0.38,  0.10],
    [ 0.38,  0.10],
    [ 0.00,  0.34]
  ];

  const mobilePositions = [
    [-0.25, -0.27],
    [ 0.25, -0.22],
    [-0.28,  0.09],
    [ 0.28,  0.10],
    [ 0.00,  0.30]
  ];

  // Small offsets keep the videos visibly stacked before the final zoom.
  const stackOffsets = [
    [-28, -20],
    [ 24, -14],
    [-20,  18],
    [ 16,  12],
    [  0,   0]
  ];

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function ease(value) {
    return value * value * (3 - 2 * value);
  }

  function drawShowreel() {
    showreelFrameRequested = false;

    if (reducedMotion.matches) {
      frames.forEach((frame) => {
        frame.style.removeProperty("--x");
        frame.style.removeProperty("--y");
        frame.style.removeProperty("--scale");
      });
      return;
    }

    const rect = showreel.getBoundingClientRect();
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const scrollDistance = showreel.offsetHeight - height;

    if (scrollDistance <= 0) return;

    const targetProgress = clamp(-rect.top / scrollDistance, 0, 1);

    // Move a fraction of the remaining distance each frame (the "delay")
    smoothProgress += (targetProgress - smoothProgress) * 0.04;

    if (Math.abs(targetProgress - smoothProgress) < 0.0005) {
      smoothProgress = targetProgress;
    } else {
      requestShowreelUpdate(); // keep animating until it catches up
    }

const progress = smoothProgress;

        // On mobile, start with video 5 centered and expand it to fill the screen.
    if (window.innerWidth <= 850) {
      const frontFrame = frames[4];
      const frontWidth = frontFrame.offsetWidth;
      const frontHeight = frontFrame.offsetHeight;

      if (!frontWidth || !frontHeight) return;

      const fullScreenScale = Math.max(
        width / frontWidth,
        height / frontHeight
      );

      const expand = ease(clamp(progress / 0.8, 0, 1));

      frontFrame.style.setProperty("--x", "0px");
      frontFrame.style.setProperty("--y", "0px");
      frontFrame.style.setProperty(
        "--scale",
        1 + (fullScreenScale - 1) * expand
      );

      if (scrollHint) {
        scrollHint.style.opacity = String(1 - clamp(progress * 5, 0, 1));
      }

      return;
    }

    // First phase: scattered frames move into a central stack.
        // First phase: scattered frames move into a central stack.
    const gather = ease(clamp(progress / 0.55, 0, 1));

    // Second phase: the front video expands to fill the viewport.
    const expand = ease(clamp((progress - 0.55) / 0.3, 0, 1));

    // Third phase: the full-screen video settles into a smaller inset card.
    const settle = ease(clamp((progress - 0.85) / 0.15, 0, 1));

    const positions = window.innerWidth <= 850
      ? mobilePositions
      : desktopPositions;

    const frontFrame = frames[4];
    const frontWidth = frontFrame.offsetWidth;
    const frontHeight = frontFrame.offsetHeight;

    // Cover the viewport even when its proportions differ from the video.
    const fullScreenScale = Math.max(
      width / frontWidth,
      height / frontHeight
    );

    frames.forEach((frame, index) => {
      const [startX, startY] = positions[index];
      const [stackX, stackY] = stackOffsets[index];

      const x = startX * width * (1 - gather) + stackX * gather;
      const y = startY * height * (1 - gather) + stackY * gather;

      const insetScale = fullScreenScale * (1 - 0.18 * settle);

    const scale = index === 4
      ? 1 + (insetScale - 1) * expand
      : 1;

    frontFrame.classList.toggle("is-settling", settle > 0.05);

      frame.style.setProperty("--x", `${x}px`);
      frame.style.setProperty("--y", `${y}px`);
      frame.style.setProperty("--scale", scale);
    });

    if (scrollHint) {
      scrollHint.style.opacity = String(1 - clamp(progress * 5, 0, 1));
    }
  }

  function requestShowreelUpdate() {
    if (showreelFrameRequested) return;

    showreelFrameRequested = true;
    requestAnimationFrame(drawShowreel);
  }

    function updateVideoPlayback() {
    const isMobile = window.innerWidth <= 850;

    videos.forEach((video, index) => {
      const unusedOnMobile = isMobile && index !== 4;

      if (reducedMotion.matches || !showreelVisible || unusedOnMobile) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    });

    requestShowreelUpdate();
  }

  window.addEventListener("scroll", requestShowreelUpdate, { passive: true });
    window.addEventListener("resize", updateVideoPlayback);

  if ("IntersectionObserver" in window) {
    const visibilityObserver = new IntersectionObserver((entries) => {
      showreelVisible = entries[0].isIntersecting;
      updateVideoPlayback();
    });

    visibilityObserver.observe(showreel);
  }

  reducedMotion.addEventListener("change", updateVideoPlayback);
  updateVideoPlayback();
}

// Smooth, inertial scrolling
if (window.Lenis && !reducedMotion.matches) {
  const lenis = new Lenis({
    lerp: 0.05 // smaller = more glide/latency, larger = snappier
  });

  function lenisFrame(time) {
    lenis.raf(time);
    requestAnimationFrame(lenisFrame);
  }

  requestAnimationFrame(lenisFrame);
}

// Reveal text and cards as they enter the screen (replays when scrolling back)
const revealItems = document.querySelectorAll(
  ".reveal-lines, .reveal-fade, .portfolio-card"
);

// Give cards a staggered delay based on their position
document.querySelectorAll(".portfolio-card").forEach((card, i) => {
  card.style.setProperty("--i", i);
});

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const textObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("in-view", entry.isIntersecting);
    });
  }, { threshold: 0.2 });

  revealItems.forEach((item) => textObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}