const G = 100;
const maxThrowSpeed = 150;
const minLifeLen = 500;
const maxLifeLen = 1000;
const n = 100;

const speedCoef = 1;

const c = document.createElement("canvas");
c.id = "sparkly-canvas";
c.style.position = "fixed";
c.style.top = "0";
c.style.left = "0";
c.width = window.innerWidth;
c.height = window.innerHeight;

c.style.pointerEvents = "none";
document.body.appendChild(c);

const ctx = c.getContext("2d");

function now() {
  return new Date().getTime();
}

function randomDouble() {
  return Math.random();
}

function randomDoubleCentered() {
  const count = 5;
  const arr = [...Array(count)].map(() => randomDouble());

  return arr.reduce((acc, curr) => acc + curr, 0) / count;
}

function convertHex(hex, opacity) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const result = "rgba(" + r + "," + g + "," + b + "," + opacity / 100 + ")";
  return result;
}

class Sparkle {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    const dir = randomDouble() * 2 * Math.PI;
    const dist = randomDoubleCentered() * maxThrowSpeed;

    this.dx = Math.cos(dir) * dist;
    this.dy = Math.sin(dir) * dist;

    this.size = Math.random() * 2 + 1;

    this.color = getRandomColor();
    this.birthTime = now();
    this.life = Math.random() * (maxLifeLen - minLifeLen) + minLifeLen;
  }

  get timeLeft() {
    return this.birthTime + this.life / speedCoef - now();
  }
}

const sparkles = new Set();

function createSparkle({
  x = ctx.canvas.width / 2,
  y = ctx.canvas.height / 2
}) {
  sparkles.add(new Sparkle(x, y));
}

function createSparkles({ x, y, n = 1 }) {
  for (let i = 0; i < n; ++i) {
    createSparkle({ x, y });
  }
}

document.addEventListener("click", e => {
  const viewportOffset = c.getBoundingClientRect();
  const top = viewportOffset.top;
  const left = viewportOffset.left;

  createSparkles({
    x: e.clientX - left,
    y: e.clientY - top,
    n: n
  });
});

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function tick() {
  const curr = now();
  const diff = curr - tick.lastT;
  tick.lastT = curr;
  const tobeDeleted = [];

  const vecSpeed = (diff * speedCoef) / 1000;

  sparkles.forEach(s => {
    s.x += s.dx * vecSpeed;
    s.y += s.dy * vecSpeed;

    s.dy += G * vecSpeed;

    if (s.timeLeft <= 0) {
      tobeDeleted.push(s);
    }
  });

  tobeDeleted.map(s => sparkles.delete(s));
}

tick.lastT = now();

function render() {
  // clear the canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // for each dot
  sparkles.forEach(s => {
    ctx.fillStyle = convertHex(
      s.color,
      (s.timeLeft < 1000 ? s.timeLeft / 1000 : 1) * 255
    );

    ctx.circle(s.x, s.y, s.size, true);
    ctx.fill();
  });

  tick();
}

CanvasRenderingContext2D.prototype.circle = function(x, y, r) {
  this.beginPath();
  this.arc(x, y, r, 0, 2 * Math.PI, false);
  this.closePath();
};

window.requestAnimFrame = (function() {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

(function animloop() {
  render();
  requestAnimationFrame(animloop);
})();

createSparkle(100, 100);
