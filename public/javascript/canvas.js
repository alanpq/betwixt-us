const canvas = document.getElementById("canvas");
const playerLayerCanvas = document.createElement("canvas");
const playerMaskCanvas = document.createElement("canvas");

var W, H;
var WSF, HSF;
const resizeCanvas = () => {
  W = canvas.width = playerMaskCanvas.width = playerLayerCanvas.width = (window.innerWidth || document.body.clientWidth);
  H = canvas.height = playerMaskCanvas.height = playerLayerCanvas.height = (window.innerHeight || document.body.clientHeight);
  WSF = W / 355;
  HSF = H / 600;
}
resizeCanvas();

window.addEventListener('resize', debounce(resizeCanvas, 100));
window.addEventListener('fullscreenchange', debounce(resizeCanvas, 1000));