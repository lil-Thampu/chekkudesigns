/*
  Photos must still be numbered:

  1.jpg
  2.png
  3.jpeg
  4.webp

  Each photo can use a different format.
*/

const collections = [
  {
    gridId: "cataloguing-grid",
    folder: "portfolio-media/ai-cataloguing",
    count: 6,
    label: "AI cataloguing project"
  },
  {
    gridId: "mood-grid",
    folder: "portfolio-media/ai-mood-shots",
    count: 6,
    label: "AI mood shot"
  },
  {
    gridId: "art-grid",
    folder: "portfolio-media/art-direction",
    count: 11,
    label: "Art direction project"
  },
  {
    gridId: "event-grid",
    folder: "portfolio-media/event-design",
    count: 9,
    label: "Event design project"
  },
    {
  gridId: "caratlane-grid",
  folder: "portfolio-media/store-design/caratlane",
  count: 6,
  label: "Caratlane store design"
},
{
  gridId: "fastrack-grid",
  folder: "portfolio-media/store-design/fastrack",
  count: 3,
  label: "Fastrack store design"
},
{
  gridId: "runway-grid",
  folder: "portfolio-media/store-design/runway",
  count: 4,
  label: "Runway store design"
},
{
  gridId: "titan-grid",
  folder: "portfolio-media/store-design/titan-eye-plus-4",
  count: 4,
  label: "Titan Eye+4 store design"
},
  {
    gridId: "packaging-grid",
    folder: "portfolio-media/packaging",
    count: 3,
    label: "Packaging design project"
  },
  {
    gridId: "social-grid",
    folder: "portfolio-media/social-media",
    count: 8,
    label: "Social media content project"
  }
];

// The gallery tries these formats in this order.
const imageFormats = ["jpg", "jpeg", "png", "webp"];

collections.forEach((collection) => {
  const grid = document.getElementById(collection.gridId);

  if (!grid) return;

  for (let number = 1; number <= collection.count; number++) {
    const figure = document.createElement("figure");
    figure.className = "gallery-item";

    const image = document.createElement("img");
    image.alt = `${collection.label} ${number} by Swoosh Designs`;
    image.loading = "lazy";

    let formatIndex = 0;

    function tryNextFormat() {
      if (formatIndex >= imageFormats.length) {
        figure.classList.add("gallery-item-error");
        figure.textContent =
          `Photo ${number} not found in ${collection.folder}. ` +
          `Check its name and extension.`;
        return;
      }

      const extension = imageFormats[formatIndex];
      formatIndex++;

      image.src = `${collection.folder}/${number}.${extension}`;
    }

    image.addEventListener("error", tryNextFormat);
    figure.appendChild(image);

    const caption = document.createElement("figcaption");
    caption.className = "overlay-caption";
    caption.textContent = `${collection.label} ${number}`;
    figure.appendChild(caption);

    
    grid.appendChild(figure);

    tryNextFormat();
  }
});

// Reveal gallery photos as they scroll into view
const revealTargets = document.querySelectorAll(".gallery-item");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (revealTargets.length && "IntersectionObserver" in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  revealTargets.forEach((item) => revealObserver.observe(item));
} else {
  revealTargets.forEach((item) => item.classList.add("in-view"));
}

// ==========================================
// Category list and individual gallery views
// ==========================================

const sections = [...document.querySelectorAll(".gallery-section")];
const intro = document.querySelector(".gallery-intro");
const categoryNav = document.querySelector(".gallery-nav");
const contact = document.querySelector(".gallery-contact");

// Add a back link before the category sections.
const backLink = document.createElement("a");
backLink.className = "gallery-back";
backLink.href = "work.html";
backLink.textContent = "← Back to all work";
backLink.hidden = true;

if (sections.length) {
  sections[0].before(backLink);
}

// Turn each category title into a clickable link.
// The existing IDs also make browser back/forward navigation work.
sections.forEach((section) => {
  const title = section.querySelector(".gallery-heading h2");

  if (!title) return;

  const link = document.createElement("a");
  link.href = `#${section.id}`;
  link.textContent = title.textContent;
  link.className = "category-title-link";

  title.textContent = "";
  title.appendChild(link);
});

let hideCategoryPreview = () => {};

function updateGalleryView() {
  const selectedId = decodeURIComponent(window.location.hash.slice(1));
  const selectedSection = sections.find(
    (section) => section.id === selectedId
  );

  const galleryIsOpen = Boolean(selectedSection);

  sections.forEach((section) => {
    section.hidden = galleryIsOpen && section !== selectedSection;
  });

  if (intro) intro.hidden = galleryIsOpen;
  if (categoryNav) categoryNav.hidden = galleryIsOpen;
  if (contact) contact.hidden = galleryIsOpen;

  backLink.hidden = !galleryIsOpen;
  document.body.classList.toggle("gallery-view-open", galleryIsOpen);

  hideCategoryPreview();

  if (galleryIsOpen) {
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

window.addEventListener("hashchange", updateGalleryView);
updateGalleryView();


// ==========================================
// Floating category preview and slideshow
// ==========================================

const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

if (canHover.matches) {
  const preview = document.createElement("div");
  preview.className = "category-preview";
  preview.setAttribute("aria-hidden", "true");

  const previewImage = document.createElement("img");
  previewImage.alt = "";
  preview.appendChild(previewImage);
  document.body.appendChild(preview);

  let activeHeading = null;
  let pendingHeading = null;
  let previewDelayTimer = null;
  let slideshowTimer = null;
  let previewSession = 0;

    let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let animationFrame = null;
  let previewPositioned = false;

  function animatePreviewPosition() {
    // Smaller number = heavier, slower movement.
    const smoothness = 0.03;

    currentX += (targetX - currentX) * smoothness;
    currentY += (targetY - currentY) * smoothness;

    preview.style.left = `${currentX}px`;
    preview.style.top = `${currentY}px`;

    if (
      Math.abs(targetX - currentX) > 0.1 ||
      Math.abs(targetY - currentY) > 0.1
    ) {
      animationFrame = requestAnimationFrame(animatePreviewPosition);
    } else {
      animationFrame = null;
    }
  }

  function movePreview(event) {
    const gap = 25;
    const width = preview.offsetWidth;
    const height = preview.offsetHeight;

    targetX = Math.max(
      0,
      Math.min(event.clientX + gap, window.innerWidth - width - 10)
    );

    targetY = Math.max(
      10,
      Math.min(event.clientY - height - gap, window.innerHeight - height - 10)
    );

    // Place the preview immediately the first time it appears.
    if (!previewPositioned || reducedMotion.matches) {
      currentX = targetX;
      currentY = targetY;
      preview.style.left = `${currentX}px`;
      preview.style.top = `${currentY}px`;
      previewPositioned = true;
      return;
    }

    if (animationFrame === null) {
      animationFrame = requestAnimationFrame(animatePreviewPosition);
    }
  }

    function hidePreview() {
    clearTimeout(previewDelayTimer);
    previewDelayTimer = null;
    pendingHeading = null;
    activeHeading = null;
    previewSession++;

    clearTimeout(slideshowTimer);
    slideshowTimer = null;

    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    previewPositioned = false;
    preview.classList.remove("is-visible");
    previewImage.classList.remove("slide-in");
    preview.querySelector(".preview-old-image")?.remove();
  }

  hideCategoryPreview = hidePreview;

  function getPreviewPhotos(section) {
    const photos = [];

    // Store Design includes several grids; collect photos from each one.
    section.querySelectorAll(".gallery-grid[id]").forEach((grid) => {
      const collection = collections.find(
        (item) => item.gridId === grid.id
      );

      if (!collection) return;

      for (let number = 1; number <= collection.count; number++) {
        photos.push({
          folder: collection.folder,
          number
        });
      }
    });

    return photos;
  }

  function showSlideshow(section, heading, event) {
    hidePreview();

    const photos = getPreviewPhotos(section);

    // A video category can use a poster image as its preview.
    const video = section.querySelector("video");
    const videoPoster = video?.getAttribute("poster");

    if (!photos.length && videoPoster) {
      activeHeading = heading;
      movePreview(event);
      previewImage.src = videoPoster;
      preview.classList.add("is-visible");
      return;
    }

    // Without images or a video poster, don't show an empty preview.
    if (!photos.length) return;

    activeHeading = heading;
    const session = previewSession;
    let photoIndex = 0;

    movePreview(event);

    function showPhoto(attemptedPhotos = 0) {
      if (session !== previewSession || activeHeading !== heading) return;

      // Stop if none of the files in this category could be loaded.
      if (attemptedPhotos >= photos.length) {
        hidePreview();
        return;
      }

      const photo = photos[photoIndex];
      let formatIndex = 0;
      const testImage = new Image();

      function tryFormat() {
        if (session !== previewSession || activeHeading !== heading) return;

        if (formatIndex >= imageFormats.length) {
          photoIndex = (photoIndex + 1) % photos.length;
          showPhoto(attemptedPhotos + 1);
          return;
        }

        const extension = imageFormats[formatIndex++];
        testImage.src = `${photo.folder}/${photo.number}.${extension}`;
      }

      testImage.onload = () => {
        if (session !== previewSession || activeHeading !== heading) return;
        
              const alreadyVisible = preview.classList.contains("is-visible");

        // Remove any leftover image from a previous transition.
        preview.querySelector(".preview-old-image")?.remove();

        if (alreadyVisible && !reducedMotion.matches) {
          // Keep the current image underneath while the next one enters.
          const oldImage = previewImage.cloneNode();
          oldImage.className = "preview-old-image";
          preview.insertBefore(oldImage, previewImage);

          oldImage.addEventListener("animationend", () => {
            oldImage.remove();
          }, { once: true });
        }

        previewImage.classList.remove("slide-in");
        previewImage.src = testImage.src;

        if (alreadyVisible && !reducedMotion.matches) {
          // Restart the animation for the new image.
          void previewImage.offsetWidth;
          previewImage.classList.add("slide-in");
        }

        preview.classList.add("is-visible");

        // Keep a still image for visitors who prefer reduced motion.
        if (!reducedMotion.matches && photos.length > 1) {
          slideshowTimer = setTimeout(() => {
            photoIndex = (photoIndex + 1) % photos.length;
            showPhoto();
          }, 1200);
        }
      };

      testImage.onerror = tryFormat;
      tryFormat();
    }

    showPhoto();
  }

    function startSlideshow(section, heading, event) {
    // Stop the previous preview and cancel any pending one.
    hidePreview();

    pendingHeading = heading;

    // Use the latest mouse position if it moves during the delay.
    let x = event.clientX;
    let y = event.clientY;

    previewDelayTimer = setTimeout(() => {
      previewDelayTimer = null;

      if (pendingHeading !== heading) return;

      // mouseX and mouseY are updated by the pointermove listener below.
      if (mouseX >= 0 && mouseY >= 0) {
        x = mouseX;
        y = mouseY;
      }

      pendingHeading = null;
      showSlideshow(section, heading, { clientX: x, clientY: y });
    }, reducedMotion.matches ? 0 : 800);
  }

  sections.forEach((section) => {
    const heading = section.querySelector(".gallery-heading");

    if (!heading) return;

    heading.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse") return;
      if (document.body.classList.contains("gallery-view-open")) return;

      startSlideshow(section, heading, event);
    });

    heading.addEventListener("pointermove", (event) => {
      if (activeHeading === heading) {
        movePreview(event);
      }
    });

    heading.addEventListener("pointerleave", hidePreview);
  });

    previewImage.addEventListener("error", hidePreview);

  // Remember the mouse position so scrolling can update the preview,
  // even when the mouse is stationary.
  let mouseX = -1;
  let mouseY = -1;

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;

    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  window.addEventListener("scroll", () => {
    if (document.body.classList.contains("gallery-view-open")) {
      hidePreview();
      return;
    }

    if (mouseX < 0 || mouseY < 0) return;

    const element = document.elementFromPoint(mouseX, mouseY);
    const heading = element?.closest(".gallery-heading");
    const section = heading?.closest(".gallery-section");

    // Only use headings belonging to the Work category list.
    if (!heading || !section || !sections.includes(section)) {
      hidePreview();
      return;
    }

    // Keep the current slideshow running if we're still on the same heading.
      if (heading === activeHeading || heading === pendingHeading) return;

    // startSlideshow first hides the previous preview and stops its timer,
    // so only one category can be active at a time.
    startSlideshow(section, heading, {
      clientX: mouseX,
      clientY: mouseY
    });
  }, { passive: true });

  document.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) {
      mouseX = -1;
      mouseY = -1;
      hidePreview();
    }
  });
}

// ==========================================
// AI videos: autoplay (muted) while on screen
// ==========================================

const autoVideos = document.querySelectorAll(".gallery-item video");

if (
  autoVideos.length &&
  "IntersectionObserver" in window &&
  !reducedMotion.matches
) {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target: video, isIntersecting }) => {
      if (isIntersecting) {
        // Don't restart a video the visitor paused on purpose
        if (video.dataset.manualPause !== "true") {
          video.play().catch(() => {});
        }
      } else if (!video.paused) {
        video.dataset.autoPause = "true";
        video.pause();
      }
    });
  }, { threshold: 0.5 });

  autoVideos.forEach((video) => {
    video.muted = true;   // browsers only autoplay muted video
    video.loop = true;
    video.playsInline = true;

    video.addEventListener("pause", () => {
      if (video.dataset.autoPause === "true") {
        video.dataset.autoPause = "false";
        return;
      }
      if (!video.ended) video.dataset.manualPause = "true";
    });

    video.addEventListener("play", () => {
      video.dataset.manualPause = "false";
    });

    videoObserver.observe(video);
  });
}
