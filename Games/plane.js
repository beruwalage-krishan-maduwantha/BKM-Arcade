const canvas = document.getElementById("planeCanvas");
const ctx = canvas.getContext("2d");

const healthBar = document.querySelector("#health-bar > div");
const gameOverOverlay = document.getElementById("game-over-overlay");
const finalScoreText = document.getElementById("final-score");
const highScoreDisplay = document.getElementById("high-score-display");
const restartBtn = document.getElementById("restart-btn");
const gameOverSound = document.getElementById("gameOverSound");

const plane = {
  x: canvas.width / 2,
  y: canvas.height - 40,
  width: 20,
  height: 30,
  speed: 4,
  maxHealth: 100,
  health: 100
};

const bullets = [];
const enemies = [];
let score = 0;
let highScore = localStorage.getItem("bkmPlaneHighScore") || 0;
highScore = parseInt(highScore, 10) || 0;

let keys = {};
let gameOver = false;

document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === " " && !gameOver) {
    bullets.push({ x: plane.x, y: plane.y });
  }
});

document.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

restartBtn.addEventListener("click", () => {
  resetGame();
});

function drawPlane() {
  ctx.fillStyle = "lime";
  ctx.beginPath();
  ctx.moveTo(plane.x, plane.y);
  ctx.lineTo(plane.x - plane.width / 2, plane.y + plane.height);
  ctx.lineTo(plane.x + plane.width / 2, plane.y + plane.height);
  ctx.closePath();
  ctx.fill();
}

function drawBullets() {
  ctx.fillStyle = "red";
  bullets.forEach((b, i) => {
    b.y -= 6;
    ctx.fillRect(b.x - 2, b.y, 4, 10);
    if (b.y < 0) bullets.splice(i, 1);
  });
}

function drawEnemies() {
  ctx.fillStyle = "yellow";
  enemies.forEach((e, i) => {
    e.y += 2;
    ctx.fillRect(e.x, e.y, e.width, e.height);

    if (
      plane.x + plane.width / 2 > e.x &&
      plane.x - plane.width / 2 < e.x + e.width &&
      plane.y + plane.height > e.y &&
      plane.y < e.y + e.height
    ) {
      enemies.splice(i, 1);
      damagePlane(20);
    }

    if (e.y > canvas.height) enemies.splice(i, 1);
  });
}

function damagePlane(amount) {
  plane.health -= amount;
  if (plane.health < 0) plane.health = 0;
  updateHealthBar();

  if (plane.health <= 0 && !gameOver) {
    endGame();
  }
}

function updateHealthBar() {
  const healthPercent = (plane.health / plane.maxHealth) * 100;
  healthBar.style.width = healthPercent + "%";

  if (healthPercent > 50) {
    healthBar.style.background = "linear-gradient(90deg, #00ff99 0%, #00cc66 50%, #009944 100%)";
  } else if (healthPercent > 25) {
    healthBar.style.background = "linear-gradient(90deg, #ffcc00 0%, #ff9900 50%, #cc6600 100%)";
  } else {
    healthBar.style.background = "linear-gradient(90deg, #ff4444 0%, #cc0000 50%, #990000 100%)";
  }
}

function detectCollisions() {
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (b.x > e.x && b.x < e.x + e.width && b.y < e.y + e.height && b.y > e.y) {
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        score += 10;
      }
    });
  });
}

function movePlane() {
  if (keys["a"] && plane.x > plane.width / 2) plane.x -= plane.speed;
  if (keys["d"] && plane.x < canvas.width - plane.width / 2) plane.x += plane.speed;
  if (keys["w"] && plane.y > 0) plane.y -= plane.speed;
  if (keys["s"] && plane.y < canvas.height - plane.height) plane.y += plane.speed;
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "16px Poppins";
  ctx.fillText("Score: " + score, 10, 20);
  ctx.fillText("High Score: " + highScore, 10, 40);
}

function endGame() {
  gameOver = true;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("bkmPlaneHighScore", highScore);
  }

  finalScoreText.textContent = `Your Score: ${score}`;
  highScoreDisplay.textContent = `High Score: ${highScore}`;
  gameOverOverlay.classList.remove("hidden");
}

function resetGame() {
  plane.health = plane.maxHealth;
  updateHealthBar();

  score = 0;
  enemies.length = 0;
  bullets.length = 0;
  plane.x = canvas.width / 2;
  plane.y = canvas.height - 40;

  gameOver = false;
  gameOverOverlay.classList.add("hidden");
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!gameOver) {
    movePlane();
    drawPlane();
    drawBullets();
    drawEnemies();
    detectCollisions();
    drawScore();
  }
  requestAnimationFrame(update);
}

setInterval(() => {
  if (!gameOver) {
    const x = Math.random() * (canvas.width - 30);
    enemies.push({ x, y: 0, width: 30, height: 20 });
  }
}, 1500);

update();
updateHealthBar();
