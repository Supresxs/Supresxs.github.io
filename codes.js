/* ---------------------------------------------------------------
   CODE LIBRARY
   ---------------------------------------------------------------
   Every bolded word in a story is a "code". Add one line here for
   each code and point it at the page that code unlocks.

   Format:   "code typed by the reader": "page/it/leads/to.html"

   Paths are written as if from the site root; each page's gate
   sets data-code-base so they resolve from subfolders too.

   Codes are matched case-insensitively and ignore surrounding
   spaces, so "Attention", "ATTENTION " and "attention" all work.
--------------------------------------------------------------- */

const STORY_CODES = {
  attention: "pages/attention.html",
  anachronism: "index.html",
};

/* ---------------------------------------------------------------
   Helpers used by every page. You shouldn't need to touch these.
--------------------------------------------------------------- */

function normalizeCode(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** Returns the destination page for a typed code, or null if invalid. */
function resolveCode(raw) {
  const key = normalizeCode(raw);
  if (!key) return null;
  return Object.prototype.hasOwnProperty.call(STORY_CODES, key)
    ? STORY_CODES[key]
    : null;
}

/** True if the typed text is a real code. */
function isValidCode(raw) {
  return resolveCode(raw) !== null;
}

/* ---------------------------------------------------------------
   Wires up any code gate on the page.

   Markup it expects:
     <form data-code-gate>
       <input data-code-input>
       <button data-code-submit>Are you sure?</button>
     </form>

   The button stays hidden until what's typed is a valid code.
--------------------------------------------------------------- */

function initCodeGates(root = document) {
  root.querySelectorAll("[data-code-gate]").forEach((gate) => {
    const input = gate.querySelector("[data-code-input]");
    const button = gate.querySelector("[data-code-submit]");
    if (!input || !button) return;

    // Where this page lives, so relative paths in the library
    // resolve the same way from a subpage as from the landing page.
    const base = gate.dataset.codeBase || "";

    const refresh = () => {
      gate.classList.toggle("is-valid", isValidCode(input.value));
    };

    const go = () => {
      const dest = resolveCode(input.value);
      if (dest) window.location.href = base + dest;
    };

    input.addEventListener("input", refresh);
    button.addEventListener("click", (e) => {
      e.preventDefault();
      go();
    });
    gate.addEventListener("submit", (e) => {
      e.preventDefault();
      go();
    });

    refresh();
  });
}

document.addEventListener("DOMContentLoaded", () => initCodeGates());
