(() => {
  const tabs = [...document.querySelectorAll("[data-life]")],
    panel = document.querySelector("#life-feature");
  if (!panel) return;
  const descriptions = {
    pulse:
      "Remember what happened, who was there and the details you wanted to keep.",
    people:
      "Conversations with Amma, dates and small details you want to remember.",
    places:
      "The entrance, parking and small details that make your next visit easier.",
    shopping:
      "The right size, the preferred brand, and what you have already bought.",
  };
  function select(tab, focus = false) {
    const key = tab.dataset.life,
      name = tab.textContent;
    tabs.forEach((t) => {
      const active = t === tab;
      t.setAttribute("aria-selected", String(active));
      t.tabIndex = active ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", tab.id);
    panel.dataset.feature = key;
    panel.querySelector(".life-feature-summary").textContent =
      descriptions[key];
    for (const device of ["tablet", "phone"]) {
      const img = panel.querySelector(".life-" + device + "-image"),
        link = img.closest("a");
      img.src =
        "/assets/portfolio/previews/life-" + key + "-" + device + ".webp";
      img.alt = "LifeSuite " + name + " on a " + device;
      link.href = img.src.replace(
        "/assets/portfolio/previews/",
        "/assets/portfolio/",
      );
      link.dataset.image = img
        .getAttribute("src")
        .replace("/assets/portfolio/previews/", "/assets/portfolio/");
      link.dataset.title = "LifeSuite · " + name;
      link.setAttribute(
        "aria-label",
        "Enlarge LifeSuite " + name + " on a " + device,
      );
    }
    panel.querySelector(".life-shopping-film").hidden = key !== "shopping";
    if (focus) tab.focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (e) => {
      let n;
      if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
      if (e.key === "ArrowLeft") n = (i + tabs.length - 1) % tabs.length;
      if (e.key === "Home") n = 0;
      if (e.key === "End") n = tabs.length - 1;
      if (n !== undefined) {
        e.preventDefault();
        select(tabs[n], true);
      }
    });
  });
})();
