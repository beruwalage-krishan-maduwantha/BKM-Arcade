const canvas = document.querySelector(".gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const overlay = document.getElementById("overlay");
const finalScore = document.getElementById("finalScore");
const restartBtn = document.getElementById("restart");
const difficultySelect = document.getElementById("difficulty-select");
const eatSound = document.getElementById("eatSound");
const gameOverSound = document.getElementById("gameOverSound");

const box = 20;
const canvasSize = 400;
let snake = [{ x: 200, y: 200 }];
let food = generateFood();
let score = 0;
let direction = "RIGHT";
let paused = false;
let intervalTime = +difficultySelect.value;
let gameInterval = null;

document.addEventListener("keydown", changeDirection);
document.addEventListener("keydown", togglePause);
difficultySelect.addEventListener("change", () => {
  intervalTime = +difficultySelect.value;
  restartGame();
});
restartBtn.addEventListener("click", restartGame);

function changeDirection(e) {
  const key = e.key.toLowerCase();
  if ((key === "arrowup" || key === "w") && direction !== "DOWN") direction = "UP";
  if ((key === "arrowdown" || key === "s") && direction !== "UP") direction = "DOWN";
  if ((key === "arrowleft" || key === "a") && direction !== "RIGHT") direction = "LEFT";
  if ((key === "arrowright" || key === "d") && direction !== "LEFT") direction = "RIGHT";
}

function togglePause(e) {
  if (e.key.toLowerCase() === "p") {
    paused = !paused;
    if (paused) {
      clearInterval(gameInterval);
    } else {
      gameInterval = setInterval(draw, intervalTime);
    }
  }
}

function generateFood() {
  return {
    x: Math.floor(Math.random() * (canvasSize / box)) * box,
    y: Math.floor(Math.random() * (canvasSize / box)) * box,
  };
}

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "#00ff99" : "#00cc66";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  ctx.fillStyle = "lime";
  ctx.fillRect(food.x, food.y, box, box);

  let head = { x: snake[0].x, y: snake[0].y };

  if (direction === "LEFT") head.x -= box;
  if (direction === "RIGHT") head.x += box;
  if (direction === "UP") head.y -= box;
  if (direction === "DOWN") head.y += box;

  if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize || collision(head, snake)) {
    gameOver();
    return;
  }

  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreDisplay.textContent = score;
    food = generateFood();
    eatSound.play();
  } else {
    snake.pop();
  }

  snake.unshift(head);
}

function collision(head, body) {
  return body.some(segment => head.x === segment.x && head.y === segment.y);
}

function gameOver() {
  clearInterval(gameInterval);
  gameOverSound.play();
  overlay.classList.remove("hidden");
  finalScore.textContent = `Your Score: ${score}`;
}

function restartGame() {
  snake = [{ x: 200, y: 200 }];
  direction = "RIGHT";
  score = 0;
  food = generateFood();
  scoreDisplay.textContent = score;
  overlay.classList.add("hidden");
  clearInterval(gameInterval);
  gameInterval = setInterval(draw, intervalTime);
}

// Start game
gameInterval = setInterval(draw, intervalTime);
