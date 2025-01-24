const gameBoard = document.getElementById('game-board');
const playerScoreElem = document.getElementById('player-score');
const pairsLeftElem = document.getElementById('pairs-left');
const restartButton = document.getElementById('restart');
const difficultySelect = document.getElementById('difficulty');

const allCards = [
    'pic/apple.png', 'pic/apple.png',
    'pic/baltika.png', 'pic/baltika.png',
    'pic/grape.png', 'pic/grape.png',
    'pic/grusa.png', 'pic/grusa.png',
    'pic/ingalipt.png', 'pic/ingalipt.png',
    'pic/lipton.png', 'pic/lipton.png',
    'pic/nuyella.png', 'pic/nuyella.png',
    'pic/rice.png', 'pic/rice.png',
    'pic/audi.png', 'pic/audi.png',
    'pic/banana.png', 'pic/banana.png',
    'pic/bmw.png', 'pic/bmw.png',
    'pic/chevrolete.png', 'pic/chevrolete.png',
    'pic/cool.png', 'pic/cool.png',
    'pic/cucumber.png', 'pic/cucumber.png',
    'pic/discord.png', 'pic/discord.png',
    'pic/dodge.png', 'pic/dodge.png',
    'pic/dragonfruit.png', 'pic/dragonfruit.png',
    'pic/google.png', 'pic/google.png',
    'pic/honda.png', 'pic/honda.png',
    'pic/lego.png', 'pic/lego.png',
    'pic/mercedes.png', 'pic/mercedes.png',
    'pic/lichi.png', 'pic/lichi.png',
    'pic/nissan.png', 'pic/nissan.png',
    'pic/nvidia.png', 'pic/nvidia.png',
    'pic/opera.png', 'pic/opera.png',
    'pic/orange.png', 'pic/orange.png',
    'pic/renoult.png', 'pic/renoult.png',
    'pic/roblox.png', 'pic/roblox.png',
    'pic/suzuki.png', 'pic/suzuki.png',
    'pic/switch.png', 'pic/switch.png',
    'pic/telegram.png', 'pic/telegram.png',
    'pic/toyota.png', 'pic/toyota.png',
    'pic/twitch.png', 'pic/twitch.png',
    'pic/youtube.png', 'pic/youtube.png'
];

let flippedCards = [];
let matchedCards = [];
let playerScore = 0;
let pairsLeft = 0;
let totalCards = 0;
let rows = 0;
let cols = 0;

function setDifficulty() {
    const difficulty = difficultySelect.value;

    let cards = [];

    if (difficulty === 'easy') {
        cards = getRandomCards(16);  // 8
        rows = 4;
        cols = 8;
    } else if (difficulty === 'medium') {
        cards = getRandomCards(24);  // 12
        rows = 6;
        cols = 8;
    } else if (difficulty === 'hard') {
        cards = getRandomCards(32);  // 16
        rows = 8;
        cols = 8;
    }

    totalCards = cards.length;
    shuffleCards(cards);
    createBoard(cards);
}

function getRandomCards(pairCount) {
    const selectedCards = [];
    const usedCards = new Set();


    while (selectedCards.length < pairCount) {
        const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
        if (!usedCards.has(randomCard)) {
            selectedCards.push(randomCard, randomCard);
            usedCards.add(randomCard);
        }
    }

    return selectedCards;
}

// Перемешиваем карты случайн
function shuffleCards(cards) {
    cards.sort(() => Math.random() - 0.5);
}

function createBoard(cards) {
    gameBoard.innerHTML = '';
    flippedCards = [];
    matchedCards = [];

    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 100px)`;
    gameBoard.style.gridTemplateRows = `repeat(${rows}, 100px)`;

    // Создаём карточки
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.index = index;
        cardElement.addEventListener('click', () => flipCard(cardElement, cards));
        gameBoard.appendChild(cardElement);
    });

    pairsLeft = cards.length / 2;
    pairsLeftElem.textContent = pairsLeft;
    playerScoreElem.textContent = playerScore;


    showAllCards(cards);
}

function showAllCards(cards) {
    const allCardElements = document.querySelectorAll('.card');
    allCardElements.forEach((cardElement, index) => {
        cardElement.style.backgroundImage = `url(${cards[index]})`;
        cardElement.classList.add('flipped');
    });

    setTimeout(() => {
        allCardElements.forEach(cardElement => {
            cardElement.classList.remove('flipped');
            cardElement.style.backgroundImage = 'url(back.png)';
        });
    }, 2000);
}

function flipCard(cardElement, cards) {
    // Убираем все ограничения на количество открытых карт
    if (cardElement.classList.contains('flipped') || matchedCards.includes(cardElement.dataset.index)) {
        return;  // Если карта уже открыта или она совпала, игнорируем её
    }

    cardElement.classList.add('flipped');
    cardElement.style.backgroundImage = `url(${cards[cardElement.dataset.index]})`;
    flippedCards.push(cardElement);

    // проверяем на совпадение
    if (flippedCards.length === 2) {
        checkMatch(cards);
    }
}

// совпадают ли карты
function checkMatch(cards) {
    const [card1, card2] = flippedCards;
    const index1 = card1.dataset.index;
    const index2 = card2.dataset.index;

    if (cards[index1] === cards[index2]) {
        matchedCards.push(index1, index2);
        updateScore();
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.style.backgroundImage = 'url(back.png)';
            card2.style.backgroundImage = 'url(back.png)';
        }, 1000);
    }

    flippedCards = [];
}

// Обновляем счёт
function updateScore() {
    playerScore++;
    pairsLeft--;
    playerScoreElem.textContent = playerScore;
    pairsLeftElem.textContent = pairsLeft;

    checkWinner();
}

function checkWinner() {
    if (pairsLeft === 0) {
        setTimeout(() => {
            alert(`Вы выиграли! Ваш счёт: ${playerScore}`);
        }, 500);
    }
}

// перезагрузка
restartButton.addEventListener('click', () => {
    playerScore = 0;
    pairsLeft = totalCards / 2;
    playerScoreElem.textContent = playerScore;
    pairsLeftElem.textContent = pairsLeft;
    setDifficulty();
});


difficultySelect.addEventListener('change', () => {
    setDifficulty();
});

setDifficulty();
