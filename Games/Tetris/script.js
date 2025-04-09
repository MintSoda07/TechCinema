const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

const nextCanvas = document.getElementById('next-piece');
const nextContext = nextCanvas.getContext('2d');
nextContext.scale(20, 20);

const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const highScoreElement = document.getElementById('high-score');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score');

let highScore = localStorage.getItem('highScore') || 0;
let score = 0;

const colors = [
  null, '#FF0D72', '#0DC2FF', '#0DFF72',
  '#F538FF', '#FF8E0D', '#FFE138', '#3877FF',
];

const arena = createMatrix(12, 20);

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  next: null,
};

function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

function createPiece(type) {
  switch (type) {
    case 'T': return [[0, 1, 0], [1, 1, 1], [0, 0, 0]];
    case 'O': return [[2, 2], [2, 2]];
    case 'L': return [[0, 0, 3], [3, 3, 3], [0, 0, 0]];
    case 'J': return [[4, 0, 0], [4, 4, 4], [0, 0, 0]];
    case 'I': return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
    case 'S': return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
    case 'Z': return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
  }
}

function drawMatrix(matrix, offset, ctx = context) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = colors[value];
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

function drawNext() {
  nextContext.fillStyle = '#000';
  nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
  drawMatrix(player.next, { x: 1, y: 1 }, nextContext);
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function collide(arena, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
          (arena[y + o.y] &&
           arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  dir > 0 ? matrix.forEach(row => row.reverse()) : matrix.reverse();
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    arenaSweep();
    playerReset();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) player.pos.x -= dir;
}

function playerReset() {
  if (!player.next) player.next = createPiece(randomPieceType());
  player.matrix = player.next;
  player.next = createPiece(randomPieceType());
  player.pos.y = 0;
  player.pos.x = Math.floor((arena[0].length - player.matrix[0].length) / 2);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    score = 0;
    updateScore();
    gameOver();
  }
  drawNext();
}

function randomPieceType() {
  const pieces = 'TJLOSZI';
  return pieces[Math.floor(Math.random() * pieces.length)];
}

function arenaSweep() {
    outer: for (let y = arena.length - 1; y >= 0; --y) {
      for (let x = 0; x < arena[y].length; ++x) {
        if (arena[y][x] === 0) {
          continue outer;
        }
      }
      const row = arena.splice(y, 1)[0].fill(0);
      arena.unshift(row);
      ++y;
      score += 10;
    }
    updateScore(); // 점수 반영!
  }

function updateScore() {
  scoreElement.innerText = `점수: ${score}`;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
    highScoreElement.innerText = `최고 점수: ${highScore}`;
  }
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

function flashScreen(callback) {
  let flashes = 0;
  const interval = setInterval(() => {
    canvas.style.visibility = (canvas.style.visibility === 'hidden') ? 'visible' : 'hidden';
    flashes++;
    if (flashes > 6) {
      clearInterval(interval);
      canvas.style.visibility = 'visible';
      callback();
    }
  }, 100);
}

function gameOver() {
  flashScreen(resetGame);
}

function resetGame() {
  startScreen.style.display = 'block';
  gameContainer.style.display = 'none';
  score = 0;
  updateScore();
  player.next = null;
}

function startGame() {
  arena.forEach(row => row.fill(0));
  playerReset();
  updateScore();
  update();
}

startButton.addEventListener('click', () => {
  startScreen.style.display = 'none';
  gameContainer.style.display = 'flex';
  startGame();
});

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') playerMove(-1);
  else if (event.key === 'ArrowRight') playerMove(1);
  else if (event.key === 'ArrowDown') playerDrop();
  else if (event.key === 'Shift') playerRotate(1); // Shift 회전
});

highScoreElement.innerText = `최고 점수: ${highScore}`;
