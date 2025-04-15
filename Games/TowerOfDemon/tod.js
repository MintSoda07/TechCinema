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

// 페이지 로드 시 실행
//window.addEventListener('DOMContentLoaded', loadJobCards);

// 전역 변수 선언
let weatherData, worldMap, gameState, timePeriods;
let inventory = {
    items: [
        { id: "sword001", quantity: 1 },
        { id: "potion001", quantity: 3 },
        { id: "armor001", quantity: 1 }
    ]
};
let PlayingBgm = document.getElementById('bgm');
let bgs = new Audio('bgm/bgs/forest.mp3');
let se = new Audio('se/click.mp3');

window.onload = () => {
    loadJobCards();
    loadSettings();
};

function startNewGame() {
    // 타이틀 화면 숨기고 → 저장 슬롯 선택 UI 보여주기
    document.getElementById('title-screen').style.display = 'none';
    showSaveSlotSelection('new');
}

function continueGame() {
    document.getElementById('title-screen').style.display = 'none';
    showSaveSlotSelection('load');
}

function openSettings() {
    document.getElementById('settings-screen').style.display = 'flex';

    document.getElementById('bgm-volume').value = PlayingBgm.volume;
    document.getElementById('bgs-volume').value = bgs.volume;
    document.getElementById('se-volume').value = se.volume;

    // 실시간 반영 이벤트 설정
    document.getElementById('bgm-volume').oninput = (e) => {
        bgm.volume = parseFloat(e.target.value);
    };
    document.getElementById('bgs-volume').oninput = (e) => {
        bgs.volume = parseFloat(e.target.value);
    };
    document.getElementById('se-volume').onchange = (e) => {
        se.volume = parseFloat(e.target.value);
        se.currentTime = 0; // 효과음 미리듣기
        se.play();
    };
}

function closeSettings() {
    document.getElementById('settings-screen').style.display = 'none';
    document.getElementById('save-message').textContent = '';
}


function saveSettings() {
    const bgmVolume = parseFloat(document.getElementById('bgm-volume').value);
    const bgsVolume = parseFloat(document.getElementById('bgs-volume').value);
    const seVolume = parseFloat(document.getElementById('se-volume').value);

    bgm.volume = bgmVolume;
    bgs.volume = bgsVolume;
    se.volume = seVolume;

    localStorage.setItem('gameSettings', JSON.stringify({ bgmVolume, bgsVolume, seVolume }));

    const message = document.getElementById('save-message');
    message.textContent = '설정이 저장되었습니다.';
    setTimeout(() => {
        message.textContent = '';
    }, 3000);
}

// 설정 불러오기 (초기화 시 실행)
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('gameSettings'));
    if (settings) {
        bgm.volume = settings.bgmVolume ?? 1;
        bgs.volume = settings.bgsVolume ?? 1;
        se.volume = settings.seVolume ?? 1;
    }
}

function exitGame() {
    alert('게임 종료 처리 (웹이라면 브라우저 닫기 안내)');
}

function fadeOutAudio(audio, duration = 2000) {
    const step = 50;
    const volumeStep = audio.volume / (duration / step);

    const fade = setInterval(() => {
        if (audio.volume > volumeStep) {
            audio.volume -= volumeStep;
        } else {
            audio.volume = 0;
            audio.pause();
            clearInterval(fade);
        }
    }, step);
}

function switchBGM(newSrc) {
    if (!bgm.paused && !bgm.ended) {
        fadeOutAudio(bgm, 1000); // 페이드 아웃
        setTimeout(() => {
            playNewBGM(newSrc);  // 페이드 인 포함
        }, 1000);
    } else {
        playNewBGM(newSrc);
    }
}

function playNewBGM(src) {
    bgm.src = src;
    bgm.loop = true;
    fadeInAudio(bgm, 1000); // 1초 동안 페이드 인
}

function fadeInAudio(audio, duration = 2000, targetVolume = 1.0) {
    const step = 50;
    const volumeStep = targetVolume / (duration / step);

    audio.volume = 0;
    audio.muted = true;

    audio.play().then(() => {
        audio.muted = false;
        const fade = setInterval(() => {
            if (audio.volume < targetVolume - volumeStep) {
                audio.volume += volumeStep;
            } else {
                audio.volume = targetVolume;
                clearInterval(fade);
            }
        }, step);
    }).catch(error => {
        console.error("오디오 재생 중 오류:", error);
    });
}
// 슬롯 선택 UI 표시
function showSaveSlotSelection(mode) {
    const saveSlotSelection = document.getElementById('save-slot-selection');
    const slotButtons = document.getElementById('slot-buttons');
    const slotModeTitle = document.getElementById('slot-mode-title');

    slotModeTitle.textContent = mode === 'new' ? '어느 슬롯에 저장하시겠습니까?' : '어느 슬롯의 데이터를 불러오시겠습니까?';
    slotButtons.innerHTML = '';

    for (let i = 1; i <= 3; i++) {
        const saveKey = `save_slot_${i}/data/gameState`;
        const saveData = localStorage.getItem(saveKey);
        const slotButton = document.createElement('button');
        slotButton.classList.add('title-button');

        if (saveData) {
            const data = JSON.parse(saveData);
            const { name, class: charClass } = data.playerInfo;
            const { area, spot } = data.place;
            const lastSaved = new Date(data.lastSaved).toLocaleString();

            slotButton.innerHTML = `
                <strong>슬롯 ${i}</strong><br>
                ${name} (${charClass})<br>
                위치: ${area} - ${spot}<br>
                저장: ${lastSaved}
            `;
        } else {
            slotButton.textContent = `슬롯 ${i} (빈 슬롯)`;
        }

        slotButton.onclick = () => handleSlotSelection(i, mode);
        slotButtons.appendChild(slotButton);
    }

    saveSlotSelection.style.display = 'flex';
}

// 슬롯 클릭 처리
function handleSlotSelection(slotNumber, mode) {
    const saveKey = `save_slot_${slotNumber}/data/gameState`; // 게임 상태를 저장하는 키
    if (mode === 'new') {
        showCharacterSetup(slotNumber);
    } else if (mode === 'load') {
        const savedData = localStorage.getItem(saveKey);

        if (savedData) {
            const data = JSON.parse(savedData);
            alert(`슬롯 ${slotNumber}에서 이어하기.`);
            // 이어하기 후 게임 로딩 로직
            loadGameDataFromSlot(slotNumber, data);
            const saveSlotSelection = document.getElementById('save-slot-selection');
            const slotButtons = document.getElementById('slot-buttons');
            saveSlotSelection.style.display = 'none';
        } else {
            alert(`슬롯 ${slotNumber}에 저장된 데이터가 없습니다.`);
        }
    }
}
let selectedClass = null;

function loadGameDataFromSlot(slotNumber) {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';
    const bgm = document.getElementById('bgm');


     // BGM 페이드아웃 시작
    if (bgm && !bgm.paused) {
        fadeOutAudio(bgm, 2000); // 2초 동안 페이드 아웃
    }

    setTimeout(() => {
        try {
            weatherData = JSON.parse(localStorage.getItem('save_slot_' + slotNumber + '/data/weatherData.json')) || {};
            worldMap = JSON.parse(localStorage.getItem('save_slot_' + slotNumber + '/data/worldMap.json')) || {};
            gameState = JSON.parse(localStorage.getItem('save_slot_' + slotNumber + '/data/gameState.json')) || {};
            timePeriods = JSON.parse(localStorage.getItem('save_slot_' + slotNumber + '/data/timeData.json'))?.timePeriods || [];
            inventory = JSON.parse(localStorage.getItem('save_slot_' + slotNumber + '/data/inventory.json')) || { items: [] };
            itemsDatabase = JSON.parse(localStorage.getItem('itemsDatabase')) || {};

            console.log(`슬롯 ${slotNumber}에서 데이터 불러오기 완료!`);

            // 이후 초기화 작업
            initializeForecast();
            initializeGameState();
        } catch (error) {
            console.error(`슬롯 ${slotNumber}에서 데이터를 불러오는 중 오류 발생:`, error);
        } finally {
            loadingOverlay.style.display = 'none';
        }
    }, 500);
}

async function loadJobCards() {
    const response = await fetch('data/jobs.json');
    const jobs = await response.json();
    const container = document.getElementById('class-selection');
    container.innerHTML = '';

    jobs.forEach(job => {
        const card = document.createElement('div');
        card.classList.add('job-card');
        card.setAttribute('data-job-id', job.id);
        card.onclick = () => toggleClassSelection(job.id);

        card.innerHTML = `
            <h4>${job.name}</h4>
            <p>${job.description}</p>
        `;

        container.appendChild(card);
    });
}

function toggleClassSelection(className) {
    const cards = document.querySelectorAll('.job-card');
    cards.forEach(card => {
        const isSelected = card.getAttribute('data-job-id') === className;
        card.classList.toggle('selected', isSelected);
    });

    selectedClass = className;
}
// 캐릭터 설정 UI 표시
function showCharacterSetup(slotNumber) {
    const characterSetup = document.getElementById('character-setup');
    characterSetup.style.display = 'flex';
    loadJobCards(); // 직업 카드 불러오기

    const form = document.getElementById('character-form');
    form.onsubmit = function (event) {
        event.preventDefault();
        if (!selectedClass) {
            alert('직업을 선택해주세요!');
            return;
        }
        saveCharacterData(slotNumber); // 슬롯 기반 저장
    };
}

// 캐릭터 데이터를 해당 슬롯에 저장
function saveCharacterData(slotNumber) {
    const name = document.getElementById('character-name').value;
    const gender = document.getElementById('character-gender').value;

    const characterData = {
        level: 1,
        exp: 0,
        expMax: 100,
        place: {
            region: "에리디아 평원", // 기본 지역
            area: "에렌투스",        // 기본 지역 세부
            spot: "모험가 길드"      // 기본 장소
        },
        gold: 0,
        playerInfo: {
            name,
            gender,
            class: selectedClass,
            hp: 100,
            hpMax: 100,
            mp: 30,
            mpMax: 30,
            stamina: 50,
            staminaMax: 50,
            hunger: 100,
            thirst: 100
        },
        weather: "☀️ 맑음", // 초기 날씨
        turn: "플레이어", // 첫 턴: 플레이어
        statPoints: 3, // 초기 스탯 포인트
        stats: {
            힘: 5,
            지능: 5,
            민첩: 5,
            인내: 5,
            행운: 5
        },
        lastSaved: new Date().toISOString()
    };

    // 슬롯 번호에 맞춰 gameState 저장
    const saveKey = `save_slot_${slotNumber}/data/gameState`;
    localStorage.setItem(saveKey, JSON.stringify(characterData));

    // 추가적인 데이터 파일 복사 (예: 게임 상태, 인벤토리 등)
    copyDataFilesToLocalStorage(slotNumber);
    
    alert(`슬롯 ${slotNumber}에 저장되었습니다! (${name}, ${gender}, ${selectedClass})`);
    goBackToTitle();
}
async function copyDataFilesToLocalStorage(slotNumber) {
    const slotPrefix = `save_slot_${slotNumber}/data/`;

    // 어떤 파일들을 복사할지 정의 (직접 하드코딩하거나 filelist.json에서 가져와도 됨)
    const dataFiles = [
        'jobs.json',
        'gameState.json',
        'timeData.json',
        'weatherData.json',
        'worldMap.json',
        'itemData.json'
    ];

    for (const fileName of dataFiles) {
        const response = await fetch(`data/${fileName}`);
        const json = await response.json();
        localStorage.setItem(`${slotPrefix}${fileName}`, JSON.stringify(json));
    }

    console.log(`슬롯 ${slotNumber}에 모든 기본 데이터 복사 완료`);
}
// 타이틀 화면 복귀 (UI 리셋용)
function goBackToTitle() {
    document.getElementById('character-setup').style.display = 'none';
    document.getElementById('save-slot-selection').style.display = 'none';
    document.getElementById('title-screen').style.display = 'flex';
}


// 로컬스토리지에서 JSON 데이터를 불러오는 함수
function loadJSONFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        if (!data) {
            console.warn(`로컬스토리지에서 "${key}" 데이터를 찾을 수 없습니다.`);
            return null;
        }
        return JSON.parse(data);
    } catch (error) {
        console.error(`로컬스토리지 "${key}" JSON 파싱 실패:`, error);
        return null;
    }
}
function saveGameDataToSlot(slotNumber) {
    try {
        localStorage.setItem(getSlotKey(slotNumber, 'weatherData'), JSON.stringify(weatherData));
        localStorage.setItem(getSlotKey(slotNumber, 'worldMap'), JSON.stringify(worldMap));
        localStorage.setItem(getSlotKey(slotNumber, 'gameState'), JSON.stringify(gameState));
        localStorage.setItem(getSlotKey(slotNumber, 'timeData'), JSON.stringify(timePeriods));
        console.log(`게임 데이터가 슬롯 ${slotNumber}에 저장되었습니다.`);
    } catch (error) {
        console.error('슬롯 저장 중 오류:', error);
    }
}

function saveInventoryToSlot(slotNumber) {
    try {
        localStorage.setItem(getSlotKey(slotNumber, 'inventory'), JSON.stringify(inventory));
        console.log(`인벤토리가 슬롯 ${slotNumber}에 저장되었습니다.`);
    } catch (error) {
        console.error('슬롯 인벤토리 저장 오류:', error);
    }
}

// 아이템 정보 불러오기
function getItemInfo(itemId) {
    return itemsDatabase[itemId]; // itemsDatabase는 로드된 아이템 데이터가 담긴 객체
}

// 인벤토리에서 아이템 사용하기
function useItem(itemId) {
    const item = getItemInfo(itemId);
    if (item) {
        // 아이템 사용 로직 처리
        if (item.type === '소모품') {
            // 예: 체력 회복 등의 효과 적용
        }

        // 아이템 수량 감소
        const inventoryItem = inventory.items.find(i => i.id === itemId);
        if (inventoryItem) {
            inventoryItem.quantity -= 1;
            if (inventoryItem.quantity <= 0) {
                inventory.items = inventory.items.filter(i => i.id !== itemId);
            }
        }

        // 아이템 사용 후 인벤토리 저장
        saveInventoryToSlot(slotNumber);
    }
}

// // 데이터가 변경될 때마다 자동 저장할 수 있도록 "빠른 저장" 기능 구현
// document.getElementById('saveButton').addEventListener('click', () => {
//     saveGameData();
//     saveInventory();
// });

//시간 
let currentGameTime = 480; // 08:00부터 시작 (단위: 분)
let currentDay = 1;

let isWaiting = false;
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


// 시간대 판별 함수
function getTimePeriod(mins) {
    const hour = Math.floor(mins / 60);
    for (let period of timePeriods) {
        if (hour >= period.startHour && hour < period.endHour) {
            return period.id;
        }
    }
    return 'night';  // 기본적으로 밤으로 설정
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
        console.log('지역: '+worldMap)
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
    console.log("지역 날씨 예보 : " + region + regionWeather);
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
    document.querySelector('.time-now').textContent = `${formatted}`;

    const period = getTimePeriod(currentGameTime);
    const periodData = timePeriods.find(p => p.id === period);
    if (periodData) {
        document.querySelector('.time-period').textContent = `${periodData.label} ${periodData.description || ''}`;
    }

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
        usable: true,
        disposialAfterLeave: true,
        oneTimeUse: true,
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
        usable: true,
        disposialAfterLeave: true,
        oneTimeUse: false,
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
        usable: true,
        disposialAfterLeave: true,
        oneTimeUse: false,
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
        usable: true,
        disposialAfterLeave: true,
        oneTimeUse: true,
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
        usable: true,
        disposialAfterLeave: true,
        oneTimeUse: false,
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
        usable: true,
        disposialAfterLeave: true,
        oneTimeUse: false,
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
        tags: ['퀘스트', '초보자', '전투', '소탕']
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
        tags: ['퀘스트', '초보자', '비전투', '수집']
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
        tags: ['길드', '행동', '돌아가기']
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
function playStatusSound() {
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

    setTimeout(() => { addMultipleCards(guild_quest_set) }, 500);

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
    document.querySelector('.place-name').textContent = gameState.location.area;
    document.querySelector('.place-detail').textContent = gameState.location.spot;
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
    const spots = worldMap[gameState.place.region].regions[gameState.place.area].spots;
    // "모험가 길드"의 spot 객체를 찾고 해당 bgm만 출력
    const targetSpot = spots.find(spot => spot.name === gameState.place.spot);
    if (targetSpot) {
        console.log(`BGM for "모험가 길드": ${targetSpot.bgm}`);
        switchBGM('bgm/background/' + targetSpot.bgm);
    } else {
        console.log(gameState.place.spot + " 를 찾을 수 없습니다.");
    }




    console.log("현재 위치:", gameState.place.region + " > " + gameState.place.area + " > " + gameState.place.spot);
}


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
    document.querySelector('.place-name').textContent = gameState.place.region + " - " + gameState.place.area;
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