
const board = document.getElementById('sudoku-board');
let selectedCell = null;
let correctBoard = [];

function copyBoard(board) {
  return board.map(row => row.slice());
}

function generateBoard(emptyCells) {
  board.innerHTML = '';

  const fullBoard = generateFullBoard();
  correctBoard = fullBoard;

  const puzzleBoard = removeCells(copyBoard(fullBoard), emptyCells);

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const cell = document.createElement('input');
      cell.classList.add('cell');
      cell.maxLength = 1;
      cell.dataset.row = i;
      cell.dataset.col = j;
      
      if (puzzleBoard[i][j] !== null) {
        cell.value = puzzleBoard[i][j];
        cell.setAttribute('readonly', 'true');
      } else {
        cell.addEventListener('keydown', (event) => {
          const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
          if (allowedKeys.includes(event.key)) return;
          if (/^[1-9]$/.test(event.key)) {
            event.preventDefault();
            cell.value = event.key; 
            const row = parseInt(cell.dataset.row, 10);
            const col = parseInt(cell.dataset.col, 10);
            checkForErrors(cell, row, col);
            updateDynamicCounts();
          } else {
            event.preventDefault();
          }
        });
        cell.addEventListener('input', () => {
          const row = parseInt(cell.dataset.row, 10);
          const col = parseInt(cell.dataset.col, 10);
          if (cell.value.length > 1) {
            cell.value = cell.value.slice(0, 1);
          }
          checkForErrors(cell, row, col);
          updateDynamicCounts();
        });
      }
      
      cell.addEventListener('click', () => {
        selectCell(cell, i, j);
      });
      
      board.appendChild(cell);
    }
  }
  updateDynamicCounts();
}

function generateFullBoard() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(null));
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      board[i][j] = ((i * 3 + Math.floor(i / 3) + j) % 9) + 1;
    }
  }
  return board;
}

function removeCells(board, emptyCells) {
  let removed = 0;
  while (removed < emptyCells) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (board[row][col] !== null) {
      board[row][col] = null;
      removed++;
    }
  }
  return board;
}

function calculateRequiredCounts(board) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  board.flat().forEach(cell => {
    if (cell !== null) {
      counts[cell]++;
    }
  });
  return counts;
}

function updateDynamicCounts() {
  const requiredCounts = calculateRequiredCounts(correctBoard);
  const correctFilled = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  const cells = board.children;
  let filledCells = 0;

  for (let idx = 0; idx < cells.length; idx++) {
    const cell = cells[idx];
    const row = Math.floor(idx / 9);
    const col = idx % 9;
    const correctDigit = correctBoard[row][col];
    if (cell.hasAttribute('readonly')) {
      correctFilled[correctDigit] = (correctFilled[correctDigit] || 0) + 1;
    } else {
      const val = cell.value.trim();
      if (val !== '') {
        const inputDigit = parseInt(val, 10);
        if (inputDigit === correctDigit && !cell.classList.contains('error')) {
          correctFilled[correctDigit] = (correctFilled[correctDigit] || 0) + 1;
        }
        filledCells++;
      }
    }
  }

  for (let d = 1; d <= 9; d++) {
    const remaining = requiredCounts[d] - (correctFilled[d] || 0);
    const numberElement = document.getElementById(`number-${d}`);
    if (numberElement) {
      const countSpan = numberElement.querySelector('.count');
      if (countSpan) {
        countSpan.textContent = remaining;
      } else {
        numberElement.textContent = `${d}: ${remaining}`;
      }
    }
  }

  if (filledCells === 81 && isSolvedCorrectly()) {
    showVictoryMessage();
  }
}

function isSolvedCorrectly() {
  const cells = board.children;
  for (let idx = 0; idx < cells.length; idx++) {
    const cell = cells[idx];
    const row = Math.floor(idx / 9);
    const col = idx % 9;
    const userInput = parseInt(cell.value.trim(), 10);
    const correctValue = correctBoard[row][col];

    if (userInput !== correctValue) {
      return false;
    }
  }
  return true;
}

function showVictoryMessage() {
  alert("Поздравляем! Вы выиграли!");
}
function checkForErrors(cell, row, col) {
  const inputText = cell.value.trim();
  if (inputText === '') {
    cell.classList.remove('error');
    return;
  }
  const userInput = parseInt(inputText, 10);
  const correctValue = correctBoard[row][col];
  if (userInput !== correctValue) {
    cell.classList.add('error');
  } else {
    cell.classList.remove('error');
  }
}

function selectCell(cell, row, col) {
  if (selectedCell) {
    selectedCell.classList.remove('selected');
  }
  selectedCell = cell;
  selectedCell.classList.add('selected');
  highlightRowAndColumn(row, col);
}

function highlightRowAndColumn(row, col) {
  document.querySelectorAll('.cell').forEach(cell => {
    cell.classList.remove('highlight-row', 'highlight-column', 'highlight-matching');
  });
  for (let i = 0; i < 9; i++) {
    board.children[row * 9 + i].classList.add('highlight-row');
  }
  for (let i = 0; i < 9; i++) {
    board.children[i * 9 + col].classList.add('highlight-column');
  }
  const selectedValue = selectedCell.value;
  document.querySelectorAll('.cell').forEach(cell => {
    if (cell.value === selectedValue && selectedValue !== '') {
      cell.classList.add('highlight-matching');
    }
  });
}

document.addEventListener('click', (e) => {
  if (!board.contains(e.target)) {
    if (selectedCell) {
      selectedCell.classList.remove('selected');
    }
    document.querySelectorAll('.cell').forEach(cell => {
      cell.classList.remove('highlight-row', 'highlight-column', 'highlight-matching');
    });
    selectedCell = null;
  }
});


document.querySelectorAll('.number').forEach(numberElement => {
  numberElement.addEventListener('click', () => {
    if (selectedCell && !selectedCell.hasAttribute('readonly')) {
      const digit = numberElement.id.split('-')[1];
      selectedCell.value = digit;
      const row = parseInt(selectedCell.dataset.row, 10);
      const col = parseInt(selectedCell.dataset.col, 10);
      checkForErrors(selectedCell, row, col);
      updateDynamicCounts();
    }
  });
});

document.getElementById('clear-digit').addEventListener('click', () => {
  if (selectedCell && !selectedCell.hasAttribute('readonly')) {
    selectedCell.value = "";
    selectedCell.classList.remove('error');
    const row = parseInt(selectedCell.dataset.row, 10);
    const col = parseInt(selectedCell.dataset.col, 10);
    updateDynamicCounts();
  }
});

document.querySelectorAll('.difficulty-button').forEach(button => {
  button.addEventListener('click', () => {
    let emptyCells;
    switch (button.dataset.difficulty) {
      case 'easy':
        emptyCells = 30;
        break;
      case 'medium':
        emptyCells = 55;
        break;
      case 'hard':
        emptyCells = 65;
        break;
      default:
        emptyCells = 30;
    }
    generateBoard(emptyCells);
  });
});

generateBoard(30);
