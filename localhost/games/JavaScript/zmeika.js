const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const cell_size = 20;
const width = canvas.width;
const height = canvas.height;

let snake = [{ x: width / 2, y: height / 2 }];
let direction = "right";
let nextDirection = "right";
let apple = generateApple();
let score = 0;
let game_started = false;
let isDirectionChanged = false;

function generateApple() {
    let newApple;
    do {
        newApple = {
            x: Math.floor(Math.random() * (width / cell_size)) * cell_size,
            y: Math.floor(Math.random() * (height / cell_size)) * cell_size
        };
    } while (snake.some(part => part.x === newApple.x && part.y === newApple.y));
    return newApple;
}

function draw_snake() {
    ctx.fillStyle = "green";
    snake.forEach(part => ctx.fillRect(part.x, part.y, cell_size, cell_size));
}

function draw_apple() {
    ctx.fillStyle = "red";
    ctx.fillRect(apple.x, apple.y, cell_size, cell_size);
}

function change_direction(event) {
    if (!game_started) {
        game_started = true;
        game_loop();
    }

    if (isDirectionChanged) return;

    const key = event.key;
    if (key === "ArrowUp" && direction !== "down") {
        nextDirection = "up";
        isDirectionChanged = true;
    } else if (key === "ArrowDown" && direction !== "up") {
        nextDirection = "down";
        isDirectionChanged = true;
    } else if (key === "ArrowLeft" && direction !== "right") {
        nextDirection = "left";
        isDirectionChanged = true;
    } else if (key === "ArrowRight" && direction !== "left") {
        nextDirection = "right";
        isDirectionChanged = true;
    }
}

document.addEventListener("keydown", change_direction);

function game_loop() {
    if (!game_started) return;

    direction = nextDirection;
    isDirectionChanged = false;

    let head = { ...snake[0] };

    if (direction === "up") head.y -= cell_size;
    else if (direction === "down") head.y += cell_size;
    else if (direction === "left") head.x -= cell_size;
    else if (direction === "right") head.x += cell_size;

    // телепортация через границы
    if (head.x < 0) head.x = width - cell_size;
    else if (head.x >= width) head.x = 0;
    if (head.y < 0) head.y = height - cell_size;
    else if (head.y >= height) head.y = 0;

    snake.unshift(head);

    if (head.x === apple.x && head.y === apple.y) {
        score++;
        apple = generateApple();
    } else {
        snake.pop();
    }

    // проверка на столкновение с собой
    if (snake.slice(1).some(part => part.x === head.x && part.y === head.y)) {
        alert(`Игра окончена! Ваш счёт: ${score}`);
        window.location.reload();
        return;
    }

    ctx.clearRect(0, 0, width, height);
    draw_snake();
    draw_apple();

    document.getElementById("score").innerText = score;

    setTimeout(game_loop, 100);
}