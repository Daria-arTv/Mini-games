let boardSize = 8;
let mineCount = 10;
let board = [];
let gameOver = false;

function setDifficulty() {
  const difficulty = document.getElementById("difficulty").value;
  if (difficulty === "easy") {
    boardSize = 8;
    mineCount = 10;
  } else if (difficulty === "medium") {
    boardSize = 12;
    mineCount = 20;
  } else if (difficulty === "hard") {
    boardSize = 16;
    mineCount = 40;
  }
}

function createBoard() {
  setDifficulty();
  board = [];
  const gameBoard = document.getElementById("game-board");
  gameBoard.innerHTML = "";
  gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 40px)`;

  for (let i = 0; i < boardSize; i++) {
    board[i] = [];
    for (let j = 0; j < boardSize; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.addEventListener("click", () => revealCell(i, j));
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        toggleFlag(cell);
      });
      gameBoard.appendChild(cell);
      board[i][j] = { mine: false, revealed: false, flagged: false };
    }
  }
  placeMines();
}

function placeMines() {
  let minesPlaced = 0;
  while (minesPlaced < mineCount) {
    const row = Math.floor(Math.random() * boardSize);
    const col = Math.floor(Math.random() * boardSize);

    if (!board[row][col].mine) {
      board[row][col].mine = true;
      minesPlaced++;
    }
  }
}

function revealCell(row, col) {
  if (gameOver || board[row][col].revealed || board[row][col].flagged) return;

  const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  board[row][col].revealed = true;
  cell.classList.add("revealed");

  if (board[row][col].mine) {
    cell.innerHTML = "💣";
    cell.style.backgroundColor = "red";
    gameOver = true; // устанавливаем флаг о завершении игры
    alert("Вы проиграли! Нажмите 'Играть заново' для новой игры.");
    revealAllMines(); // раскрываем бомбы
    return;
  }

  const adjacentMines = countAdjacentMines(row, col);
  if (adjacentMines > 0) {
    cell.textContent = adjacentMines;
  } else {
    revealAdjacentCells(row, col);
  }

  checkForVictory();
}

function countAdjacentMines(row, col) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const newRow = row + i;
      const newCol = col + j;
      if (isValidCell(newRow, newCol) && board[newRow][newCol].mine) {
        count++;
      }
    }
  }
  return count;
}

function revealAdjacentCells(row, col) {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const newRow = row + i;
      const newCol = col + j;
      if (isValidCell(newRow, newCol) && !board[newRow][newCol].revealed) {
        revealCell(newRow, newCol);
      }
    }
  }
}

function isValidCell(row, col) {
  return row >= 0 && col >= 0 && row < boardSize && col < boardSize;
}

function toggleFlag(cell) {
  const row = parseInt(cell.dataset.row, 10);
  const col = parseInt(cell.dataset.col, 10);

  if (!board[row][col].revealed && !gameOver) {
    board[row][col].flagged = !board[row][col].flagged;
    cell.classList.toggle("flag");
  }
}

function revealAllMines() {
  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.mine) {
        const cellElement = document.querySelector(`[data-row="${rowIndex}"][data-col="${colIndex}"]`);
        cellElement.innerHTML = "💣";
        cellElement.style.backgroundColor = "red";
      }
    });
  });
}

function checkForVictory() {
  let revealedCells = 0;
  board.forEach(row => {
    row.forEach(cell => {
      if (cell.revealed && !cell.mine) {
        revealedCells++;
      }
    });
  });

  const totalSafeCells = boardSize * boardSize - mineCount;
  if (revealedCells === totalSafeCells) {
    alert("Вы выиграли! Поздравляем!");
    revealAllMines(); // раскрываем все бомбы после победы
  }
}

document.getElementById("restart").addEventListener("click", () => {
  gameOver = false;
  createBoard();
});

createBoard();
