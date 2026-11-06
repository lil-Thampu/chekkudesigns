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
  ".nav a, .header-cta, .logo"
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