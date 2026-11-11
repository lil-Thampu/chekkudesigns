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

// Footer on every page (pages that already have their own footer are skipped)
if (!document.querySelector(".site-footer, .footer")) {
  const siteFooter = document.createElement("footer");
  siteFooter.className = "site-footer";

  siteFooter.innerHTML = `
    <div class="wrap">
      <div class="footer-top">
        <h2 class="footer-title reveal-lines">
          <span class="line"><span>Tell us your tale</span></span>
          <span class="line"><span>We’ll design the story.</span></span>
        </h2>

        <div class="footer-cta-block reveal-fade">
          <a class="footer-pill" href="contact.html">Tell us about the project →</a>
          
        </div>
      </div>
      
      

      <div class="footer-columns">
      <div class="footer-brand">
  <p class="footer-brand-name">Swoosh 
  </p><p class="footer-brand-name"> 
  Designs</p>
  <p class="footer-brand-tag">A communication design studio for stores, brands and stories.</p>
</div>
        <div class="reveal-fade" style="--i: 0">
          <p class="footer-label">Explore</p>
          <ul class="footer-list">
        
            <li><a href="work.html">Work</a></li>
            <li><a href="studio.html">Studio</a></li>
            <li><a href="process.html">Process</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>

        <div class="reveal-fade" style="--i: 1">
          <p class="footer-label">Talk to us</p>
          <ul class="footer-list">
            
            <li><a href="mailto:getswooshd@gmail.com">getswooshd@gmail.com</a></li>
            <li><a href="tel:+919495375748">+91 94953 75748</a></li>
            <li class="footer-muted">Palakkad · India</li>
          </ul>
        </div>

        <div class="reveal-fade" style="--i: 2">
          
          
        </div>
      </div>

      <div class="footer-bottom">
        <p> <span class="footer-year"></span> </p>
        <button class="footer-top-btn" type="button">Back to top ↑</button>
      </div>
    </div>

    
  `;

  document.body.appendChild(siteFooter);

  siteFooter.querySelector(".footer-year").textContent =
    new Date().getFullYear();

  siteFooter.querySelector(".footer-top-btn").addEventListener("click", () => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
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
  ".nav a, .header-cta, .logo, .portfolio-card a, .view-all, .site-footer a"
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
   window.__lenis = lenis;

  function lenisFrame(time) {
    lenis.raf(time);
    requestAnimationFrame(lenisFrame);
  }

  requestAnimationFrame(lenisFrame);
}

// ==========================================
// Reveal text and cards on every page
// ==========================================

// Things that already animate themselves, or should be left alone.
const skipReveal = ".home-showreel, .site-header, .gallery-item, .category-preview";
const alreadyRevealing = ".reveal-lines, .reveal-fade, .portfolio-card";

// 1. Big page titles slide in from a mask (all pages except the home hero)
document.querySelectorAll("main h1").forEach((heading) => {
  if (heading.closest(skipReveal) || heading.matches(alreadyRevealing)) return;

  const line = document.createElement("span");
  const inner = document.createElement("span");
  line.className = "line";

  while (heading.firstChild) inner.appendChild(heading.firstChild);

  line.appendChild(inner);
  heading.appendChild(line);
  heading.classList.add("reveal-lines");
});

// 2. Everything else fades up, staggered among its neighbours
const fadeSelector = [
  "main .eyebrow",
  "main .section-heading",
  "main h2",
  "main h3",
  "main p",
  "main li",
  "main article",
  ".gallery-heading",
  ".store-project h3",
  ".gallery-contact a",
  ".email-link",
  ".footer"
].join(", ");

const staggerCount = new Map();

document.querySelectorAll(fadeSelector).forEach((el) => {
  if (el.closest(skipReveal) || el.matches(alreadyRevealing)) return;

  // Skip anything inside something that is already animating
  if (el.parentElement && el.parentElement.closest(
    `${alreadyRevealing}, .gallery-item`
  )) return;

  const parent = el.parentElement;
  const count = staggerCount.get(parent) || 0;
  staggerCount.set(parent, count + 1);

  el.style.setProperty("--i", String(Math.min(count, 5)));
  el.classList.add("reveal-fade");
});

// Give the home cards a staggered delay as before
document.querySelectorAll(".portfolio-card").forEach((card, i) => {
  card.style.setProperty("--i", i);
});

const revealItems = document.querySelectorAll(
  ".reveal-lines, .reveal-fade, .portfolio-card"
);

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const textObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("in-view", entry.isIntersecting);
    });
  }, { threshold: 0.15 });

  revealItems.forEach((item) => textObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}
// Home header: add "is-scrolled" once the page moves
const homeHeader = document.querySelector(".home-page .site-header");

if (homeHeader) {
  const updateHeader = () => {
    homeHeader.classList.toggle("is-scrolled", window.scrollY > 40);
  };

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
}

// Shrink the hero title as the page scrolls
const heroTitle = document.querySelector(".home-showreel-title");

if (heroTitle && !reducedMotion.matches) {
  const updateHeroTitle = () => {
    // 0 at the top, 1 after scrolling 70% of the screen height
    const progress = Math.min(
      Math.max(window.scrollY / (window.innerHeight * 0.7), 0),
      1
    );

    heroTitle.style.setProperty("--title-scale", String(1 - progress * 0.6));
    heroTitle.style.setProperty("--title-fade", String(1 - progress));
  };

  window.addEventListener("scroll", updateHeroTitle, { passive: true });
  updateHeroTitle();
}

// Flip the page to dark while the services section is under the header
const servicesSection = document.querySelector(".home-services");
const servicesLine = document.querySelector(".home-services .section-heading");
const servicesList = document.querySelector(".home-services .service-list");
const mainHeader = document.querySelector(".site-header");

if (
  servicesSection && servicesLine && servicesList && mainHeader &&
  document.body.classList.contains("home-page")
) {
    const checkTheme = () => {
    const headerBottom = mainHeader.getBoundingClientRect().bottom;
    const lineTop = servicesLine.getBoundingClientRect().top;

    // Dark once the line has reached the header, and stays dark
    // until you scroll back up and the line drops below it again
    document.body.classList.toggle("is-dark", lineTop <= headerBottom);
  };

  window.addEventListener("scroll", checkTheme, { passive: true });
  window.addEventListener("resize", checkTheme);
  checkTheme();
}

// Contact form -> Formspree
const enquiryForm = document.getElementById("enquiry-form");

if (enquiryForm) {
  enquiryForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = enquiryForm.querySelector('button[type="submit"]');
    const note = enquiryForm.querySelector(".contact-form-foot p");

    button.disabled = true;
    button.textContent = "Sending…";

    try {
      const response = await fetch(enquiryForm.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(enquiryForm),
      });

      if (!response.ok) throw new Error("Request failed");

      note.textContent =
        "Your brief has been sent. We'll be in touch within one working day.";
      button.textContent = "Brief sent ✓";
      enquiryForm.reset();
    } catch (error) {
      note.textContent =
        "Something went wrong. Please try again or email getswooshd@gmail.com.";
      button.disabled = false;
      button.textContent = "Send the brief";
    }
  });
}