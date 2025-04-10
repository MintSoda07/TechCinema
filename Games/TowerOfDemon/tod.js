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
    },
    {
        name: '아이스 스피어',
        effect: '❄️ 속박 공격',
        description: '적에게 20의 피해를 주고 1턴 동안 속박합니다.',
        image: 'ice_spear.png'
    },
    {
        name: '힐링 라이트',
        effect: '✨ 회복 마법',
        description: '아군 전체의 체력을 25 회복합니다.',
        image: 'healing.png'
    },
    {
        name: '섀도우 스텝',
        effect: '🌑 은신 이동',
        description: '2턴 동안 회피 확률이 100%가 됩니다.',
        image: 'shadow.png'
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
// 카드 DOM 생성 함수
function createCard(card, index, total) {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
        <img src="${card.image}" alt="${card.name}" />
        <div><strong>${card.name}</strong></div>
        <div>${card.effect}</div>
    `;

    document.body.appendChild(el);

    // 카드 기본 크기
    const cardWidth = 150;

    // 카드 간 간격 (겹침 정도 조절: 많을수록 덜 겹침)
    let gap = cardWidth * 1.1; // 기본 20% 겹침
    if (total >= 6) {
        gap = cardWidth * 0.8; // 40% 겹침
    }

    // 전체 폭 계산 (겹침 고려)
    const totalWidth = gap * (total - 1) + cardWidth ;
    const startX = (window.innerWidth - totalWidth) / 2;
    const y = window.innerHeight - 240;

    const x = startX + index * gap;

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.transform = `rotate(0deg)`;
    el.style.transformOrigin = 'center center';

    // 중앙에 가까울수록 위로 올라오게
    const centerIndex = (total - 1) / 2;
    const z = 100 - Math.abs(index - centerIndex);
    el.style.zIndex = Math.floor(z);

    el.style.transition = 'transform 0.2s ease, top 0.2s ease';

    // 호버 효과 직접 추가
    el.addEventListener('mouseenter', () => {
        el.style.transform = `scale(1.2) translateY(-20px)`;
        el.style.zIndex = 999; // 최상단으로
    });

    el.addEventListener('mouseleave', () => {
        el.style.transform = `rotate(0deg) scale(1) translateY(0)`;
        el.style.zIndex = Math.floor(z); // 원래 zIndex 복구
    });
    
    enableDrag(el, card);

    return el;
}
// 초기 카드 배치 함수
function renderHandCards() {
    document.querySelectorAll('.card').forEach(card => card.remove());
    cardData.forEach((card, i) => createCard(card, i, cardData.length));
}



function enableDrag(original, cardData) {
    original.addEventListener('mousedown', (e) => {
        e.preventDefault();
        original.style.transition = '';
        // 드래그용 복제 카드 생성
        const clone = original.cloneNode(true);
        clone.classList.add('dragging');
        document.body.appendChild(clone);

        const rect = original.getBoundingClientRect();

        clone.style.position = 'absolute';
        clone.style.left = `${e.clientX-70}px`;
        clone.style.top = `${e.clientY - 160}px`;
        clone.style.transform = 'rotate(0deg) scale(1.2)';
        clone.style.zIndex = 999;

        // 기존 카드 잠시 숨김
        original.style.visibility = 'collapse';

        function onMouseMove(e) {
            clone.style.left = `${e.clientX-70}px`;
            clone.style.top = `${e.clientY - 160}px`;
        }

        function onMouseUp(e) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            // drop 영역 체크 (일단은 주석)
            // if (inDropZone(e.clientX, e.clientY)) {
            //     alert(`${cardData.name} 사용됨`);
            // } else {
            //     renderHandCards(); // 돌아감
            // }

            // 기본은 복귀
            clone.remove();
            renderHandCards();
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}



// 게임 초기 상태
function initializeGameState() {
    document.querySelector('.level').textContent = 'Lv. 1';
    document.querySelector('.exp-fill').style.width = '0%';
    document.querySelector('.floor-number').textContent = '1F';
    document.querySelector('.floor-name').textContent = '탑의 입구';
    document.querySelector('.gold').textContent = '💰 0G';

    const info = document.querySelector('.player-info');
    info.querySelector('h3').textContent = '???';
    const lines = [
        '레벨 1 | 경험치 0/100', 'HP: 100 / 100', 'MP: 30 / 30',
        '기력: 50 / 50', '허기: 100%', '수분: 100%'
    ];
    info.querySelectorAll('p').forEach((p, i) => p.textContent = lines[i]);

    showTab('status');
    document.querySelector('.event-display').innerHTML = '<p>탑의 기운이 감지됩니다...</p>';

    renderHandCards();

    document.querySelector('.weather').textContent = '☀️ 맑음';
    document.querySelector('.turn-info').textContent = '턴: 플레이어';
}

// 페이지 로드 시 초기화
window.onload = () => {
    initializeGameState();
};