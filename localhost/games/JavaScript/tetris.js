const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');
let lastRotateTime = 0;

//const rotateCooldown = 150; // мин задержка в миллисекундах для проворота фигур

const grid = 32; // размер квадратика
var tetrominoSequence = [];
// Игровое поле: 10 столбцов и 20 строк, плюс 2 скрытые строки (индексы -2 и -1)
var playfield = [];
for (let row = -2; row < 20; row++) {
  playfield[row] = [];
  for (let col = 0; col < 10; col++) {
    playfield[row][col] = 0;
  }
}

// матрицы фигур
const tetrominos = {
  'I': [
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0]
  ],
  'J': [
    [1,0,0],
    [1,1,1],
    [0,0,0],
  ],
  'L': [
    [0,0,1],
    [1,1,1],
    [0,0,0],
  ],
  'O': [
    [1,1],
    [1,1],
  ],
  'S': [
    [0,1,1],
    [1,1,0],
    [0,0,0],
  ],
  'Z': [
    [1,1,0],
    [0,1,1],
    [0,0,0],
  ],
  'T': [
    [0,1,0],
    [1,1,1],
    [0,0,0],
  ]
};

//цвета для фигур
const colors = {
  'I': 'cyan',
  'O': 'yellow',
  'T': 'purple',
  'S': 'green',
  'Z': 'red',
  'J': 'blue',
  'L': 'orange'
};

let count = 0;
let score = 0;

// получаем две фигуры: текущую и следующую
let tetromino = getNextTetromino();
let nextTetromino = getNextTetromino();

let rAF = null;  
let gameOver = false;

// возвращает случайное целое число в диапазоне [min, max]
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// генерация последовательности фигур (алгоритм "bag")
function generateSequence() {
  const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  while (sequence.length) {
    const rand = getRandomInt(0, sequence.length - 1);
    const name = sequence.splice(rand, 1)[0];
    tetrominoSequence.push(name);
  }
}

// получаем следующую фигуру
function getNextTetromino() {
  if (tetrominoSequence.length === 0) {
    generateSequence();
  }
  const name = tetrominoSequence.pop();
  const matrix = tetrominos[name];
  const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
  const row = name === 'I' ? -1 : -2;
  return {
    name: name,
    matrix: matrix,
    row: row,
    col: col
  };
}

// поворот матрицы на 90 градусов по часовой стрелке
function rotate(matrix) {
  const N = matrix.length - 1;
  const result = matrix.map((row, i) =>
    row.map((val, j) => matrix[N - j][i])
  );
  return result;
}

//можно ли разместить фигуру в указанном месте
function isValidMove(matrix, cellRow, cellCol) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col]) {
        if (cellCol + col < 0 ||
            cellCol + col >= playfield[0].length ||
            cellRow + row >= playfield.length ||
            playfield[cellRow + row][cellCol + col]) {
          return false;
        }
      }
    }
  }
  return true;
}

// фиксация фигуры на поле
function placeTetromino() {
  for (let row = 0; row < tetromino.matrix.length; row++) {
    for (let col = 0; col < tetromino.matrix[row].length; col++) {
      if (tetromino.matrix[row][col]) {
        if (tetromino.row + row < 0) {
          return showGameOver();
        }
        playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
      }
    }
  }
  // проверка и удаление заполненных рядов с начислением очков
  let rowsCleared = 0;
  for (let row = playfield.length - 1; row >= 0; ) {
    if (playfield[row].every(cell => !!cell)) {
      rowsCleared++;
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < playfield[r].length; c++) {
          playfield[r][c] = (r-1 >= -2) ? playfield[r-1][c] : 0;
        }
      }
    } else {
      row--;
    }
  }
  let points = 0;
  if (rowsCleared === 4) {
    points = 20;
  } else if (rowsCleared === 3) {
    points = 10;
  } else if (rowsCleared === 2) {
    points = 7;
  } else if (rowsCleared === 1) {
    points = 5;
  }
  score += points;
  document.getElementById('score').textContent = score;
  
  tetromino = nextTetromino;
  nextTetromino = getNextTetromino();
  drawNextTetromino();
}

//рисовка следующей фигуры на отдельном холсте
function drawNextTetromino() {
  nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  if (!nextTetromino) return;
  const matrix = nextTetromino.matrix;
  const offsetX = Math.floor((4 - matrix[0].length) / 2);
  const offsetY = Math.floor((4 - matrix.length) / 2);
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col]) {
        nextContext.fillStyle = colors[nextTetromino.name];
        nextContext.fillRect((col + offsetX) * grid, (row + offsetY) * grid, grid-1, grid-1);
      }
    }
  }
}

//модальное окно при проигрыше
function showGameOver() {
  cancelAnimationFrame(rAF);
  gameOver = true;
  document.getElementById('final-score').textContent = score;
  document.getElementById('game-over-modal').style.display = 'flex';
}

// рестарт игры(сброс поля, счёта и переменных)
function restartGame() {
  for (let row = -2; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      playfield[row][col] = 0;
    }
  }
  tetrominoSequence = [];
  score = 0;
  count = 0;
  gameOver = false;
  tetromino = getNextTetromino();
  nextTetromino = getNextTetromino();
  drawNextTetromino();
  document.getElementById('score').textContent = score;
  document.getElementById('game-over-modal').style.display = 'none';
  rAF = requestAnimationFrame(loop);
}

document.getElementById('restart-button').addEventListener('click', restartGame);

//цикл анимации
function loop() {
  rAF = requestAnimationFrame(loop);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  //рисовка заполненных клеток игрового поля
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (playfield[row][col]) {
        const name = playfield[row][col];
        context.fillStyle = colors[name];
        context.fillRect(col * grid, row * grid, grid-1, grid-1);
      }
    }
  }
  
  // падение ныняшней фигуры
  if (++count > 35) {
    tetromino.row++;
    count = 0;
    if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
      tetromino.row--;
      placeTetromino();
    }
  }
  
  // рисовка текущей фигуры
  if (tetromino) {
    context.fillStyle = colors[tetromino.name];
    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {
          context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid-1, grid-1);
        }
      }
    }
  }
  
  //сетка поля
  context.beginPath();
  context.strokeStyle = 'lightgray';
  for (let x = 0; x <= canvas.width; x += grid) {
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
  }
  for (let y = 0; y <= canvas.height; y += grid) {
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
  }
  context.stroke();
}

// управление клавой
document.addEventListener('keydown', function(e) {
  if (gameOver) return;
  // влево/вправо
  if (e.which === 37 || e.which === 39) {
    const col = e.which === 37 ? tetromino.col - 1 : tetromino.col + 1;
    if (isValidMove(tetromino.matrix, tetromino.row, col)) {
      tetromino.col = col;
    }
  }
  // вращение (вверх)
  if (e.which === 38) {
    const matrix = rotate(tetromino.matrix);
    if (isValidMove(matrix, tetromino.row, tetromino.col)) {
      tetromino.matrix = matrix;
    }
  }
  // ускорение падения (вниз)
  if (e.which === 40) {
    const row = tetromino.row + 1;
    if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
      tetromino.row = row - 1;
      placeTetromino();
      return;
    }
    tetromino.row = row;
  }
});

// начальная отрисовка следующей фигуры и запуск цикла игры
drawNextTetromino();
rAF = requestAnimationFrame(loop);