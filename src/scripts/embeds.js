// Native iframe lazy-loading can start several screens early on mobile.
// Load the two interactive samples only as the visitor approaches them.
const embeds = new IntersectionObserver(entries => {
  for (const { target, isIntersecting } of entries) {
    if (!isIntersecting) continue;
    target.src = target.dataset.src;
    embeds.unobserve(target);
  }
}, { rootMargin: "160px" });
document.querySelectorAll("iframe[data-src]").forEach(frame => embeds.observe(frame));
