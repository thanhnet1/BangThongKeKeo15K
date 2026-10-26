let titlesConfig = {
    navMini1: "MINI GAME 1",
    subMini1: "Lịch Thi Đấu Team A & B",
    subSub1: "Minigame 20/10",
    subSub2: "Minigame 20/10 - 17 Trận",
    navMini2: "GIẢI ĐẤU MINI GAME 2",
    subMini2: "Giải Đấu Mini Game 2 (Chia Bảng A & B)",
    subTour1: "Giải Đấu Bổ Sung 1 (Nội Dung Khác)",
    subTour2: "Giải Đấu Bổ Sung 2 (Nội Dung Khác)"
};
let currentTab = "";

// Hàm xác định ngày gần nhất hoặc ngày hôm nay
function getClosestOrCurrentDate(dateArray) {
    if (!dateArray || dateArray.length === 0) return "tonghop";
    const now = new Date();
    const todayStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear().toString().substr(-2)}`;
    if (dateArray.includes(todayStr)) return todayStr;
    let closestDate = dateArray[0];
    let minDiff = Infinity;
    const parseDateStr = (str) => {
        const parts = str.split('/');
        if (parts.length === 3) {
            let day = parseInt(parts[0], 10);
            let month = parseInt(parts[1], 10) - 1;
            let year = parseInt(parts[2], 10);
            if (year < 100) year += 2000;
            return new Date(year, month, day);
        }
        return new Date(0);
    };
    dateArray.forEach(dStr => {
        const dObj = parseDateStr(dStr);
        const diff = Math.abs(now - dObj);
        if (diff < minDiff) {
            minDiff = diff;
            closestDate = dStr;
        }
    });
    return closestDate;
}

// Hàm tính mức tiền thắng/thua theo chế độ kèo
function getKeoValues(mode, matchObj) {
    let winAmt = 5, loseAmt = -15;
    if (mode === "k25") {
        winAmt = 0; loseAmt = -25;
    } else if (mode === "no_keo") {
        winAmt = 0; loseAmt = 0;
    } else if (mode === "free") {
        winAmt = matchObj && matchObj.customWin !== undefined ? parseInt(matchObj.customWin) : 5;
        loseAmt = matchObj && matchObj.customLose !== undefined ? parseInt(matchObj.customLose) : -15;
    }
    return { winAmt, loseAmt };
}

function updateNavbarTitles() {
    if (document.getElementById("navLabelMini1")) document.getElementById("navLabelMini1").innerText = titlesConfig.navMini1;
    if (document.getElementById("subLabelMini1")) document.getElementById("subLabelMini1").innerText = titlesConfig.subMini1;
    if (document.getElementById("subLabelSub1")) document.getElementById("subLabelSub1").innerText = titlesConfig.subSub1;
    if (document.getElementById("subLabelSub2")) document.getElementById("subLabelSub2").innerText = titlesConfig.subSub2;
    if (document.getElementById("navLabelMini2")) document.getElementById("navLabelMini2").innerText = titlesConfig.navMini2;
    if (document.getElementById("subLabelMini2")) document.getElementById("subLabelMini2").innerText = titlesConfig.subMini2;
    if (document.getElementById("subLabelTour1")) document.getElementById("subLabelTour1").innerText = titlesConfig.subTour1;
    if (document.getElementById("subLabelTour2")) document.getElementById("subLabelTour2").innerText = titlesConfig.subTour2;
}

function toggleMenu(menuId, e) {
    e.stopPropagation();
    const targetMenu = document.getElementById(menuId);
    const isAlreadyShow = targetMenu.classList.contains("show");
    closeAllDropdowns();
    if (!isAlreadyShow) {
        targetMenu.classList.add("show");
    }
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
}

function switchTab(tab) {
    currentTab = tab;
    closeAllDropdowns();
    if (typeof renderDatesMenu === 'function') renderDatesMenu();
    renderCurrentTab();
}

function renderCurrentTab() {
    const content = document.getElementById("tabContent");
    if (!content) return;
    if (currentTab === "tonghop") {
        if (typeof renderTongHopTab === 'function') renderTongHopTab(content);
    } else if (currentTab === "players") {
        if (typeof renderPlayersTab === 'function') renderPlayersTab(content);
    } else if (currentTab === "minigame1") {
        if (typeof renderMiniGame1Tab === 'function') renderMiniGame1Tab(content);
    } else if (currentTab === "minigame1_sub1") {
        if (typeof renderMiniGame1Sub1Tab === 'function') renderMiniGame1Sub1Tab(content);
    } else if (currentTab === "minigame1_sub2") {
        if (typeof renderMiniGame1Sub2Tab === 'function') renderMiniGame1Sub2Tab(content);
    } else if (currentTab === "minigame2") {
        if (typeof renderMiniGame2Tab === 'function') renderMiniGame2Tab(content);
    } else if (currentTab === "minigame2_tour1") {
        if (typeof renderMiniGame2Tour1Tab === 'function') renderMiniGame2Tour1Tab(content);
    } else if (currentTab === "minigame2_tour2") {
        if (typeof renderMiniGame2Tour2Tab === 'function') renderMiniGame2Tour2Tab(content);
    } else {
        if (typeof renderSingleDayTab === 'function') renderSingleDayTab(content, currentTab);
    }
    if (typeof updateAdminUIState === 'function') updateAdminUIState();
    updateNavbarTitles();
}

window.addEventListener('click', function() {
    closeAllDropdowns();
});
