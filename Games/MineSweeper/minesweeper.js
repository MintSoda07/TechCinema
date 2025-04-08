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

function setSelectedDifficulty(label, rows, cols, mines) {
    selectedDifficulty = { label, rows, cols, mines };
    showPreview(label, rows, cols, mines);
}

function returnToMain() {
    const sections = document.querySelectorAll('.hidden-section');

    sections.forEach(sec => {
        sec.classList.remove('show-section');
        sec.style.display = 'none';
    });

    // 게임 UI 초기화
    document.getElementById('gameUI').style.display = 'none';
    document.getElementById('gameStartCountdown').innerText = '';
    document.getElementById('gameStartCountdown').style.display = 'none';
    clearInterval(timerInterval);
    document.getElementById('gameTimer').innerText = '00:00:00';

    const mainMenu = document.getElementById('mainMenu');
    mainMenu.style.display = 'block';
    mainMenu.classList.add('show-section');
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
                startGameTimer(); // 타이머 시작
            }, 600); // 마지막 애니메이션 종료 후
        }
    }, 700);
}
function startGame() {
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
    clearInterval(timerInterval);
    document.getElementById('gameTimer').innerText = '00:00:00';
    // 실제 보드 초기화 함수 호출 예정
}