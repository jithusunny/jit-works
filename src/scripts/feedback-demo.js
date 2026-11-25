// A local demonstration: no requests, storage or customer messages.
(() => {
  const scene = document.querySelector(".review-demo");
  if (!scene) return;
  scene.classList.add("feedback-ready");
  const screen = scene.querySelector(".review-screen");
  const target = scene.querySelector(".pickup-target");
  const list = scene.querySelector(".sample-comments");
  const replay = scene.querySelector(".replay-review");
  const pause = scene.querySelector(".pause-review");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const example =
    "Can “Free pickup” be smaller and softer? The order total should stand out more.";
  const initial = [
    {
      text: "Can we show when an order will be ready to collect?",
      anchor: ".collection-example",
      reply: "Yes. I’ll show the collection time beside this option.",
    },
    {
      text: "Please let customers change the quantity here.",
      anchor: ".order-item",
      reply: "Yes. I’ll add a quantity control beside the item.",
    },
  ];
  let selectedTarget = target;
  scene.querySelector(".client-comment")?.remove();
  list.innerHTML =
    '<button class="comments-toggle" type="button" aria-expanded="true" aria-controls="sample-comments-body"><span>Feedback <b>2</b></span><span class="collapse-glyph" aria-hidden="true">−</span></button><div id="sample-comments-body"><div class="feedback-list" tabindex="0" aria-label="Comments, scroll for more"></div><button class="feedback-submit" type="button">Submit feedback <span aria-hidden="true">↗</span></button></div><p class="feedback-status" role="status" hidden></p>';
  const composer = document.createElement("div");
  composer.className = "feedback-composer";
  composer.id = "client-comment";
  composer.hidden = true;
  composer.setAttribute("role", "group");
  composer.setAttribute("aria-label", "Comment on the pickup note");
  composer.innerHTML =
    '<div class="feedback-person"><img src="/assets/portfolio/tony-jose.webp" alt=""><b>Tony Jose</b><button class="feedback-close" type="button" aria-label="Close comment">×</button></div><label class="feedback-label" for="feedback-text">Your comment</label><textarea id="feedback-text" rows="2" maxlength="400" placeholder="What would you like to change?"></textarea><div class="feedback-response" hidden><b>Jithu</b><p></p></div><div class="feedback-actions"><button class="feedback-delete" type="button" hidden>Delete</button><button class="feedback-edit" type="button" hidden>Edit</button><button class="feedback-add" type="button">Add <span aria-hidden="true">↵</span></button></div>';
  screen.append(composer);
  const cursor = document.createElement("div");
  cursor.className = "feedback-cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML =
    '<svg viewBox="0 0 24 30"><path d="M3 1v22l5.8-5.6 4.6 10.3 4.1-1.9-4.7-10.2H22Z"/></svg><span></span>';
  screen.append(cursor);
  const confirmation = document.createElement("div");
  confirmation.className = "feedback-confirmation";
  confirmation.hidden = true;
  confirmation.innerHTML =
    '<span role="status">Comment added · 3 comments</span><button type="button">View feedback</button>';
  screen.append(confirmation);
  function revealFeedback() {
    confirmation.hidden = true;
    list.scrollIntoView({
      block: "center",
      behavior: reduced.matches ? "instant" : "smooth",
    });
  }
  confirmation
    .querySelector("button")
    .addEventListener("click", revealFeedback);
  const textarea = composer.querySelector("textarea");
  const add = composer.querySelector(".feedback-add");
  const edit = composer.querySelector(".feedback-edit");
  const del = composer.querySelector(".feedback-delete");
  const rows = list.querySelector(".feedback-list");
  const toggle = list.querySelector(".comments-toggle");
  const body = list.querySelector("#sample-comments-body");
  const status = list.querySelector(".feedback-status");
  const submit = list.querySelector(".feedback-submit");
  target.setAttribute("aria-controls", composer.id);
  target.setAttribute("aria-expanded", "false");
  let comments = [],
    selected = null,
    nextId = 3;
  let playing = false,
    started = false,
    visible = false,
    replayRequested = false;
  let elapsed = 0,
    previous = 0,
    raf = 0,
    phase = "",
    announced = false;

  function syncHighlight() {
    scene.dataset.demoPaused = String(
      (!playing && !pause.hidden) || !visible || document.hidden,
    );
  }
  function setPhase(value) {
    if (phase === value) return;
    phase = value;
    scene.dataset.phase = value;
  }
  function renderRows() {
    rows.replaceChildren();
    comments.forEach((comment) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "feedback-row";
      button.dataset.comment = String(comment.id);
      button.setAttribute("aria-pressed", String(selected === comment.id));
      const number = document.createElement("span");
      number.textContent = comment.id;
      const excerpt = document.createElement("span");
      excerpt.textContent = comment.text;
      button.append(number, excerpt);
      button.addEventListener("click", () => {
        stop();
        setPhase("reading");
        openComment(comment.id, true);
      });
      rows.append(button);
    });
    toggle.querySelector("b").textContent = comments.length;
    rows.setAttribute(
      "aria-label",
      comments.length + " comments, scroll for more",
    );
  }
  function positionComposer() {
    if (composer.hidden) return;
    const s = screen.getBoundingClientRect(),
      t = selectedTarget.getBoundingClientRect();
    const compact = screen.clientWidth < 420;
    const width = Math.min(
      compact ? screen.clientWidth - 24 : screen.clientWidth * 0.48,
      330,
    );
    composer.style.width = width + "px";
    const left = Math.max(
      10,
      Math.min(t.left - s.left, screen.clientWidth - width - 10),
    );
    composer.style.left = left + "px";
    const height = composer.offsetHeight;
    let top = t.bottom - s.top + 9;
    const listRect = list.getBoundingClientRect();
    const crossesList =
      left < listRect.right - s.left &&
      left + width > listRect.left - s.left &&
      top + height > listRect.top - s.top - 8;
    const above = top + height > screen.clientHeight - 8 || crossesList;
    if (above) top = t.top - s.top - height - 9;
    composer.classList.toggle("above", above);
    composer.style.top = Math.max(8, top) + "px";
    const words = (
      selectedTarget.querySelector(".pickup-wording") || selectedTarget
    ).getBoundingClientRect();
    composer.style.setProperty(
      "--pointer-x",
      Math.min(
        width - 18,
        Math.max(18, words.left - s.left + words.width / 2 - left),
      ) + "px",
    );
  }
  function closeComment(focus = false) {
    composer.hidden = true;
    selected = null;
    selectedTarget.classList.remove("feedback-selected");
    selectedTarget = target;
    target.setAttribute("aria-expanded", "false");
    scene.dataset.selectedComment = "none";
    renderRows();
    if (focus) target.focus({ preventScroll: true });
  }
  function openComment(id = null, focus = false) {
    confirmation.hidden = true;
    selected = id;
    const comment = comments.find((c) => c.id === id);
    selectedTarget.classList.remove("feedback-selected");
    selectedTarget = comment ? scene.querySelector(comment.anchor) : target;
    selectedTarget.classList.add("feedback-selected");
    composer.dataset.mode = comment ? "read" : "write";
    const response = composer.querySelector(".feedback-response");
    response.hidden = !comment?.reply;
    response.querySelector("p").textContent = comment?.reply || "";
    composer.setAttribute(
      "aria-label",
      comment?.anchor === ".order-item"
        ? "Comment on the item quantity"
        : comment?.anchor === ".collection-example"
          ? "Comment on collection time"
          : "Comment on the pickup note",
    );
    textarea.value = comment?.text || "";
    textarea.readOnly = Boolean(comment);
    edit.hidden = del.hidden = !comment;
    add.hidden = Boolean(comment);
    add.textContent = "Add ↵";
    composer.hidden = false;
    target.setAttribute("aria-expanded", String(selectedTarget === target));
    scene.dataset.selectedComment = id === null ? "draft" : String(id);
    positionComposer();
    renderRows();
    if (focus) {
      (comment ? edit : textarea).focus({ preventScroll: true });
      const rect = composer.getBoundingClientRect();
      if (rect.top < 90 || rect.bottom > innerHeight - 12)
        composer.scrollIntoView({ block: "center", behavior: "instant" });
    }
  }
  function saveComment(automatic = false) {
    const value = textarea.value.trim();
    if (!value) {
      if (!automatic) textarea.focus();
      return;
    }
    let comment = comments.find((c) => c.id === selected);
    if (comment) {
      comment.text = value;
      comment.reply = "";
    } else {
      comment = {
        id: nextId++,
        text: value,
        anchor: ".pickup-target",
        reply:
          value === example
            ? "Yes. I’ll soften the pickup note and bring the total forward."
            : "",
      };
      comments.push(comment);
    }
    closeComment();
    const row = rows.querySelector('[data-comment="' + comment.id + '"]');
    row.classList.add("feedback-new");
    row.addEventListener(
      "animationend",
      () => row.classList.remove("feedback-new"),
      { once: true },
    );
    rows.scrollTop = rows.scrollHeight;
    setPhase("added");
    if (!automatic) row.focus({ preventScroll: true });
    if (
      automatic &&
      matchMedia(
        "(max-width:950px) and (max-height:500px) and (orientation:landscape)",
      ).matches
    ) {
      const bounds = list.getBoundingClientRect();
      if (bounds.top < 0 || bounds.bottom > innerHeight) {
        if (replayRequested) revealFeedback();
        else {
          const s = screen.getBoundingClientRect(),
            t = target.getBoundingClientRect();
          confirmation.style.left = Math.max(8, t.left - s.left) + "px";
          confirmation.style.top = t.bottom - s.top + 9 + "px";
          confirmation.hidden = false;
        }
      }
    }
  }
  function stop() {
    started = true;
    playing = false;
    cancelAnimationFrame(raf);
    raf = 0;
    pause.hidden = true;
    cursor.classList.remove("visible", "pressed");
    syncHighlight();
  }
  function clearResult() {
    status.hidden = true;
    status.textContent = "";
    submit.innerHTML = 'Submit feedback <span aria-hidden="true">↗</span>';
  }
  function reset() {
    stop();
    started = false;
    elapsed = 0;
    previous = 0;
    announced = false;
    replayRequested = false;
    confirmation.hidden = true;
    comments = initial.map((comment, i) => ({ id: i + 1, ...comment }));
    nextId = 3;
    closeComment();
    textarea.value = "";
    body.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    toggle.querySelector(".collapse-glyph").textContent = "−";
    rows.scrollTop = 0;
    clearResult();
    setPhase("idle");
  }
  function center(element) {
    const s = screen.getBoundingClientRect(),
      r = element.getBoundingClientRect();
    return {
      x: r.left - s.left + r.width * 0.5,
      y: r.top - s.top + r.height * 0.5,
    };
  }
  function placeCursor(from, to, progress) {
    const t = Math.max(0, Math.min(1, progress)),
      eased = t * t * (3 - 2 * t);
    cursor.style.left = from.x + (to.x - from.x) * eased + "px";
    cursor.style.top = from.y + (to.y - from.y) * eased + "px";
    cursor.classList.add("visible");
  }
  function tick(now) {
    raf = 0;
    if (!playing || !visible || document.hidden) return;
    elapsed += previous ? Math.min(now - previous, 80) : 0;
    previous = now;
    const targetPoint = center(target.querySelector(".pickup-wording"));
    const start = {
      x: Math.min(screen.clientWidth - 18, targetPoint.x + 115),
      y: Math.min(screen.clientHeight - 20, targetPoint.y + 85),
    };
    cursor.classList.remove("pressed");
    if (elapsed < 550) setPhase("idle");
    else if (elapsed < 1550) {
      setPhase("pointing");
      placeCursor(start, targetPoint, (elapsed - 550) / 1000);
    } else if (elapsed < 1850) {
      setPhase("clicking");
      placeCursor(targetPoint, targetPoint, 1);
      cursor.classList.add("pressed");
    } else if (elapsed < 5100) {
      if (phase !== "typing") {
        setPhase("typing");
        openComment();
      }
      cursor.classList.remove("visible");
      textarea.value = example.slice(
        0,
        Math.floor(Math.max(0, elapsed - 2200) / 35),
      );
    } else if (elapsed < 5800) {
      textarea.value = example;
      setPhase("adding");
      placeCursor(targetPoint, center(add), (elapsed - 5100) / 550);
      cursor.classList.toggle("pressed", elapsed > 5650);
    } else {
      if (!announced) {
        announced = true;
        saveComment(true);
      }
      cursor.classList.remove("visible", "pressed");
      // Keep the completed result visible for five seconds before the next cycle.
      if (elapsed >= 10800) {
        play();
        return;
      }
    }
    raf = requestAnimationFrame(tick);
  }
  function resume() {
    syncHighlight();
    previous = 0;
    if (playing && visible && !document.hidden && !raf)
      raf = requestAnimationFrame(tick);
  }
  function play(userReplay = false) {
    reset();
    started = true;
    replayRequested = userReplay;
    if (reduced.matches) return;
    playing = true;
    pause.hidden = false;
    pause.textContent = "Pause";
    resume();
  }
  rows.addEventListener("focusin", stop);
  rows.addEventListener("pointerdown", stop);
  target.addEventListener("click", () => {
    started = true;
    stop();
    setPhase("composing");
    openComment(null, true);
  });
  add.addEventListener("click", () => {
    stop();
    saveComment();
  });
  textarea.addEventListener("pointerdown", stop);
  textarea.addEventListener("focus", stop);
  textarea.addEventListener("input", stop);
  textarea.addEventListener("keydown", (event) => {
    stop();
    if (event.key === "Enter" && !event.shiftKey && !textarea.readOnly) {
      event.preventDefault();
      saveComment();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeComment(true);
    }
  });
  edit.addEventListener("click", () => {
    stop();
    composer.dataset.mode = "write";
    composer.querySelector(".feedback-response").hidden = true;
    textarea.readOnly = false;
    edit.hidden = true;
    add.hidden = false;
    add.textContent = "Save ↵";
    positionComposer();
    textarea.focus();
  });
  del.addEventListener("click", () => {
    stop();
    comments = comments.filter((c) => c.id !== selected);
    closeComment(true);
  });
  composer.querySelector(".feedback-close").addEventListener("click", () => {
    stop();
    closeComment(true);
  });
  toggle.addEventListener("click", () => {
    started = true;
    stop();
    body.hidden = !body.hidden;
    toggle.setAttribute("aria-expanded", String(!body.hidden));
    toggle.querySelector(".collapse-glyph").textContent = body.hidden
      ? "+"
      : "−";
  });
  submit.addEventListener("click", () => {
    started = true;
    stop();
    status.hidden = false;
    status.textContent = "Preview only. No feedback was sent.";
    submit.textContent = "Nothing sent";
  });
  function bringIntoView() {
    if (scene.getBoundingClientRect().height > innerHeight - 40)
      target.scrollIntoView({ block: "center", behavior: "instant" });
    else scene.scrollIntoView({ block: "center", behavior: "instant" });
  }
  replay.addEventListener("click", () => {
    bringIntoView();
    play(true);
  });
  pause.addEventListener("click", () => {
    if (playing) {
      playing = false;
      cancelAnimationFrame(raf);
      raf = 0;
      pause.textContent = "Resume";
      syncHighlight();
    } else {
      playing = true;
      pause.textContent = "Pause";
      bringIntoView();
      resume();
    }
  });
  new ResizeObserver(positionComposer).observe(screen);
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      syncHighlight();
      if (!visible) {
        cancelAnimationFrame(raf);
        raf = 0;
        previous = 0;
      } else if (!started && !reduced.matches) play();
      else resume();
    },
    { threshold: 0.8 },
  ).observe(target);
  document.addEventListener("visibilitychange", () => {
    syncHighlight();
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
      previous = 0;
    } else resume();
  });
  reduced.addEventListener("change", () => {
    if (reduced.matches) {
      stop();
      closeComment();
      setPhase("idle");
    }
  });
  reset();
})();
