const panel = document.getElementById("playerPanel");
const handCards = document.getElementById('handCards');
const menuButton = document.getElementById("menuButton");

const cardData = [
    {
        name: '파이어볼',
        effect: '🔥 마법 공격',
        description: '적 하나에게 30의 화염 피해를 줍니다.',
        image: 'fireball.png'
    },
    {
        name: '가드업',
        effect: '🛡️ 방어 강화',
        description: '1턴 동안 받는 피해를 50% 감소시킵니다.',
        image: 'guard.png'
    }
];

// 패널 열기/닫기
function togglePanel() {
    panel.classList.toggle("open");
    menuButton.style.left = panel.classList.contains("open") ? "280px" : "0px";
}

// 탭 정보 표시
function showTab(tab) {
    const contentMap = {
        status: '상태 정보 표시 영역',
        skills: '보유 스킬 목록',
        equipment: '장비 착용 정보',
        effects: '버프/디버프 상태',
        codex: '몬스터/아이템 도감'
    };
    document.getElementById('tabContent').innerHTML = `<p>${contentMap[tab] || ''}</p>`;
}

// 카드 상세보기
function showCardDetail(card) {
    alert(`🔍 ${card.name}\n${card.effect}\n\n${card.description}`);
}

// 카드 DOM 생성
function createCard(card) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.setAttribute('draggable', true);
    cardEl.innerHTML = `
        <img src="${card.image}" alt="${card.name}" class="card-image" />
        <div class="card-name">${card.name}</div>
        <div class="card-effect">${card.effect}</div>
        <div class="card-description">${card.description}</div>
    `;

    cardEl.addEventListener('click', () => alert(`${card.name} 사용!`));
    cardEl.addEventListener('contextmenu', e => {
        e.preventDefault();
        showCardDetail(card);
    });

    // 원래 브라우저 drag preview 숨기기
    cardEl.addEventListener('dragstart', e => {
        const img = new Image();
        img.src = "";
        e.dataTransfer.setDragImage(img, 0, 0);
    });

    return cardEl;
}

// 게임 초기 상태
function initializeGameState() {
    document.querySelector('.level').textContent = 'Lv. 1';
    document.querySelector('.exp-fill').style.width = '0%';
    document.querySelector('.floor-number').textContent = '1F';
    document.querySelector('.floor-name').textContent = '탑의 입구';
    document.querySelector('.gold').textContent = '💰 0G';

    // 플레이어 정보
    const info = document.querySelector('.player-info');
    info.querySelector('h3').textContent = '???';
    const lines = [
        '레벨 1 | 경험치 0/100', 'HP: 100 / 100', 'MP: 30 / 30',
        '기력: 50 / 50', '허기: 100%', '수분: 100%'
    ];
    info.querySelectorAll('p').forEach((p, i) => p.textContent = lines[i]);

    // 탭, 이벤트 초기화
    showTab('status');
    document.querySelector('.event-display').innerHTML = '<p>탑의 기운이 감지됩니다...</p>';

    // 카드 초기화
    handCards.innerHTML = '';
    cardData.forEach(card => {
        const el = createCard(card);
        handCards.appendChild(el);
    });

    document.querySelector('.weather').textContent = '☀️ 맑음';
    document.querySelector('.turn-info').textContent = '턴: 플레이어';
}

// 드래그 카드 수동 구현
let draggedCard = null;
document.addEventListener('mousedown', function (e) {
    const target = e.target.closest('.card');
    if (!target || e.button !== 0) return;

    console.log('[DEBUG] 카드 드래그 시작:', target);

    // 원본 카드 숨기기
    target.style.visibility = 'hidden';

    // 클론 생성
    draggedCard = target.cloneNode(true);
    draggedCard.classList.add('dragging-manual');
    draggedCard.style.visibility = 'visible';
    // 필수 스타일 수동 지정
    Object.assign(draggedCard.style, {
        position: 'absolute',
        width: `${target.offsetWidth}px`,
        height: `${target.offsetHeight}px`,
        zIndex: 9999,
        pointerEvents: 'none',
        opacity: 0.9,
        border: '2px solid red'
    });
    document.body.appendChild(draggedCard);

    console.log('[DEBUG] 드래그 카드 생성 완료:', draggedCard);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const rect = draggedCard.getBoundingClientRect();
            moveAt(e.pageX, e.pageY, rect);
        });
    });

    // 위치 이동 함수
    function moveAt(x, y, rect) {
        const cardWidth = rect?.width || draggedCard.offsetWidth;
        const cardHeight = rect?.height || draggedCard.offsetHeight;
        draggedCard.style.left = `${x - cardWidth / 2 + 595}px`;
        draggedCard.style.top = `${y - cardHeight / 2 -80}px`;

        console.log(`[DEBUG] 카드 위치 이동: (${x - cardWidth / 2}px, ${y - cardHeight / 2}px)`);
    }
    // 마우스 이동
    function onMouseMove(e) {
        moveAt(e.pageX, e.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);

    document.addEventListener('mouseup', function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        if (draggedCard) {
            draggedCard.remove();
            draggedCard = null;
            console.log('[DEBUG] 드래그 카드 제거 완료');
        }

        target.style.visibility = 'visible';
        console.log('[DEBUG] 원본 카드 다시 표시');
    }, { once: true });
});
// 페이지 로드 시 초기화
window.onload = initializeGameState;
