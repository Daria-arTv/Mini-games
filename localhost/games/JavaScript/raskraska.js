const gridRows = 80;
const gridCols = 80;
const cellSize = 15;


const gridElem = document.getElementById('grid');
gridElem.style.gridTemplateColumns = `repeat(${gridCols}, ${cellSize}px)`;

const imageInput = document.getElementById('image-input');
const paletteContainer = document.getElementById('palette-container');
const resetBtn = document.getElementById('reset-btn');
const showSolutionBtn = document.getElementById('show-solution-btn');

const hiddenCanvas = document.getElementById('hidden-canvas');
const ctx = hiddenCanvas.getContext('2d');

let solutionGrid = [];
let digitGrid = [];
let paletteMapping = {};
let currentColor = null;

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    const img = new Image();
    img.onload = function() {
      processImage(img);
    }
    img.src = evt.target.result;
  }
  reader.readAsDataURL(file);
});

function processImage(img) {
  hiddenCanvas.width = gridCols;
  hiddenCanvas.height = gridRows;
  
  ctx.drawImage(img, 0, 0, gridCols, gridRows);
  const imgData = ctx.getImageData(0, 0, gridCols, gridRows).data;
  
  solutionGrid = [];
  const colorCount = {};
  
  for (let row = 0; row < gridRows; row++) {
    solutionGrid[row] = [];
    for (let col = 0; col < gridCols; col++) {
      const index = (row * gridCols + col) * 4;
      let r = imgData[index];
      let g = imgData[index + 1];
      let b = imgData[index + 2];
      r = Math.round(r / 85) * 85;
      g = Math.round(g / 85) * 85;
      b = Math.round(b / 85) * 85;
      if (r > 255) r = 255;
      if (g > 255) g = 255;
      if (b > 255) b = 255;
      const hex = rgbToHex(r, g, b);
      solutionGrid[row][col] = hex;
      // белый цвет не учитываеb
      if (hex !== "#ffffff") {
        colorCount[hex] = (colorCount[hex] || 0) + 1;
      }
    }
  }
  
  const uniqueColors = Object.keys(colorCount);
  uniqueColors.sort((a, b) => colorCount[b] - colorCount[a]);
  
  paletteMapping = {};
  digitGrid = [];
  const maxColors = 50; // огранич кол цвет
  uniqueColors.forEach((color, index) => {
    if (index < maxColors) {
      const digit = (index + 1).toString();
      paletteMapping[digit] = color;
    }
  });
  

  for (let row = 0; row < gridRows; row++) {
    digitGrid[row] = [];
    for (let col = 0; col < gridCols; col++) {
      if (solutionGrid[row][col] === "#ffffff") {
        digitGrid[row][col] = "";
      } else {
        const targetColor = solutionGrid[row][col];
        let bestDigit = null;
        let bestDistance = Infinity;
        for (const [digit, paletteColor] of Object.entries(paletteMapping)) {
          const dist = colorDistance(targetColor, paletteColor);
          if (dist < bestDistance) {
            bestDistance = dist;
            bestDigit = digit;
          }
        }
        digitGrid[row][col] = bestDigit;
      }
    }
  }
  
  generateGridUI();
  generatePaletteUI();
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join('');
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  const bigint = parseInt(hex, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function colorDistance(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const dr = rgb1.r - rgb2.r;
  const dg = rgb1.g - rgb2.g;
  const db = rgb1.b - rgb2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function hexToRgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function generateGridUI() {
  gridElem.innerHTML = '';
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      if (digitGrid[row][col] === "") {
        cell.classList.add('non-paintable');
        cell.style.backgroundColor = "#ffffff";
      } else {
        cell.textContent = digitGrid[row][col];
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.addEventListener('click', () => {
          if (!currentColor) return;
          const expectedDigit = digitGrid[row][col];
          const correctColor = paletteMapping[expectedDigit];
          if (currentColor === correctColor) {
            cell.style.backgroundColor = currentColor;
            cell.textContent = '';
          } else {
            cell.style.backgroundColor = hexToRgba(currentColor, 0.5);
          }
        });
      }
      gridElem.appendChild(cell);
    }
  }
}

function generatePaletteUI() {
  paletteContainer.innerHTML = '';
  for (const [digit, color] of Object.entries(paletteMapping)) {
    const item = document.createElement('div');
    item.className = 'palette-item';
    item.addEventListener('click', () => {
      currentColor = color;
      document.querySelectorAll('.palette-color').forEach(el => el.style.border = '1px solid #ccc');
      colorBox.style.border = '3px solid #000';
    });
    const colorBox = document.createElement('div');
    colorBox.className = 'palette-color';
    colorBox.style.backgroundColor = color;
    const label = document.createElement('div');
    label.textContent = digit;
    item.appendChild(colorBox);
    item.appendChild(label);
    paletteContainer.appendChild(item);
  }
}

resetBtn.addEventListener('click', generateGridUI);
showSolutionBtn.addEventListener('click', () => {
document.querySelectorAll('.cell').forEach(cell => {
const row = cell.dataset.row;
const col = cell.dataset.col;
if (row !== undefined && col !== undefined) {
  const digit = digitGrid[row]?.[col];
  if (digit && paletteMapping[digit]) {
    const correctColor = paletteMapping[digit];
    cell.style.backgroundColor = correctColor;
    cell.textContent = '';
  }
}
});
});