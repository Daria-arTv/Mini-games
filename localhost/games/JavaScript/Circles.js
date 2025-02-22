//Объявление переменных - массив, текущий игрок, окончание игры, размер поля по умолчанию 3на3, кроличество символов в ряд для победы
let board = []; //массив
let currentPlayer = 'X'; //текущий игрок
let gameOver = false; //окончание игры
let boardSize = 3; // размер поля по умолчанию 3на3
let winLength = 3; //кроличество символов в ряд для победы

// Создание игрового поля
const createBoard = () => {
    boardSize = parseInt(document.getElementById('size').value);
    winLength = boardSize >= 5 ? 5 : 3;  // Если поле 5x5 или больше, то нужно 5 символов в ряд, иначе 3
    board = Array(boardSize).fill().map(() => Array(boardSize).fill(''));//создание пустого поля
    gameOver = false; // Сбрас флага окончания игры
    currentPlayer = 'X';// Первый ход делает X
    renderBoard();// отображаем поле
    updateStatus('Ход игрока X');// обновляем статус
};
 // отображение поля
const renderBoard = () => {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';  // очищаем игровое поле

    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 50px)`; // Устанавливаем размер сетки

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');// создаем ячейку
            cell.classList.add('cell');//css-класс
            cell.addEventListener('click', () => makeMove(row, col)); // обрабатываем клик
            if (board[row][col] !== '') {
                cell.classList.add('taken'); // если клетка занята, добавляем класс
                cell.textContent = board[row][col]; // Устанавливаем X или O
            }
            boardElement.appendChild(cell);
        }
    }
};
// ход игрока.
const makeMove = (row, col) => {
    if (gameOver || board[row][col] !== '') return;

    board[row][col] = currentPlayer;  // записываем ход игрока
    renderBoard(); // обновляем поле

    if (checkWin(row, col)) {//проверяем победу
        gameOver = true;
        showModal(`Победа! Игрок ${currentPlayer} выиграл!`);
        return;
    }

    if (isDraw()) { //проверяем ничью
        gameOver = true;
        showModal('Ничья!');
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';  // иеняем игрока
    if (currentPlayer === 'O') {
        botMove(); // ходит бот
    } else {
        updateStatus('Ход игрока X');
    }
};
//xод бота.
const botMove = () => {
    if (gameOver) return;

    let move = findBlockingMove(); //можно ли заблокировать игрока
    if (!move) {
        move = findWinningMove();// может ли бот выиграть сразу
    }
    if (!move) {
        move = findRandomMove();//случайный ход
    }

    board[move.row][move.col] = 'O';// записываем ход бота
    renderBoard();

    if (checkWin(move.row, move.col)) {
        gameOver = true;
        showModal('Победа! Бот выиграл!');
        return;
    }

    if (isDraw()) {
        gameOver = true;
        showModal('Ничья!');
        return;
    }

    currentPlayer = 'X';
    updateStatus('Ход игрока X');
};

const findBlockingMove = () => {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] === '') {
                board[row][col] = 'X';
                if (checkWin(row, col)) {
                    board[row][col] = 'O';
                    return { row, col };
                }
                board[row][col] = '';
            }
        }
    }
    return null;
};

const findWinningMove = () => {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] === '') {
                board[row][col] = 'O';
                if (checkWin(row, col)) {
                    return { row, col };
                }
                board[row][col] = '';
            }
        }
    }
    return null;
};

const findRandomMove = () => {
    let availableMoves = [];
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] === '') {
                availableMoves.push({ row, col });
            }
        }
    }
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
};

const checkWin = (row, col) => {
    const player = board[row][col];

    // проверка в 4 направлениях: горизонталь, вертикаль, диагональ \ и диагональ /
    return (
        checkDirection(row, col, 0, 1, player) || // горизонталь
        checkDirection(row, col, 1, 0, player) || // вертикаль
        checkDirection(row, col, 1, 1, player) || // диагональ \
        checkDirection(row, col, 1, -1, player)   // диагональ /
    );
};
 //проверяем выигрыш в 4 направлениях.
const checkDirection = (row, col, dRow, dCol, player) => {
    let count = 1;

    for (let i = 1; i < winLength; i++) {
        const r = row + i * dRow;
        const c = col + i * dCol;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === player) {
            count++;
        } else {
            break;
        }
    }

    for (let i = 1; i < winLength; i++) {
        const r = row - i * dRow;
        const c = col - i * dCol;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === player) {
            count++;
        } else {
            break;
        }
    }

    return count >= winLength;
};
//проверка ничьей
const isDraw = () => {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] === '') {
                return false;
            }
        }
    }
    return true;
};

const updateStatus = (message) => {
    document.getElementById('status').textContent = message;
};

const showModal = (message) => {
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modal-message');
    modalMessage.textContent = message;
    modal.style.display = 'flex';
};

const closeModal = () => {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    restartGame();
};

const restartGame = () => {
    createBoard();
    closeModal();
};

createBoard();
