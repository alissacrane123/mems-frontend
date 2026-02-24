/**
 * DOM helpers for contentEditable checkbox lines.
 * Kept framework-agnostic so they can be used in event handlers and hooks.
 */

function styleCheckbox(cb: HTMLInputElement) {
  cb.style.marginRight = "6px";
  cb.style.cursor = "pointer";
  cb.style.verticalAlign = "middle";
}

/** Create a checkbox <input> element and wire up its change listener. */
export function createCheckboxElement(onDirty: () => void): HTMLInputElement {
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.contentEditable = "false";
  styleCheckbox(cb);
  cb.addEventListener("change", () => {
    if (cb.checked) {
      cb.setAttribute("checked", "checked");
    } else {
      cb.removeAttribute("checked");
    }
    onDirty();
  });
  return cb;
}

/** Build a <div> containing [checkbox][nbsp] and return it. */
export function createCheckboxLine(onDirty: () => void): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.appendChild(createCheckboxElement(onDirty));
  wrapper.appendChild(document.createTextNode("\u00A0"));
  return wrapper;
}

/** Place the cursor at the end of `node`'s text content. */
export function placeCursorAtEnd(node: Node) {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.setStart(node, node.textContent?.length ?? 0);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * Sync every checkbox's DOM attribute to match its runtime checked state
 * so that innerHTML serialization preserves it.
 */
export function serializeCheckboxes(container: HTMLElement) {
  container
    .querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
    .forEach((cb) => {
      if (cb.checked) {
        cb.setAttribute("checked", "checked");
      } else {
        cb.removeAttribute("checked");
      }
    });
}

/** Walk up the DOM from `node` to find the nearest block-level parent inside `root`. */
function findBlock(node: Node | null, root: HTMLElement): HTMLElement | null {
  let current =
    node instanceof HTMLElement ? node : (node?.parentElement ?? null);
  while (current && current !== root) {
    const tag = current.tagName;
    if (tag === "DIV" || tag === "P" || tag === "LI") return current;
    current = current.parentElement;
  }
  return null;
}

/**
 * Handle Backspace on an empty checkbox line — removes the whole line.
 * Returns true if the event was handled (caller should preventDefault).
 */
export function handleCheckboxBackspace(
  editorEl: HTMLElement,
  onDirty: () => void,
): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;

  const block = findBlock(selection.anchorNode, editorEl);
  if (!block) return false;
  if (!block.querySelector('input[type="checkbox"]')) return false;

  const text = block.textContent?.replace(/\u00A0/g, "").trim();
  if (text) return false;

  // Empty checkbox line → replace with a plain empty line
  const empty = document.createElement("div");
  empty.appendChild(document.createElement("br"));
  block.replaceWith(empty);

  const range = document.createRange();
  range.setStart(empty, 0);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  onDirty();
  return true;
}

/**
 * Handle Enter key inside the editor. If the cursor is on a checkbox line:
 * - Empty line → remove checkbox, insert blank line (break out of checkbox mode)
 * - Non-empty line → insert a new checkbox line below and focus it
 * Returns true if the event was handled (caller should preventDefault).
 */
export function handleCheckboxEnter(
  editorEl: HTMLElement,
  onDirty: () => void,
): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;

  const block = findBlock(selection.anchorNode, editorEl);
  if (!block) return false;
  if (!block.querySelector('input[type="checkbox"]')) return false;

  const text = block.textContent?.replace(/\u00A0/g, "").trim();

  // Empty checkbox line → break out
  if (!text) {
    block.remove();
    const empty = document.createElement("div");
    empty.appendChild(document.createElement("br"));
    const range = selection.getRangeAt(0);
    range.insertNode(empty);
    range.setStart(empty, 0);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    onDirty();
    return true;
  }

  // Non-empty → add a new checkbox line
  const wrapper = createCheckboxLine(onDirty);
  block.insertAdjacentElement("afterend", wrapper);
  placeCursorAtEnd(wrapper.lastChild!);
  onDirty();
  return true;
}
