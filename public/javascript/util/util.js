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

const fillStrokedText = (ctx, text, x, y, maxWidth) => {
  ctx.fillText(text, x, y, maxWidth);
  ctx.strokeText(text, x, y, maxWidth);
}