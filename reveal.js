/* ---------------------------------------------------------------
   Shared scroll animation.

   Put class="reveal" on any block of text and it gets split into
   lines and revealed line-by-line as it scrolls into view.
   The split re-runs on resize, so the line breaks always match
   the current screen width.
--------------------------------------------------------------- */

gsap.registerPlugin(ScrollTrigger, SplitText);

document.documentElement.classList.add("js-loading");

function initReveals() {
  // Speaker labels become real elements first, so they get split and
  // revealed along with the dialogue.
  if (typeof applySpeakerNames === "function") applySpeakerNames();

  document.querySelectorAll(".reveal").forEach((el) => {
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      linesClass: "split-line",
      autoSplit: true, // re-split whenever the line breaks change
      onSplit(self) {
        // Returned animation is cleaned up automatically on re-split.
        return gsap.from(self.lines, {
          yPercent: 115,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            end: "bottom 45%",
            toggleActions: "play none none reverse",
          },
        });
      },
    });
  });

  document.documentElement.classList.remove("js-loading");
  ScrollTrigger.refresh();
}

// Wait for webfonts so the line splits measure the real typeface.
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(initReveals);
} else {
  window.addEventListener("load", initReveals);
}
