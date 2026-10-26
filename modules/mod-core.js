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

function editTitlePrompt(key, currentVal) {
    let newVal = prompt(`Sửa tên tiêu đề:`, currentVal);
    if (newVal !== null && newVal.trim() !== "") {
        titlesConfig[key] = newVal.trim();
        updateNavbarTitles();
        saveDataToFirestore();
        renderCurrentTab();
    }
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
    renderDatesMenu();
    renderCurrentTab();
}

function renderCurrentTab() {
    const content = document.getElementById("tabContent");
    if (!content) return;
    if (currentTab === "tonghop") {
        renderTongHopTab(content);
    } else if (currentTab === "players") {
        renderPlayersTab(content);
    } else if (currentTab === "minigame1") {
        renderMiniGame1Tab(content);
    } else if (currentTab === "minigame1_sub1") {
        renderMiniGame1Sub1Tab(content);
    } else if (currentTab === "minigame1_sub2") {
        renderMiniGame1Sub2Tab(content);
    } else if (currentTab === "minigame2") {
        renderMiniGame2Tab(content);
    } else if (currentTab === "minigame2_tour1") {
        renderMiniGame2Tour1Tab(content);
    } else if (currentTab === "minigame2_tour2") {
        renderMiniGame2Tour2Tab(content);
    } else {
        renderSingleDayTab(content, currentTab);
    }
    updateAdminUIState();
    updateNavbarTitles();
}
// Đóng tất cả dropdown khi click ra ngoài vùng menu
window.addEventListener('click', function() {
    closeAllDropdowns();
});
