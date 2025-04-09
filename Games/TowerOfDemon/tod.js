// 플레이어 패널 열기/닫기 구현
const panel = document.getElementById("playerPanel");

function togglePanel() {
    const panel = document.getElementById('playerPanel');
    panel.classList.toggle('collapsed');
}

function showTab(tab) {
    const tabContent = document.getElementById('tabContent');
    switch (tab) {
        case 'status':
            tabContent.innerHTML = `<p>상태 정보 표시 영역</p>`;
            break;
        case 'skills':
            tabContent.innerHTML = `<p>보유 스킬 목록</p>`;
            break;
        case 'equipment':
            tabContent.innerHTML = `<p>장비 착용 정보</p>`;
            break;
        case 'effects':
            tabContent.innerHTML = `<p>버프/디버프 상태</p>`;
            break;
        case 'codex':
            tabContent.innerHTML = `<p>몬스터/아이템 도감</p>`;
            break;
    }
}
function initializeGameState() {
    // HUD 상단
    document.querySelector('.level').textContent = 'Lv. 1';
    document.querySelector('.exp-fill').style.width = '0%';

    document.querySelector('.floor-number').textContent = '1F';
    document.querySelector('.floor-name').textContent = '탑의 입구';

    document.querySelector('.gold').textContent = '💰 0G';

    // 플레이어 패널
    document.querySelector('.player-info h3').textContent = '???';
    document.querySelector('.player-info p:nth-child(3)').textContent = '레벨 1 | 경험치 0/100';
    document.querySelector('.player-info p:nth-child(4)').textContent = 'HP: 100 / 100';
    document.querySelector('.player-info p:nth-child(5)').textContent = 'MP: 30 / 30';
    document.querySelector('.player-info p:nth-child(6)').textContent = '기력: 50 / 50';
    document.querySelector('.player-info p:nth-child(7)').textContent = '허기: 100%';
    document.querySelector('.player-info p:nth-child(8)').textContent = '수분: 100%';

    // 기본 탭 내용
    document.getElementById('tabContent').innerHTML = '<p>상태 정보 표시 영역</p>';

    // 이벤트 화면
    document.querySelector('.event-display').innerHTML = '<p>탑의 기운이 감지됩니다...</p>';

    // 하단 카드 초기화
    const handCards = document.querySelector('.hand-cards');
    handCards.innerHTML = ''; // 기존 카드 제거

    // 초기 카드 2장 추가 예시
    const defaultCards = [
        {
            name: '찌르기',
            image: 'stab.png',
            effect: '⚔️ 물리 공격',
            description: '적 하나에게 10의 피해를 줍니다.'
        },
        {
            name: '휴식',
            image: 'rest.png',
            effect: '💤 회복',
            description: 'HP를 10 회복하고 기력을 20 회복합니다.'
        }
    ];

    defaultCards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.innerHTML = `
            <img src="${card.image}" alt="${card.name}" class="card-image" />
            <div class="card-name">${card.name}</div>
            <div class="card-effect">${card.effect}</div>
            <div class="card-description">${card.description}</div>
        `;
        handCards.appendChild(cardDiv);
    });

    // 우측 패널
    document.querySelector('.weather').textContent = '☀️ 맑음';
    document.querySelector('.turn-info').textContent = '턴: 플레이어';
}

// 페이지 로드시 자동 초기화
window.onload = initializeGameState;
