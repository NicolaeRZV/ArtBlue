// Smooth scroll for in-page navigation
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    const headerOffset = 80;
    const elementPosition = target.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  });
});

// Reveal on scroll animation
const revealElements = () => {
  const revealables = document.querySelectorAll(
    ".stage-content, .overview, .timeline-track, .step-card, .problem-card, .market-card, .plan-card, .gallery-grid"
  );

  revealables.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.85;
    if (inView) {
      el.classList.add("reveal-on-scroll", "is-visible");
    }
  });
};

// Initialize classes before first check
document.addEventListener("DOMContentLoaded", () => {
  const revealables = document.querySelectorAll(
    ".stage-content, .overview, .timeline-track, .step-card, .problem-card, .market-card, .plan-card, .gallery-grid"
  );
  revealables.forEach((el) => el.classList.add("reveal-on-scroll"));

  revealElements();

  initUserGallery();
});

window.addEventListener("scroll", revealElements);

// Timeline active step based on scroll
const stageSections = document.querySelectorAll(".stage");
const timelineSteps = document.querySelectorAll(".timeline-step");

// Active stage on scroll (used to sync diagram animations + text highlight)
const updateActiveStages = () => {
  const activeLine = window.innerHeight * 0.55;
  let activeIndex = -1;

  stageSections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= activeLine && rect.bottom >= activeLine) {
      activeIndex = index;
    }
  });

  stageSections.forEach((section, index) => {
    section.classList.toggle("stage--active", index === activeIndex);
  });
};

const updateTimeline = () => {
  let activeIndex = 0;

  stageSections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    const midpoint = window.innerHeight * 0.5;
    if (rect.top <= midpoint) {
      activeIndex = index + 1; // +1 because first step is "Surse regenerabile"
    }
  });

  timelineSteps.forEach((step, i) => {
    step.classList.toggle("active", i <= activeIndex);
  });
};

window.addEventListener("scroll", updateTimeline);
window.addEventListener("load", updateTimeline);

window.addEventListener("scroll", updateActiveStages, { passive: true });
window.addEventListener("load", updateActiveStages);

// User gallery (local preview only)
const initUserGallery = () => {
  const input = document.getElementById("photoInput");
  const grid = document.getElementById("userGallery");
  const clearBtn = document.getElementById("clearPhotosBtn");

  if (!input || !grid || !clearBtn) return;

  const section = grid.closest(".gallery");

  /** @type {string[]} */
  let objectUrls = [];

  const setEmptyState = () => {
    if (grid.children.length > 0) return;
    const empty = document.createElement("div");
    empty.className = "gallery-empty";
    empty.innerHTML =
      "<strong>Trage pozele aici</strong><div>Poți da drag &amp; drop cu mai multe imagini odată.</div>";
    grid.appendChild(empty);
    section?.classList.remove("has-items");
  };

  const clearGrid = () => {
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
    objectUrls = [];
    grid.innerHTML = "";
    setEmptyState();
  };

  const addFiles = (files) => {
    const list = Array.from(files || []).filter((f) => f && f.type && f.type.startsWith("image/"));
    if (list.length === 0) return;

    const empty = grid.querySelector(".gallery-empty");
    if (empty) empty.remove();
    section?.classList.add("has-items");

    list.forEach((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.push(url);

      const item = document.createElement("div");
      item.className = "gallery-item reveal-on-scroll is-visible";

      const img = document.createElement("img");
      img.src = url;
      img.alt = file.name ? `Poză încărcată: ${file.name}` : "Poză încărcată";
      img.loading = "lazy";

      item.appendChild(img);
      grid.appendChild(item);
    });
  };

  input.addEventListener("change", () => {
    addFiles(input.files);
    input.value = "";
  });

  clearBtn.addEventListener("click", clearGrid);

  // Drag & drop
  let dragDepth = 0;

  const prevent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragEnter = (e) => {
    prevent(e);
    dragDepth += 1;
    grid.classList.add("is-dragover");
  };

  const onDragOver = (e) => {
    prevent(e);
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    grid.classList.add("is-dragover");
  };

  const onDragLeave = (e) => {
    prevent(e);
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) grid.classList.remove("is-dragover");
  };

  const onDrop = (e) => {
    prevent(e);
    dragDepth = 0;
    grid.classList.remove("is-dragover");
    addFiles(e.dataTransfer?.files);
  };

  ["dragenter", "dragover", "dragleave", "drop"].forEach((type) => {
    grid.addEventListener(type, prevent);
  });
  grid.addEventListener("dragenter", onDragEnter);
  grid.addEventListener("dragover", onDragOver);
  grid.addEventListener("dragleave", onDragLeave);
  grid.addEventListener("drop", onDrop);

  setEmptyState();
};

