const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalScoreText = document.getElementById('finalScore');
const highScoreMessage = document.getElementById('highScoreMessage');
const restartBtn = document.getElementById('restartBtn');
const difficultySelect = document.getElementById('difficulty-select');

// Game state
const gridSize = 20;
let snake = [{ x: 240, y: 240 }];
let food = generateFood();
let score = 0;
let highScore = 0; // Remove localStorage dependency for now
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let paused = false;
let gameRunning = false;
let gameInterval = null;

// Try to load high score from localStorage if available
try {
  highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
} catch (e) {
  highScore = 0;
}

// Mobile controls
const mobileControls = {
  up: document.getElementById('upBtn'),
  down: document.getElementById('downBtn'),
  left: document.getElementById('leftBtn'),
  right: document.getElementById('rightBtn'),
  pause: document.getElementById('pauseBtn')
};

// Initialize displays
highScoreDisplay.textContent = highScore;
scoreDisplay.textContent = score;

// Event listeners
document.addEventListener('keydown', handleKeyPress);
difficultySelect.addEventListener('change', changeDifficulty);
restartBtn.addEventListener('click', restartGame);

// Mobile controls
Object.entries(mobileControls).forEach(([action, btn]) => {
  if (btn) {
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      handleMobileControl(action);
    });
    btn.addEventListener('click', e => {
      e.preventDefault();
      handleMobileControl(action);
    });
  }
});

function handleKeyPress(e) {
  const key = e.key.toLowerCase();
  
  if (key === 'p') {
    togglePause();
    return;
  }

  if (paused) return;

  // Direction controls
  if ((key === 'arrowup' || key === 'w') && direction !== 'DOWN') {
    nextDirection = 'UP';
  } else if ((key === 'arrowdown' || key === 's') && direction !== 'UP') {
    nextDirection = 'DOWN';
  } else if ((key === 'arrowleft' || key === 'a') && direction !== 'RIGHT') {
    nextDirection = 'LEFT';
  } else if ((key === 'arrowright' || key === 'd') && direction !== 'LEFT') {
    nextDirection = 'RIGHT';
  }
}

function handleMobileControl(action) {
  if (action === 'pause') {
    togglePause();
    return;
  }

  if (paused) return;

  switch (action) {
    case 'up':
      if (direction !== 'DOWN') nextDirection = 'UP';
      break;
    case 'down':
      if (direction !== 'UP') nextDirection = 'DOWN';
      break;
    case 'left':
      if (direction !== 'RIGHT') nextDirection = 'LEFT';
      break;
    case 'right':
      if (direction !== 'LEFT') nextDirection = 'RIGHT';
      break;
  }
}

function togglePause() {
  if (!gameRunning) {
    startGame();
    return;
  }
  
  paused = !paused;
  if (paused) {
    clearInterval(gameInterval);
    if (mobileControls.pause) {
      mobileControls.pause.textContent = '▶';
    }
  } else {
    gameInterval = setInterval(gameLoop, parseInt(difficultySelect.value));
    if (mobileControls.pause) {
      mobileControls.pause.textContent = '⏸';
    }
  }
}

function changeDifficulty() {
  if (gameRunning && !paused) {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, parseInt(difficultySelect.value));
  }
}

function generateFood() {
  let newFood;
  let attempts = 0;
  
  do {
    newFood = {
      x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
      y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
    };
    attempts++;
  } while (attempts < 100 && snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
  
  return newFood;
}

function drawSnake() {
  snake.forEach((segment, index) => {
    if (index === 0) {
      // Head - bright green with glow effect
      ctx.fillStyle = '#00ff88';
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 8;
    } else {
      // Body - darker green
      ctx.fillStyle = '#00cc66';
      ctx.shadowColor = '#00cc66';
      ctx.shadowBlur = 4;
    }
    
    ctx.fillRect(segment.x + 1, segment.y + 1, gridSize - 2, gridSize - 2);
  });
  
  // Reset shadow
  ctx.shadowBlur = 0;
}

function drawFood() {
  ctx.fillStyle = '#ff6600';
  ctx.shadowColor = '#ff6600';
  ctx.shadowBlur = 10;
  ctx.fillRect(food.x + 1, food.y + 1, gridSize - 2, gridSize - 2);
  ctx.shadowBlur = 0;
}

function drawGrid() {
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 0.5;
  
  for (let i = 0; i <= canvas.width; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
  
  for (let i = 0; i <= canvas.height; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }
}

function drawGameInfo() {
  ctx.fillStyle = '#00ff88';
  ctx.font = '18px Orbitron';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score}`, 10, 30);
  
  if (paused) {
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 30px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
  }
  
  if (!gameRunning && !gameOverOverlay.classList.contains('hidden') === false) {
    ctx.fillStyle = '#cccccc';
    ctx.font = '20px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('Press P to Start', canvas.width / 2, canvas.height / 2);
  }
  
  ctx.textAlign = 'left';
}

function moveSnake() {
  direction = nextDirection;
  
  const head = { x: snake[0].x, y: snake[0].y };
  
  switch (direction) {
    case 'UP':
      head.y -= gridSize;
      break;
    case 'DOWN':
      head.y += gridSize;
      break;
    case 'LEFT':
      head.x -= gridSize;
      break;
    case 'RIGHT':
      head.x += gridSize;
      break;
  }
  
  // Check wall collision
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    gameOver();
    return false;
  }
  
  // Check self collision
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    gameOver();
    return false;
  }
  
  snake.unshift(head);
  
  // Check food collision
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreDisplay.textContent = score;
    food = generateFood();
  } else {
    snake.pop();
  }
  
  return true;
}

function gameLoop() {
  if (paused || !gameRunning) return;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw game elements
  drawGrid();
  
  // Move snake and check for game over
  if (!moveSnake()) {
    return;
  }
  
  drawSnake();
  drawFood();
  drawGameInfo();
}

function gameOver() {
  gameRunning = false;
  clearInterval(gameInterval);
  
  let isNewHighScore = false;
  if (score > highScore) {
    highScore = score;
    highScoreDisplay.textContent = highScore;
    
    // Try to save high score
    try {
      localStorage.setItem('snakeHighScore', highScore.toString());
    } catch (e) {
      // localStorage not available, continue without saving
    }
    
    isNewHighScore = true;
  }
  
  finalScoreText.textContent = `Final Score: ${score}`;
  highScoreMessage.textContent = isNewHighScore ? 
    'NEW HIGH SCORE ACHIEVED!' : `Best Score: ${highScore}`;
  
  gameOverOverlay.classList.remove('hidden');
}

function startGame() {
  if (gameRunning) return;
  
  gameRunning = true;
  paused = false;
  
  if (mobileControls.pause) {
    mobileControls.pause.textContent = '⏸';
  }
  
  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, parseInt(difficultySelect.value));
}

function restartGame() {
  // Reset game state
  snake = [{ x: 240, y: 240 }];
  direction = 'RIGHT';
  nextDirection = 'RIGHT';
  score = 0;
  paused = false;
  
  scoreDisplay.textContent = score;
  food = generateFood();
  gameOverOverlay.classList.add('hidden');
  
  startGame();
}

// Initialize game display
function initGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawSnake();
  drawFood();
  drawGameInfo();
}

// Start the game
initGame();