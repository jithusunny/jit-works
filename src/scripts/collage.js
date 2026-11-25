(() => {
  const collage = document.querySelector(".product-collage");
  if (!collage) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false;
  function sync() {
    collage.dataset.running = String(
      visible && !document.hidden && !reduced.matches,
    );
  }
  new IntersectionObserver(
    (e) => {
      visible = e[0].isIntersecting;
      sync();
    },
    { threshold: 0.1 },
  ).observe(collage);
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
  sync();
})();
