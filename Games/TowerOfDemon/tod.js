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
const cancelSound = new Audio('audio/cancel.wav');


// 날씨 목록
const weatherData = {
    "에리디아 평원": {
        types: {
            "맑음": 50,
            "흐림": 20,
            "비": 20,
            "안개": 10
        }
    },
    "대삼림": {
        types: {
            "맑음": 30,
            "비": 30,
            "폭우": 25,
            "짙은 안개": 15
        }
    },
    "영원의 화산": {
        types: {
            "맑음": 20,
            "화산재": 40,
            "연기": 25,
            "번개": 15
        }
    },
    "화산지역": {
        types: {
            "연기": 35,
            "재낙하": 40,
            "뜨거운 돌풍": 25
        }
    },
    "사막": {
        types: {
            "맑음": 40,
            "모래폭풍": 30,
            "건조": 20,
            "사막 번개": 10
        }
    }
};
const worldMap = {
    "에리디아 평원": {
        weatherForecast: Array.from({ length: 7 }, () => generateWeather("에리디아 평원")), // 7일치 예보
        currentWeather: null,
        regions: {
            "에렌투스": {
                spots: ["광장", "여관", "시장", "모험가 길드"],
                bgm: "calm_meadow.mp3",
                monsters: [],
                events: ["퀘스트 수령", "아이템 상점", "길드 가입"]
            },
            "고대 전초기지": {
                spots: ["입구", "중앙 격납고", "감시탑"],
                bgm: "abandoned_base.mp3",
                monsters: ["고대 병기", "방황하는 영혼"],
                events: ["보물 상자 발견", "기계 부활"]
            },
            "사냥터 입구": {
                spots: ["덩굴지대", "수풀길", "야영지"],
                bgm: "hunting_path.mp3",
                monsters: ["야생 늑대", "숲 도마뱀"],
                events: ["추적자 퀘스트", "은신처 발견"]
            }
        }
    },
    "대삼림": {
        weatherForecast: Array.from({ length: 7 }, () => generateWeather("대삼림")), // 7일치 예보
        currentWeather: null,
        regions: {
            "고목의 숲": {
                spots: ["거목 아래", "숲속 연못", "숨겨진 길"],
                bgm: "forest_depths.mp3",
                monsters: ["숲의 정령", "독나무 뱀"],
                events: ["비밀 퀘스트", "고대의 소환진"]
            },
            "엘프 성역": {
                spots: ["입구", "의식의 제단", "엘프 정원"],
                bgm: "elven_sanctuary.mp3",
                monsters: [],
                events: ["엘프 의식 참관", "영창 퀘스트"]
            },
            "맹수의 둥지": {
                spots: ["야수의 동굴", "뼈무덤", "숨겨진 구역"],
                bgm: "beast_den.mp3",
                monsters: ["맹렬한 곰", "동굴 뱀"],
                events: ["야수 소굴 파괴", "사냥꾼의 유품"]
            }
        }
    },
    "영원의 화산": {
        weatherForecast: Array.from({ length: 7 }, () => generateWeather("영원의 화산")), // 7일치 예보
        currentWeather: null,
        regions: {
            "분화구 입구": {
                spots: ["불의 문", "화산지대 경계", "감시초소"],
                bgm: "volcano_warning.mp3",
                monsters: ["불 도마뱀", "용암 슬라임"],
                events: ["열풍 경보", "화산의 흔적 조사"]
            },
            "불의 신전": {
                spots: ["신전 앞마당", "불꽃 회랑", "제단"],
                bgm: "fire_temple.mp3",
                monsters: ["불꽃 정령", "타락한 사제"],
                events: ["제단 봉인 해제", "불꽃 심판 이벤트"]
            },
            "용암 터널": {
                spots: ["용암강", "돌다리", "열기 방"],
                bgm: "lava_tunnel.mp3",
                monsters: ["마그마 골렘", "화염 도마뱀"],
                events: ["용암 폭발 피하기", "지열 조정 장치 발견"]
            }
        }
    },
    "화산지역": {
        weatherForecast: Array.from({ length: 7 }, () => generateWeather("화산지역")), // 7일치 예보
        currentWeather: null,
        regions: {
            "잿빛 고원": {
                spots: ["바위 언덕", "잿더미 평지", "붕괴된 탑"],
                bgm: "ashen_plateau.mp3",
                monsters: ["잿빛 늑대", "돌가루 정령"],
                events: ["불씨 수거 퀘스트", "탑 조사"]
            },
            "연기 협곡": {
                spots: ["협곡 입구", "흐릿한 절벽", "연기 바위길"],
                bgm: "smoky_canyon.mp3",
                monsters: ["연기 악령", "화산 바위벌레"],
                events: ["길 잃은 탐험가 구조", "연기 폭풍 예측"]
            }
        }
    },
    "사막": {
        weatherForecast: Array.from({ length: 7 }, () => generateWeather("사막")), // 7일치 예보
        currentWeather: null,
        regions: {
            "모래 언덕": {
                spots: ["바람 언덕", "낙타 야영지", "모래 폭풍 지대"],
                bgm: "desert_wind.mp3",
                monsters: ["사막 정찰자", "모래뱀"],
                events: ["모래 폭풍 회피", "상인단 호위"]
            },
            "유적지 입구": {
                spots: ["파손된 문", "조각상 앞", "폐허"],
                bgm: "ruins_gate.mp3",
                monsters: ["사막 망령", "부서진 골렘"],
                events: ["고대 유물 조사", "비밀 통로 발견"]
            },
            "잃어버린 오아시스": {
                spots: ["야자수 숲", "작은 연못", "오래된 성소"],
                bgm: "lost_oasis.mp3",
                monsters: ["물 정령", "암살자 도적"],
                events: ["회복의 축복", "비밀 의식"]
            }
        }
    }
};
//시간 
let currentGameTime = 480; // 08:00부터 시작 (단위: 분)
let currentDay = 1;

let isWaiting = false;

// 게임 초기 상태 변수 정의
const gameState = {
    level: 1,
    exp: 0,
    expMax: 100,
    place: {
        region: '에리디아 평원',
        area: '에렌투스',
        spot: '모험가 길드'
    },
    gold: 0,
    playerInfo: {
        name: '???',
        hp: 100,
        hpMax: 100,
        mp: 30,
        mpMax: 30,
        stamina: 50,
        staminaMax: 50,
        hunger: 100,
        thirst: 100
    },
    weather: '☀️ 맑음',
    turn: '플레이어',
    statPoints: 3, 
    stats: {
        힘: 5,
        지능: 5,
        민첩: 5,
        인내: 5,
        행운: 5
    }
};

// 배경음악 제어를 위한 오디오 객체
let currentBGM = null;


function moveToLocation(region, area, spot) {
    const regionData = worldMap[region];
    const areaData = regionData?.[area];
    const isValid = areaData && areaData.spots.includes(spot);

    if (!isValid) {
        console.warn("존재하지 않는 지역입니다.");
        return;
    }

    // 위치 저장
    gameState.location = { region, area, spot };

    // 날씨 갱신
    updateWeather();

    // BGM 페이드 전환
    const bgmSrc = areaData.bgm;
    if (bgmSrc) switchBGM(bgmSrc);

    // UI 갱신
    updateLocationDisplay();

    // 기타 시스템
    updateGameStateUI();
    renderHandCards();

    console.log(`이동 완료: ${region} > ${area} > ${spot}`);
}
// 위치 표시 UI 갱신
function updateLocationDisplay() {
    const { region, area, spot } = gameState.location;
    document.querySelector('.place-name').textContent = `${region} - ${area}`;
    document.querySelector('.place-detail').textContent = spot;
}
function switchBGM(newSrc) {
    const fadeOutDuration = 1000;

    // 기존 BGM 페이드 아웃
    if (currentBGM) {
        const prev = currentBGM;
        const step = 0.05;
        const fadeOut = setInterval(() => {
            if (prev.volume > step) {
                prev.volume -= step;
            } else {
                clearInterval(fadeOut);
                prev.pause();
                playNewBGM(newSrc);
            }
        }, fadeOutDuration * step);
    } else {
        playNewBGM(newSrc);
    }
}

function playNewBGM(src) {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0;
    audio.play();
    currentBGM = audio;

    // 페이드 인
    const step = 0.05;
    const fadeIn = setInterval(() => {
        if (audio.volume < 1 - step) {
            audio.volume += step;
        } else {
            audio.volume = 1;
            clearInterval(fadeIn);
        }
    }, 1000 * step);
}




// 시간대 판별 함수
function getTimePeriod(mins) {
    const hour = Math.floor(mins / 60);
    if (hour >= 4 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'noon';
    if (hour >= 17 && hour < 20) return 'evening';
    return 'night';
}

function updateWeather() {
    const areaName = gameState.place.area;
    let matchedRegionName = null;

    // worldMap 전체에서 areaName을 포함한 region을 찾는다
    for (const [regionName, regionData] of Object.entries(worldMap)) {
        if (regionData.regions && regionData.regions[areaName]) {
            matchedRegionName = regionName;
            break;
        }
    }

    if (!matchedRegionName) {
        console.warn(`지역을 찾을 수 없습니다: ${areaName}`);
        return;
    }

    const region = worldMap[matchedRegionName];

    // 오늘 날씨 가져오기
    const todayWeather = region.weatherForecast[0];

    // 지역 상태에 저장
    region.currentWeather = todayWeather;

    // 게임 전역 상태에 저장
    gameState.weather = todayWeather;

    // UI 갱신
    document.querySelector('.weather').textContent = todayWeather;
}


// 날씨 예보 생성 함수
function generateWeather(regionName) {
    const weatherInfo = weatherData[regionName];
    if (!weatherInfo) {
        return "맑음"; // 예보 데이터가 없을 경우 기본 날씨
    }

    const types = weatherInfo.types;
    const totalWeight = Object.values(types).reduce((sum, value) => sum + value, 0);
    const rand = Math.random() * totalWeight;
    let accumulated = 0;
    let selectedWeather = "맑음";

    for (const [weather, chance] of Object.entries(types)) {
        accumulated += chance;
        if (rand <= accumulated) {
            selectedWeather = weather;
            break;
        }
    }

    return selectedWeather;
}
// 초기 예보 생성 (각 지역별로 7일치 예보 생성)
const regions = {};
// 각 지역별 날씨 초기화
function initializeForecast() {
    Object.keys(worldMap).forEach(region => {
        worldMap[region].weatherForecast = Array.from({ length: 7 }, () => generateWeather(region));
        const regionData = worldMap[region];

        // 7일치 날씨 예보 출력
        console.log(`지역: ${region} - 7일 날씨 예보: ${regionData.weatherForecast.join(", ")}`);
        
        // 현재 날씨 출력
        console.log(`지역: ${region} - 현재 날씨: ${regionData.currentWeather}`);
    });
}

// 날씨 UI 업데이트
function updateRegionWeatherDisplay(region) {
    const regionWeather = worldMap[region].currentWeather;
    //document.querySelector(`.weather-${region}`).textContent = `${region}: ${regionWeather}`;
    console.log("지역 날씨 예보 : " +region + regionWeather);
}


// 게임 내 모든 지역 날씨 정보 업데이트
function updateAllRegionWeather() {
    Object.keys(worldMap).forEach(region => {
        const regionData = worldMap[region];
        regionData.weatherForecast.shift(); // 가장 오래된 날씨를 제거
        regionData.weatherForecast.push(generateWeather(region)); // 새로운 날씨 추가

        // UI 업데이트
        updateRegionWeatherDisplay(region);
    });
}
function updateDayDisplay() {
    document.querySelector('.day-count').textContent = ` ${currentDay}일차`;
}
// 시간 표시 업데이트
function updateTimeDisplay() {
    const hour = Math.floor(currentGameTime / 60);
    const minute = currentGameTime % 60;
    const formatted = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    document.querySelector('.time-now').textContent = ` ${formatted}`;

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
function endTurn() {
    isWaiting = true;
    endTurnButton.classList.add('disabled');
    endTurnButton.textContent = '⏳ 대기 중...';

    currentGameTime += 10;
    if (currentGameTime >= 1440) {
        currentGameTime -= 1440;
        currentDay++;
        updateAllRegionWeather();
        updateWeather(); // 지역 날씨 갱신
        Object.keys(worldMap).forEach(region => {
            const regionData = worldMap[region];
    
            // 7일치 날씨 예보 출력
            console.log(`지역: ${region} - 7일 날씨 예보: ${regionData.weatherForecast.join(", ")}`);
            
            // 현재 날씨 출력
            console.log(`지역: ${region} - 현재 날씨: ${regionData.currentWeather}`);

        });
    }

    decreaseHungerAndThirst();
    updateTimeDisplay();
    updateDayDisplay();

    turnEndSound.currentTime = 0;
    turnEndSound.play().catch(e => console.warn("turnEndSound.mp3 재생 실패", e));
    renderHandCards();
    updateGameStateUI();

    setTimeout(() => {
        isWaiting = false;
        endTurnButton.classList.remove('disabled');
        endTurnButton.textContent = '⏭️ 턴 넘기기';
        document.querySelector('.turn-info').textContent = '턴: 플레이어';
        renderHandCards();
    }, 1000);
}

// 처음에 시작할 카드 내용이랑 카드 변수가 있음
let cardData = [
    {
        name: '게시판 확인',
        effect: '의뢰 확인',
        description: '현재 접수 가능한 의뢰와 진행 중인 임무를 확인합니다.',
        image: 'icons/board.png',
        undiscardable: true,
        type: '행동',
        cost: 0,
        usable:true,
        disposialAfterLeave:true,
        oneTimeUse:true,
        id: 'guild_quest',
        tags: ['길드', '행동', '게시판 확인']
    },
    {
        name: '대화하기',
        effect: '길드원 교류',
        description: '길드 마스터나 다른 길드원들과 대화를 나눕니다.',
        image: 'icons/chat.png',
        undiscardable: true,
        type: '행동',
        cost: 0,
        usable:true,
        disposialAfterLeave:true,
        oneTimeUse:false,
        id: 'guild_talk',
        tags: ['길드', '행동', '대화하기']
    },
    {
        name: '길드 나가기',
        effect: '마을 이동',
        description: '길드를 나와 마을로 돌아갑니다.',
        image: 'icons/doorOut.png',
        undiscardable: true,
        type: '행동',
        cost: 0,
        usable:true,
        disposialAfterLeave:true,
        oneTimeUse:false,
        id: 'guild_leave',
        tags: ['길드', '행동', '마을이동']
    }
];


let guild_set = [
    {
        name: '게시판 확인',
        effect: '의뢰 확인',
        description: '현재 접수 가능한 의뢰와 진행 중인 임무를 확인합니다.',
        image: 'icons/board.png',
        undiscardable: true,
        type: '행동',
        cost: 0,
        usable:true,
        disposialAfterLeave:true,
        oneTimeUse:true,
        id: 'guild_quest',
        tags: ['길드', '행동', '게시판 확인']
    },
    {
        name: '대화하기',
        effect: '길드원 교류',
        description: '길드 마스터나 다른 길드원들과 대화를 나눕니다.',
        image: 'icons/chat.png',
        undiscardable: true,
        type: '행동',
        cost: 0,
        usable:true,
        disposialAfterLeave:true,
        oneTimeUse:false,
        id: 'guild_talk',
        tags: ['길드', '행동', '대화하기']
    },
    {
        name: '길드 나가기',
        effect: '마을 이동',
        description: '길드를 나와 마을로 돌아갑니다.',
        image: 'icons/doorOut.png',
        undiscardable: true,
        type: '행동',
        cost: 0,
        usable:true,
        disposialAfterLeave:true,
        oneTimeUse:false,
        id: 'guild_leave',
        tags: ['길드', '행동', '마을이동']
    }
];


let guild_quest_set = [
    {
        name: '슬라임 소탕',
            effect: '퀘스트 수락',
            description: '요즘 슬라임의 수가 너무 많소. 세 놈만 잡으면, 두둑히 보수하겠소.',
            image: 'icons/quest.png',
            undiscardable: true,
            type: '소탕 퀘스트',
            cost: 0,
            usable: true,
            disposialAfterLeave: true,
            oneTimeUse: true,
            id: 'quest1',
            tags: ['퀘스트', '초보자','전투','소탕']
        },
        {
            name: '구리 원석이 필요하네.',
            effect: '퀘스트 수락',
            description: '구리 원석을 4개 구해서 대장간으로 가져와 주게나. 보수는.. 200G 즈음 주겠네.',
            image: 'icons/quest.png',
            undiscardable: true,
            type: '수집 퀘스트',
            cost: 0,
            usable: true,
            disposialAfterLeave: true,
            oneTimeUse: true,
            id: 'quest2',
            tags: ['퀘스트', '초보자','비전투','수집']
        },
        {
            name: '돌아가기',
            effect: '마을로 돌아가기',
            description: '퀘스트를 마친 후 마을로 돌아갑니다.',
            image: 'icons/doorOut.png',
            undiscardable: true,
            type: '행동',
            cost: 0,
            usable: false,
            disposialAfterLeave: true,
            oneTimeUse: false,
            id: 'back_to_town',
            tags: ['길드','행동', '돌아가기']
        }
];
// 좌측 패널에 대한 내용이 있음
// 패널 열기/닫기
function togglePanel() {
    panel.classList.toggle("open");
    menuButton.style.left = panel.classList.contains("open") ? "280px" : "0px";
    statuSound.currentTime = 0;
    statuSound.play().catch(e => console.warn("dropCard.mp3 재생 실패", e));
}
function playStatusSound(){
    statuSound.currentTime = 0;
    statuSound.play().catch(e => console.warn("pickCard.mp3 재생 실패", e));
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
    if (tab === 'status') {
        // 상태 탭: 스탯 UI 구성
        tabContent.innerHTML = ''; // 초기화

        const statContainer = document.createElement('div');
        statContainer.className = 'stat-block';

        const pointInfo = document.createElement('p');
        pointInfo.textContent = `남은 스탯 포인트: ${gameState.statPoints}`;
        statContainer.appendChild(pointInfo);

        for (const statName in gameState.stats) {
            const statRow = document.createElement('div');
            statRow.className = 'stat-row';

            const label = document.createElement('span');
            label.textContent = `${statName}: ${gameState.stats[statName]}`;
            statRow.appendChild(label);

            if (gameState.statPoints > 0) {
                const btn = document.createElement('button');
                btn.textContent = '+';
                btn.onclick = () => {
                    pickSound.currentTime = 0;
        pickSound.play().catch(e => console.warn("pickCard.mp3 재생 실패", e));
                    gameState.stats[statName]++;
                    gameState.statPoints--;
                    showTab('status'); // UI 갱신
                };
                statRow.appendChild(btn);
            }

            statContainer.appendChild(statRow);
        }

        tabContent.appendChild(statContainer);

    } else {
        // 다른 탭은 기존처럼 텍스트만 출력
        const contentMap = {
            status: '상태 정보 표시 영역',
            skills: '보유 스킬 목록',
            equipment: '장비 착용 정보',
            quest: '퀘스트 정보',
            codex: '몬스터/아이템 도감'
        };
        tabContent.innerHTML = `<p>${contentMap[tab] || ''}</p>`;
    }
}

// 카드에 대한 작업이 있음
// 카드 상세보기
function showCardDetail(card) {
    alert(`🔍 ${card.name}\n${card.effect}\n\n${card.description}`);
}
// 카드 DOM 생성 함수
function createCard(card, index, total) {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
        <div class="card-header">
            <div class="card-cost">${card.cost}</div>
            <div class="card-type">${card.type}</div>
        </div>
        <img class='card-image' src="${card.image}" alt="noImage" />
        <div class='card-name'><strong>${card.name}</strong></div>
        <div class='card-effect'>${card.effect}</div>
        <div class='card-description'>${card.description}</div>
    `;
    document.body.appendChild(el);
    el.cardData = card;
    const cardWidth = 180;

    // 기본 간격
    let gap = cardWidth * 1.1;

    if (total >= 6) {
        gap = cardWidth * 0.8;
    }

    // 화면 크기에 따라 덱 너비 제한
    if (window.innerWidth > 800) {
        const maxTotalWidth = window.innerWidth / 2 + 60;
        const maxGap = (maxTotalWidth - cardWidth) / (total - 1);
        gap = Math.min(gap, maxGap);
    }

    const totalWidth = gap * (total - 1) + cardWidth;
    const startX = (window.innerWidth - totalWidth) / 2 - 100;
    const y = window.innerHeight - 260;
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
        el.style.transform = `scale(1.05) translateY(-10px)`;
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
// 초기 카드 배치 함수 겸 카드 렌더링 (새로고침)
function renderHandCards() {
    document.querySelectorAll('.card').forEach(card => card.remove());
    cardData.forEach((card, i) => createCard(card, i, cardData.length));
}


function addCard(card) {
    const deck = document.getElementById('deck');
    const deckRect = deck?.getBoundingClientRect() || { left: window.innerWidth / 2, top: window.innerHeight };
    const total = cardData.length + 1;
    const index = cardData.length;

    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
        <div class="card-header">
            <div class="card-cost">${card.cost}</div>
            <div class="card-type">${card.type}</div>
        </div>
        <img class='card-image' src="${card.image}" alt="noImage" />
        <div class='card-name'><strong>${card.name}</strong></div>
        <div class='card-effect'>${card.effect}</div>
        <div class='card-description'>${card.description}</div>
    `;
    document.body.appendChild(el);
    el.cardData = card;

    // 초기 위치: 덱 위치
    el.style.position = 'absolute';
    el.style.left = `${deckRect.left}px`;
    el.style.top = `${deckRect.top}px`;
    el.style.opacity = 0;
    el.style.transition = 'all 0.5s ease';

    // 렌더링 강제 반영
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const cardWidth = 180;

            // 기본 간격
            let gap = cardWidth * 1.1;
        
            if (total >= 6) {
                gap = cardWidth * 0.8;
            }
        
            // 화면 크기에 따라 덱 너비 제한
            if (window.innerWidth > 800) {
                const maxTotalWidth = window.innerWidth / 2 + 60;
                const maxGap = (maxTotalWidth - cardWidth) / (total - 1);
                gap = Math.min(gap, maxGap);
            }
        
            const totalWidth = gap * (total - 1) + cardWidth;
            const startX = (window.innerWidth - totalWidth) / 2 - 200;
            const y = window.innerHeight - 260;
            const x = startX + index * gap;

            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
            el.style.opacity = 1;
            el.style.transformOrigin = 'center center';
            const centerIndex = (total - 1) / 2;
            const z = 100 - Math.abs(index - centerIndex);

            el.addEventListener('mouseenter', () => {
                if (isWaiting) return;
                el.style.transform = `scale(1.05) translateY(-10px)`;
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
        });
    });

    // 카드 데이터에 추가
    cardData.push(card);
}


// 카드 드래그 액션 처리리
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

            const isInUseArea = (() => {
                const stage = document.querySelector('.cardUseRect') || document.body;
                const stageRect = stage.getBoundingClientRect();
                return (
                    cloneRect.right > stageRect.left &&
                    cloneRect.left < stageRect.right &&
                    cloneRect.bottom > stageRect.top &&
                    cloneRect.top < stageRect.bottom
                );
            })();
            const isInDiscard = (
                cloneRect.right > discardRect.left &&
                cloneRect.left < discardRect.right &&
                cloneRect.bottom > discardRect.top &&
                cloneRect.top < discardRect.bottom
            );

            if (isInDiscard) {
                // 버릴 수 없는 카드면 그냥 복구
                if (card.undiscardable) {
                    showUndiscardableMessage();
                    cardData.splice(index, 0, card);
                    clone.remove();
                    renderHandCards();
                    discardArea.classList.remove('active');
                    cancelSound.currentTime = 0;
                    cancelSound.play().catch(e => console.warn("discardCard.mp3 재생 실패", e));
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

                setTimeout(() => { clone.remove(); discardArea.classList.remove('active'); }, 500);

                return; // 원래 위치로 복구 안 함
            }

            if (isInUseArea) {
                // 카드 사용 처리
                original
                useCard(card); // 카드 사용 함수 호출 (직접 구현 필요)
                setTimeout(() => clone.remove(), 400);
                if (card.oneTimeUse) {
                    clone.remove();
                    return
                }
                cardData.splice(index, 0, card);
                clone.remove();
                renderHandCards();
                return;
                
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

function useCard(card) {
    const display = document.querySelector('.event-display');
    display.innerHTML = `<p>💥 ${card.name} 사용됨: ${card.effect}</p>`;
    // 실제 효과는 카드 id나 tags를 기반으로 처리하세요!


    // 사운드 효과 (선택사항)
    pickSound.currentTime = 0;
    pickSound.play().catch(e => console.warn("cardUse.mp3 재생 실패", e));

    // 실제 기능 로직은 카드 ID 또는 태그로 분기
    switch (card.id) {
        case 'guild_quest':
            console.log('퀘스트를 확인합니다!');
            console.log(cardData);
            openQuestTab();
            // 여기에 퀘스트 확인 처리
            break;
        case 'guild_talk':
            console.log('대화창이 열립니다!');
            // 대화 관련 처리
            break;
        case 'guild_leave':
            console.log('길드를 나갑니다!');
            // 여기에 길드 → 마을 이동 처리
            break;


        // 다른 카드들 추가 가능
        default:
            console.log(`${card.name} 사용됨`);
    }
}


function openQuestTab() {
    // 기존 카드 제거
    returnAllCardsToDeck(cardData.length);
    
    setTimeout(() => { addMultipleCards(guild_quest_set)}, 500);
    
    // 퀘스트 카드 추가
    
}


function addMultipleCards(cardsArray) {

    cardsArray.forEach((card, index) => {
        setTimeout(() => {
            addCard(card, index, cardsArray.length);
        }, index * 500); // 한 장씩 슥슥 추가되는 느낌
    });
}
function returnAllCardsToDeck(value) {
    const handCards = document.querySelectorAll('.card');
    handCards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const deck = document.querySelector('#deck'); // 덱 요소
        const deckRect = deck.getBoundingClientRect();

        const dx = deckRect.left - rect.left;
        const dy = deckRect.top - rect.top;

        card.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
        card.style.transform = `translate(${dx}px, ${dy}px) scale(0.2) rotate(-30deg)`;
        card.style.opacity = '0';

        setTimeout(cardData.splice(0, value));
    });
}

// 초기 상태 설정 함수
function initializeGameState() {
    // 시작 위치 설정
    gameState.location = {
        region: "에리디아 평원",
        area: "에렌투스",
        spot: "모험가 길드"
    };

    // 날씨 및 배경음악 갱신
    const areaData = worldMap[gameState.location.region][gameState.location.area];
    if (areaData?.bgm) {
        switchBGM(areaData.bgm);
    }
    // 게임 상태 UI 업데이트
    document.querySelector('.level').textContent = `Lv. ${gameState.level}`;
    document.querySelector('.exp-fill').style.width = `${(gameState.exp / gameState.expMax) * 100}%`;
    document.querySelector('.place-name').textContent = gameState.place.name;
    document.querySelector('.place-detail').textContent = gameState.place.detail;
    document.querySelector('.gold').textContent = `💰 ${gameState.gold}G`;
    updateLocationDisplay(); // 위치 정보 갱신
    const info = document.querySelector('.player-info');
    info.querySelector('h3').textContent = gameState.playerInfo.name;
    const lines = [
        `레벨 ${gameState.level} | 경험치 ${gameState.exp}/${gameState.expMax}`,
        `HP: ${gameState.playerInfo.hp} / ${gameState.playerInfo.hpMax}`,
        `MP: ${gameState.playerInfo.mp} / ${gameState.playerInfo.mpMax}`,
        `기력: ${gameState.playerInfo.stamina} / ${gameState.playerInfo.staminaMax}`,
        `허기: ${gameState.playerInfo.hunger}%`,
        `수분: ${gameState.playerInfo.thirst}%`
    ];
    info.querySelectorAll('p').forEach((p, i) => p.textContent = lines[i]);
    document.getElementById('manaValue').textContent = gameState.playerInfo.mp;
    document.getElementById('hpValue').textContent = gameState.playerInfo.hp;

    showTab('status');
    document.querySelector('.event-display').innerHTML = '<p>당신은 시작의 마을, 에렌투스의 모험가 길드에 들어갑니다. 솥에서  풍기는 고소한 고기 스튜 냄새와 맥주 냄새가 가득합니다.<br> 주변에는 퀘스트 보드와 모험가들이 있습니다..</p>';

    renderHandCards();

    // 턴 종료 버튼 연결
    endTurnButton.addEventListener('click', () => {
        if (!endTurnButton.classList.contains('disabled')) {
            endTurn();
        }
    });

    // 스페이스바로 턴 종료
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault(); // 스크롤 방지 등 기본 동작 차단
            if (!endTurnButton.classList.contains('disabled')) {
                endTurn();
            }
        }
    });

    // 날씨 및 턴 정보 업데이트
    document.querySelector('.weather').textContent = gameState.weather;
    document.querySelector('.turn-info').textContent = `턴: ${gameState.turn}`;
    updateWeather();
    updateTimeDisplay();
    const locationInfo = worldMap[gameState.place.region][gameState.place.area];
console.log("현재 위치:",gameState.place.region + " > " + gameState.place.area+" > " +gameState.place.spot);
console.log("배경음악:", locationInfo.bgm);
}

// 페이지 로드 시 초기화
window.onload = () => {
    initializeForecast();
    initializeGameState();
};

window.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

function showUndiscardableMessage() {
    // 중복 방지
    if (document.querySelector('.message-create')) return;

    const discardArea = document.querySelector('.discard-area');
    const discardRect = discardArea.getBoundingClientRect();

    const msg = document.createElement('div');
    msg.className = 'message-create';
    msg.textContent = '이 카드는 버릴 수 없어요.';

    Object.assign(msg.style, {
        position: 'fixed',
        left: `${discardRect.left + discardRect.width / 2}px`,
        bottom: `${window.innerHeight - discardRect.top + 10}px`,
        transform: 'translateX(-50%)',
        background: 'rgba(50, 50, 50, 0.9)',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '20px',
        fontSize: '16px',
        opacity: '0',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        zIndex: '9999',
        pointerEvents: 'none',
        animation: 'shake 0.4s ease-in-out', // 👈 진동 애니메이션 추가
    });

    document.body.appendChild(msg);

    // 등장
    requestAnimationFrame(() => {
        msg.style.opacity = '1';
        msg.style.transform = 'translateX(-50%) translateY(-20px)';
    });

    // 제거
    setTimeout(() => {
        msg.style.opacity = '0';
        msg.style.transform = 'translateX(-50%) translateY(0px)';
        setTimeout(() => msg.remove(), 300);
    }, 3000);
}

// CSS 애니메이션 추가 (JS에서 삽입 가능)
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes shake {
    0% { transform: translateX(-50%) translateY(-20px) translateX(0); }
    20% { transform: translateX(-50%) translateY(-20px) translateX(-5px); }
    40% { transform: translateX(-50%) translateY(-20px) translateX(5px); }
    60% { transform: translateX(-50%) translateY(-20px) translateX(-4px); }
    80% { transform: translateX(-50%) translateY(-20px) translateX(4px); }
    100% { transform: translateX(-50%) translateY(-20px) translateX(0); }
}
`;
document.head.appendChild(shakeStyle);

function decreaseHungerAndThirst() {
    // 허기와 갈증 감소 확률 (30% ~ 40%)
    const hungerChance = Math.random() * (0.4 - 0.3) + 0.3; // 30% ~ 40%
    const thirstChance = Math.random() * (0.4 - 0.3) + 0.3; // 30% ~ 40%

    // 허기와 갈증 감소량 (0.05 ~ 0.1)
    const hungerDecreaseAmount = Math.random() * (0.01 - 0.005) + 0.005; // 0.05 ~ 0.1
    const thirstDecreaseAmount = Math.random() * (0.01 - 0.005) + 0.005; // 0.05 ~ 0.1

    // 확률에 맞춰 허기 감소
    if (Math.random() < hungerChance) {
        gameState.playerInfo.hunger = Math.max(0, (gameState.playerInfo.hunger - hungerDecreaseAmount * 100).toFixed(1)); // 허기는 최소 0, *100으로 퍼센트 적용, 첫째 자리까지만
    }

    // 확률에 맞춰 갈증 감소
    if (Math.random() < thirstChance) {
        gameState.playerInfo.thirst = Math.max(0, (gameState.playerInfo.thirst - thirstDecreaseAmount * 100).toFixed(1)); // 갈증도 최소 0, *100으로 퍼센트 적용, 첫째 자리까지만
    }

    // UI 갱신
    updateGameStateUI();
}
function healHP(amount) {
    gameState.playerInfo.hp += amount;
    if (gameState.playerInfo.hp > gameState.playerInfo.hpMax) {
        gameState.playerInfo.hp = gameState.playerInfo.hpMax; // 최대 체력을 넘지 않도록
    }
    updateGameStateUI(); // UI 갱신
}
function addGold(amount) {
    gameState.gold += amount;
    updateGameStateUI(); // UI 갱신
}
function addExperience(amount) {
    gameState.exp += amount;
    if (gameState.exp >= gameState.expMax) {
        gameState.exp = gameState.expMax; // 최대 경험치를 넘지 않도록
        levelUp(); // 레벨업 처리
    }
    updateGameStateUI(); // UI 갱신
}

function updateGameStateUI() {
    document.querySelector('.level').textContent = `Lv. ${gameState.level}`;
    document.querySelector('.exp-fill').style.width = `${(gameState.exp / gameState.expMax) * 100}%`;
    document.querySelector('.place-name').textContent = gameState.place.region + " - " +gameState.place.area;
    document.querySelector('.place-detail').textContent = gameState.place.spot;
    document.querySelector('.gold').textContent = `💰 ${gameState.gold}G`;

    const info = document.querySelector('.player-info');
    info.querySelector('h3').textContent = gameState.playerInfo.name;
    const lines = [
        `레벨 ${gameState.level} | 경험치 ${gameState.exp}/${gameState.expMax}`,
        `HP: ${gameState.playerInfo.hp} / ${gameState.playerInfo.hpMax}`,
        `MP: ${gameState.playerInfo.mp} / ${gameState.playerInfo.mpMax}`,
        `기력: ${gameState.playerInfo.stamina} / ${gameState.playerInfo.staminaMax}`,
        `허기: ${gameState.playerInfo.hunger}%`,
        `수분: ${gameState.playerInfo.thirst}%`
    ];
    info.querySelectorAll('p').forEach((p, i) => p.textContent = lines[i]);
    document.getElementById('manaValue').textContent = gameState.playerInfo.mp;
    document.getElementById('hpValue').textContent = gameState.playerInfo.hp;

    document.querySelector('.weather').textContent = gameState.weather;
    document.querySelector('.turn-info').textContent = `턴: ${gameState.turn}`;
    updateTimeDisplay();

    // HP 및 MP 게이지 애니메이션 적용
    const hpFill = document.querySelector('.hp-fill');
    const mpFill = document.querySelector('.mp-fill');

    // HP와 MP 게이지 업데이트
    hpFill.style.width = `${(gameState.playerInfo.hp / gameState.playerInfo.hpMax) * 100}%`;
    mpFill.style.width = `${(gameState.playerInfo.mp / gameState.playerInfo.mpMax) * 100}%`;
}