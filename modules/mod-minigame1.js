/* =============================================================================
   MODULE MINIGAME 1 · modules/minigame1.js
   Lịch thi đấu Team A,B | Minigame 21 trận | Minigame 17 trận
   ============================================================================= */

let miniGame1Content = "Lịch Thi Đấu Team A & Team B Xoay Vòng.";

// --- DỮ LIỆU TEAM A & B ---
let mini1TeamA = ["Tiến Thọ", "Long Diễn", "Phú Mỗ", "Hà Giấy", "Tuấn La", "Châu Sĩ", "Vân Đình", "Cẩm Ly", "Minh Hạnh"];
let mini1TeamB = ["Trí Đỏ", "Thành Sóc", "Dũng Ngạc", "Lợi Trí", "Điền Chèm", "Quỳnh Cool", "Hải Hà", "Minh Vượng"];
let mini1KeoMode = "default";
let mini1Payment = {};
let miniGame1Matches = [];

const DEFAULT_MINI1_DATA = [
  { id: 1, category: "Nam xoay vòng", a1: "Tiến Thọ", a2: "Long Diễn", scoreA: "8", scoreB: "11", b1: "Trí Đỏ", b2: "Thành Sóc", customWin: 5, customLose: -15 },
  { id: 2, category: "Nam xoay vòng", a1: "Phú Mỗ", a2: "Hà Giấy", scoreA: "5", scoreB: "11", b1: "Dũng Ngạc", b2: "Lợi Trí", customWin: 5, customLose: -15 },
  { id: 3, category: "Nam xoay vòng", a1: "Tuấn La", a2: "Châu Sĩ", scoreA: "6", scoreB: "11", b1: "Điền Chèm", b2: "Thành Sóc", customWin: 5, customLose: -15 }
];

// --- HÀM XỬ LÝ MINI GAME 1 ---
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
    id: newId, category: "Trận tự chọn",
    a1: "", a2: "", scoreA: "", scoreB: "", b1: "", b2: "",
    customWin: 5, customLose: -15
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

// --- RENDER GIAO DIỆN MINI GAME 1 ---
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
  let statusA = winCountA > winCountB ? "🟢 TẠM DẪN TRƯỚC" : (winCountB > winCountA ? "🔴 TẠM BỊ DẪN" : "🤝 TẠM HÒA");
  let statusB = winCountB > winCountA ? "🟢 TẠM DẪN TRƯỚC" : (winCountA > winCountB ? "🔴 TẠM BỊ DẪN" : "🤝 TẠM HÒA");

  let allMini1Vdvs = Array.from(new Set([...mini1TeamA, ...mini1TeamB]));
  let mini1Stats = {};
  allMini1Vdvs.forEach(v => { mini1Stats[v] = { played: 0, winK: 0, loseK: 0, total: 0 }; });

  miniGame1Matches.forEach(m => {
    let sA = parseInt(m.scoreA);
    let sB = parseInt(m.scoreB);
    let { winAmt, loseAmt } = getMiniKeoValues ? getMiniKeoValues(mini1KeoMode, m) : { winAmt: 5, loseAmt: -15 };
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
        teamBPair.forEach(v => { if (mini1Stats[v]) { mini1Stats[v].played++; mini1Stats[v].loseK += effLose; mini1Stats[v].total += effLose; } });
        teamAPair.forEach(v => { if (mini1Stats[v]) { mini1Stats[v].played++; mini1Stats[v].winK += effWin; mini1Stats[v].total += effWin; } });
      }
    }
  });

  let sumBringBack1 = 0, sumThucThu1 = 0, sumAmThucTe1 = 0;
  let summaryRowsHtml1 = "";
  allMini1Vdvs.forEach(v => {
    const st = mini1Stats[v];
    if (st && st.played > 0) {
      const payKey = `mini1_${v}`;
      const isPaid = mini1Payment[payKey] || false;
      const vIndex = vdvs.indexOf(v);
      const vColor = vIndex !== -1 ? VDV_COLORS[vIndex % VDV_COLORS.length] : '#1e293b';
      let bringBack = 0;
      if (st.played >= 4 && st.total > 0) { bringBack = st.total; sumBringBack1 += bringBack; }
      if (st.total < 0) {
        sumAmThucTe1 += st.total;
        if (isPaid) sumThucThu1 += Math.abs(st.total);
      }
      let noteText = st.total < 0 ? (isPaid ? '<span class="note-paid">Đã nộp</span>' : '<span class="note-unpaid">Chưa nộp</span>') : (st.total > 0 ? (isPaid ? '<span class="note-paid">Đã nhận</span>' : '<span class="note-unpaid">Chưa nhận</span>') : '');
      const checkboxClass = isAdminVerified ? "checkbox-cell admin-active" : "checkbox-cell";

      summaryRowsHtml1 += `
        <tr>
          <td style="color: ${vColor}; font-weight: 800; font-size:12px; text-align: left; padding-left: 8px;">${v}</td>
          <td>${st.played}</td>
          <td class="txt-win">${st.winK > 0 ? st.winK : ''}</td>
          <td class="txt-lose">${st.loseK < 0 ? st.loseK : ''}</td>
          <td style="color:#2563eb; font-weight:bold;">${bringBack > 0 ? bringBack : ''}</td>
          <td class="${st.total < 0 ? 'txt-lose' : (st.total > 0 ? 'txt-win' : '')}"><strong>${st.total}</strong></td>
          <td><input type="checkbox" class="${checkboxClass}" ${isPaid ? 'checked' : ''} onclick="toggleMini1Payment('${payKey}')"></td>
          <td>${noteText}</td>
        </tr>`;
    }
  });

  let btcThuVeCalculated1 = sumAmThucTe1 + sumBringBack1;
  let quyCon1 = sumThucThu1 - Math.abs(btcThuVeCalculated1);

  let html = `
    <div class="card" style="margin-bottom:12px;">
      <div class="card-header-flex">
        <h2 class="card-title">📊 TỔNG HỢP TỶ SỐ & HIỆU SỐ TEAM A & B</h2>
        <span style="font-size:11px; font-weight:bold; color:#d97706;">Đã đấu: ${matchesPlayedCount}/${totalMatches} Trận</span>
      </div>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th style="width:120px;">TÊN ĐỘI</th>
              <th>SỐ TRẬN THẮNG</th>
              <th>TỔNG ĐIỂM GHI ĐƯỢC</th>
              <th>HIỆU SỐ ĐIỂM TỔNG</th>
              <th>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:#f0fdf4;">
              <td style="color:#15803d; font-weight:900; text-align:left; padding-left:10px;">🟢 TEAM A</td>
              <td class="txt-win" style="font-size:13px;">${winCountA}</td>
              <td><strong>${totalScoreA}</strong></td>
              <td class="${(totalScoreA - totalScoreB) > 0 ? 'txt-win' : ((totalScoreA - totalScoreB) < 0 ? 'txt-lose' : '')}">
                <strong>${(totalScoreA - totalScoreB) > 0 ? '+' + (totalScoreA - totalScoreB) : (totalScoreA - totalScoreB)}</strong>
              </td>
              <td style="font-weight:900; color:#15803d;">${statusA}</td>
            </tr>
            <tr style="background:#f0f9ff;">
              <td style="color:#0369a1; font-weight:900; text-align:left; padding-left:10px;">🔵 TEAM B</td>
              <td class="txt-win" style="font-size:13px;">${winCountB}</td>
              <td><strong>${totalScoreB}</strong></td>
              <td class="${(totalScoreB - totalScoreA) > 0 ? 'txt-win' : ((totalScoreB - totalScoreA) < 0 ? 'txt-lose' : '')}">
                <strong>${(totalScoreB - totalScoreA) > 0 ? '+' + (totalScoreB - totalScoreA) : (totalScoreB - totalScoreA)}</strong>
              </td>
              <td style="font-weight:900; color:#0369a1;">${statusB}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  container.innerHTML = html;
}
