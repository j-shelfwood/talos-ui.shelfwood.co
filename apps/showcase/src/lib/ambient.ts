/**
 * Shared client setup for every layout: register the Talos web components and
 * write the cursor position to the two custom properties the ambient grid reads.
 * Previously this pair was copy-pasted verbatim into Landing/DocsShell/BlogShell;
 * each layout now calls initAmbient() and adds only its own page-specific extras.
 */
import "@shelfwood/talos-ui/wc";

export function initAmbient(): void {
  const root = document.documentElement;
  addEventListener("pointermove", (e) => {
    root.style.setProperty("--talos-cursor-x", e.clientX + "px");
    root.style.setProperty("--talos-cursor-y", e.clientY + "px");
  });
}
