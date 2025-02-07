const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = 800;

let airplaneX = canvas.width / 2 - 20;
let airplaneY = canvas.height - 100;
const airplaneWidth = 40;
const airplaneHeight = 30;
let airplaneSpeed = 2;
let bullets = [];
let enemies = [];
let prizes = [];
let score = 0;
let gameOver = false;
let lastShotTime = 0;
let shootCooldown = 500;
let maxEnemies = 1;

let keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    space: false
};

//перезапуск
const restartButton = document.getElementById('restartButton');
const gameOverContainer = document.getElementById('gameOverContainer');

restartButton.addEventListener('click', restartGame);

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") keys.up = true;
    if (event.key === "ArrowDown") keys.down = true;
    if (event.key === "ArrowLeft") keys.left = true;
    if (event.key === "ArrowRight") keys.right = true;
    if (event.key === " ") keys.space = true;
});

document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowUp") keys.up = false;
    if (event.key === "ArrowDown") keys.down = false;
    if (event.key === "ArrowLeft") keys.left = false;
    if (event.key === "ArrowRight") keys.right = false;
    if (event.key === " ") keys.space = false;
});

function gameLoop() {
    if (gameOver) {
        showGameOver();
        return;
    }

    updateShootCooldown();  // обновляем скорость стрельбы в зависимости от очков
    updateMaxEnemies();     // обновляем максимальное количество врагов в зависимости от очков

    clearCanvas();
    moveBullets();
    moveEnemies();
    movePrizes();
    checkCollisions();
    handleMovement();
    drawAirplane();
    drawBullets();
    drawEnemies();
    drawPrizes();
    drawScore();
    requestAnimationFrame(gameLoop);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function handleMovement() {
    if (keys.up && airplaneY > 0) airplaneY -= airplaneSpeed;
    if (keys.down && airplaneY < canvas.height - airplaneHeight) airplaneY += airplaneSpeed;
    if (keys.left && airplaneX > 0) airplaneX -= airplaneSpeed;
    if (keys.right && airplaneX < canvas.width - airplaneWidth) airplaneX += airplaneSpeed;

    if (keys.space) shootBullet();
}

function shootBullet() {
    const currentTime = Date.now();
    if (currentTime - lastShotTime >= shootCooldown) {
        bullets.push({
            x: airplaneX + airplaneWidth / 2 - 5,
            y: airplaneY,
            width: 10,
            height: 4,
            speed: 5
        });
        lastShotTime = currentTime;
    }
}

function moveBullets() {
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            i--;
        }
    }
}

function generateEnemy() {
    const xPosition = Math.random() * (canvas.width - 40);
    enemies.push({
        x: xPosition,
        y: 0,
        width: 40,
        height: 30,
        speed: 1.5
    });
}

function generatePrize() {
    const xPosition = Math.random() * (canvas.width - 40);
    prizes.push({
        x: xPosition,
        y: 0,
        width: 20,
        height: 20,
        speed: 1
    });
}

function moveEnemies() {
    for (let i = 0; i < maxEnemies; i++) {
        if (Math.random() < 0.01) {
            generateEnemy();
        }
    }

    for (let i = 0; i < enemies.length; i++) {
        enemies[i].y += enemies[i].speed;

        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
            score--;
            i--;
        }
    }
}

function movePrizes() {
    for (let i = 0; i < prizes.length; i++) {
        prizes[i].y += prizes[i].speed;

        if (prizes[i].y > canvas.height) {
            prizes.splice(i, 1);
            i--;
        }
    }
}

function checkCollisions() {
    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < enemies.length; j++) {
            if (bullets[i].x < enemies[j].x + enemies[j].width &&
                bullets[i].x + bullets[i].width > enemies[j].x &&
                bullets[i].y < enemies[j].y + enemies[j].height &&
                bullets[i].y + bullets[i].height > enemies[j].y) {
                
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                score++;

                // 40% шанс на выпадение подарка
                if (Math.random() < 0.4) {
                    generatePrize();
                }

                i--;
                break;
            }
        }
    }

    for (let i = 0; i < prizes.length; i++) {
        
        if (airplaneX < prizes[i].x + prizes[i].width &&
            airplaneX + airplaneWidth > prizes[i].x &&
            airplaneY < prizes[i].y + prizes[i].height &&
            airplaneY + airplaneHeight > prizes[i].y) {
            prizes.splice(i, 1);
            score += 10;
            i--;
        }
    }

    for (let i = 0; i < enemies.length; i++) {
        if (airplaneX < enemies[i].x + enemies[i].width &&
            airplaneX + airplaneWidth > enemies[i].x &&
            airplaneY < enemies[i].y + enemies[i].height &&
            airplaneY + airplaneHeight > enemies[i].y) {
            gameOver = true;
        }
    }
}

function drawAirplane() {
    ctx.fillStyle = "#ff5722";
    ctx.fillRect(airplaneX, airplaneY, airplaneWidth, airplaneHeight);
}

function drawBullets() {
    ctx.fillStyle = "#000000";
    for (let i = 0; i < bullets.length; i++) {
        ctx.fillRect(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height);
    }
}

function drawEnemies() {
    ctx.fillStyle = "#0000ff";
    for (let i = 0; i < enemies.length; i++) {
        ctx.fillRect(enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);
    }
}

function drawPrizes() {
    ctx.fillStyle = "#00ff00";
    for (let i = 0; i < prizes.length; i++) {
        ctx.fillRect(prizes[i].x, prizes[i].y, prizes[i].width, prizes[i].height);
    }
}

function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "#333";
    ctx.fillText("Счёт: " + score, 20, 30);
}

function showGameOver() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "30px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Игра окончена! Счёт: " + score, canvas.width / 2 - 150, canvas.height / 2);

    gameOverContainer.style.display = 'block';
}

function updateShootCooldown() {
    shootCooldown = Math.max(300 - Math.floor(score / 10) * 30, 100);
}

function updateMaxEnemies() {
    maxEnemies = Math.floor(score / 10) + 1;
}

function restartGame() {
    airplaneX = canvas.width / 2 - 20;
    airplaneY = canvas.height - 100;
    score = 0;
    enemies = [];
    prizes = [];
    bullets = [];
    gameOver = false;

    gameOverContainer.style.display = 'none';

    gameLoop();
}

gameLoop();
