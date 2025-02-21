let board = [];
let currentPlayer = 'X';
let gameOver = false;
let boardSize = 3;
let winLength = 3;

const createBoard = () => {
    boardSize = parseInt(document.getElementById('size').value);
    winLength = boardSize >= 5 ? 5 : 3;
    board = Array(boardSize).fill().map(() => Array(boardSize).fill(''));
    gameOver = false;
    currentPlayer = 'X';
    renderBoard();
    updateStatus('Ход игрока X');
};

const renderBoard = () => {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';

    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 50px)`;

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.addEventListener('click', () => makeMove(row, col));
            if (board[row][col] !== '') {
                cell.classList.add('taken');
                cell.textContent = board[row][col];
            }
            boardElement.appendChild(cell);
        }
    }
};

const makeMove = (row, col) => {
    if (gameOver || board[row][col] !== '') return;

    board[row][col] = currentPlayer;
    renderBoard();

    if (checkWin(row, col)) {
        gameOver = true;
        showModal(`Победа! Игрок ${currentPlayer} выиграл!`);
        return;
    }

    if (isDraw()) {
        gameOver = true;
        showModal('Ничья!');
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    if (currentPlayer === 'O') {
        botMove();
    } else {
        updateStatus('Ход игрока X');
    }
};

const botMove = () => {
    if (gameOver) return;

    let move = findBlockingMove();
    if (!move) {
        move = findWinningMove();
    }
    if (!move) {
        move = findRandomMove();
    }

    board[move.row][move.col] = 'O';
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

    // Проверка в 4 направлениях: горизонталь, вертикаль, диагональ \ и диагональ /
    return (
        checkDirection(row, col, 0, 1, player) || // горизонталь
        checkDirection(row, col, 1, 0, player) || // вертикаль
        checkDirection(row, col, 1, 1, player) || // диагональ \
        checkDirection(row, col, 1, -1, player)   // диагональ /
    );
};

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
