function debounce(func, wait, immediate = false) {
  let timeout;
  return function () {
    const context = this, args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

/**
 * Fill and Stroke the same text at once.
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} text 
 * @param {number} x 
 * @param {number} y 
 * @param {number} maxWidth 
 */
const fillStrokedText = (ctx, text, x, y, maxWidth) => {
  ctx.fillText(text, x, y, maxWidth);
  ctx.strokeText(text, x, y, maxWidth);
}

// TODO: real colours
const colors = [
  "#ffffff",
  "#ff0faa",
  "#fccfff",
  "#faaabf",
  "#ffddff",
  "#003dff",
  "#fbfff",
  "#deadbe",
  "#beefda",
  "#123faa",
  "#addaaa",
  "#cccaac",
];