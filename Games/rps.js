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
    resultEl.textContent = `You chose ${emoji(userChoice)} | Computer chose ${emoji(computerChoice)} — You Win!`;
  } else if (winner === "computer") {
    computerScore++;
    resultEl.textContent = `You chose ${emoji(userChoice)} | Computer chose ${emoji(computerChoice)} — You Lose!`;
  } else {
    resultEl.textContent = `You chose ${emoji(userChoice)} | Computer chose ${emoji(computerChoice)} — It's a Draw!`;
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

function emoji(choice) {
  if (choice === "rock") return "✊";
  if (choice === "paper") return "✋";
  if (choice === "scissors") return "✌️";
}

function updateScores() {
  userScoreEl.textContent = userScore;
  computerScoreEl.textContent = computerScore;
}

function checkGameOver() {
  if (userScore >= 5) {
    finalMessage.textContent = "🎉 You Win the Game!";
    overlay.classList.remove("hidden");
  } else if (computerScore >= 5) {
    finalMessage.textContent = "😢 Computer Wins!";
    overlay.classList.remove("hidden");
  }
}

function restartGame() {
  userScore = 0;
  computerScore = 0;
  updateScores();
  resultEl.textContent = "Make your move!";
  overlay.classList.add("hidden");
}
