document.addEventListener("DOMContentLoaded", function () {
    const tapes = document.querySelectorAll(".video-tape");
    let currentIndex = 0;
    let isVideoSelected = false;  // 비디오 선택 상태
    const leftArrow = document.querySelector(".left-arrow");
    const rightArrow = document.querySelector(".right-arrow");
    const upArrow = document.querySelector(".up-arrow");
    const downArrow = document.querySelector(".down-arrow");


    function updateTapes() {
        tapes.forEach((tape, index) => {
            const diff = index - currentIndex;
            tape.classList.remove("active", "left", "right", "far-left", "far-right", "enlarged");
    
            if (diff === 0 && isVideoSelected) {
                tape.classList.add("active", "enlarged");
                console.log(`선택되어 있는 비디오 : ${tape.dataset.title}`);
    
                // 오디오 & 비디오 자동 재생
                const video = tape.querySelector("video");
                const audio = tape.querySelector("audio");
                if (video) {
                    video.currentTime = 0;
                    video.play().catch(err => console.log("비디오 재생 오류:", err));
                }
                if (audio) {
                    audio.currentTime = 0;
                    audio.play().catch(err => console.log("오디오 재생 오류:", err));
                }
            } else if (diff === 0) {
                tape.classList.add("active");
                console.log(`하이라이트 비디오: ${tape.dataset.title}`);
            } else if (diff === -1) {
                tape.classList.add("left");
            } else if (diff === 1) {
                tape.classList.add("right");
            } else if (diff <= -2) {
                tape.classList.add("far-left");
            } else {
                tape.classList.add("far-right");
            }
    
            tape.parentElement.style.transform = `translateX(${diff * 140 - 1000}px)`;
        });
    }

    updateTapes();

    // 방향키 버튼 클릭 시 비디오 이동
    document.querySelector(".left-arrow").addEventListener("click", function () {
        if (!isVideoSelected && currentIndex > 0) {
            currentIndex--;
            updateTapes();
        }
    });

    document.querySelector(".right-arrow").addEventListener("click", function () {
        if (!isVideoSelected && currentIndex < tapes.length - 1) {
            currentIndex++;
            updateTapes();
        }
    });

    // 아래 방향키 클릭 시 비디오 선택
    document.querySelector(".down-arrow").addEventListener("click", function () {
        if (!isVideoSelected) {
            isVideoSelected = true;  // 비디오 선택됨
            updateTapes();
        }
    });

// 위 방향키 클릭 시 비디오 선택 해제
document.querySelector(".up-arrow").addEventListener("click", function () {
    if (isVideoSelected) {
        stopMedia();  // 추가된 정지 함수
        isVideoSelected = false;
        updateTapes();
    }
});

    // 키보드 방향키 입력 처리
    document.addEventListener("keydown", function (event) {
        if (isVideoSelected) {
            // 위로 가는 방향키만 허용
            if (event.key === "ArrowUp") {
                const activeTape = document.querySelector(".video-tape.active");
                if (activeTape) {
                    activeTape.classList.remove("enlarged");
                    stopMedia(); 
                    console.log(`비디오 선택 해제 : ${activeTape.dataset.title}`);
                }
                isVideoSelected = false; // 선택 취소
                updateTapes();
            }
            if (event.key === "ArrowDown"){
                console.log(`선택 확정 시도`);  // 두 번째 선택 감지 로그
                const activeTape = document.querySelector(".video-tape.active");
                if (activeTape) {
                    console.log("선택된 테이프 존재, 애니메이션 준비 중...");
                    const allTapes = document.querySelectorAll(".video-tape");
                    allTapes.forEach(tape => {
                        if (tape !== activeTape) {
                            tape.classList.add("fade-out");
                        }
                    });
                    // 기존 transform 값을 계산
                    const computedStyle = window.getComputedStyle(activeTape);
                    const matrix = new DOMMatrix(computedStyle.transform);
                    const currentTranslateY = matrix.m42; // 현재 Y 이동값
                    const finalTranslateY = currentTranslateY + 200;
                    
                    // 직접 애니메이션 적용 (CSS 클래스 없이)
                    activeTape.style.transition = "transform 4s ease, opacity 4s ease";
                    activeTape.style.transform = `translateY(${finalTranslateY}px)`;
                    activeTape.style.opacity = 0;

                    // 애니메이션 종료 후 페이지 이동
                    setTimeout(() => {
                        const linkTag = activeTape.querySelector("p.page-link");
                        if (linkTag && linkTag.textContent.trim() !== "") {
                            const nextPage = linkTag.textContent.trim();
                            console.log(`페이지 이동: ${nextPage}`);
                            window.location.href = nextPage;
                        } else {
                            console.warn("다음 페이지 링크가 존재하지 않음");
                        }
                    }, 1000); // transition과 동일한 시간
                }
            }
            return;  // 선택된 상태에서는 다른 방향키 무시
        }

        // 좌우 방향키 처리
        if (event.key === "ArrowRight" && currentIndex < tapes.length - 1) {
            currentIndex++;
            updateTapes();
        } else if (event.key === "ArrowLeft" && currentIndex > 0) {
            currentIndex--;
            updateTapes();
        }


        // 아래 방향키 처리
if (event.key === "ArrowDown") {
    if (!isVideoSelected) {
        isVideoSelected = true;
        console.log(`비디오 선택 !`);
        updateTapes();
    } else {
        
    }
}
    });
    // 방향키 눌렀을 때 색을 변화시킴
    document.addEventListener("keydown", function (event) {
        if (event.key === "ArrowLeft") {
            leftArrow.classList.add("active");
        }
        if (event.key === "ArrowRight") {
            rightArrow.classList.add("active");
        }
        if (event.key === "ArrowUp") {
            upArrow.classList.add("active");
        }
        if (event.key === "ArrowDown") {
            downArrow.classList.add("active");
        }
    });

    // 방향키에서 손을 뗐을 때 색을 원래대로 돌림
    document.addEventListener("keyup", function (event) {
        if (event.key === "ArrowLeft") {
            leftArrow.classList.remove("active");
        }
        if (event.key === "ArrowRight") {
            rightArrow.classList.remove("active");
        }
        if (event.key === "ArrowUp") {
            upArrow.classList.remove("active");
        }
        if (event.key === "ArrowDown") {
            downArrow.classList.remove("active");
        }
    });
});

function stopMedia() {
    const activeTape = document.querySelector(".video-tape.active");
    if (activeTape) {
        const video = activeTape.querySelector("video");
        const audio = activeTape.querySelector("audio");
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }
}