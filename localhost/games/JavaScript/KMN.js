let playerScore = 0; // счет игрока
let computerScore = 0; // счет компьютера

// элементы для отображения данных на странице
const playerChoiceElem = document.getElementById("playerChoice");
const computerChoiceElem = document.getElementById("computerChoice");
const roundResultElem = document.getElementById("roundResult");
const playerScoreElem = document.getElementById("playerScore");
const computerScoreElem = document.getElementById("computerScore");

// массив с возможными вариантами выбора
const choices = ['rock', 'scissors', 'paper'];

// добавление обработчиков событий на кнопки выбора
document.getElementById("rock").addEventListener("click", () => playRound('rock'));
document.getElementById("scissors").addEventListener("click", () => playRound('scissors'));
document.getElementById("paper").addEventListener("click", () => playRound('paper'));

// функция для выбора компьютера
function getComputerChoice() {
  const randomIndex = Math.floor(Math.random() * 3); // случайный индекс от 0 до 2
  return choices[randomIndex]; // возврат случайного выбора
}

// функция для определения победителя
function determineWinner(playerChoice, computerChoice) {
  if (playerChoice === computerChoice) {
    return 'ничья'; // если выборы совпали — ничья
  }

  // проверка всех случаев, когда игрок побеждает
  if (
    (playerChoice === 'rock' && computerChoice === 'scissors') ||
    (playerChoice === 'scissors' && computerChoice === 'paper') ||
    (playerChoice === 'paper' && computerChoice === 'rock')
  ) {
    return 'победа';
  }

  // иначе — поражение
  return 'поражение';
}

// функция для проведения одного раунда игры
function playRound(playerChoice) {
  const computerChoice = getComputerChoice(); // выбор компьютера
  const result = determineWinner(playerChoice, computerChoice); // определение результата раунда
  
  // отображение выбора игрока и компьютера с помощью эмодзи
  playerChoiceElem.textContent = getEmoji(playerChoice);
  computerChoiceElem.textContent = getEmoji(computerChoice);

  // отображение результата
  roundResultElem.textContent = result;

  // обновление счета в зависимости от результата
  if (result === 'победа') {
    playerScore++;
  } else if (result === 'поражение') {
    computerScore++;
  }

  // отображение нового счета на странице
  playerScoreElem.textContent = playerScore;
  computerScoreElem.textContent = computerScore;
}

// функция для получения эмодзи по выбранному варианту
function getEmoji(choice) {
  switch(choice) {
    case 'rock': return '🗿'; // камень
    case 'scissors': return '✂️'; // ножницы
    case 'paper': return '📄'; // бумага
    default: return '---'; // защита на случай ошибки
  }
}
