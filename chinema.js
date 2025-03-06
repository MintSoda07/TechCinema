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
            // transform 속성을 JavaScript로 직접 설정
            tape.parentElement.style.transform = `translateX(${diff * 140 - 1000}px)`
        });
    }

    updateTapes();

    // 방향키 버튼 클릭 시 비디오 이동
    document.querySelector(".left-arrow").addEventListener("click", function () {
        if (!isVideoSelected && currentIndex > 0) {
            currentIndex--;
            updateTapes();
            applyBlinkEffect(leftArrow);
        }
    });

    document.querySelector(".right-arrow").addEventListener("click", function () {
        if (!isVideoSelected && currentIndex < tapes.length - 1) {
            currentIndex++;
            updateTapes();
            applyBlinkEffect(rightArrow);
        }
    });

    // 아래 방향키 클릭 시 비디오 선택
    document.querySelector(".down-arrow").addEventListener("click", function () {
        if (!isVideoSelected) {
            isVideoSelected = true;  // 비디오 선택됨
            updateTapes();
            applyBlinkEffect(downArrow);
        }
    });

    // 위 방향키 클릭 시 비디오 선택 해제
    document.querySelector(".up-arrow").addEventListener("click", function () {
        if (isVideoSelected) {
            isVideoSelected = false;  // 비디오 선택 해제
            updateTapes();
            applyBlinkEffect(upArrow);
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
                    console.log(`비디오 선택 해제 : ${activeTape.dataset.title}`);
                }
                isVideoSelected = false; // 선택 취소
                updateTapes();
                applyBlinkEffect(upArrow);
            }
            return;  // 선택된 상태에서는 다른 방향키 무시
        }

        // 좌우 방향키 처리
        if (event.key === "ArrowRight" && currentIndex < tapes.length - 1) {
            currentIndex++;
            updateTapes();
            applyBlinkEffect(rightArrow);
        } else if (event.key === "ArrowLeft" && currentIndex > 0) {
            currentIndex--;
            updateTapes();
            applyBlinkEffect(leftArrow);
        }

        // 아래 방향키 처리
        if (event.key === "ArrowDown" && !isVideoSelected) {
            isVideoSelected = true;  // 비디오 선택됨
            console.log(`비디오 선택 !`);
            updateTapes();
            applyBlinkEffect(downArrow);
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
