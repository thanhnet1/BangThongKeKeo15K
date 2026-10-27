/* ==========================================================================
   MODULE MINIGAME1 · MINI GAME 1
   Gồm: Lịch thi đấu Team A,B (TEAM) | Minigame 21 trận (SUB1) | Minigame 17 trận (SUB2)
   ========================================================================== */

/* --- 1. MINIGAME 1: TEAM A & B (MAIN) --- */
let miniGame1Content = "Thể lệ Mini Game 1: Chia đội Team A và Team B thi đấu các trận Pick đôi.";
let mini1TeamA = ["Tiến Thọ", "Châu Sĩ", "Vân Đình", "Cẩm Ly"];
let mini1TeamB = ["Phú Mỗ", "Hà Giấy", "Long Diễn", "Tuấn La"];
let mini1KeoMode = "default";
let mini1Payment = {};
let miniGame1Matches = [
  { id: 1, c1_p1: "Tiến Thọ", c1_p2: "Châu Sĩ", c2_p1: "Phú Mỗ", c2_p2: "Hà Giấy", score1: "", score2: "" },
  { id: 2, c1_p1: "Vân Đình", c1_p2: "Cẩm Ly", c2_p1: "Long Diễn", c2_p2: "Tuấn La", score1: "", score2: "" }
];

function changeMini1KeoMode(mode) {
  mini1KeoMode = mode;
  saveDataToFirestore();
  renderCurrentTab();
}

function updateMini1Match(idx, field, value) {
  if (!miniGame1Matches[idx]) return;
  miniGame1Matches[idx][field] = value;
  saveDataToFirestore();
  if (field === 'score1' || field === 'score2' || field === 'customWin' || field === 'customLose') {
    renderCurrentTab();
  }
}

function addMini1Match() {
  const newId = miniGame1Matches.length + 1;
  miniGame1Matches.push({ id: newId, c1_p1: "", c1_p2: "", c2_p1: "", c2_p2: "", score1: "", score2: "", customWin: 5, customLose: -15 });
  saveDataToFirestore();
  renderCurrentTab();
}

function deleteMini1Match(idx) {
  if (confirm(`Bạn có chắc muốn xóa Trận ${idx + 1}?`)) {
    miniGame1Matches.splice(idx, 1);
    miniGame1Matches.forEach((m, i) => m.id = i + 1);
    saveDataToFirestore();
    renderCurrentTab();
  }
}

function toggleMini1Payment(payKey) {
  if (!isAdminVerified) {
    alert("🔒 Tính năng này đang bị khóa. Vui lòng bấm nút 'Đăng Nhập Admin' ở góc trên để mở khóa.");
    return;
  }
  mini1Payment[payKey] = !mini1Payment[payKey];
  saveDataToFirestore();
  renderCurrentTab();
}

function renderMiniGame1Tab(container) {
  let { winAmt, loseAmt } = getKeoValues(mini1KeoMode, null);
  let html = `
    <div class="card">
      <div class="card-header-flex">
        <h2 class="card-title">🎮 ${titlesConfig.subMini1}</h2>
        <div class="table-actions-toolbar">
          <button class="btn btn-green" onclick="addMini1Match()">➕ Thêm Trận</button>
        </div>
      </div>
      <div style="background:#f1f5f9; padding:8px 12px; border-radius:6px; margin-bottom:12px; font-size:11px;">
        <strong>📜 Thể lệ:</strong> ${miniGame1Content || 'Chưa cập nhật thể lệ.'}
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th style="width: 55px;">STT</th>
              <th colspan="2" class="th-team-a">TEAM A</th>
              <th colspan="2" class="th-team-b">TEAM B</th>
              <th style="width: 88px;">TỶ SỐ</th>
              ${mini1KeoMode === 'free' ? '<th style="width: 120px;" class="th-money">MỆNH GIÁ THẮNG/THUA</th>' : ''}
              <th colspan="2" class="th-money" style="padding: 4px;">
                <div style="font-size: 10px; margin-bottom: 2px;">KÈO BAN ĐẦU</div>
                <select style="font-size: 10px; padding: 2px; width: 95%; font-weight: bold; background: #fff8e1; border: 1px solid #d97706;" onchange="changeMini1KeoMode(this.value)">
                  <option value="default" ${mini1KeoMode === 'default' ? 'selected' : ''}>Kèo 5k / -15k (Mặc định)</option>
                  <option value="k25" ${mini1KeoMode === 'k25' ? 'selected' : ''}>Kèo 25k (0k / -25k)</option>
                  <option value="no_keo" ${mini1KeoMode === 'no_keo' ? 'selected' : ''}>No Kèo (0k / 0k)</option>
                  <option value="free" ${mini1KeoMode === 'free' ? 'selected' : ''}>Kèo Tự Do (Tùy Chỉnh)</option>
                </select>
              </th>
            </tr>
          </thead>
          <tbody>
  `;

  miniGame1Matches.forEach((m, idx) => {
    const val1 = (m.score1 || "").toString().trim();
    const val2 = (m.score2 || "").toString().trim();
    const s1 = parseInt(val1);
    const s2 = parseInt(val2);
    let keo1 = 0, keo2 = 0;
    let matchKeo = getKeoValues(mini1KeoMode, m);

    if (!isNaN(s1) && !isNaN(s2)) {
      let isHam = (s1 === 0 || s2 === 0);
      let effWin = isHam ? (matchKeo.winAmt > 0 ? matchKeo.winAmt * 2 : 0) : matchKeo.winAmt;
      let effLose = isHam ? matchKeo.loseAmt * 2 : matchKeo.loseAmt;

      if (s1 > s2) { keo1 = effWin; keo2 = effLose; }
      else if (s2 > s1) { keo1 = effLose; keo2 = effWin; }
    }

    const isScore1Zero = (val1 === "0" || s1 === 0);
    const isScore2Zero = (val2 === "0" || s2 === 0);

    const score1Inner = isScore1Zero ? `<span class="ham-text">HẦM</span>` : `<input type="text" class="score-input" value="${m.score1 || ''}" onchange="updateMini1Match(${idx}, 'score1', this.value)">`;
    const score2Inner = isScore2Zero ? `<span class="ham-text">HẦM</span>` : `<input type="text" class="score-input" value="${m.score2 || ''}" onchange="updateMini1Match(${idx}, 'score2', this.value)">`;

    let customKeoInputHtml = "";
    if (mini1KeoMode === 'free') {
      customKeoInputHtml = `
        <td>
          <div style="display:flex; gap:2px; justify-content:center;">
            <input type="number" placeholder="Thắng" style="width:48px;" value="${m.customWin !== undefined ? m.customWin : winAmt}" onchange="updateMini1Match(${idx}, 'customWin', parseInt(this.value))">
            <input type="number" placeholder="Thua" style="width:48px;" value="${m.customLose !== undefined ? m.customLose : loseAmt}" onchange="updateMini1Match(${idx}, 'customLose', parseInt(this.value))">
          </div>
        </td>
      `;
    }

    html += `
      <tr>
        <td>
          <div style="display:flex; align-items:center; justify-content:center; gap:3px;">
            <button style="border:none; background:none; color:red; cursor:pointer; font-weight:bold; font-size:12px; padding:0;" onclick="deleteMini1Match(${idx})">🗑️</button>
            <strong>Trận ${m.id}</strong>
          </div>
        </td>
        <td><select onchange="updateMini1Match(${idx}, 'c1_p1', this.value)"><option value="">-- Select --</option>${generateVdvOptionsHtml(m.c1_p1, mini1TeamA)}</select></td>
        <td><select onchange="updateMini1Match(${idx}, 'c1_p2', this.value)"><option value="">-- Select --</option>${generateVdvOptionsHtml(m.c1_p2, mini1TeamA)}</select></td>
        <td><select onchange="updateMini1Match(${idx}, 'c2_p1', this.value)"><option value="">-- Select --</option>${generateVdvOptionsHtml(m.c2_p1, mini1TeamB)}</select></td>
        <td><select onchange="updateMini1Match(${idx}, 'c2_p2', this.value)"><option value="">-- Select --</option>${generateVdvOptionsHtml(m.c2_p2, mini1TeamB)}</select></td>
        <td>
          <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
            <div class="score-input" onclick="if(${isScore1Zero}) updateMini1Match(${idx}, 'score1', '')">${score1Inner}</div>
            <span style="font-weight:bold;">-</span>
            <div class="score-input" onclick="if(${isScore2Zero}) updateMini1Match(${idx}, 'score2', '')">${score2Inner}</div>
          </div>
        </td>
        ${customKeoInputHtml}
        <td class="${keo1 > 0 ? 'txt-win' : (keo1 < 0 ? 'txt-lose' : '')}">${keo1}</td>
        <td class="${keo2 > 0 ? 'txt-win' : (keo2 < 0 ? 'txt-lose' : '')}">${keo2}</td>
      </tr>
    `;
  });

  html += `</tbody></table></div></div>`;
  container.innerHTML = html;
}

/* --- 2. MINIGAME 1 SUB 1 (21 TRẬN) --- */
let mini1Sub1TeamA = ["Tiến Thọ", "Châu Sĩ", "Vân Đình", "Cẩm Ly"];
let mini1Sub1TeamB = ["Phú Mỗ", "Hà Giấy", "Long Diễn", "Tuấn La"];
let mini1Sub1KeoMode = "default";
let mini1Sub1Payment = {};
let miniGame1Sub1Matches = [];

function changeMini1Sub1KeoMode(mode) {
  mini1Sub1KeoMode = mode;
  saveDataToFirestore();
  renderCurrentTab();
}

function updateMini1Sub1Match(idx, field, value) {
  if (!miniGame1Sub1Matches[idx]) return;
  miniGame1Sub1Matches[idx][field] = value;
  saveDataToFirestore();
  if (field === 'score1' || field === 'score2' || field === 'customWin' || field === 'customLose') {
    renderCurrentTab();
  }
}

function renderMiniGame1Sub1Tab(container) {
  if (!miniGame1Sub1Matches || miniGame1Sub1Matches.length === 0) {
    miniGame1Sub1Matches = Array.from({ length: 21 }, (_, i) => ({
      id: i + 1, c1_p1: "", c1_p2: "", c2_p1: "", c2_p2: "", score1: "", score2: ""
    }));
  }

  let html = `
    <div class="card">
      <div class="card-header-flex">
        <h2 class="card-title">🌸 ${titlesConfig.subSub1}</h2>
      </div>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th style="width: 55px;">STT</th>
              <th colspan="2" class="th-team-a">TEAM A</th>
              <th colspan="2" class="th-team-b">TEAM B</th>
              <th style="width: 88px;">TỶ SỐ</th>
              <th colspan="2" class="th-money">KÈO BAN ĐẦU</th>
            </tr>
          </thead>
          <tbody>
  `;

  miniGame1Sub1Matches.forEach((m, idx) => {
    const val1 = (m.score1 || "").toString().trim();
    const val2 = (m.score2 || "").toString().trim();
    const s1 = parseInt(val1);
    const s2 = parseInt(val2);
    let keo1 = 0, keo2 = 0;
    let { winAmt, loseAmt } = getKeoValues(mini1Sub1KeoMode, m);

    if (!isNaN(s1) && !isNaN(s2)) {
      let isHam = (s1 === 0 || s2 === 0);
      let effWin = isHam ? (winAmt > 0 ? winAmt * 2 : 0) : winAmt;
      let effLose = isHam ? loseAmt * 2 : loseAmt;

      if (s1 > s2) { keo1 = effWin; keo2 = effLose; }
      else if (s2 > s1) { keo1 = effLose; keo2 = effWin; }
    }

    html += `
      <tr>
        <td><strong>Trận ${m.id}</strong></td>
        <td><select onchange="updateMini1Sub1Match(${idx}, 'c1_p1', this.value)"><option value="">-- Select --</option>${generateVdvOptionsHtml(m.c1_p1, mini1Sub1TeamA)}</select></td>
        <td><select onchange="updateMini1Sub1Match(${idx}, 'c1_p2', this.value)"><option value="">-- Select --</option>${generateVdvOptionsHtml(m.c1_p2, mini1Sub1TeamA)}</select></td>
        <td><select onchange="updateMini1Sub1Match(${idx}, 'c2_p1', this.value)"><option value="">-- Select --</option>${generateVdvOptionsHtml(m.c2_p1, mini1Sub1TeamB)}</select></td>
        <td><select onchange="updateMini1Sub1Match(${idx}, 'c2_p2', this.value)"><option value="">-- Select --</option>${generateVdvOptionsHtml(m.c2_p2, mini1Sub1TeamB)}</select></td>
        <td>
          <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
            <input type="text" class="score-input" value="${m.score1 || ''}" onchange="updateMini1Sub1Match(${idx}, 'score1', this.value)">
            <span>-</span>
            <input type="text" class="score-input" value="${m.score2 || ''}" onchange="updateMini1Sub1Match(${idx}, 'score2', this.value)">
          </div>
        </td>
        <td class="${keo1 > 0 ? 'txt-win' : (keo1 < 0 ? 'txt-lose' : '')}">${keo1}</td>
        <td class="${keo2 > 0 ? 'txt-win' : (keo2 < 0 ? 'txt-lose' : '')}">${keo2}</td>
      </tr>
    `;
  });

  html += `</tbody></table></div></div>`;
  container.innerHTML = html;
}

/* --- 3. MINIGAME 1 SUB 2 (17 TRẬN 20/10) --- */
let mini1Sub2TeamA = [];
let mini1Sub2TeamB = [];
let mini1Sub2KeoMode = "default";
let mini1Sub2Payment = {};
let miniGame1Sub2Matches = [];

function handleMinigame2010Click() {
  if (!miniGame1Sub2Matches || miniGame1Sub2Matches.length === 0) {
    miniGame1Sub2Matches = Array.from({ length: 17 }, (_, i) => ({
      id: i + 1, c1_p1: "", c1_p2: "", c2_p1: "", c2_p2: "", score1: "", score2: ""
    }));
  }
}

function updateMini1Sub2Match(idx, field, value) {
  if (!miniGame1Sub2Matches[idx]) return;
  miniGame1Sub2Matches[idx][field] = value;
  saveDataToFirestore();
  if (field === 'score1' || field === 'score2') {
    renderCurrentTab();
  }
}

function renderMiniGame1Sub2Tab(container) {
  handleMinigame2010Click();

  let html = `
    <div class="card">
      <div class="card-header-flex">
        <h2 class="card-title">🌸 ${titlesConfig.subSub2}</h2>
      </div>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th style="width: 55px;">STT</th>
              <th colspan="2" class="th-team-a">TEAM A</th>
              <th colspan="2" class="th-team-b">TEAM B</th>
              <th style="width: 88px;">TỶ SỐ</th>
              <th colspan="2" class="th-money">KÈO BAN ĐẦU</th>
            </tr>
          </thead>
          <tbody>
  `;

  miniGame1Sub2Matches.forEach((m, idx) => {
    const val1 = (m.score1 || "").toString().trim();
    const val2 = (m.score2 || "").toString().trim();
    const s1 = parseInt(val1);
    const s2 = parseInt(val2);
    let keo1 = 0, keo2 = 0;
    let { winAmt, loseAmt } = getKeoValues(mini1Sub2KeoMode, m);

    if (!isNaN(s1) && !isNaN(s2)) {
      let isHam = (s1 === 0 || s2 === 0);
      let effWin = isHam ? (winAmt > 0 ? winAmt * 2 : 0) : winAmt;
      let effLose = isHam ? loseAmt * 2 : loseAmt;

      if (s1 > s2) { keo1 = effWin; keo2 = effLose; }
      else if (s2 > s1) { keo1 = effLose; keo2 = effWin; }
    }

    html += `
      <tr>
        <td><strong>Trận ${m.id}</strong></td>
        <td><select onchange="updateMini1Sub2Match(${idx}, 'c1_p1', this.value)"><option value="">-- Select --</option>${generateVdvOptionsHtml(m.c1_p1)}</select></td>
        <td><select onchange="updateMini1Sub2Match(${idx}, 'c1_p2', this.value)"><option value="">-- Select --</option>${generateVdvOptionsHtml(m.c1_p2)}</select></td>
        <td><select onchange="updateMini1Sub2Match(${idx}, 'c2_p1', this.value)"><option value="">-- Select --</option>${generateVdvOptionsHtml(m.c2_p1)}</select></td>
        <td><select onchange="updateMini1Sub2Match(${idx}, 'c2_p2', this.value)"><option value="">-- Select --</option>${generateVdvOptionsHtml(m.c2_p2)}</select></td>
        <td>
          <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
            <input type="text" class="score-input" value="${m.score1 || ''}" onchange="updateMini1Sub2Match(${idx}, 'score1', this.value)">
            <span>-</span>
            <input type="text" class="score-input" value="${m.score2 || ''}" onchange="updateMini1Sub2Match(${idx}, 'score2', this.value)">
          </div>
        </td>
        <td class="${keo1 > 0 ? 'txt-win' : (keo1 < 0 ? 'txt-lose' : '')}">${keo1}</td>
        <td class="${keo2 > 0 ? 'txt-win' : (keo2 < 0 ? 'txt-lose' : '')}">${keo2}</td>
      </tr>
    `;
  });

  html += `</tbody></table></div></div>`;
  container.innerHTML = html;
}
