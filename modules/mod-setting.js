function addDateTab() {
    closeAllDropdowns();
    const dateStr = prompt("Nhập ngày đấu mới (VD: 28/9/26):");
    if (dateStr && !dates.includes(dateStr)) {
        dates.push(dateStr);
        matchesData[dateStr] = Array.from({ length: 5 }, (_, i) => ({
            id: i + 1, c1_p1: "", c1_p2: "", c2_p1: "", c2_p2: "", score1: "", score2: "", customWin: 5, customLose: -15
        }));
        dateKeoMode[dateStr] = "default";
        currentTab = dateStr;
        saveDataToFirestore();
    }
}

function renameCurrentDate() {
    closeAllDropdowns();
    const nonDateTabs = ["tonghop", "players", "minigame1", "minigame1_sub1", "minigame1_sub2", "minigame2", "minigame2_tour1", "minigame2_tour2"];
    if (nonDateTabs.includes(currentTab)) return alert("⚠ Không thể đổi tên tab này!");
    const oldDate = currentTab;
    const newDate = prompt(`Nhập tên mới cho ngày "${oldDate}":`, oldDate);
    if (newDate && newDate.trim() !== "" && newDate !== oldDate) {
        const trimmed = newDate.trim();
        if (dates.includes(trimmed)) return alert("⚠ Tên ngày này đã tồn tại!");
        const idx = dates.indexOf(oldDate);
        if (idx !== -1) dates[idx] = trimmed;
        matchesData[trimmed] = matchesData[oldDate];
        dateKeoMode[trimmed] = dateKeoMode[oldDate];
        delete matchesData[oldDate];
        delete dateKeoMode[oldDate];
        currentTab = trimmed;
        saveDataToFirestore();
    }
}

function deleteCurrentDate() {
    closeAllDropdowns();
    const nonDateTabs = ["tonghop", "players", "minigame1", "minigame1_sub1", "minigame1_sub2", "minigame2", "minigame2_tour1", "minigame2_tour2"];
    if (nonDateTabs.includes(currentTab)) return alert("⚠ Không thể xóa tab này!");
    const dateToDelete = currentTab;
    if (confirm(`❌ Bạn có chắc chắn muốn XÓA TOÀN BỘ dữ liệu ngày "${dateToDelete}"?`)) {
        dates = dates.filter(d => d !== dateToDelete);
        delete matchesData[dateToDelete];
        delete dateKeoMode[dateToDelete];
        currentTab = getClosestOrCurrentDate(dates);
        saveDataToFirestore();
    }
}

function exportToExcel() {
    closeAllDropdowns();
    let wb = XLSX.utils.book_new();
    dates.forEach(d => {
        let matches = matchesData[d] || [];
        let rows = matches.map((m, idx) => ({
            "Trận": idx + 1,
            "Cặp 1 - VĐV 1": m.c1_p1 || "", "Cặp 1 - VĐV 2": m.c1_p2 || "",
            "Cặp 2 - VĐV 1": m.c2_p1 || "", "Cặp 2 - VĐV 2": m.c2_p2 || "",
            "Điểm 1": m.score1 || "", "Điểm 2": m.score2 || ""
        }));
        let ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, d.replace(/\//g, "-"));
    });
    XLSX.writeFile(wb, `CLB_Pickleball_CMTD_ThongKe.xlsx`);
}

function backupDataJSON() {
    closeAllDropdowns();
    const backupData = autoBackupMemory || {
        players, vdvs, dates, matchesData, dateKeoMode, paymentStatus,
        miniGame1Content, miniGame2Content, titlesConfig,
        mini1TeamA, mini1TeamB, mini1KeoMode, mini1Payment,
        mini1Sub1TeamA, mini1Sub1TeamB, mini1Sub1KeoMode, mini1Sub1Payment, miniGame1Sub1Matches,
        mini1Sub2TeamA, mini1Sub2TeamB, mini1Sub2KeoMode, mini1Sub2Payment, miniGame1Sub2Matches,
        miniGame1Matches, mini2PairsA, mini2PairsB, mini2MatchesA, mini2MatchesB, mini2Knockout,
        mini2Tour1Content, mini2Tour2Content, mini2KeoMode, mini2Payment,
        exportAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateTag = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `CMTD_Pickleball_AutoBackup_${dateTag}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function triggerRestoreJSON() {
    closeAllDropdowns();
    document.getElementById('restoreFileInput').click();
}

function handleRestoreJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (confirm("⚠️ Bạn có chắc muốn khôi phục dữ liệu từ file sao lưu này? Dữ liệu hiện tại sẽ bị thay thế!")) {
                if (data.players) players = data.players;
                if (data.vdvs) vdvs = data.vdvs;
                if (data.dates) dates = data.dates;
                if (data.matchesData) matchesData = data.matchesData;
                if (data.dateKeoMode) dateKeoMode = data.dateKeoMode;
                if (data.paymentStatus) paymentStatus = data.paymentStatus;
                if (data.miniGame1Content) miniGame1Content = data.miniGame1Content;
                if (data.miniGame2Content) miniGame2Content = data.miniGame2Content;
                if (data.titlesConfig) titlesConfig = Object.assign(titlesConfig, data.titlesConfig);
                if (data.mini1TeamA) mini1TeamA = data.mini1TeamA;
                if (data.mini1TeamB) mini1TeamB = data.mini1TeamB;
                if (data.mini1KeoMode) mini1KeoMode = data.mini1KeoMode;
                if (data.mini1Payment) mini1Payment = data.mini1Payment;
                if (data.mini1Sub1TeamA) mini1Sub1TeamA = data.mini1Sub1TeamA;
                if (data.mini1Sub1TeamB) mini1Sub1TeamB = data.mini1Sub1TeamB;
                if (data.mini1Sub1KeoMode) mini1Sub1KeoMode = data.mini1Sub1KeoMode;
                if (data.mini1Sub1Payment) mini1Sub1Payment = data.mini1Sub1Payment;
                if (data.miniGame1Sub1Matches) miniGame1Sub1Matches = data.miniGame1Sub1Matches;
                if (data.mini1Sub2TeamA) mini1Sub2TeamA = data.mini1Sub2TeamA;
                if (data.mini1Sub2TeamB) mini1Sub2TeamB = data.mini1Sub2TeamB;
                if (data.mini1Sub2KeoMode) mini1Sub2KeoMode = data.mini1Sub2KeoMode;
                if (data.mini1Sub2Payment) mini1Sub2Payment = data.mini1Sub2Payment;
                if (data.miniGame1Sub2Matches) miniGame1Sub2Matches = data.miniGame1Sub2Matches;
                if (data.miniGame1Matches) miniGame1Matches = data.miniGame1Matches;
                if (data.mini2PairsA) mini2PairsA = data.mini2PairsA;
                if (data.mini2PairsB) mini2PairsB = data.mini2PairsB;
                if (data.mini2MatchesA) mini2MatchesA = data.mini2MatchesA;
                if (data.mini2MatchesB) mini2MatchesB = data.mini2MatchesB;
                if (data.mini2Knockout) mini2Knockout = Object.assign(mini2Knockout, data.mini2Knockout);
                if (data.miniGame2Tour1Content) mini2Tour1Content = data.miniGame2Tour1Content;
                if (data.miniGame2Tour2Content) mini2Tour2Content = data.miniGame2Tour2Content;
                if (data.mini2KeoMode) mini2KeoMode = data.mini2KeoMode;
                if (data.mini2Payment) mini2Payment = data.mini2Payment;
                syncVdvsFromPlayers();
                updateNavbarTitles();
                currentTab = getClosestOrCurrentDate(dates);
                saveDataToFirestore();
                alert("✅ Phục hồi dữ liệu thành công!");
            }
        } catch (err) {
            alert("❌ File sao lưu không hợp lệ hoặc bị lỗi!");
            console.error(err);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}
