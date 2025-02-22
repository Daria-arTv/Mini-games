const gridSize = 4; // размер игрового поля 4x4
const tileSize = 100;// размер плитки в пикселях
const gap = 10;  // расстояние между плитками

let board = []; //массив (игровое поле)
let tileIdCounter = 0; // счетчик для присваивания уникальных ID плиткам
let tileElements = {}; // объект, хранящий HTML-элементы плиток
let tilesToRemove = [];// плитки, которые нужно удалить после объединения
let winTriggered = false; // отслеживает достижения 2048

function initBoard() {
  board = [];
  for (let r = 0; r < gridSize; r++) {
    let row = [];
    for (let c = 0; c < gridSize; c++) {
      row.push(null);
    }
    board.push(row);
  }
  const grid = document.getElementById("grid");
  grid.querySelectorAll('.tile').forEach(tile => tile.remove()); // удаляет старые плитки
  tileElements = {};// очищает объект с плитками
  tileIdCounter = 0;// обнуляет ID счетчик плиток
  tilesToRemove = []; // очищает массив удаляемых плиток
  winTriggered = false; // Сбрасывает победу

  document.getElementById("game-over").style.display = "none";
  document.getElementById("win-overlay").style.display = "none";

//добавляет две случайные плитки в начале игры
  addRandomTile();
  addRandomTile();
  updateBoard();
}
// вычисл позиции плитки
function getTilePosition(row, col) {
  let top = gap + row * (tileSize + gap);
  let left = gap + col * (tileSize + gap);
  return { top, left };
}
//созд новой плитки
function addRandomTile() {
  let emptyCells = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (board[r][c] === null) {
        emptyCells.push({ r, c });
      }
    }
  }
  //Нахожд пустых клеток на игровом поле
  if (emptyCells.length > 0) {
    let { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    let value = Math.random() < 0.9 ? 2 : 4; // 90% шанс получить 2, 10% шанс получить 4
    let tile = { id: tileIdCounter++, value: value, merged: false };
    board[r][c] = tile;
    createTileElement(tile, r, c);
  }
}

function createTileElement(tile, row, col) {
  const grid = document.getElementById("grid");
  const div = document.createElement("div");
  div.classList.add("tile", "tile-" + tile.value);
  div.textContent = tile.value;
  div.setAttribute("data-id", tile.id);
  let pos = getTilePosition(row, col);
  div.style.top = pos.top + "px";
  div.style.left = pos.left + "px";
  grid.appendChild(div);
  tileElements[tile.id] = div;
}
//сдвиг/объединение плиток
function slideRow(row) {
  let filtered = row.filter(tile => tile !== null);
  let missing = gridSize - filtered.length;
  return [...filtered, ...Array(missing).fill(null)];
}

// объединение плиток
function combineRow(row) {
  for (let i = 0; i < gridSize - 1; i++) {
    if (row[i] && row[i + 1] && row[i].value === row[i + 1].value && !row[i].merged && !row[i + 1].merged) {
      row[i].value *= 2; // объединяет плитки
      row[i].merged = true;
      tilesToRemove.push(row[i + 1].id); // метка плитки для удаления
      row[i + 1] = null;
    }
  }
  return row;
}

function resetMergedFlags() {
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (board[r][c]) {
        board[r][c].merged = false;
      }
    }
  }
}
//вверх/вниз
function rotateBoard() {
  let newBoard = [];
  for (let r = 0; r < gridSize; r++) {
    newBoard.push(new Array(gridSize).fill(null));
  }
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      newBoard[c][gridSize - 1 - r] = board[r][c];
    }
  }
  board = newBoard;
}
//обработка движений
function move(direction) {
  let oldBoard = JSON.stringify(board, (key, value) => {
    if (value && value.id !== undefined) {
      return { id: value.id, value: value.value };
    }
    return value;
  });
  
  tilesToRemove = [];
  
  if (direction === 'up') {
    rotateBoard();
    rotateBoard();
    rotateBoard();
    move('left');
    rotateBoard();
  } else if (direction === 'down') {
    rotateBoard();
    move('left');
    rotateBoard();
    rotateBoard();
    rotateBoard();
  } else if (direction === 'right') {
    for (let r = 0; r < gridSize; r++) {
      board[r] = board[r].reverse();
      let row = slideRow(board[r]);
      row = combineRow(row);
      row = slideRow(row);
      board[r] = row.reverse();
    }
  } else if (direction === 'left') {
    for (let r = 0; r < gridSize; r++) {
      let row = board[r];
      row = slideRow(row);
      row = combineRow(row);
      row = slideRow(row);
      board[r] = row;
    }
  }
  resetMergedFlags();
  let newBoard = JSON.stringify(board, (key, value) => {
    if (value && value.id !== undefined) {
      return { id: value.id, value: value.value };
    }
    return value;
  });
  
  //новые плитки
  if (oldBoard !== newBoard) {
    addRandomTile();
  }
  updateBoard();

  //наличие ходов
  if (checkGameOver()) {
    showGameOverOverlay();
  }
}
function updateBoard() {
  // обн положение и знач
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      let tile = board[r][c];
      if (tile) {
        let pos = getTilePosition(r, c);
        let el = tileElements[tile.id];
        if (el) {
          el.style.top = pos.top + "px";
          el.style.left = pos.left + "px";
          el.textContent = tile.value;
          el.className = "tile tile-" + tile.value;
        }
      }
    }
  }
  //удал объединение
  tilesToRemove.forEach(id => {
    let el = tileElements[id];
    if (el) {
      el.classList.add("merge");
      setTimeout(() => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      }, 200);
      delete tileElements[id];
    }
  });

  checkWin();
}
function checkGameOver() {
  // пустая - дальше
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (board[r][c] === null) return false;
    }
  }
  // проверка сосед клеток
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      let current = board[r][c];
      if (c < gridSize - 1 && board[r][c+1] && current.value === board[r][c+1].value) {
        return false;
      }
      if (r < gridSize - 1 && board[r+1][c] && current.value === board[r+1][c].value) {
        return false;
      }
    }
  }
  return true;
}
function showGameOverOverlay() {
  const overlay = document.getElementById("game-over");
  overlay.style.display = "flex";
}
//выигрыш
function checkWin() {
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      let tile = board[r][c];
      if (tile && tile.value === 2048 && !winTriggered) {
        winTriggered = true;
        showWinOverlay();
        return;
      }
    }
  }
}
function showWinOverlay() {
  const overlay = document.getElementById("win-overlay");
  overlay.style.display = "flex";
}
//обработак клавиш
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowLeft":
      move("left");
      break;
    case "ArrowRight":
      move("right");
      break;
    case "ArrowUp":
      move("up");
      break;
    case "ArrowDown":
      move("down");
      break;
  }
});

//перезапуск при проигрыш
document.getElementById("restart").addEventListener("click", initBoard);
// выигрыш 
document.getElementById("continue").addEventListener("click", () => {
  document.getElementById("win-overlay").style.display = "none";
});
document.getElementById("new-game").addEventListener("click", initBoard);
document.addEventListener("DOMContentLoaded", initBoard);