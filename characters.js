/* ---------------------------------------------------------------
   CHARACTER + POSITION LIBRARY
   ---------------------------------------------------------------
   Add a character here and you can immediately use it in any page:

     <p data-who="narrator" data-at="left">...</p>

   data-who  -> who is speaking (sets the text colour)
   data-at   -> where on the screen the text sits

   Positions, left to right:
     hardleft  left  leftcenter  center  rightcenter  right  hardright

   Everything below is turned into real CSS at load time, so this is
   the only file you edit to add a speaker or a new position.
--------------------------------------------------------------- */

const CHARACTERS = {
  // key            colour       display name
  narrator: { color: "#d9d6d1", name: "Narrator" },
  luft: { color: "#C7D6D6", name: "Eureka Luft" },
  khan: { color: "#F28080", name: "Agnes Khan" },
};

/* Position -> how far across the column it sits (0 = far left, 1 = far right).
   Add your own with any name and any number between 0 and 1. */
const POSITIONS = {
  hardleft: 0,
  left: 1 / 6,
  leftcenter: 2 / 6,
  center: 3 / 6,
  rightcenter: 4 / 6,
  right: 5 / 6,
  hardright: 1,
};

/* How wide a block of dialogue is allowed to get.

   DIALOGUE_WIDTH is the width you'd like it to be.
   DIALOGUE_MAX_SHARE is the most of the page it may ever take up.

   The share is the important one: whatever is left over is the space
   the text has to slide around in. At 60%, a block always keeps 40%
   of the page to travel across, so the positions stay distinct no
   matter how wide the window is. Raise it for longer lines, lower it
   for more dramatic movement. */
const DIALOGUE_WIDTH = "75ch";
const DIALOGUE_MAX_SHARE = "95%";

/* ---------------------------------------------------------------
   Below here is the machinery. You shouldn't need to touch it.
--------------------------------------------------------------- */

(function buildCharacterStyles() {
  const css = [];

  // --- speaker colours ---
  css.push(":root {");
  for (const [key, char] of Object.entries(CHARACTERS)) {
    css.push(`  --who-${key}: ${char.color};`);
  }
  css.push("}");

  for (const key of Object.keys(CHARACTERS)) {
    css.push(`[data-who="${key}"] { color: var(--who-${key}); }`);
  }

  // Codes inside dialogue take the speaker's colour instead of the
  // site accent, so a line stays visually one voice.
  css.push("[data-who] b, [data-who] strong { color: inherit; }");

  // Optional speaker label: add data-name to show it above the line.
  // It's built as a real element (see applySpeakerNames below) rather
  // than a ::before, so the scroll reveal can animate it like any
  // other text.
  css.push(`
.who-name,
.story .who-name {
  margin: 0 0 0.2em;
  font-size: clamp(0.62rem, 1vw, 0.75rem);
  letter-spacing: 0.18em;
  opacity: 0.55;
}`);

  // --- positioning ---
  // A block is given a known width, so the free space beside it is
  // (100% - width) and we can slide it along that space with --pos.
  //
  // --col is capped at a share of the page, which guarantees that
  // free space actually exists. If a block were allowed to fill the
  // whole column, (100% - width) would be zero and every position
  // would collapse into the same spot.
  css.push(`
[data-at][data-at] {
  --pos: 0.5;
  --col: min(${DIALOGUE_WIDTH}, ${DIALOGUE_MAX_SHARE});
  width: var(--col);
  margin-inline-start: calc(var(--pos) * (100% - var(--col)));
  margin-inline-end: 0;
}`);

  for (const [name, pos] of Object.entries(POSITIONS)) {
    css.push(`[data-at="${name}"][data-at] { --pos: ${pos}; }`);
  }

  // Text naturally reads toward the edge it's nearest.
  for (const [name, pos] of Object.entries(POSITIONS)) {
    const align = pos < 0.5 ? "left" : pos > 0.5 ? "right" : "center";
    css.push(`[data-at="${name}"][data-at] { text-align: ${align}; }`);
  }

  // Explicit override when the automatic choice is wrong.
  for (const align of ["left", "center", "right", "justify"]) {
    css.push(`[data-align="${align}"][data-align] { text-align: ${align}; }`);
  }

  // .beat and .middlebody centre their children with grid, which would
  // shrink a positioned block and pin it to the middle. Let it stretch
  // so it has a full-width track to slide along.
  css.push(`
.beat:has([data-at]),
.middlebody:has([data-at]) {
  justify-items: stretch;
}`);

  // On narrow screens there's no room to drift; everything centres.
  css.push(`
@media (max-width: 700px) {
  [data-at][data-at] {
    width: 100%;
    margin-inline-start: 0;
    text-align: center;
  }
}`);

  const style = document.createElement("style");
  style.id = "character-styles";
  style.textContent = css.join("\n");
  document.head.appendChild(style);
})();

/* ---------------------------------------------------------------
   Turns data-name into a real element sitting above the line, so it
   scrolls in and out with the same animation as everything else.
   It copies the line's speaker and position, so the label always
   lines up with the dialogue it belongs to.

   Runs before the reveals are built. Safe to call twice.
--------------------------------------------------------------- */

function applySpeakerNames(root = document) {
  root.querySelectorAll("[data-name]:not([data-named])").forEach((el) => {
    el.setAttribute("data-named", "");

    const label = document.createElement("p");
    label.className = "who-name reveal";
    label.textContent = el.dataset.name;

    // Match the line it labels.
    if (el.dataset.who) label.dataset.who = el.dataset.who;
    if (el.dataset.at) label.dataset.at = el.dataset.at;
    if (el.dataset.align) label.dataset.align = el.dataset.align;

    el.parentNode.insertBefore(label, el);
  });
}

document.addEventListener("DOMContentLoaded", () => applySpeakerNames());
