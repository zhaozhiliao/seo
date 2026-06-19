/** Optical alignment — nudge display type so glyph ink (not layout box) hits the column line. */

const DEFAULT_SELECTORS = ".display-headline";

export function alignDisplayType(selectors = DEFAULT_SELECTORS): void {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  document.querySelectorAll(selectors).forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    el.style.marginLeft = "0px";

    const text = (el.textContent ?? "").trim();
    const ch = text.charAt(0);
    if (!ch) return;

    const cs = getComputedStyle(el);
    let glyph = ch;
    if (cs.textTransform === "uppercase") glyph = ch.toUpperCase();

    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx.textAlign = "left";

    const abl = ctx.measureText(glyph).actualBoundingBoxLeft;
    if (Number.isFinite(abl)) el.style.marginLeft = `${abl.toFixed(2)}px`;
  });
}

/** After fonts load; re-runs on resize (debounced). Returns cleanup. */
export function initOpticalAlign(selectors?: string): () => void {
  const run = () => alignDisplayType(selectors);

  if (document.fonts?.ready) void document.fonts.ready.then(run);
  run();

  let timer: ReturnType<typeof setTimeout>;
  const onResize = () => {
    clearTimeout(timer);
    timer = setTimeout(run, 120);
  };
  window.addEventListener("resize", onResize);

  return () => {
    clearTimeout(timer);
    window.removeEventListener("resize", onResize);
  };
}
