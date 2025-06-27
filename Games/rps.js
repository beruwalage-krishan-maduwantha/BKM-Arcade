let userScore = 0;
    let computerScore = 0;

    const userScoreEl = document.getElementById("user-score");
    const computerScoreEl = document.getElementById("computer-score");
    const resultEl = document.getElementById("result");
    const overlay = document.getElementById("overlay");
    const finalMessage = document.getElementById("final-message");

    function play(userChoice) {
      if (userScore >= 5 || computerScore >= 5) return;

      const choices = ["rock", "paper", "scissors"];
      const computerChoice = choices[Math.floor(Math.random() * choices.length)];

      const winner = getWinner(userChoice, computerChoice);

      if (winner === "user") {
        userScore++;
        resultEl.innerHTML = `
          <div style="color: #00ff88; font-weight: 700; margin-bottom: 0.5rem;">⚡ COMBAT SUCCESSFUL ⚡</div>
          <div>PLAYER: ${getWeaponName(userChoice)} | A.I.: ${getWeaponName(computerChoice)}</div>
        `;
      } else if (winner === "computer") {
        computerScore++;
        resultEl.innerHTML = `
          <div style="color: #ff4444; font-weight: 700; margin-bottom: 0.5rem;">💥 COMBAT FAILED 💥</div>
          <div>PLAYER: ${getWeaponName(userChoice)} | A.I.: ${getWeaponName(computerChoice)}</div>
        `;
      } else {
        resultEl.innerHTML = `
          <div style="color: #ffaa00; font-weight: 700; margin-bottom: 0.5rem;">🔄 COMBAT DRAW 🔄</div>
          <div>PLAYER: ${getWeaponName(userChoice)} | A.I.: ${getWeaponName(computerChoice)}</div>
        `;
      }

      updateScores();
      checkGameOver();
    }

    function getWinner(user, computer) {
      if (user === computer) return "draw";
      if (
        (user === "rock" && computer === "scissors") ||
        (user === "paper" && computer === "rock") ||
        (user === "scissors" && computer === "paper")
      ) {
        return "user";
      } else {
        return "computer";
      }
    }

    function getWeaponName(choice) {
      const weapons = {
        rock: "✊ ROCK",
        paper: "✋ PAPER", 
        scissors: "✌️ SCISSORS"
      };
      return weapons[choice];
    }

    function updateScores() {
      userScoreEl.textContent = userScore;
      computerScoreEl.textContent = computerScore;
    }

    function checkGameOver() {
      if (userScore >= 5) {
        finalMessage.innerHTML = '<span class="victory">🏆 MISSION VITORY 🏆</span>';
        finalMessage.className = 'victory';
        overlay.classList.remove("hidden");
      } else if (computerScore >= 5) {
        finalMessage.innerHTML = '<span class="defeat">💀 MISSION FAILED 💀</span>';
        finalMessage.className = 'defeat';
        overlay.classList.remove("hidden");
      }
    }

    function restartGame() {
      userScore = 0;
      computerScore = 0;
      updateScores();
      resultEl.textContent = "SELECT YOUR WEAPON TO BEGIN COMBAT";
      overlay.classList.add("hidden");
    }