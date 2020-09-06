const canvas = document.getElementById("canvas");

var W, H;

W = canvas.width = window.innerWidth || document.body.clientWidth;
H = canvas.height = window.innerHeight || document.body.clientHeight;

window.addEventListener('resize', debounce(function () {
  W = canvas.width = window.innerWidth || document.body.clientWidth;
  H = canvas.height = window.innerHeight || document.body.clientHeight;
}, 250))