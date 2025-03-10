const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 400;

// параметры платформы
const paddleWidth = 100, paddleHeight = 10;
let paddleX = (canvas.width - paddleWidth) / 2;
const paddleSpeed = 6;
let leftPressed = false;
let rightPressed = false;

// параметры мяча
let ballRadius = 7;
let ballX, ballY, ballDX, ballDY;
let ballOnPaddle = true;

// начальная скорость мяча
const initialBallSpeed = 2.5;
let ballSpeed = initialBallSpeed;

let bricks = [];
let score = 0;
let lives = 3;
// уровни игры
const levels = [
    [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
    ],
    [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 0, 1, 1, 0, 1, 0],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
    ],
    [
        [1, 0, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 0, 1, 1, 0, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 1, 0, 1, 0, 1, 0]
    ],
    [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
    ],
    [
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1],
        [1, 0, 1, 1, 1, 1, 0, 1],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [1, 0, 1, 1, 1, 1, 0, 1],
        [1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1]
    ]
];
// текущий уровень
let currentLevel = 0;

// загрузка уровня
function loadLevel(levelIndex) {
    const layout = levels[levelIndex];
    bricks = [];

    for (let c = 0; c < layout[0].length; c++) {
        bricks[c] = [];
        for (let r = 0; r < layout.length; r++) {
            bricks[c][r] = {
                x: 0, y: 0,
                strength: layout[r][c] === 1 ? 1 : 0
            };
        }
    }
}

// сброс мяча на платформу
function resetBall() {
    ballX = paddleX + paddleWidth / 2;
    ballY = canvas.height - paddleHeight - ballRadius - 1;
    ballDX = ballSpeed;
    ballDY = -ballSpeed;
    ballOnPaddle = true;
}

// перезапуск игры
function resetGame() {
    currentLevel = 0;
    lives = 3;
    score = 0;
    loadLevel(currentLevel);
    resetBall();
    updateUI();
}

// отрисовка кирпичей
function drawBricks() {
    const brickWidth = 65, brickHeight = 20, brickPadding = 10;
    const brickOffsetTop = 30, brickOffsetLeft = 15;

    for (let c = 0; c < bricks.length; c++) {
        for (let r = 0; r < bricks[c].length; r++) {
            const brick = bricks[c][r];
            if (brick.strength > 0) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                brick.x = brickX;
                brick.y = brickY;
                ctx.fillStyle = "#99779C";
                ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
            }
        }
    }
}

// отрисовка платформы
function drawPaddle() {
    ctx.fillStyle = "#b467be";
    ctx.fillRect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
}
// отрисовка мяча
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#f00";
    ctx.fill();
    ctx.closePath();
}

// проверка столкновений с кирпичами
function collisionDetection() {
    for (let c = 0; c < bricks.length; c++) {
        for (let r = 0; r < bricks[c].length; r++) {
            const brick = bricks[c][r];
            if (brick.strength > 0 &&
                ballX > brick.x && ballX < brick.x + 65 &&
                ballY > brick.y && ballY < brick.y + 20) {
                ballDY = -ballDY;
                brick.strength = 0;
                score += 10;
                if (checkWin()) nextLevel();
            }
        }
    }
}

// проверка на победу на уровне
function checkWin() {
    return bricks.flat().every(brick => brick.strength === 0);
}

// переход на следующий уровень
function nextLevel() {
    currentLevel++;
    if (currentLevel < levels.length) {
        alert(`Уровень ${currentLevel + 1}`);
        loadLevel(currentLevel);
        resetBall();
    } else {
        alert("Поздравляем! Все уровни пройдены!");
        resetGame();
    }
}

// обновление интерфейса пользователя
function updateUI() {
    document.getElementById("score").innerText = score;
    document.getElementById("lives").innerText = lives;
}

// движение платформы
function movePaddle() {
    if (leftPressed && paddleX > 0) paddleX -= paddleSpeed;
    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += paddleSpeed;
    if (ballOnPaddle) ballX = paddleX + paddleWidth / 2;
}

// обновление позиции мяча
function updateBall() {
    if (ballOnPaddle) return;
    ballX += ballDX;
    ballY += ballDY;

    if (ballX + ballRadius > canvas.width || ballX - ballRadius < 0) ballDX = -ballDX;
    if (ballY - ballRadius < 0) ballDY = -ballDY;

    if (ballY + ballRadius > canvas.height - paddleHeight &&
        ballX > paddleX && ballX < paddleX + paddleWidth) {
        ballDY = -Math.abs(ballDY);
    } else if (ballY > canvas.height) {
        lives--;
        if (lives === 0) {
            alert("Игра окончена!");
            resetGame();
        } else {
            resetBall();
        }
    }
}

// основной цикл отрисовки
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawPaddle();
    drawBall();
    movePaddle();
    updateBall();
    collisionDetection();
    updateUI();
    requestAnimationFrame(draw);
}

// обработчики событий для управления платформой
document.addEventListener("keydown", e => { if (e.key === "ArrowLeft") leftPressed = true; if (e.key === "ArrowRight") rightPressed = true; if (e.key === " ") ballOnPaddle = false; });
document.addEventListener("keyup", e => { if (e.key === "ArrowLeft") leftPressed = false; if (e.key === "ArrowRight") rightPressed = false; });
document.getElementById("restartButton").onclick = resetGame;
// запрещаем прокрутку с помощью стрелок и колесика мыши
window.addEventListener("keydown", function(e) {
    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
    }
});

window.addEventListener("wheel", function(e) {
    e.preventDefault(); // предотвращает прокрутку колесиком мыши
}, { passive: false });
resetGame();
draw();