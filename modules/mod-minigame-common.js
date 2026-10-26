let miniGame1Content = "Lịch Thi Đấu Team A & Team B Xoay V vòng.";
let miniGame2Content = "Giải đấu Chia 2 Bảng A & B Thi đấu vòng tròn.";
let activeGameEditing = 1;

function openGameModal(gameId) {
    closeAllDropdowns();
    activeGameEditing = gameId;
    document.getElementById("gameModalTitle").innerText = `Chỉnh Sửa Mini Game ${gameId}`;
    document.getElementById("gameContentInput").value = gameId === 1 ? miniGame1Content : miniGame2Content;
    document.getElementById("gameModal").classList.add("show");
}

function closeGameModal() {
    document.getElementById("gameModal").classList.remove("show");
}

function saveGameContent() {
    const val = document.getElementById("gameContentInput").value;
    if (activeGameEditing === 1) miniGame1Content = val;
    else miniGame2Content = val;
    saveDataToFirestore();
    closeGameModal();
}

function getMiniKeoValues(mode, matchObj) {
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

function renderKeoSelectDropdown(currentMode, onChangeFuncStr) {
    return `
    <select style="width: auto; padding: 4px 8px; font-weight: bold; background: #fff8e1; border: 1px solid #d97706;" onchange="${onChangeFuncStr}(this.value)">
        <option value="default" ${currentMode === 'default' ? 'selected' : ''}>Kèo 5k / -15k (Mặc định)</option>
        <option value="k25" ${currentMode === 'k25' ? 'selected' : ''}>Kèo 25k (0k / -25k)</option>
        <option value="no_keo" ${currentMode === 'no_keo' ? 'selected' : ''}>No Kèo (0k / 0k)</option>
        <option value="free" ${currentMode === 'free' ? 'selected' : ''}>Kèo Tự Do (Tùy Chỉnh)</option>
    </select>`;
}
