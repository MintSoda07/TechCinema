function showSection(id) {
    const mainMenu = document.getElementById('mainMenu');
    const sections = document.querySelectorAll('.hidden-section');

    // 메뉴 숨기기
    mainMenu.style.display = 'none';

    // 모든 섹션 숨기기
    sections.forEach(sec => {
        sec.classList.remove('show-section');
        sec.style.display = 'none';
    });

    // 대상 섹션 보이기
    const target = document.getElementById(id);
    target.style.display = 'block';
    setTimeout(() => target.classList.add('show-section'), 10); // 애니메이션 적용
}
let selectedDifficulty = {
    label: '쉬움',
    rows: 10,
    cols: 10,
    mines: 10
};
let revealedCount = 0; // 열린 칸 수
function setSelectedDifficulty(label, rows, cols, mines) {
    selectedDifficulty = { label, rows, cols, mines };
    showPreview(label, rows, cols, mines);
}

function returnToMain() {
    location.reload();
    // const sections = document.querySelectorAll('.hidden-section');

    // sections.forEach(sec => {
    //     sec.classList.remove('show-section');
    //     sec.style.display = 'none';
    // });

    // // 게임 UI 초기화
    // document.getElementById('gameUI').style.display = 'none';
    // document.getElementById('gameStartCountdown').innerText = '';
    // document.getElementById('gameStartCountdown').style.display = 'none';
    // clearInterval(timerInterval);
    // document.getElementById('gameTimer').innerText = '00:00:00';

    // const mainMenu = document.getElementById('mainMenu');
    // mainMenu.style.display = 'block';
    // mainMenu.classList.add('show-section');
}
function showPreview(label, rows, cols, mines) {
    const preview = document.getElementById('previewBox');
    const custom = document.getElementById('customSettings');

    // 커스텀 설정이 열려 있다면 닫기
    if (custom.style.display === 'block') {
        custom.classList.remove('show-section');
        custom.style.display = 'none';
    }

    // 기본 미리보기 표시
    preview.style.display = 'block';
    preview.innerText = `${label} 난이도 선택됨\n크기: ${rows} x ${cols}, 지뢰 수: ${mines}`;
}

function toggleSection(id) {
    const el = document.getElementById(id);
    const preview = document.getElementById('previewBox');
    const isVisible = el.style.display === 'block';

    if (isVisible) {
        el.classList.remove('show-section');
        setTimeout(() => el.style.display = 'none', 200); // 커스텀 숨김
        preview.style.display = 'block'; // 미리보기 다시 보이기
    } else {
        el.style.display = 'block';
        setTimeout(() => el.classList.add('show-section'), 10);
        preview.style.display = 'none'; // 미리보기 숨김
    }
}

function updateCustomPreview() {
    const mines = document.getElementById('customMines').value;
    const size = document.getElementById('customSize').value;
    document.getElementById('mineValue').innerText = mines;
    document.getElementById('sizeValue').innerText = `${size} x ${size}`;
    document.getElementById('customPreview').innerText =
        `지뢰: ${mines}, 크기: ${size} x ${size}`;
}

// 순위표 생성 예시
const rankList = document.getElementById('rankList');
for (let i = 1; i <= 100; i++) {
    const li = document.createElement('li');
    li.innerText = `${i}위 - 플레이어${i} (시간: ${30 + i}s)`;
    rankList.appendChild(li);
}
function startGameWithCountdown(difficultyLabel) {
    showSection('gameManagerSection');
    const countdownEl = document.getElementById('gameStartCountdown');
    countdownEl.style.display = 'block'; // 반드시 보이도록 초기화
    const ui = document.getElementById('gameUI');
    const label = document.getElementById('difficultyLabel');
    label.innerText = `지뢰찾기 - ${difficultyLabel}`;

    const countdownMessages = ['3', '2', '1', '게임 시작!'];
    let i = 0;

    const interval = setInterval(() => {
        countdownEl.innerText = countdownMessages[i];
        countdownEl.style.animation = 'none';
        void countdownEl.offsetWidth; // 재적용 트릭
        countdownEl.style.animation = 'pop 0.6s ease-in-out';

        i++;
        if (i >= countdownMessages.length) {
            clearInterval(interval);
            setTimeout(() => {
                countdownEl.style.display = 'none';
                ui.style.display = 'block';
                generateMineBoard(selectedDifficulty.rows, selectedDifficulty.cols, selectedDifficulty.mines); // ⬅️ 추가
                startGameTimer(); // 타이머 시작
            }, 600);
        }
    }, 700);
}

function startGame() {
    gameOver = false; // 게임 시작 시 초기화

    if (document.getElementById('customSettings').style.display === 'block') {
        const mines = document.getElementById('customMines').value;
        const size = document.getElementById('customSize').value;
        selectedDifficulty = {
            label: '커스텀',
            rows: parseInt(size),
            cols: parseInt(size),
            mines: parseInt(mines)
        };
    }

    startGameWithCountdown(selectedDifficulty.label);
}

let timerInterval;
function startGameTimer() {
    const timerEl = document.getElementById('gameTimer');
    let seconds = 0;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds++;
        const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        timerEl.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

function resetGame() {
    clearInterval(timerInterval); // 타이머 멈추기
    document.getElementById('gameTimer').innerText = '00:00:00';

    // 게임 상태 초기화
    gameOver = false;

    // 기존 보드 제거
    const mineTable = document.getElementById('mineTable');
    mineTable.innerHTML = '';

    // 버튼 상태 복구
    document.getElementById('btnReset').style.display = 'none';
    document.getElementById('btnFlag').style.display = 'inline-block';
    document.getElementById('btnFind').style.display = 'inline-block';
    document.getElementById('btnSurrender').style.display = 'inline-block';

    // 보드 다시 생성
    generateMineBoard(
        selectedDifficulty.rows,
        selectedDifficulty.cols,
        selectedDifficulty.mines
    );

    // 타이머 재시작
    startGameTimer();
}

function generateMineBoard(rows, cols, mines) {
    const mineTable = document.getElementById('mineTable');
    mineTable.innerHTML = ''; // 기존 보드 초기화
    revealedCount = 0; // 새 게임 시작 시 초기화

    const board = [];
    const minePositions = new Set();

    // 빈 2차원 배열 생성
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            row.push({ isMine: false, adjacent: 0, revealed: false });
        }
        board.push(row);
    }

    // 지뢰 위치 무작위 지정
    while (minePositions.size < mines) {
        const rand = Math.floor(Math.random() * rows * cols);
        minePositions.add(rand);
    }

    minePositions.forEach(index => {
        const r = Math.floor(index / cols);
        const c = index % cols;
        board[r][c].isMine = true;
    });

    // 인접 지뢰 수 계산
const dir = [-1, 0, 1];
for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
        if (board[r][c].isMine) continue;
        let count = 0;
        dir.forEach(dr => {
            dir.forEach(dc => {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
                    count++;
                }
            });
        });
        board[r][c].adjacent = count;
    }
}

    // HTML 테이블로 표시
    const table = document.createElement('table');
    table.classList.add('mine-board');
    for (let r = 0; r < rows; r++) {
        const tr = document.createElement('tr');
        for (let c = 0; c < cols; c++) {
            const td = document.createElement('td');
            td.classList.add('cell');
            td.dataset.row = r;
            td.dataset.col = c;
            td.onclick = () => handleCellClick(r, c, board, td);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    mineTable.appendChild(table);
}
function revealCell(r, c, board, td) {
    if (gameOver) return;

    const cell = board[r][c];
    if (cell.revealed || td.innerText === '🚩') return;
    cell.revealed = true;
    revealedCount++;
    td.classList.add('revealed');

    if (cell.isMine) {
        td.innerText = '💣';
        td.style.backgroundColor = 'red';
        clearInterval(timerInterval);
        gameOver = true;
        showResetOnlyUI();
        revealAllMines(board);
        triggerEffect('explode');
        playSound('sndBoom');
    } else {
        if (cell.adjacent > 0) {
            td.innerText = cell.adjacent;
        } else {
            const dir = [-1, 0, 1];
            dir.forEach(dr => {
                dir.forEach(dc => {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (
                        (dr !== 0 || dc !== 0) &&
                        nr >= 0 && nr < board.length &&
                        nc >= 0 && nc < board[0].length
                    ) {
                        const neighborCell = document.querySelector(`td[data-row="${nr}"][data-col="${nc}"]`);
                        revealCell(nr, nc, board, neighborCell);
                    }
                });
            });
        }

        // 승리 조건: 총 칸 수 - 지뢰 수 === 열린 칸 수
        const totalSafeCells = board.length * board[0].length - selectedDifficulty.mines;
        if (revealedCount === totalSafeCells) {
            triggerEffect('win');
            playSound('sndWin');
            clearInterval(timerInterval);
            gameOver = true;
            showResetOnlyUI();
            alert('승리! 모든 지뢰를 피해 성공적으로 클리어했습니다!');
        }
    }
}
let mode = 'reveal'; // 기본 모드: 드러내기

function revealAllMines(board) {
    board.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell.isMine) {
                const td = document.querySelector(`td[data-row="${r}"][data-col="${c}"]`);
                if (!td.classList.contains('revealed')) {
                    td.innerText = '💣';
                    td.style.backgroundColor = '#faa';
                }
            }
        });
    });
}
function showResetOnlyUI() {
    document.getElementById('btnReset').style.display = 'inline-block';
    document.getElementById('btnFlag').style.display = 'none';
    document.getElementById('btnFind').style.display = 'none';
    document.getElementById('btnSurrender').style.display = 'none';
}
function triggerEffect(type) {
    const effect = document.getElementById('gameEffect');
    effect.className = 'effect-overlay'; // 초기화

    if (type === 'explode') {
        effect.classList.add('effect-explode');
    } else if (type === 'win') {
        effect.classList.add('effect-win');
    }

    // 일정 시간 후 자동 숨김
    setTimeout(() => {
        effect.className = 'effect-overlay';
        effect.style.display = 'none';
    }, 2000);
}
function playSound(id) {
    const audio = document.getElementById(id);
    if (audio) audio.play();
}

function setFlagMode() {
    mode = 'flag';
    document.getElementById('btnFlag').classList.add('active');
    document.getElementById('btnFind').classList.remove('active');
}

function setFindMode() {
    mode = 'find';
    document.getElementById('btnFlag').classList.remove('active');
    document.getElementById('btnFind').classList.add('active');
}
function handleCellClick(r, c, board, td) {
    if (gameOver) return;
    const cell = board[r][c];

    if (mode === 'flag') {
        if (!cell.revealed) {
            td.innerText = td.innerText === '🚩' ? '' : '🚩';
        }
    } else if (mode === 'find') {
        tryFindSurrounding(r, c, board);
        if (td.innerText === '🚩') return; // 깃발 꽂힌 셀은 클릭 무시
        revealCell(r, c, board, td);
    } else {
        if (td.innerText === '🚩') return; // 깃발 꽂힌 셀은 클릭 무시
        revealCell(r, c, board, td);
    }
}
function tryFindSurrounding(r, c, board) {
    const cell = board[r][c];
    if (!cell.revealed || cell.adjacent === 0) return;

    const dir = [-1, 0, 1];
    let flagCount = 0;
    let hiddenCells = [];

    dir.forEach(dr => {
        dir.forEach(dc => {
            const nr = r + dr;
            const nc = c + dc;
            if (dr === 0 && dc === 0) return;
            if (nr >= 0 && nr < board.length && nc >= 0 && nc < board[0].length) {
                const neighborCell = board[nr][nc];
                const td = document.querySelector(`td[data-row="${nr}"][data-col="${nc}"]`);
                if (td.innerText === '🚩') flagCount++;
                if (!neighborCell.revealed && td.innerText !== '🚩') {
                    hiddenCells.push({ r: nr, c: nc, td });
                }
            }
        });
    });

    if (flagCount === cell.adjacent) {
        hiddenCells.forEach(({ r, c, td }) => {
            revealCell(r, c, board, td);
        });
    }
}
let flagCount = 0;

function updateFlagUI() {
    const remaining = selectedDifficulty.mines - flagCount;
    document.getElementById('flagCounter').innerText = `남은 지뢰 수: ${remaining}`;
}
document.addEventListener('contextmenu', (e) => {
    if (e.target.matches('.cell')) {
        e.preventDefault();
        const td = e.target;
        if (td.classList.contains('revealed')) return;

        if (td.innerText === '🚩') {
            td.innerText = '';
            flagCount--;
            td.classList.remove('flagged');
        } else {
            td.innerText = '🚩';
            flagCount++;
            td.classList.add('flagged');
            td.classList.add('flag-anim');
            setTimeout(() => td.classList.remove('flag-anim'), 500);
        }

        updateFlagUI();
    }
});
