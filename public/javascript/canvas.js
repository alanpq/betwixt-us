const canvas = document.getElementById("canvas");

var W, H;
const resizeCanvas = () => {
  W = canvas.width = window.innerWidth || document.body.clientWidth;
  H = canvas.height = window.innerHeight || document.body.clientHeight;
}
resizeCanvas();

window.addEventListener('resize', debounce(resizeCanvas, 250));
window.addEventListener('fullscreenchange', debounce(resizeCanvas, 1000));