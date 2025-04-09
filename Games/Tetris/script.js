const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

const nextCanvas = document.getElementById('next-piece');
const nextContext = nextCanvas.getContext('2d');
nextContext.scale(20, 20);

const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const leaderboardStart = document.getElementById('leaderboard-list');
const leaderboardGame = document.getElementById('leaderboard-list-game');

let score = 0;
let gameStartTime = 0;
let elapsedTime = 0;

const colors = [
  null, '#FF0D72', '#0DC2FF', '#0DFF72',
  '#F538FF', '#FF8E0D', '#FFE138', '#3877FF',
  '#888888', '#00FF00', '#FF00FF', '#222222' // 11번: Blocker (공백처럼 보이도록)
];

function createMatrix(w, h) {
  return Array.from({ length: h }, () => new Array(w).fill(0));
}

function createPiece(type) {
  switch (type) {
    case 'T': return [[0, 1, 0], [1, 1, 1]];
    case 'O': return [[2, 2], [2, 2]];
    case 'L': return [[0, 0, 3], [3, 3, 3]];
    case 'J': return [[4, 0, 0], [4, 4, 4]];
    case 'I': return [[5], [5], [5], [5]];
    case 'S': return [[0, 6, 6], [6, 6, 0]];
    case 'Z': return [[7, 7, 0], [0, 7, 7]];
    case 'FAST': return [[8], [8], [8], [8]];
    case 'BIG': return [
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9]
    ];
    case 'Blocker': return [[11]];
  }
}

function drawMatrix(matrix, offset, ctx = context) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.05;
      ctx.strokeRect(x + offset.x, y + offset.y, 1, 1);
      if (value !== 0) {
        ctx.fillStyle = colors[value];
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.strokeRect(x + offset.x, y + offset.y, 1, 1);
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
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function rotate(matrix, dir) {
  const result = matrix[0].map((_, i) =>
    matrix.map(row => row[i])
  );
  return dir > 0 ? result.map(row => row.reverse()) : result.reverse();
}

function playerRotate(dir) {
  if (player.gimmick) return;
  const originalMatrix = player.matrix;
  const rotated = rotate(player.matrix, dir);

  const pos = player.pos.x;
  let offset = 1;
  player.matrix = rotated;

  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > rotated[0].length) {
      player.matrix = originalMatrix;
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
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function randomPieceType() {
  const base = 'TJLOSZI';
  let chance = Math.random();
  if (score >= 5000 && chance < 0.1) return 'Blocker';
  if (score >= 3000 && chance < 0.2) return 'BIG';
  if (score >= 1000 && chance < 0.4) return 'FAST';
  return base[Math.floor(Math.random() * base.length)];
}

function getPieceType(matrix) {
  const flat = matrix.flat();
  const type = flat.find(v => v !== 0);
  if (type === 8) return 'FAST';
  if (type === 9) return 'BIG';
  if (type === 11) return 'Blocker';
  return '';
}

function playerReset() {
  if (!player.next) player.next = createPiece(randomPieceType());
  player.matrix = player.next;
  player.next = createPiece(randomPieceType());
  player.pos.y = 0;
  player.pos.x = Math.floor((arena[0].length - player.matrix[0].length) / 2);

  const pieceType = getPieceType(player.matrix);
  player.gimmick = (pieceType === 'FAST');
  dropInterval = (pieceType === 'FAST') ? 100 : 1000;

  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    gameOver();
  }

  drawNext();
}

function shuffleArena() {
  const allBlocks = arena.flat().filter(v => v !== 0);
  allBlocks.sort(() => Math.random() - 0.5);
  let i = 0;
  for (let y = 0; y < arena.length; y++) {
    for (let x = 0; x < arena[y].length; x++) {
      arena[y][x] = allBlocks.length ? allBlocks[i++] || 0 : 0;
    }
  }
}

function arenaSweep() {
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0 || arena[y][x] === 11) continue outer;
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    score += 70;
  }
  updateScore();
}

function updateScore() {
  elapsedTime = Math.floor((performance.now() - gameStartTime) / 1000);
  const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
  const seconds = String(elapsedTime % 60).padStart(2, '0');
  scoreElement.innerText = `점수: ${score} | 시간: ${minutes}:${seconds}`;
}

function gameOver() {
  const playerName = prompt('게임 오버! 이름을 입력하세요:');
  if (playerName) {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ name: playerName, score: score });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard.slice(0, 5)));
    updateLeaderboard();
  }
  resetGame();
}

function updateLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  [leaderboardStart, leaderboardGame].forEach(container => {
    if (!container) return;
    container.innerHTML = '';
    leaderboard.forEach((entry, index) => {
      const li = document.createElement('li');
      li.textContent = `${index + 1}. ${entry.name}: ${entry.score}점`;
      container.appendChild(li);
    });
  });
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
  gameStartTime = performance.now();
  playerReset();
  updateScore();
  update();
}

const arena = createMatrix(12, 20);
const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  next: null,
  gimmick: false,
};

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
  updateScore();
  draw();
  requestAnimationFrame(update);
}

function countdown(callback) {
  const countdownElem = document.createElement('div');
  countdownElem.style.position = 'absolute';
  countdownElem.style.top = '50%';
  countdownElem.style.left = '50%';
  countdownElem.style.transform = 'translate(-50%, -50%)';
  countdownElem.style.fontSize = '4rem';
  countdownElem.style.color = '#fff';
  countdownElem.style.zIndex = '10';
  document.body.appendChild(countdownElem);

  let count = 3;
  const interval = setInterval(() => {
    countdownElem.textContent = count;
    count--;
    if (count < 0) {
      clearInterval(interval);
      document.body.removeChild(countdownElem);
      callback();
    }
  }, 1000);
}

startButton.addEventListener('click', () => {
  startScreen.classList.add('fade-out');
  setTimeout(() => {
    startScreen.style.display = 'none';
    gameContainer.style.display = 'flex';
    countdown(() => {
      startGame();
    });
  }, 500);
});

document.addEventListener('keydown', event => {
  if (event.code === 'ArrowLeft') playerMove(-1);
  else if (event.code === 'ArrowRight') playerMove(1);
  else if (event.code === 'ArrowDown') playerDrop();
  else if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') playerRotate(1);
});

updateLeaderboard();
