const panel = document.getElementById("playerPanel");
const handCards = document.getElementById('handCards');
const menuButton = document.getElementById("menuButton");
const endTurnButton = document.querySelector('.end-turn-button');
//효과음 모음
const pickSound = new Audio('audio/card_grab.wav');
const dropSound = new Audio('audio/card_down.wav');
const statuSound = new Audio('audio/status_tab_open_close.wav');
const turnEndSound = new Audio('audio/turn_end.wav');
const discardSound = new Audio('audio/trash_card.wav');

//시간 
let currentGameTime = 480; // 08:00부터 시작 (단위: 분)
let currentDay = 1;

let isWaiting = false;
// 날씨 목록
const weatherList = ['☀️ 맑음', '🌥️ 흐림', '🌧️ 비', '❄️ 눈', '🌩️ 폭풍우'];

// 시간대 판별 함수
function getTimePeriod(mins) {
    const hour = Math.floor(mins / 60);
    if (hour >= 4 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'noon';
    if (hour >= 17 && hour < 20) return 'evening';
    return 'night';
}


// 날씨 결정 함수
function updateWeather() {
    if (Math.random() < 0.05) {
        const newWeather = weatherList[Math.floor(Math.random() * weatherList.length)];
        document.querySelector('.weather').textContent = newWeather;
    }
}


// 예보 큐 (7일간)
let weatherForecast = [];

function generateWeather() {
    return weatherList[Math.floor(Math.random() * weatherList.length)];
}

// 초기 예보 생성
function initializeForecast() {
    weatherForecast = Array.from({ length: 7 }, () => generateWeather());
}
function updateDayDisplay() {
    document.querySelector('.day-count').textContent = `📅 ${currentDay}일차`;
}
// 시간 표시 업데이트
function updateTimeDisplay() {
    const hour = Math.floor(currentGameTime / 60);
    const minute = currentGameTime % 60;
    const formatted = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    document.querySelector('.time-now').textContent = `🕒 ${formatted}`;

    const period = getTimePeriod(currentGameTime);
    const periodTextMap = {
        dawn: '🌅 새벽',
        morning: '🌄 아침',
        noon: '🌞 낮',
        evening: '🌇 저녁',
        night: '🌃 밤'
    };
    document.querySelector('.time-period').textContent = periodTextMap[period] || '';
    updateDayDisplay();
}

// 턴 종료 시 호출
function endTurn() {
    isWaiting = true;

   // 버튼 비활성화 및 텍스트 변경
   endTurnButton.classList.add('disabled');
   endTurnButton.textContent = '⏳ 대기 중...';
    currentGameTime += 10;

    if (currentGameTime >= 1440) {
        currentGameTime -= 1440;
        currentDay++;

        // 새로운 날씨 예보 추가
        weatherForecast.shift(); // 가장 오래된 날씨 제거
        weatherForecast.push(generateWeather());

        renderForecast();
    }

    updateTimeDisplay();
    updateWeather();
    turnEndSound.currentTime = 0;
    turnEndSound.play().catch(e => console.warn("turnEndSound.mp3 재생 실패", e));
    renderHandCards(); // 카드 재생성 함수
    setTimeout(() => {
        isWaiting = false;
        endTurnButton.classList.remove('disabled');
        endTurnButton.textContent = '⏭️ 턴 넘기기';
        document.querySelector('.turn-info').textContent = '턴: 플레이어';
        renderHandCards(); // 카드 재생성 함수
    }, 1000);
}

const cardData = [
    {
        name: '📜 게시판 확인',
        effect: '의뢰 확인',
        description: '현재 접수 가능한 의뢰와 진행 중인 임무를 확인합니다.',
        image: 'board.png',
        undiscardable: true
    },
    {
        name: '💬 대화하기',
        effect: '길드원 교류',
        description: '길드 마스터나 다른 길드원들과 대화를 나눕니다.',
        image: 'talk.png',
        undiscardable: true
    },
    {
        name: '🚪 길드 나가기',
        effect: '마을 이동',
        description: '길드를 나와 마을로 돌아갑니다.',
        image: 'exit.png',
        undiscardable: true
    },
    {
        name: '💬 대화하기',
        effect: '길드원 교류',
        description: '길드 마스터나 다른 길드원들과 대화를 나눕니다.',
        image: 'talk.png',
        undiscardable: true
    },
    {
        name: '💬 대화하기',
        effect: '길드원 교류',
        description: '길드 마스터나 다른 길드원들과 대화를 나눕니다.',
        image: 'talk.png',
        undiscardable: true
    },
    {
        name: '💬 대화하기',
        effect: '길드원 교류',
        description: '길드 마스터나 다른 길드원들과 대화를 나눕니다.',
        image: 'talk.png',
        undiscardable: true
    },
    {
        name: '💬 대화하기',
        effect: '길드원 교류',
        description: '길드 마스터나 다른 길드원들과 대화를 나눕니다.',
        image: 'talk.png',
        undiscardable: true
    },
    {
        name: '💬 대화하기',
        effect: '길드원 교류',
        description: '길드 마스터나 다른 길드원들과 대화를 나눕니다.',
        image: 'talk.png',
        undiscardable: true
    },
    {
        name: '💬 대화하기',
        effect: '길드원 교류',
        description: '길드 마스터나 다른 길드원들과 대화를 나눕니다.',
        image: 'talk.png',
        undiscardable: true
    },
    {
        name: '💬 대화하기',
        effect: '길드원 교류',
        description: '길드 마스터나 다른 길드원들과 대화를 나눕니다.',
        image: 'talk.png',
        undiscardable: true
    },
    {
        name: '💬 대화하기',
        effect: '길드원 교류',
        description: '길드 마스터나 다른 길드원들과 대화를 나눕니다.',
        image: 'talk.png',
        undiscardable: true
    }
];

// 패널 열기/닫기
function togglePanel() {
    panel.classList.toggle("open");
    menuButton.style.left = panel.classList.contains("open") ? "280px" : "0px";
    statuSound.currentTime = 0;
    statuSound.play().catch(e => console.warn("dropCard.mp3 재생 실패", e));
}

// 탭 정보 표시
function showTab(tab) {
    const contentMap = {
        status: '상태 정보 표시 영역',
        skills: '보유 스킬 목록',
        equipment: '장비 착용 정보',
        quest: '퀘스트 정보',
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
        <img src="${card.image}" alt="noImage" />
        <div id='card-name'><strong>${card.name}</strong></div>
        <div id='card-effect'>${card.effect}</div>
        <div id='card-description'>${card.description}</div>
    `;

    document.body.appendChild(el);

    const cardWidth = 150;

    // 기본 간격
    let gap = cardWidth * 1.1;

    if (total >= 6) {
        gap = cardWidth * 0.8;
    }

    // 화면 크기에 따라 덱 너비 제한
    if (window.innerWidth > 800) {
        const maxTotalWidth = window.innerWidth / 2 +60;
        const maxGap = (maxTotalWidth - cardWidth) / (total - 1);
        gap = Math.min(gap, maxGap);
    } 

    const totalWidth = gap * (total - 1) + cardWidth;
    const startX = (window.innerWidth - totalWidth) / 2 - 80;
    const y = window.innerHeight - 240;
    const x = startX + index * gap;

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.transform = `rotate(0deg)`;
    el.style.transformOrigin = 'center center';
    const centerIndex = (total - 1) / 2;
    const z = 100 - Math.abs(index - centerIndex);
    el.style.zIndex = Math.floor(z);
    el.style.transition = 'transform 0.2s ease, top 0.2s ease, left 0.2s ease';

    el.addEventListener('mouseenter', () => {
        if (isWaiting) return;
        el.style.transform = `scale(1.2) translateY(-20px)`;
        el.style.zIndex = 999;
    });

    el.addEventListener('mouseleave', () => {
        if (isWaiting) return;
        el.style.transform = `rotate(0deg) scale(1) translateY(0)`;
        el.style.zIndex = Math.floor(z);
    });

    if (!isWaiting) {
        enableDrag(el, card);
    } else {
        el.classList.add('card-disabled');
    }

    return el;
}
// 초기 카드 배치 함수
function renderHandCards() {
    document.querySelectorAll('.card').forEach(card => card.remove());
    cardData.forEach((card, i) => createCard(card, i, cardData.length));
}


function enableDrag(original, card) {
    original.addEventListener('mousedown', (e) => {
        e.preventDefault();
        original.style.transition = '';

        const index = cardData.indexOf(card);
        if (index === -1) return;
        cardData.splice(index, 1);
        renderHandCards();

        const clone = original.cloneNode(true);
        clone.classList.add('dragging');
        document.body.appendChild(clone);

        clone.style.position = 'absolute';
        clone.style.left = `${e.clientX - 70}px`;
        clone.style.top = `${e.clientY - 160}px`;
        clone.style.transform = 'rotate(0deg) scale(1.2)';
        clone.style.zIndex = 999;

        pickSound.currentTime = 0;
        pickSound.play().catch(e => console.warn("pickCard.mp3 재생 실패", e));

        const discardArea = document.querySelector('.discard-area');

        function isInsideDiscardArea(x, y) {
            const rect = discardArea.getBoundingClientRect();
            return (
                x >= rect.left &&
                x <= rect.right &&
                y >= rect.top &&
                y <= rect.bottom
            );
        }

        function onMouseMove(e) {
            clone.style.left = `${e.clientX - 70}px`;
            clone.style.top = `${e.clientY - 160}px`;

            if (isInsideDiscardArea(e.clientX, e.clientY)) {
                discardArea.classList.add('active');
            } else {
                discardArea.classList.remove('active');
            }
        }

        function onMouseUp(e) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        
            const discardArea = document.querySelector('.discard-area');
            const discardRect = discardArea.getBoundingClientRect();
            const cloneRect = clone.getBoundingClientRect();
        
            const isInDiscard = (
                cloneRect.right > discardRect.left &&
                cloneRect.left < discardRect.right &&
                cloneRect.bottom > discardRect.top &&
                cloneRect.top < discardRect.bottom
            );
        
            if (isInDiscard) {
                // 버릴 수 없는 카드면 그냥 복구
    if (card.undiscardable) {
        cardData.splice(index, 0, card);
        clone.remove();
        renderHandCards();
        return;
    }
                // 파티클 효과 추가
                const particle = document.createElement('div');
                particle.className = 'particle-burst';
                particle.style.left = `${cloneRect.left + cloneRect.width / 2}px`;
                particle.style.top = `${cloneRect.top + cloneRect.height / 2}px`;
                document.body.appendChild(particle);
        
                setTimeout(() => particle.remove(), 600);
        
                // 카드 삭제 애니메이션
                clone.classList.add('shrink-out');
        
                discardSound.currentTime = 0;
                discardSound.play().catch(e => console.warn("discardCard.mp3 재생 실패", e));
        
                setTimeout(() => {clone.remove();discardArea.classList.remove('active');}, 500);
        
                return; // 원래 위치로 복구 안 함
            }
        
            // 카드 복원
            cardData.splice(index, 0, card);
            clone.remove();
            renderHandCards();
        
            dropSound.currentTime = 0;
            dropSound.play().catch(e => console.warn("dropCard.mp3 재생 실패", e));
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}


// 게임 초기 상태
function initializeGameState() {
    document.querySelector('.level').textContent = 'Lv. 1';
    document.querySelector('.exp-fill').style.width = '0%';
    document.querySelector('.place-name').textContent = '에렌투스';
    document.querySelector('.place-detail').textContent = '길드';
    document.querySelector('.gold').textContent = '💰 0G';

    const info = document.querySelector('.player-info');
    info.querySelector('h3').textContent = '???';
    const lines = [
        '레벨 1 | 경험치 0/100', 'HP: 100 / 100', 'MP: 30 / 30',
        '기력: 50 / 50', '허기: 100%', '수분: 100%'
    ];
    info.querySelectorAll('p').forEach((p, i) => p.textContent = lines[i]);

    showTab('status');
    document.querySelector('.event-display').innerHTML = '<p>시작의 마을, 에렌투스에 오신 걸 환영합니다.</p>';

    renderHandCards();
    // 턴 종료 버튼 연결
    endTurnButton.addEventListener('click', () => {
        if (!endTurnButton.classList.contains('disabled')) {
            endTurn();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault(); // 스크롤 방지 등 기본 동작 차단
            if (!endTurnButton.classList.contains('disabled')) {
                endTurn();
            }
        }
    });
    
    document.querySelector('.weather').textContent = '☀️ 맑음';
    document.querySelector('.turn-info').textContent = '턴: 플레이어';

    updateTimeDisplay();
}

// 페이지 로드 시 초기화
window.onload = () => {
    initializeForecast();
    initializeGameState();
};

window.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});