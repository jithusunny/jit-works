(() => {
  const dialog = document.querySelector("#media-dialog"),
    content = document.querySelector("#dialog-content"),
    title = document.querySelector("#dialog-title"),
    close = document.querySelector("#dialog-close");
  const descriptions = {
    "update.webp":
      "Mira shop update, 18 to 22 November. Shop collection, clear collection details and order tracking are ready to try. Screenshots show the checkout choice and orders grouped by their status.",
    "decision.webp":
      "Which design do you prefer? Mira homepage option A: warm and light, with a cream background. Option B: rich and bold, with a deep green background. Reply A or B.",
    "guide.webp":
      "Add your shop to your iPhone Home Screen. Open Safari, then the link I sent you. Tap More beside the address, or Share if already visible. Tap Share, then Add to Home Screen. If missing, open Edit Actions to add it. Turn on Open as Web App, then tap Add. Next time, tap Mira on your Home Screen.",
  };
  let opener,
    gallery = [],
    current = 0;
  // Reserve only the caption's actual height; keep it directly beside the media.
  new ResizeObserver(() =>
    dialog.style.setProperty("--caption-height", title.offsetHeight + "px"),
  ).observe(title);
  // Each image opens its full-resolution original. No frames or editing controls.
  for (const image of document.querySelectorAll(
    ".project-visual img,.more-grid img,.collage-piece img",
  )) {
    if (image.closest("a,.project-identity")) continue;
    const a = document.createElement("a");
    a.href = (image.currentSrc || image.src).replace(
      "/assets/portfolio/previews/",
      "/assets/portfolio/",
    );
    a.dataset.image = a.href;
    a.dataset.title = image.alt;
    a.className = "inspect-image";
    a.setAttribute("aria-label", "Enlarge " + image.alt);
    const target = image.closest("picture") || image;
    target.before(a);
    a.append(target);
  }
  function original(a) {
    const picture = a.querySelector("picture"),
      image = a.querySelector("img");
    const matching =
      picture &&
      [...picture.querySelectorAll("source")].find(
        (s) => !s.media || matchMedia(s.media).matches,
      );
    const src =
      matching?.srcset.split(",")[0].trim().split(/\s+/)[0] ||
      a.dataset.image ||
      image?.currentSrc ||
      image?.src;
    return new URL(src, document.baseURI).href.replace(
      "/assets/portfolio/previews/",
      "/assets/portfolio/",
    );
  }
  function groupFor(a) {
    const scope = a.closest(
      ".product-collage,.project-panel,.more-grid article,.process-row,.creative-cards",
    );
    const links = scope ? [...scope.querySelectorAll("[data-image]")] : [a];
    const seen = new Set();
    return links
      .filter(
        (link) => link.getClientRects().length && !link.closest("[hidden]"),
      )
      .map((link) => ({
        src: original(link),
        title:
          link.dataset.title ||
          link.querySelector("img")?.alt ||
          "Project image",
      }))
      .filter((item) => {
        if (seen.has(item.src)) return false;
        seen.add(item.src);
        return true;
      });
  }
  function renderImage() {
    const item = gallery[current],
      media = document.createElement("img");
    content.replaceChildren();
    title.textContent = item.title;
    media.src = item.src;
    media.alt = descriptions[item.src.split("/").at(-1)] || item.title;
    media.draggable = false;
    content.append(media);
  }
  function show(a) {
    opener = a;
    content.querySelector("video")?.pause();
    content.replaceChildren();
    dialog.dataset.device = "";
    dialog.dataset.kind = a.dataset.film ? "film" : "image";
    gallery = [];
    current = 0;
    if (a.dataset.film) {
      title.textContent = a.dataset.title || "Project film";
      const media = document.createElement("video");
      media.src = a.dataset.film;
      media.controls = true;
      media.playsInline = true;
      content.append(media);
    } else {
      gallery = groupFor(a);
      current = gallery.findIndex((item) => item.src === original(a));
      if (current < 0) {
        gallery = [
          {
            src: original(a),
            title:
              a.dataset.title || a.querySelector("img")?.alt || "Project image",
          },
        ];
        current = 0;
      }
      renderImage();
    }
    dialog.showModal();
    document.body.style.overflow = "hidden";
    close.focus();
  }
  title.setAttribute("aria-live", "polite");
  dialog.addEventListener("keydown", (e) => {
    if (
      !dialog.open ||
      gallery.length < 2 ||
      e.altKey ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey
    )
      return;
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    e.stopPropagation();
    current = (current + step + gallery.length) % gallery.length;
    renderImage();
  });
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-image],[data-film]");
    if (!a || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
    e.preventDefault();
    show(a);
  });
  close.onclick = () => dialog.close();
  dialog.addEventListener("click", (e) => {
    if (!e.target.closest("img,video,button")) dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    content.querySelector("video")?.pause();
    content.replaceChildren();
    gallery = [];
    current = 0;
    document.body.style.overflow = "";
    opener?.focus({ preventScroll: true });
  });
})();
