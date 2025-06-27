const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const healthBar = document.querySelector(".health-fill");
    const gameOverOverlay = document.getElementById("gameOverOverlay");
    const finalScoreText = document.getElementById("finalScore");
    const highScoreText = document.getElementById("highScore");
    const restartBtn = document.getElementById("restartBtn");

    // Game objects
    const player = {
      x: canvas.width / 2,
      y: canvas.height - 60,
      width: 30,
      height: 40,
      speed: 5,
      maxHealth: 100,
      health: 100
    };

    const bullets = [];
    const enemies = [];
    let score = 0;
    let highScore = parseInt(localStorage.getItem("planeHighScore") || "0");
    let keys = {};
    let gameOver = false;
    let enemySpawnRate = 1500;
    let lastEnemySpawn = 0;

    // Touch controls
    const mobileControls = {
      up: document.getElementById("upBtn"),
      down: document.getElementById("downBtn"),
      left: document.getElementById("leftBtn"),
      right: document.getElementById("rightBtn"),
      fire: document.getElementById("fireBtn")
    };

    // Event listeners
    document.addEventListener("keydown", e => {
      keys[e.key.toLowerCase()] = true;
      if (e.key === " " && !gameOver) {
        e.preventDefault();
        fireBullet();
      }
    });

    document.addEventListener("keyup", e => {
      keys[e.key.toLowerCase()] = false;
    });

    // Mobile controls
    Object.entries(mobileControls).forEach(([action, btn]) => {
      if (btn) {
        btn.addEventListener("touchstart", e => {
          e.preventDefault();
          if (action === "fire") {
            fireBullet();
          } else {
            keys[getKeyForAction(action)] = true;
          }
        });
        
        btn.addEventListener("touchend", e => {
          e.preventDefault();
          if (action !== "fire") {
            keys[getKeyForAction(action)] = false;
          }
        });
      }
    });

    function getKeyForAction(action) {
      const keyMap = { up: "w", down: "s", left: "a", right: "d" };
      return keyMap[action];
    }

    restartBtn.addEventListener("click", resetGame);

    function fireBullet() {
      bullets.push({
        x: player.x,
        y: player.y,
        width: 4,
        height: 12,
        speed: 8
      });
    }

    function drawPlayer() {
      ctx.fillStyle = "#00ff88";
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(player.x - player.width/2, player.y + player.height);
      ctx.lineTo(player.x + player.width/2, player.y + player.height);
      ctx.closePath();
      ctx.fill();
      
      // Engine glow
      ctx.fillStyle = "#ff6600";
      ctx.fillRect(player.x - 4, player.y + player.height - 5, 8, 10);
    }

    function drawBullets() {
      ctx.fillStyle = "#ffff00";
      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.y -= bullet.speed;
        
        ctx.fillRect(bullet.x - bullet.width/2, bullet.y, bullet.width, bullet.height);
        
        if (bullet.y < 0) {
          bullets.splice(i, 1);
        }
      }
    }

    function drawEnemies() {
      ctx.fillStyle = "#ff4444";
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.y += enemy.speed;
        
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Check collision with player
        if (isColliding(player, enemy)) {
          enemies.splice(i, 1);
          damagePlayer(25);
          continue;
        }
        
        if (enemy.y > canvas.height) {
          enemies.splice(i, 1);
        }
      }
    }

    function spawnEnemy() {
      const now = Date.now();
      if (now - lastEnemySpawn > enemySpawnRate) {
        enemies.push({
          x: Math.random() * (canvas.width - 40),
          y: -40,
          width: 30,
          height: 30,
          speed: 2 + Math.random() * 2
        });
        lastEnemySpawn = now;
        
        // Increase difficulty over time
        if (enemySpawnRate > 800) {
          enemySpawnRate -= 5;
        }
      }
    }

    function checkBulletCollisions() {
      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        for (let j = enemies.length - 1; j >= 0; j--) {
          const enemy = enemies[j];
          if (isColliding(bullet, enemy)) {
            bullets.splice(i, 1);
            enemies.splice(j, 1);
            score += 10;
            break;
          }
        }
      }
    }

    function isColliding(rect1, rect2) {
      return rect1.x < rect2.x + rect2.width &&
             rect1.x + rect1.width > rect2.x &&
             rect1.y < rect2.y + rect2.height &&
             rect1.y + rect1.height > rect2.y;
    }

    function movePlayer() {
      if (keys["a"] || keys["arrowleft"]) {
        player.x = Math.max(player.width/2, player.x - player.speed);
      }
      if (keys["d"] || keys["arrowright"]) {
        player.x = Math.min(canvas.width - player.width/2, player.x + player.speed);
      }
      if (keys["w"] || keys["arrowup"]) {
        player.y = Math.max(0, player.y - player.speed);
      }
      if (keys["s"] || keys["arrowdown"]) {
        player.y = Math.min(canvas.height - player.height, player.y + player.speed);
      }
    }

    function damagePlayer(amount) {
      player.health -= amount;
      if (player.health < 0) player.health = 0;
      updateHealthBar();
      
      if (player.health <= 0 && !gameOver) {
        endGame();
      }
    }

    function updateHealthBar() {
      const healthPercent = (player.health / player.maxHealth) * 100;
      healthBar.style.width = healthPercent + "%";
      
      if (healthPercent > 50) {
        healthBar.style.background = "linear-gradient(90deg, #00ff88, #00cc66, #009944)";
      } else if (healthPercent > 25) {
        healthBar.style.background = "linear-gradient(90deg, #ffaa00, #ff8800, #ff6600)";
      } else {
        healthBar.style.background = "linear-gradient(90deg, #ff4444, #cc0000, #990000)";
      }
    }

    function drawScore() {
      ctx.fillStyle = "#00ff88";
      ctx.font = "20px Orbitron";
      ctx.fillText(`SCORE: ${score}`, 20, 40);
      ctx.fillText(`HIGH: ${highScore}`, 20, 70);
    }

    function endGame() {
      gameOver = true;
      
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("planeHighScore", highScore.toString());
      }
      
      finalScoreText.textContent = `Mission Score: ${score}`;
      highScoreText.textContent = `Best Performance: ${highScore}`;
      gameOverOverlay.classList.remove("hidden");
    }

    function resetGame() {
      player.health = player.maxHealth;
      player.x = canvas.width / 2;
      player.y = canvas.height - 60;
      updateHealthBar();
      
      score = 0;
      enemies.length = 0;
      bullets.length = 0;
      enemySpawnRate = 1500;
      
      gameOver = false;
      gameOverOverlay.classList.add("hidden");
    }

    function gameLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (!gameOver) {
        movePlayer();
        spawnEnemy();
        drawPlayer();
        drawBullets();
        drawEnemies();
        checkBulletCollisions();
        drawScore();
      }
      
      requestAnimationFrame(gameLoop);
    }

    // Initialize game
    updateHealthBar();
    gameLoop();