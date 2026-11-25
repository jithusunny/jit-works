(() => {
  const frame = document.querySelector(".board-device .laptop-display"),
    iframe = frame.querySelector("iframe");
  function size() {
    const phone = matchMedia("(max-width:700px)").matches,
      w = phone ? 390 : 1200,
      h = phone ? 844 : 760;
    iframe.style.setProperty("width", w + "px", "important");
    iframe.style.setProperty("height", h + "px", "important");
    iframe.style.transformOrigin = "top left";
    iframe.style.transform = "scale(" + frame.clientWidth / w + ")";
    iframe.style.paddingTop = "0";
    iframe.style.marginTop = phone ? "22px" : "0";
  }
  new ResizeObserver(size).observe(frame);
  size();
})();
