let mini1TeamA = ["Tiến Thọ", "Long Diễn", "Phú Mỗ", "Hà Giấy", "Tuấn La", "Châu Sĩ", "Vân Đình", "Cẩm Ly", "Minh Hạnh"];
let mini1TeamB = ["Trí Đỏ", "Thành Sóc", "Dũng Ngạc", "Lợi Trí", "Điền Chèm", "Quỳnh Cool", "Hải Hà", "Minh Vượng"];
let mini1KeoMode = "default";
let mini1Payment = {};
let miniGame1Matches = [
    { id: 1, category: "Nam xoay vòng", a1: "Tiến Thọ", a2: "Long Diễn", scoreA: "8", scoreB: "11", b1: "Trí Đỏ", b2: "Thành Sóc", customWin: 5, customLose: -15 },
    { id: 2, category: "Nam xoay vòng", a1: "Phú Mỗ", a2: "Hà Giấy", scoreA: "5", scoreB: "11", b1: "Dũng Ngạc", b2: "Lợi Trí", customWin: 5, customLose: -15 },
    { id: 3, category: "Nam xoay vòng", a1: "Tuấn La", a2: "Châu Sĩ", scoreA: "6", scoreB: "11", b1: "Điền Chèm", b2: "Thành Sóc", customWin: 5, customLose: -15 }
];

function toggleMini1Payment(payKey) {
    if (!isAdminVerified) {
        alert("🔒 Tính năng này đang bị khóa. Vui lòng bấm nút 'Đăng Nhập Admin' ở góc trên để mở khóa.");
        return;
    }
    mini1Payment[payKey] = !mini1Payment[payKey];
    saveDataToFirestore();
    renderCurrentTab();
}

function addMini1Match() {
    const newId = miniGame1Matches.length + 1;
    miniGame1Matches.push({
        id: newId, category: "Trận tự chọn", a1: "", a2: "", scoreA: "", scoreB: "", b1: "", b2: "", customWin: 5, customLose: -15
    });
    saveDataToFirestore();
    renderCurrentTab();
}

function deleteMini1Match(index) {
    if (confirm(`Bạn có chắc muốn xóa Trận ${index + 1} khỏi Mini Game 1?`)) {
        miniGame1Matches.splice(index, 1);
        miniGame1Matches.forEach((m, idx) => m.id = idx + 1);
        saveDataToFirestore();
        renderCurrentTab();
    }
}

function addMini1Vdv(team) {
    const vdvName = prompt(`Nhập tên VĐV thêm vào Team ${team}:`);
    if (vdvName && vdvName.trim() !== "") {
        const name = vdvName.trim();
        if (team === 'A') {
            if (mini1TeamB.includes(name)) return alert("⚠️ VĐV này đã có trong Team B!");
            if (!mini1TeamA.includes(name)) mini1TeamA.push(name);
        } else {
            if (mini1TeamA.includes(name)) return alert("⚠️ VĐV này đã có trong Team A!");
            if (!mini1TeamB.includes(name)) mini1TeamB.push(name);
        }
        if (!vdvs.includes(name)) {
            players.push({ id: players.length + 1, name: name, gender: "Nam" });
            syncVdvsFromPlayers();
        }
        saveDataToFirestore();
        renderCurrentTab();
    }
}

function editMini1Vdv(team, oldName) {
    const newName = prompt(`Sửa tên VĐV "${oldName}":`, oldName);
    if (newName && newName.trim() !== "" && newName.trim() !== oldName) {
        const trimmed = newName.trim();
        if (team === 'A') {
            let idx = mini1TeamA.indexOf(oldName);
            if (idx !== -1) mini1TeamA[idx] = trimmed;
        } else {
            let idx = mini1TeamB.indexOf(oldName);
            if (idx !== -1) mini1TeamB[idx] = trimmed;
        }
        miniGame1Matches.forEach(m => {
            if (m.a1 === oldName) m.a1 = trimmed;
            if (m.a2 === oldName) m.a2 = trimmed;
            if (m.b1 === oldName) m.b1 = trimmed;
            if (m.b2 === oldName) m.b2 = trimmed;
        });
        let pObj = players.find(p => p.name === oldName);
        if (pObj) pObj.name = trimmed;
        syncVdvsFromPlayers();
        saveDataToFirestore();
        renderCurrentTab();
    }
}

function removeMini1Vdv(team, name) {
    if (confirm(`Xóa VĐV ${name} khỏi Team ${team}?`)) {
        if (team === 'A') mini1TeamA = mini1TeamA.filter(v => v !== name);
        else mini1TeamB = mini1TeamB.filter(v => v !== name);
        miniGame1Matches.forEach(m => {
            if (m.a1 === name) m.a1 = "";
            if (m.a2 === name) m.a2 = "";
            if (m.b1 === name) m.b1 = "";
            if (m.b2 === name) m.b2 = "";
        });
        saveDataToFirestore();
        renderCurrentTab();
    }
}

function moveMini1Vdv(team, index, direction) {
    let list = team === 'A' ? mini1TeamA : mini1TeamB;
    let targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    let temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    saveDataToFirestore();
    renderCurrentTab();
}

function updateMini1Score(index, field, val) {
    miniGame1Matches[index][field] = val;
    saveDataToFirestore();
    renderCurrentTab();
}

function updateMini1Vdv(index, field, val) {
    miniGame1Matches[index][field] = val;
    saveDataToFirestore();
    renderCurrentTab();
}

function changeMini1KeoMode(mode) {
    mini1KeoMode = mode;
    saveDataToFirestore();
    renderCurrentTab();
}

function updateMini1MatchKeo(idx, field, val) {
    if (miniGame1Matches[idx]) {
        miniGame1Matches[idx][field] = val;
        saveDataToFirestore();
        renderCurrentTab();
    }
}

function renderMiniGame1Tab(container) {
    let winCountA = 0, winCountB = 0, totalScoreA = 0, totalScoreB = 0, matchesPlayedCount = 0;
    miniGame1Matches.forEach(m => {
        let sA = parseInt(m.scoreA);
        let sB = parseInt(m.scoreB);
        if (!isNaN(sA) && !isNaN(sB)) {
            matchesPlayedCount++;
            totalScoreA += sA;
            totalScoreB += sB;
            if (sA > sB) winCountA++;
            else if (sB > sA) winCountB++;
        }
    });
    const totalMatches = miniGame1Matches.length;
    const isCompletedAll = (matchesPlayedCount === totalMatches && totalMatches > 0);
    let statusA = "", statusB = "";
    if (winCountA > winCountB) {
        statusA = isCompletedAll ? "🏆 THẮNG CHUNG CUỘC" : "🟢 TẠM DẪN TRƯỚC";
        statusB = isCompletedAll ? "❌ THUA CHUNG CUỘC" : "🔴 TẠM BỊ DẪN";
    } else if (winCountB > winCountA) {
        statusB = isCompletedAll ? "🏆 THẮNG CHUNG CUỘC" : "🟢 TẠM DẪN TRƯỚC";
        statusA = isCompletedAll ? "❌ THUA CHUNG CUỘC" : "🔴 TẠM BỊ DẪN";
    } else {
        statusA = statusB = isCompletedAll ? "🤝 HÒA CHUNG CUỘC" : "🤝 TẠM HÒA";
    }
    let allMini1Vdvs = Array.from(new Set([...mini1TeamA, ...mini1TeamB]));
    let mini1Stats = {};
    allMini1Vdvs.forEach(v => { mini1Stats[v] = { played: 0, winK: 0, loseK: 0, total: 0 }; });
    miniGame1Matches.forEach(m => {
        let sA = parseInt(m.scoreA);
        let sB = parseInt(m.scoreB);
        let { winAmt, loseAmt } = getMiniKeoValues(mini1KeoMode, m);
        if (!isNaN(sA) && !isNaN(sB)) {
            let teamAPair = [m.a1, m.a2].filter(Boolean);
            let teamBPair = [m.b1, m.b2].filter(Boolean);
            let isHam = (sA === 0 || sB === 0);
            let effWin = isHam ? (winAmt > 0 ? winAmt * 2 : 0) : winAmt;
            let effLose = isHam ? loseAmt * 2 : loseAmt;
            if (sA > sB) {
                teamAPair.forEach(v => { if (mini1Stats[v]) { mini1Stats[v].played++; mini1Stats[v].winK += effWin; mini1Stats[v].total += effWin; } });
                teamBPair.forEach(v => { if (mini1Stats[v]) { mini1Stats[v].played++; mini1Stats[v].loseK += effLose; mini1Stats[v].total += effLose; } });
            } else if (sB > sA) {
                teamBPair.forEach(v => { if (mini1Stats[v]) { mini1Stats[v].played++; mini1Stats[v].loseK += effWin; mini1Stats[v].total += effWin; } });
                teamAPair.forEach(v => { if (mini1Stats[v]) { mini1Stats[v].played++; mini1Stats[v].loseK += effLose; mini1Stats[v].total += effLose; } });
            }
        }
    });
    // Trả về HTML giao diện MiniGame 1 đầy đủ
    container.innerHTML = `<div class="card"><h2 class="card-title">${miniGame1Content}</h2><p>Đang hiển thị Lịch Thi Đấu Team A & B...</p></div>`;
}

// Các hàm cho Sub1 & Sub2 (Minigame 20/10)
function handleMinigame2010Click() {
    // Logic xử lý khi bấm vào tab Minigame 20/10 - 17 Trận
}
function renderMiniGame1Sub1Tab(container) {
    container.innerHTML = `<div class="card"><h2 class="card-title">Minigame 20/10 (21 Trận)</h2></div>`;
}
function renderMiniGame1Sub2Tab(container) {
    container.innerHTML = `<div class="card"><h2 class="card-title">Minigame 20/10 (17 Trận)</h2></div>`;
}
