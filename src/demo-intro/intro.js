import { scenes, storyFrame, totalDuration } from "./story.js";
import { renderScreens } from "./screens.js";

/** @type {{ root: HTMLElement; clock: number; paused: boolean; reduced: boolean; visible: boolean; width: number; height: number; stageView: boolean; raf: number; last?: number; observer?: ResizeObserver; onMotion?: () => void; onVisibility?: () => void; onClick?: (e: Event) => void } | null} */
let live = null;

function fitFor(count) {
  return count >= 2 ? 1100 : 560;
}

function isStageView() {
  return new URLSearchParams(location.search).get("view") === "stage";
}

/**
 * @param {HTMLElement} host
 */
export function mountIntro(host) {
  unmountIntro();

  const stageView = isStageView();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.createElement("section");
  root.className = stageView ? "ap-intro ap-intro-stage" : "ap-intro";
  root.setAttribute("aria-label", "受入検査の照合と承認の使い方");
  root.innerHTML = stageView
    ? `
    <div class="ap-viewport" data-scene="0" data-time="0" data-paused="false">
      <div class="ap-stage" aria-hidden="true" inert></div>
    </div>
    <p class="ap-motion" hidden></p>
  `
    : `
    <div class="ap-intro-top"><span>使い方を見てみる</span><span>約36秒 · 架空データでの紹介</span></div>
    <div class="ap-viewport" data-scene="0" data-time="0" data-paused="false">
      <div class="ap-stage" aria-hidden="true" inert></div>
      <div class="ap-hud">
        <div class="ap-dots" aria-hidden="true">${scenes.map(() => "<span></span>").join("")}</div>
        <p></p>
      </div>
    </div>
    <div class="ap-controls">
      <p class="ap-status"></p>
      <div class="ap-btns">
        <button type="button" data-ap="pause" aria-label="紹介を一時停止する">Ⅱ 一時停止</button>
        <button type="button" data-ap="restart">最初から</button>
      </div>
    </div>
  `;
  host.appendChild(root);

  if (stageView) {
    document.documentElement.classList.add("ap-embed-stage-root");
    document.body.classList.add("ap-embed-stage-root");
  }

  const viewport = /** @type {HTMLElement} */ (root.querySelector(".ap-viewport"));
  const stage = /** @type {HTMLElement} */ (root.querySelector(".ap-stage"));
  const caption = /** @type {HTMLElement|null} */ (root.querySelector(".ap-hud p"));
  const dots = [...root.querySelectorAll(".ap-dots span")];
  const status = /** @type {HTMLElement|null} */ (root.querySelector(".ap-status"));
  const pauseBtn = /** @type {HTMLButtonElement|null} */ (root.querySelector('[data-ap="pause"]'));
  const btns = /** @type {HTMLElement|null} */ (root.querySelector(".ap-btns"));
  const motionEl = /** @type {HTMLElement|null} */ (root.querySelector(".ap-motion"));

  live = {
    root,
    clock: 0,
    paused: false,
    reduced,
    visible: !document.hidden,
    width: viewport.getBoundingClientRect().width || 720,
    height: viewport.getBoundingClientRect().height || 424,
    stageView,
    raf: 0,
  };
  /** @type {string} */
  let screenKey = "";

  const paint = () => {
    if (!live) return;
    const current = storyFrame(live.clock);
    const index = live.reduced ? scenes.length - 1 : current.index;
    const camera = live.reduced ? scenes[scenes.length - 1].camera : current.camera;
    const stars = live.reduced ? scenes[scenes.length - 1].stars : current.stars;
    const prevStars = live.reduced ? stars : current.previousStars;
    const fit = live.reduced
      ? fitFor(stars.length)
      : fitFor(prevStars.length) + (fitFor(stars.length) - fitFor(prevStars.length)) * current.ease;
    const scale = camera[2] * Math.min(1, (live.width - 24) / fit);
    const nextKey = stars.join(",");
    if (nextKey !== screenKey) {
      stage.innerHTML = renderScreens({ stars });
      screenKey = nextKey;
    }
    const midY = live.stageView ? live.height / 2 : live.height * 0.4;
    stage.style.transform = `translate(${live.width / 2 - camera[0] * scale}px, ${midY - camera[1] * scale}px) scale(${scale})`;

    if (live.stageView && motionEl) {
      const motion = scenes[index].motion;
      if (motion) {
        motionEl.hidden = false;
        motionEl.textContent = motion;
      } else {
        motionEl.hidden = true;
        motionEl.textContent = "";
      }
    } else if (caption && status && btns && pauseBtn) {
      caption.textContent = scenes[index].caption;
      dots.forEach((dot, i) => dot.classList.toggle("ap-current", i === index));
      if (live.reduced) {
        status.textContent = "動きを抑えた表示になっています";
        btns.hidden = true;
      } else {
        status.textContent = `${index + 1} / ${scenes.length}　${scenes[index].title}`;
        btns.hidden = false;
        pauseBtn.textContent = live.paused ? "▶ 再生" : "Ⅱ 一時停止";
        pauseBtn.setAttribute("aria-label", live.paused ? "紹介を再生する" : "紹介を一時停止する");
      }
    }

    viewport.dataset.scene = String(index);
    viewport.dataset.time = String(Math.round(live.clock));
    viewport.dataset.paused = String(live.paused || live.reduced);
  };

  const stopLoop = () => {
    if (live?.raf) cancelAnimationFrame(live.raf);
    if (live) live.raf = 0;
  };

  const startLoop = () => {
    if (!live || live.paused || live.reduced || !live.visible) return;
    stopLoop();
    live.last = undefined;
    const tick = (now) => {
      if (!live || live.paused || live.reduced || !live.visible) return;
      if (live.last !== undefined) live.clock = (live.clock + now - live.last) % totalDuration;
      live.last = now;
      paint();
      live.raf = requestAnimationFrame(tick);
    };
    live.raf = requestAnimationFrame(tick);
  };

  const syncAnimations = () => {
    if (!live) return;
    const animations = viewport.getAnimations?.({ subtree: true }) ?? [];
    if (live.paused || !live.visible) animations.forEach((a) => a.pause());
    else animations.forEach((a) => a.play());
  };

  live.onMotion = () => {
    if (!live) return;
    live.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (live.reduced) {
      live.clock = totalDuration - scenes[scenes.length - 1].duration;
      stopLoop();
    } else startLoop();
    paint();
  };
  live.onVisibility = () => {
    if (!live) return;
    live.visible = !document.hidden;
    if (live.visible) startLoop();
    else stopLoop();
    syncAnimations();
  };
  live.onClick = (e) => {
    const btn = /** @type {HTMLElement|null} */ (/** @type {HTMLElement} */ (e.target).closest("[data-ap]"));
    if (!btn || !live || live.stageView) return;
    e.stopPropagation();
    if (btn.dataset.ap === "pause") {
      live.paused = !live.paused;
      if (live.paused) stopLoop();
      else startLoop();
      syncAnimations();
      paint();
    } else if (btn.dataset.ap === "restart") {
      live.clock = 0;
      live.paused = false;
      startLoop();
      paint();
    }
  };

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  motionQuery.addEventListener("change", live.onMotion);
  document.addEventListener("visibilitychange", live.onVisibility);
  root.addEventListener("click", live.onClick);

  live.observer = new ResizeObserver(([entry]) => {
    if (!live) return;
    live.width = entry.contentRect.width;
    live.height = entry.contentRect.height;
    paint();
  });
  live.observer.observe(viewport);

  paint();
  startLoop();
}

export function unmountIntro() {
  if (!live) return;
  if (live.raf) cancelAnimationFrame(live.raf);
  live.observer?.disconnect();
  if (live.onMotion) {
    window.matchMedia("(prefers-reduced-motion: reduce)").removeEventListener("change", live.onMotion);
  }
  if (live.onVisibility) document.removeEventListener("visibilitychange", live.onVisibility);
  if (live.onClick) live.root.removeEventListener("click", live.onClick);
  live.root.remove();
  if (live.stageView) {
    document.documentElement.classList.remove("ap-embed-stage-root");
    document.body.classList.remove("ap-embed-stage-root");
  }
  live = null;
}
