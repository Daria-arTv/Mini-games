let levelsCompleted = 0; // количество завершенных уровней
let isLevelComplete = false; //завершён ли уровень

class Maze {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = this.generateMaze();
    }

    generateMaze() {
        let maze = Array.from({ length: this.height }, () => Array(this.width).fill(1)); // заполнение стенами
        let stack = [[1, 1]]; //начало отслеживания пути
        maze[1][1] = 0; // начальная точка

        // генерация
        while (stack.length) {
            let [x, y] = stack[stack.length - 1];//текущ точка
            let directions = [
                [0, -2], [0, 2], [-2, 0], [2, 0] // возможн направления для хождения (вверх, вниз, влево, вправо)
            ].filter(([dx, dy]) => {
                let nx = x + dx, ny = y + dy;
                return nx > 0 && ny > 0 && nx < this.width - 1 && ny < this.height - 1 && maze[ny][nx] === 1; // проверка, что новое направление не выходит за пределы и что там стена
            });

            if (directions.length) { // если есть допустимые направления для движения
                let [dx, dy] = directions[Math.floor(Math.random() * directions.length)]; // выбираем случайное направление
                maze[y + dy][x + dx] = 0; // создаем проход
                maze[y + dy / 2][x + dx / 2] = 0; // очищаем стенку между соседними клетками
                stack.push([x + dx, y + dy]); // добавляем новую точку в стек для дальнейшего движения
            } else {
                stack.pop(); // если нет возможных направлений, отступаем назад
            }
        }
        return maze; // возвращаем сгенерированный лабиринт
    }
}

// функция генерации играбельного лабиринта
function generatePlayableMaze(width, height) {
    let maze;
    do {
        maze = new Maze(width, height); // генерируем лабиринт
    } while (!isSolvable(maze.grid)); // повторяем, пока лабиринт не станет проходимым
    return maze.grid; // возвращаем сгенерированный лабиринт
}

// функция  можно ли пройти лабиринт (проверка на проходимость)
function isSolvable(grid) {
    let queue = [[1, 1]]; // стартовая точка
    let visited = new Set(["1,1"]); // множество для отслеживания посещенных клеток

    //поиск в ширину для проверки, есть ли путь от старта до финиша
    while (queue.length) {
        let [x, y] = queue.shift(); // берем первую точку из очереди
        if (x === grid[0].length - 2 && y === grid.length - 2) return true; // если достигнут финиш, возвращаем true
        for (let [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { //проверяем соседние клетки (вверх, вниз, влево, вправо)
            let nx = x + dx, ny = y + dy;
            if (nx > 0 && ny > 0 && nx < grid[0].length - 1 && ny < grid.length - 1 && !visited.has(`${nx},${ny}`) && grid[ny][nx] === 0) {
                visited.add(`${nx},${ny}`); // если клетка не была посещена и является проходом (0), добавляем её в очередь
                queue.push([nx, ny]); // добавляем клетку в очередь
            }
        }
    }
    return false; // если нет пути - возвращаем false
}

// функция рисования лабиринта на холсте
function drawMaze(maze) {
    const canvas = document.getElementById("mazeCanvas"); // получаем элемент canvas
    const ctx = canvas.getContext("2d"); // получаем контекст рисования
    const tileSize = 20; // размер клетки (пиксели)
    canvas.width = maze[0].length * tileSize; // ширина холста зависит от ширины лабиринта
    canvas.height = maze.length * tileSize; // высота холста зависит от высоты лабиринта
    
    // рисуем каждую клетку лабиринта
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            ctx.fillStyle = maze[y][x] === 1 ? "black" : "white"; // если клетка - стена, рисуем черной, иначе белой
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize); // рисуем клетку
        }
    }
    
    // рисуем стартовую и конечную точки
    ctx.fillStyle = "green"; // старт
    ctx.fillRect(20, 20, tileSize, tileSize); // стартовая точка
    ctx.fillStyle = "blue"; // конец
    ctx.fillRect((maze[0].length - 2) * tileSize, (maze.length - 2) * tileSize, tileSize, tileSize); // конечная точка
    
    // игрок рисуем
    ctx.fillStyle = "red";
    ctx.fillRect(player.x * tileSize, player.y * tileSize, tileSize, tileSize); // рисуем красный квадрат (игрок)
}

//перемещение игрока
function movePlayer(event) {
    // определяем изменения по оси x и y в зависимости от нажатой клавиши
    let [dx, dy] = { "ArrowUp": [0, -1], "ArrowDown": [0, 1], "ArrowLeft": [-1, 0], "ArrowRight": [1, 0] }[event.key] || [0, 0];
    let nx = player.x + dx, ny = player.y + dy; //рассчет новых координат игрока
    if (maze[ny][nx] === 0) { //можно ли пройти в клетку
        player.x = nx; // обнов координаты игрока
        player.y = ny;
        drawMaze(maze); // новый лабиринт
        // если конец лабиринта
        if (nx === maze[0].length - 2 && ny === maze.length - 2) {
            levelsCompleted++; //счетчик завершенных уровней
            document.getElementById("levelCount").textContent = levelsCompleted; // обновление отображения счетчика уровней
            document.getElementById("modalLevelCount").textContent = levelsCompleted;
            document.getElementById("winModal").style.display = "block"; // модальное окно победы
            isLevelComplete = true; //завершение уровня
        }
    }
}

// Функция для перезапуска игры
function restartGame() {
    document.getElementById("winModal").style.display = "none"; // закрытие модального окна
    maze = generatePlayableMaze(21, 21); // новый лабиринт
    player.x = 1; // возврат на начальную позицию
    player.y = 1;
    drawMaze(maze); //новый лабиринт
    isLevelComplete = false;
}

document.addEventListener("keydown", function(event) {
    // уровень завершен - не обрабатываем нажатие пробела
    if (isLevelComplete && event.key === " ") {
        event.preventDefault(); // предотвращаем действие по умолчанию (прокрутку страницы)
        return; // не обрабатываем событие
    }
    //  нажата стрелка - перемещаем игрока
    if (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault(); // предотвращаем прокрутку страницы
        movePlayer(event); // перемещение игрока
    }
});

let maze = generatePlayableMaze(21, 21); // генерация лабиринта
let player = { x: 1, y: 1 }; // начальная позиция игрока
drawMaze(maze); // рисуем лабиринт
