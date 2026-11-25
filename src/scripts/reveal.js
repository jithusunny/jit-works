const reduced = matchMedia("(prefers-reduced-motion: reduce)");
// Content is always visible. Entrance motion is progressive and never gates reading.
const observed = new WeakSet();
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || observed.has(entry.target)) continue;
      observed.add(entry.target);
      if (!reduced.matches)
        entry.target.animate(
          [
            { opacity: 0.75, transform: "translateY(12px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 460, easing: "cubic-bezier(.2,.7,.2,1)" },
        );
      observer.unobserve(entry.target);
    }
  },
  { threshold: 0.12 },
);
document
  .querySelectorAll(".reveal,.process-row")
  .forEach((el) => observer.observe(el));
reduced.addEventListener("change", () => {
  if (reduced.matches) document.getAnimations().forEach((a) => a.cancel());
});
