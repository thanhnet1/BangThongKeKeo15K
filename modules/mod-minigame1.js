<!-- ========================================== -->
<!-- MODULE MINIGAME1 · MINI GAME 1           -->
<!-- ========================================== -->

<!-- ▼▼▼ KHỐI [MINIGAME1-BTN] · HTML · Nút MENU MINI GAME 1 ▼▼▼ BẮT ĐẦU -->
<div class="nav-item">
  <button class="nav-btn" onclick="toggleMenu('menuMini1', event)">
    <i class="fa-solid fa-gamepad"></i>
    <span id="navLabelMini1">MINI GAME 1</span> ▾
  </button>
  <div class="dropdown-menu" id="menuMini1">
    <div class="dropdown-item" onclick="switchTab('minigame1')">▶️ <span id="subLabelMini1">Lịch Thi Đấu Team A & B</span></div>
    <div class="dropdown-item" onclick="openGameModal(1)">⚙️ Chỉnh Sửa Nội Dung Game 1</div>
    <div class="dropdown-divider"></div>
    <div class="dropdown-item" onclick="switchTab('minigame1_sub1')">🌸 <span id="subLabelSub1">Minigame 20/10</span></div>
    <div class="dropdown-item" id="btn-minigame-2010" onclick="switchTab('minigame1_sub2'); handleMinigame2010Click();">🌸 <span id="subLabelSub2">Minigame 20/10 - 17 Trận</span></div>
  </div>
</div>
<!-- ▲▲▲ KẾT THÚC KHỐI [MINIGAME1-BTN] ▲▲▲ -->

<!-- ▼▼▼ KHỐI [MINIGAME1-TEAM-DATA] · JS · Dữ liệu Team A, B ▼▼▼ BẮT ĐẦU -->
<script>
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
</script>
<!-- ▲▲▲ KẾT THÚC KHỐI [MINIGAME1-TEAM-DATA] ▲▲▲ -->

<!-- ▼▼▼ KHỐI [MINIGAME1-TEAM-FUNCS] · JS · Thao tác Team A, B ▼▼▼ BẮT ĐẦU -->
<script>
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
      id: newId,
      category: "Trận tự chọn",
      a1: "",
      a2: "",
      scoreA: "",
      scoreB: "",
      b1: "",
      b2: "",
      customWin: 5,
      customLose: -15
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
</script>
<!-- ▲▲▲ KẾT THÚC KHỐI [MINIGAME1-TEAM-FUNCS] ▲▲▲ -->

<!-- ▼▼▼ KHỐI [MINIGAME1-TEAM-TAB] · JS · Tab Lịch thi đấu Team A & B ▼▼▼ BẮT ĐẦU -->
<script>
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
      statusA = isCompletedAll ? "🤝 HÒA CHUNG CUỘC" : "🤝 TẠM HÒA";
      statusB = isCompletedAll ? "🤝 HÒA CHUNG CUỘC" : "🤝 TẠM HÒA";
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
          teamBPair.forEach(v => { if (mini1Stats[v]) { mini1Stats[v].played++; mini1Stats[v].winK += effWin; mini1Stats[v].total += effWin; } });
          teamAPair.forEach(v => { if (mini1Stats[v]) { mini1Stats[v].played++; mini1Stats[v].loseK += effLose; mini1Stats[v].total += effLose; } });
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
        if (st.total < 0) { sumAmThucTe1 += st.total; if (isPaid) sumThucThu1 += Math.abs(st.total); }

        let noteText = "";
        if (st.total < 0) {
          noteText = isPaid ? `<span class="note-paid">Đã nộp</span>` : `<span class="note-unpaid">Chưa nộp</span>`;
        } else if (st.total > 0) {
          noteText = isPaid ? `<span class="note-paid">Đã nhận</span>` : `<span class="note-unpaid">Chưa nhận</span>`;
        }

        const checkboxClass = isAdminVerified ? "checkbox-cell admin-active" : "checkbox-cell";

        summaryRowsHtml1 += `
          <tr>
            <td style="color: ${vColor}; font-weight: 800; font-size:12px; text-align: left; padding-left: 8px;">${v}</td>
            <td>${st.played}</td>
            <td class="txt-win">${st.winK > 0 ? st.winK : ''}</td>
            <td class="txt-lose">${st.loseK < 0 ? st.loseK : ''}</td>
            <td style="color:#2563eb; font-weight:bold;">${bringBack > 0 ? bringBack : ''}</td>
            <td class="${st.total < 0 ? 'txt-lose' : (st.total > 0 ? 'txt-win' : '')}"><strong>${st.total}</strong></td>
            <td><input type="checkbox" class="${checkboxClass}" ${isPaid ? 'checked' : ''} onclick="toggleMini1Payment('${payKey}')" title="${isAdminVerified ? '' : 'Cần đăng nhập Admin'}"></td>
            <td>${noteText}</td>
          </tr>
        `;
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
                <th>TRẠNG THÁI CHUNG CUỘC</th>
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

      <div class="card" style="margin-bottom:12px;">
        <div class="card-header-flex">
          <h2 class="card-title">👥 DANH SÁCH VĐV THUỘC TEAM A & TEAM B</h2>
        </div>
        <div class="grid-2col">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; background:#15803d; color:#fff; padding:6px 8px; border-radius:6px; margin-bottom:6px;">
              <span style="font-weight:bold; font-size:11px;">🟢 DANH SÁCH TEAM A (${mini1TeamA.length} VĐV)</span>
              <button class="btn btn-green btn-sm" style="background:#fff; color:#15803d;" onclick="addMini1Vdv('A')">➕ Thêm VĐV</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              ${mini1TeamA.map((v, index) => {
                const idx = vdvs.indexOf(v);
                const color = idx !== -1 ? VDV_COLORS[idx % VDV_COLORS.length] : '#15803d';
                return `
                  <div style="background: #f8fafc; padding: 5px 8px; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight:800; color:${color}; font-size: 11px;">${index + 1}. ${v}</span>
                    <div>
                      <button style="border:none; background:none; color:#475569; cursor:pointer; font-weight:bold; margin-right:4px;" onclick="moveMini1Vdv('A', ${index}, -1)">⬆</button>
                      <button style="border:none; background:none; color:#475569; cursor:pointer; font-weight:bold; margin-right:6px;" onclick="moveMini1Vdv('A', ${index}, 1)">⬇</button>
                      <button style="border:none; background:none; color:#2563eb; cursor:pointer; font-weight:bold; margin-right:6px;" onclick="editMini1Vdv('A', '${v}')"><i class="fa-solid fa-pen-to-square"></i></button>
                      <button style="border:none; background:none; color:red; cursor:pointer; font-weight:bold;" onclick="removeMini1Vdv('A', '${v}')"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; background:#0369a1; color:#fff; padding:6px 8px; border-radius:6px; margin-bottom:6px;">
              <span style="font-weight:bold; font-size:11px;">🔵 DANH SÁCH TEAM B (${mini1TeamB.length} VĐV)</span>
              <button class="btn btn-green btn-sm" style="background:#fff; color:#0369a1;" onclick="addMini1Vdv('B')">➕ Thêm VĐV</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              ${mini1TeamB.map((v, index) => {
                const idx = vdvs.indexOf(v);
                const color = idx !== -1 ? VDV_COLORS[idx % VDV_COLORS.length] : '#0369a1';
                return `
                  <div style="background: #f8fafc; padding: 5px 8px; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight:800; color:${color}; font-size: 11px;">${index + 1}. ${v}</span>
                    <div>
                      <button style="border:none; background:none; color:#475569; cursor:pointer; font-weight:bold; margin-right:4px;" onclick="moveMini1Vdv('B', ${index}, -1)">⬆</button>
                      <button style="border:none; background:none; color:#475569; cursor:pointer; font-weight:bold; margin-right:6px;" onclick="moveMini1Vdv('B', ${index}, 1)">⬇</button>
                      <button style="border:none; background:none; color:#2563eb; cursor:pointer; font-weight:bold; margin-right:6px;" onclick="editMini1Vdv('B', '${v}')"><i class="fa-solid fa-pen-to-square"></i></button>
                      <button style="border:none; background:none; color:red; cursor:pointer; font-weight:bold;" onclick="removeMini1Vdv('B', '${v}')"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header-flex">
          <h2 class="card-title">
            <span>▶ ${titlesConfig.subMini1}</span>
            <button onclick="editTitlePrompt('subMini1', '${titlesConfig.subMini1}')" style="background:none; border:none; color:#2563eb; cursor:pointer; font-size:12px;" title="Sửa tên tiêu đề"><i class="fa-solid fa-pen"></i></button>
          </h2>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:11px; font-weight:bold;">Tùy Chọn Kèo:</span>
            ${renderKeoSelectDropdown(mini1KeoMode, 'changeMini1KeoMode')}
            <button class="btn btn-green" onclick="addMini1Match()">➕ Thêm Trận Đấu</button>
          </div>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th style="width:45px;">THAO TÁC</th>
                <th style="width:80px;">LOẠI TRẬN</th>
                <th colspan="2" class="th-team-a" style="color:#fff !important;">🟢 ĐỘI A</th>
                <th style="width:75px;">TỶ SỐ</th>
                <th colspan="2" class="th-team-b" style="color:#fff !important;">🔵 ĐỘI B</th>
                ${mini1KeoMode === 'free' ? '<th style="width:100px;" class="th-money">MỆNH GIÁ</th>' : ''}
                <th style="width:75px;">TRẠNG THÁI</th>
                <th style="width:60px;">KẾT QUẢ</th>
              </tr>
            </thead>
            <tbody>
              ${mini1TeamA.length > 0 && mini1TeamB.length > 0 ? miniGame1Matches.map((m, idx) => {
                let sA = parseInt(m.scoreA);
                let sB = parseInt(m.scoreB);
                let resText = "-";
                let matchStatusHtml = `<span style="color:#f59e0b; font-weight:bold; font-size:10px;">⏳ Chưa đánh</span>`;

                if (!isNaN(sA) && !isNaN(sB)) {
                  matchStatusHtml = `<span style="color:#16a34a; font-weight:bold; font-size:10px;">✅ Đã xong</span>`;
                  if (sA > sB) resText = "<span class='txt-win'>Đội A</span>";
                  else if (sB > sA) resText = "<span style='color:#0284c7; font-weight:bold;'>Đội B</span>";
                  else resText = "Hòa";
                }

                const colorA1 = m.a1 ? VDV_COLORS[vdvs.indexOf(m.a1) % VDV_COLORS.length] : "#334155";
                const colorA2 = m.a2 ? VDV_COLORS[vdvs.indexOf(m.a2) % VDV_COLORS.length] : "#334155";
                const colorB1 = m.b1 ? VDV_COLORS[vdvs.indexOf(m.b1) % VDV_COLORS.length] : "#334155";
                const colorB2 = m.b2 ? VDV_COLORS[vdvs.indexOf(m.b2) % VDV_COLORS.length] : "#334155";

                let customKeoCell1 = "";
                if (mini1KeoMode === 'free') {
                  customKeoCell1 = `
                    <td>
                      <div style="display:flex; gap:2px; justify-content:center;">
                        <input type="number" placeholder="Thắng" style="width:48px;" value="${m.customWin !== undefined ? m.customWin : 5}" onchange="updateMini1MatchKeo(${idx}, 'customWin', parseInt(this.value))">
                        <input type="number" placeholder="Thua" style="width:48px;" value="${m.customLose !== undefined ? m.customLose : -15}" onchange="updateMini1MatchKeo(${idx}, 'customLose', parseInt(this.value))">
                      </div>
                    </td>
                  `;
                }

                return `
                  <tr>
                    <td>
                      <div style="display:flex; align-items:center; justify-content:center; gap:4px;">
                        <button style="border:none; background:none; color:red; cursor:pointer; font-weight:bold; font-size:12px;" onclick="deleteMini1Match(${idx})" title="Xóa">🗑️</button>
                        <strong>T${m.id}</strong>
                      </div>
                    </td>
                    <td><input type="text" style="font-size:10px; font-weight:bold; color:#475569;" value="${m.category}" onchange="updateMini1Vdv(${idx}, 'category', this.value)"></td>
                    <td>
                      <select style="color:${colorA1}; font-weight:800;" onchange="updateMini1Vdv(${idx}, 'a1', this.value)">
                        <option value="">- Chọn A1 -</option>
                        ${generateVdvOptionsHtml(m.a1, mini1TeamA)}
                      </select>
                    </td>
                    <td>
                      <select style="color:${colorA2}; font-weight:800;" onchange="updateMini1Vdv(${idx}, 'a2', this.value)">
                        <option value="">- Chọn A2 -</option>
                        ${generateVdvOptionsHtml(m.a2, mini1TeamA)}
                      </select>
                    </td>
                    <td>
                      <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
                        <input type="number" min="0" class="score-input" value="${m.scoreA ?? ''}" oninput="updateMini1Score(${idx}, 'scoreA', this.value)">
                        <span>-</span>
                        <input type="number" min="0" class="score-input" value="${m.scoreB ?? ''}" oninput="updateMini1Score(${idx}, 'scoreB', this.value)">
                      </div>
                    </td>
                    <td>
                      <select style="color:${colorB1}; font-weight:800;" onchange="updateMini1Vdv(${idx}, 'b1', this.value)">
                        <option value="">- Chọn B1 -</option>
                        ${generateVdvOptionsHtml(m.b1, mini1TeamB)}
                      </select>
                    </td>
                    <td>
                      <select style="color:${colorB2}; font-weight:800;" onchange="updateMini1Vdv(${idx}, 'b2', this.value)">
                        <option value="">- Chọn B2 -</option>
                        ${generateVdvOptionsHtml(m.b2, mini1TeamB)}
                      </select>
                    </td>
                    ${customKeoCell1}
                    <td>${matchStatusHtml}</td>
                    <td>${resText}</td>
                  </tr>
                `;
              }).join('') : ''}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" style="margin-top: 14px;">
        <div class="card-header-flex">
          <h2 class="card-title">📊 BẢNG TỔNG HỢP KÈO - TEAM A,B</h2>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th style="text-align: left; padding-left: 8px;">PICK THỦ</th>
                <th>SỐ TRẬN</th>
                <th>THẮNG/K</th>
                <th>THUA/K</th>
                <th>MANG VỀ</th>
                <th>TỔNG</th>
                <th>THỰC TẾ</th>
                <th>NOTE</th>
              </tr>
            </thead>
            <tbody>
              ${summaryRowsHtml1}
              <tr class="total-summary-row">
                <td style="color: red; text-align: left; padding-left: 8px;"><strong>Tổng Tiền BTC Thu Về</strong></td>
                <td></td><td></td><td></td>
                <td style="color: blue;"><strong>${sumBringBack1}</strong></td>
                <td style="color: red;"><strong>${btcThuVeCalculated1}</strong></td>
                <td style="color: blue;"><strong>${sumThucThu1}</strong></td>
                <td></td>
              </tr>
              <tr class="total-summary-row">
                <td style="color: red; text-align: left; padding-left: 8px;" colspan="4"><strong>Quỹ Còn</strong></td>
                <td colspan="2" style="color: red; font-size: 13px;"><strong>${quyCon1}</strong></td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
</script>
<!-- ▲▲▲ KẾT THÚC KHỐI [MINIGAME1-TEAM-TAB] ▲▲▲ -->

<!-- ▼▼▼ KHỐI [MINIGAME1-SUB1-DATA] · JS · Dữ liệu Sub1 (21 trận) ▼▼▼ BẮT ĐẦU -->
<script>
  let mini1Sub1TeamA = ["Tuấn La", "Phú Mỗ", "Tiến Thọ", "Châu Sĩ", "Long Diễn", "Vân Đình", "Minh Hạnh", "Cẩm Ly"];
  let mini1Sub1TeamB = ["Thành Sóc", "Trường Giang", "Trí Đỏ", "Lợi Trí", "Thanh Đàm", "Gà Tre", "Minh Vượng", "Hải Hà"];
  let mini1Sub1KeoMode = "default";
  let mini1Sub1Payment = {};
  let miniGame1Sub1Matches = [];
</script>
<!-- ▲▲▲ KẾT THÚC KHỐI [MINIGAME1-SUB1-DATA] ▲▲▲ -->

<!-- ▼▼▼ KHỐI [MINIGAME1-SUB1-FUNCS] · JS · Thao tác Sub1 ▼▼▼ BẮT ĐẦU -->
<script>
  function generateDynamicSub1Matches() {
    let malesA = mini1Sub1TeamA.filter(name => {
      let p = players.find(x => x.name === name);
      return p ? p.gender === 'Nam' : true;
    });
    let femalesA = mini1Sub1TeamA.filter(name => !malesA.includes(name));

    let malesB = mini1Sub1TeamB.filter(name => {
      let p = players.find(x => x.name === name);
      return p ? p.gender === 'Nam' : true;
    });
    let femalesB = mini1Sub1TeamB.filter(name => !malesB.includes(name));

    while (malesA.length < 5) malesA.push(""); if (malesA.length > 5) malesA = malesA.slice(0, 5);
    while (femalesA.length < 3) femalesA.push(""); if (femalesA.length > 3) femalesA = femalesA.slice(0, 3);
    while (malesB.length < 5) malesB.push(""); if (malesB.length > 5) malesB = malesB.slice(0, 5);
    while (femalesB.length < 3) femalesB.push(""); if (femalesB.length > 3) femalesB = femalesB.slice(0, 3);

    let templateRaw = [
      { cat: "Đôi Nam Nữ", a1: malesA[0], a2: femalesA[0], b1: malesB[0], b2: femalesB[0] },
      { cat: "Đôi Nam Nữ", a1: malesA[1], a2: femalesA[1], b1: malesB[1], b2: femalesB[1] },
      { cat: "Đôi Nam",     a1: malesA[2], a2: malesA[3], b1: malesB[2], b2: malesB[3] },
      { cat: "Đôi Nam",     a1: malesA[0], a2: malesA[4], b1: malesB[0], b2: femalesB[4] },
      { cat: "Đôi Nam Nữ", a1: malesA[2], a2: femalesA[2], b1: malesB[2], b2: femalesB[2] },
      { cat: "Đôi Nam Nữ", a1: malesA[3], a2: femalesA[0], b1: malesB[3], b2: femalesB[0] },
      { cat: "Đôi Nam",     a1: malesA[1], a2: femalesA[2], b1: malesB[1], b2: femalesB[2] },
      { cat: "Đôi Nam Nữ", a1: malesA[4], a2: femalesA[1], b1: malesB[4], b2: femalesB[1] },
      { cat: "Đôi Nam",     a1: malesA[0], a2: femalesA[3], b1: malesB[0], b2: femalesB[3] },
      { cat: "Đôi Nam Nữ", a1: malesA[1], a2: femalesA[2], b1: malesB[1], b2: femalesB[2] },
      { cat: "Đôi Nam Nữ", a1: malesA[0], a2: femalesA[1], b1: malesB[0], b2: femalesB[1] },
      { cat: "Đôi Nam",     a1: malesA[2], a2: femalesA[4], b1: malesB[2], b2: femalesB[4] },
      { cat: "Đôi Nam Nữ", a1: malesA[3], a2: femalesA[2], b1: malesB[3], b2: femalesB[2] },
      { cat: "Đôi Nam Nữ", a1: malesA[1], a2: femalesA[0], b1: malesB[1], b2: femalesB[0] },
      { cat: "Đôi Nam",     a1: malesA[0], a2: femalesA[1], b1: malesB[0], b2: femalesB[1] },
      { cat: "Đôi Nam Nữ", a1: malesA[4], a2: femalesA[0], b1: malesB[4], b2: femalesB[0] },
      { cat: "Đôi Nam",     a1: malesA[3], a2: femalesA[4], b1: malesB[3], b2: femalesB[4] },
      { cat: "Đôi Nam Nữ", a1: malesA[2], a2: femalesA[1], b1: malesB[2], b2: femalesB[1] },
      { cat: "Đôi Nam",     a1: malesA[0], a2: femalesA[2], b1: malesB[0], b2: femalesB[2] },
      { cat: "Đôi Nam Nữ", a1: malesA[1], a2: femalesA[2], b1: malesB[1], b2: femalesB[2] },
      { cat: "Đôi Nam",     a1: malesA[3], a2: femalesA[1], b1: malesB[3], b2: femalesB[1] }
    ];

    miniGame1Sub1Matches = templateRaw.map((t, idx) => {
      let existing = miniGame1Sub1Matches[idx];
      return {
        id: idx + 1,
        category: t.cat,
        a1: existing && existing.a1 !== undefined ? existing.a1 : t.a1,
        a2: existing && existing.a2 !== undefined ? existing.a2 : t.a2,
        scoreA: existing ? existing.scoreA : "",
        scoreB: existing ? existing.scoreB : "",
        b1: existing && existing.b1 !== undefined ? existing.b1 : t.b1,
        b2: existing && existing.b2 !== undefined ? existing.b2 : t.b2,
        customWin: existing ? (existing.customWin !== undefined ? existing.customWin : 5) : 5,
        customLose: existing ? (existing.customLose !== undefined ? existing.customLose : -15) : -15
      };
    });
  }

  function toggleSub1Payment(payKey) {
    if (!isAdminVerified) {
      alert("🔒 Tính năng này đang bị khóa. Vui lòng bấm nút 'Đăng Nhập Admin' ở góc trên để mở khóa.");
      return;
    }
    mini1Sub1Payment[payKey] = !mini1Sub1Payment[payKey];
    saveDataToFirestore();
    renderCurrentTab();
  }

  function changeSub1KeoMode(mode) {
    mini1Sub1KeoMode = mode;
    saveDataToFirestore();
    renderCurrentTab();
  }

  function updateSub1MatchKeo(idx, field, val) {
    if (miniGame1Sub1Matches[idx]) {
      miniGame1Sub1Matches[idx][field] = val;
      saveDataToFirestore();
      renderCurrentTab();
    }
  }

  function updateSub1MatchVdv(idx, field, val) {
    if (miniGame1Sub1Matches[idx]) {
      miniGame1Sub1Matches[idx][field] = val;
      saveDataToFirestore();
      renderCurrentTab();
    }
  }

  function addSub1Vdv(team) {
    const vdvName = prompt(`Nhập tên VĐV thêm vào Team ${team}:`);
    if (vdvName && vdvName.trim() !== "") {
      const name = vdvName.trim();
      if (team === 'A') {
        if (mini1Sub1TeamB.includes(name)) return alert("⚠️ VĐV này đã có trong Team B!");
        if (!mini1Sub1TeamA.includes(name)) mini1Sub1TeamA.push(name);
      } else {
        if (mini1Sub1TeamA.includes(name)) return alert("⚠️ VĐV này đã có trong Team A!");
        if (!mini1Sub1TeamB.includes(name)) mini1Sub1TeamB.push(name);
      }
      if (!vdvs.includes(name)) {
        players.push({ id: players.length + 1, name: name, gender: "Nam" });
        syncVdvsFromPlayers();
      }
      generateDynamicSub1Matches();
      saveDataToFirestore();
      renderCurrentTab();
    }
  }

  function editSub1Vdv(team, oldName) {
    const newName = prompt(`Sửa tên VĐV "${oldName}":`, oldName);
    if (newName && newName.trim() !== "" && newName.trim() !== oldName) {
      const trimmed = newName.trim();
      if (team === 'A') {
        let idx = mini1Sub1TeamA.indexOf(oldName);
        if (idx !== -1) mini1Sub1TeamA[idx] = trimmed;
      } else {
        let idx = mini1Sub1TeamB.indexOf(oldName);
        if (idx !== -1) mini1Sub1TeamB[idx] = trimmed;
      }
      let pObj = players.find(p => p.name === oldName);
      if (pObj) pObj.name = trimmed;
      syncVdvsFromPlayers();
      generateDynamicSub1Matches();
      saveDataToFirestore();
      renderCurrentTab();
    }
  }

  function removeSub1Vdv(team, name) {
    if (confirm(`Xóa VĐV ${name} khỏi Team ${team}?`)) {
      if (team === 'A') mini1Sub1TeamA = mini1Sub1TeamA.filter(v => v !== name);
      else mini1Sub1TeamB = mini1Sub1TeamB.filter(v => v !== name);
      generateDynamicSub1Matches();
      saveDataToFirestore();
      renderCurrentTab();
    }
  }

  function moveSub1Vdv(team, index, direction) {
    let list = team === 'A' ? mini1Sub1TeamA : mini1Sub1TeamB;
    let targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    let temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    generateDynamicSub1Matches();
    saveDataToFirestore();
    renderCurrentTab();
  }

  function updateSub1Field(idx, field, val) {
    miniGame1Sub1Matches[idx][field] = val;
    saveDataToFirestore();
    renderCurrentTab();
  }
</script>
<!-- ▲▲▲ KẾT THÚC KHỐI [MINIGAME1-SUB1-FUNCS] ▲▲▲ -->

<!-- ▼▼▼ KHỐI [MINIGAME1-SUB1-TAB] · JS · Tab Minigame 20/10 (21 trận) ▼▼▼ BẮT ĐẦU -->
<script>
  function renderMiniGame1Sub1Tab(container) {
    generateDynamicSub1Matches();

    let winA = 0, winB = 0, scoreAAll = 0, scoreBAll = 0, playedCount = 0;

    miniGame1Sub1Matches.forEach(m => {
      let sA = parseInt(m.scoreA);
      let sB = parseInt(m.scoreB);
      if (!isNaN(sA) && !isNaN(sB)) {
        playedCount++;
        scoreAAll += sA;
        scoreBAll += sB;
        if (sA > sB) winA++;
        else if (sB > sA) winB++;
      }
    });

    const totalM = miniGame1Sub1Matches.length;
    const isCompletedAll = (playedCount === totalM && totalM > 0);
    let statusA = "", statusB = "";

    if (winA > winB) {
      statusA = isCompletedAll ? "🏆 THẮNG CHUNG CUỘC" : "🟢 TẠM DẪN TRƯỚC";
      statusB = isCompletedAll ? "❌ THUA CHUNG CUỘC" : "🔴 TẠM BỊ DẪN";
    } else if (winB > winA) {
      statusB = isCompletedAll ? "🏆 THẮNG CHUNG CUỘC" : "🟢 TẠM DẪN TRƯỚC";
      statusA = isCompletedAll ? "❌ THUA CHUNG CUỘC" : "🔴 TẠM BỊ DẪN";
    } else {
      statusA = isCompletedAll ? "🤝 HÒA CHUNG CUỘC" : "🤝 TẠM HÒA";
      statusB = isCompletedAll ? "🤝 HÒA CHUNG CUỘC" : "🤝 TẠM HÒA";
    }

    let allSub1Vdvs = Array.from(new Set([...mini1Sub1TeamA, ...mini1Sub1TeamB]));
    let sub1Stats = {};
    allSub1Vdvs.forEach(v => { sub1Stats[v] = { played: 0, winK: 0, loseK: 0, total: 0 }; });

    miniGame1Sub1Matches.forEach(m => {
      let sA = parseInt(m.scoreA);
      let sB = parseInt(m.scoreB);
      let { winAmt, loseAmt } = getMiniKeoValues(mini1Sub1KeoMode, m);

      if (!isNaN(sA) && !isNaN(sB)) {
        let teamAPair = [m.a1, m.a2].filter(Boolean);
        let teamBPair = [m.b1, m.b2].filter(Boolean);
        let isHam = (sA === 0 || sB === 0);
        let effWin = isHam ? (winAmt > 0 ? winAmt * 2 : 0) : winAmt;
        let effLose = isHam ? loseAmt * 2 : loseAmt;

        if (sA > sB) {
          teamAPair.forEach(v => { if (sub1Stats[v]) { sub1Stats[v].played++; sub1Stats[v].winK += effWin; sub1Stats[v].total += effWin; } });
          teamBPair.forEach(v => { if (sub1Stats[v]) { sub1Stats[v].played++; sub1Stats[v].loseK += effLose; sub1Stats[v].total += effLose; } });
        } else if (sB > sA) {
          teamBPair.forEach(v => { if (sub1Stats[v]) { sub1Stats[v].played++; sub1Stats[v].winK += effWin; sub1Stats[v].total += effWin; } });
          teamAPair.forEach(v => { if (sub1Stats[v]) { sub1Stats[v].played++; sub1Stats[v].loseK += effLose; sub1Stats[v].total += effLose; } });
        }
      }
    });

    let sumBringBack = 0, sumThucThu = 0, sumAmThucTe = 0;
    let summaryRowsHtml = "";

    allSub1Vdvs.forEach(v => {
      const st = sub1Stats[v];
      if (st && st.played > 0) {
        const payKey = `sub1_${v}`;
        const isPaid = mini1Sub1Payment[payKey] || false;
        const vIndex = vdvs.indexOf(v);
        const vColor = vIndex !== -1 ? VDV_COLORS[vIndex % VDV_COLORS.length] : '#1e293b';

        let bringBack = 0;
        if (st.played >= 4 && st.total > 0) { bringBack = st.total; sumBringBack += bringBack; }
        if (st.total < 0) { sumAmThucTe += st.total; if (isPaid) sumThucThu += Math.abs(st.total); }

        let noteText = "";
        if (st.total < 0) {
          noteText = isPaid ? `<span class="note-paid">Đã nộp</span>` : `<span class="note-unpaid">Chưa nộp</span>`;
        } else if (st.total > 0) {
          noteText = isPaid ? `<span class="note-paid">Đã nhận</span>` : `<span class="note-unpaid">Chưa nhận</span>`;
        }

        const checkboxClass = isAdminVerified ? "checkbox-cell admin-active" : "checkbox-cell";

        summaryRowsHtml += `
          <tr>
            <td style="color: ${vColor}; font-weight: 800; font-size:12px; text-align: left; padding-left: 8px;">${v}</td>
            <td>${st.played}</td>
            <td class="txt-win">${st.winK > 0 ? st.winK : ''}</td>
            <td class="txt-lose">${st.loseK < 0 ? st.loseK : ''}</td>
            <td style="color:#2563eb; font-weight:bold;">${bringBack > 0 ? bringBack : ''}</td>
            <td class="${st.total < 0 ? 'txt-lose' : (st.total > 0 ? 'txt-win' : '')}"><strong>${st.total}</strong></td>
            <td><input type="checkbox" class="${checkboxClass}" ${isPaid ? 'checked' : ''} onclick="toggleSub1Payment('${payKey}')" title="${isAdminVerified ? '' : 'Cần đăng nhập Admin'}"></td>
            <td>${noteText}</td>
          </tr>
        `;
      }
    });

    let btcThuVeCalculated = sumAmThucTe + sumBringBack; 
    let quyCon = sumThucThu - Math.abs(btcThuVeCalculated);

    let html = `
      <div class="card" style="margin-bottom:12px;">
        <div class="card-header-flex">
          <h2 class="card-title">
            <span>🌸 TỔNG HỢP KẾT QUẢ - ${titlesConfig.subSub1}</span>
            <button onclick="editTitlePrompt('subSub1', '${titlesConfig.subSub1}')" style="background:none; border:none; color:#2563eb; cursor:pointer; font-size:12px;" title="Sửa tên tiêu đề"><i class="fa-solid fa-pen"></i></button>
          </h2>
          <span style="font-size:11px; font-weight:bold; color:#d97706;">Đã đấu: ${playedCount}/${totalM} Trận</span>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th style="width:120px;">TÊN ĐỘI</th>
                <th>SỐ TRẬN THẮNG</th>
                <th>TỔNG ĐIỂM GHI ĐƯỢC</th>
                <th>HIỆU SỐ ĐIỂM</th>
                <th>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background:#f0fdf4;">
                <td style="color:#15803d; font-weight:900; text-align:left; padding-left:10px;">🟢 TEAM A</td>
                <td class="txt-win" style="font-size:13px;">${winA}</td>
                <td><strong>${scoreAAll}</strong></td>
                <td class="${(scoreAAll - scoreBAll) > 0 ? 'txt-win' : ((scoreAAll - scoreBAll) < 0 ? 'txt-lose' : '')}">
                  <strong>${(scoreAAll - scoreBAll) > 0 ? '+' + (scoreAAll - scoreBAll) : (scoreAAll - scoreBAll)}</strong>
                </td>
                <td style="font-weight:900; color:#15803d;">${statusA}</td>
              </tr>
              <tr style="background:#f0f9ff;">
                <td style="color:#0369a1; font-weight:900; text-align:left; padding-left:10px;">🔵 TEAM B</td>
                <td class="txt-win" style="font-size:13px;">${winB}</td>
                <td><strong>${scoreBAll}</strong></td>
                <td class="${(scoreBAll - scoreAAll) > 0 ? 'txt-win' : ((scoreBAll - scoreAAll) < 0 ? 'txt-lose' : '')}">
                  <strong>${(scoreBAll - scoreAAll) > 0 ? '+' + (scoreBAll - scoreAAll) : (scoreBAll - scoreAAll)}</strong>
                </td>
                <td style="font-weight:900; color:#0369a1;">${statusB}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div class="card-header-flex">
          <h2 class="card-title">👥 DANH SÁCH VĐV - ${titlesConfig.subSub1}</h2>
        </div>
        <div class="grid-2col">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; background:#15803d; color:#fff; padding:6px 8px; border-radius:6px; margin-bottom:6px;">
              <span style="font-weight:bold; font-size:11px;">🟢 DANH SÁCH TEAM A (${mini1Sub1TeamA.length} VĐV)</span>
              <button class="btn btn-green btn-sm" style="background:#fff; color:#15803d;" onclick="addSub1Vdv('A')">➕ Thêm VĐV</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              ${mini1Sub1TeamA.map((v, index) => {
                const idx = vdvs.indexOf(v);
                const color = idx !== -1 ? VDV_COLORS[idx % VDV_COLORS.length] : '#15803d';
                return `
                  <div style="background: #f8fafc; padding: 5px 8px; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight:800; color:${color}; font-size: 11px;">Hạng ${index + 1}. ${v}</span>
                    <div>
                      <button style="border:none; background:none; color:#475569; cursor:pointer; font-weight:bold; margin-right:4px;" onclick="moveSub1Vdv('A', ${index}, -1)">⬆</button>
                      <button style="border:none; background:none; color:#475569; cursor:pointer; font-weight:bold; margin-right:6px;" onclick="moveSub1Vdv('A', ${index}, 1)">⬇</button>
                      <button style="border:none; background:none; color:#2563eb; cursor:pointer; font-weight:bold; margin-right:6px;" onclick="editSub1Vdv('A', '${v}')"><i class="fa-solid fa-pen-to-square"></i></button>
                      <button style="border:none; background:none; color:red; cursor:pointer; font-weight:bold;" onclick="removeSub1Vdv('A', '${v}')"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; background:#0369a1; color:#fff; padding:6px 8px; border-radius:6px; margin-bottom:6px;">
              <span style="font-weight:bold; font-size:11px;">🔵 DANH SÁCH TEAM B (${mini1Sub1TeamB.length} VĐV)</span>
              <button class="btn btn-green btn-sm" style="background:#fff; color:#0369a1;" onclick="addSub1Vdv('B')">➕ Thêm VĐV</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              ${mini1Sub1TeamB.map((v, index) => {
                const idx = vdvs.indexOf(v);
                const color = idx !== -1 ? VDV_COLORS[idx % VDV_COLORS.length] : '#0369a1';
                return `
                  <div style="background: #f8fafc; padding: 5px 8px; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight:800; color:${color}; font-size: 11px;">Hạng ${index + 1}. ${v}</span>
                    <div>
                      <button style="border:none; background:none; color:#475569; cursor:pointer; font-weight:bold; margin-right:4px;" onclick="moveSub1Vdv('B', ${index}, -1)">⬆</button>
                      <button style="border:none; background:none; color:#475569; cursor:pointer; font-weight:bold; margin-right:6px;" onclick="moveSub1Vdv('B', ${index}, 1)">⬇</button>
                      <button style="border:none; background:none; color:#2563eb; cursor:pointer; font-weight:bold; margin-right:6px;" onclick="editSub1Vdv('B', '${v}')"><i class="fa-solid fa-pen-to-square"></i></button>
                      <button style="border:none; background:none; color:red; cursor:pointer; font-weight:bold;" onclick="removeSub1Vdv('B', '${v}')"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header-flex">
          <h2 class="card-title">▶ LỊCH THI ĐẤU - ${titlesConfig.subSub1} & TÙY CHỌN KÈO</h2>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:11px; font-weight:bold;">Tùy Chọn Kèo:</span>
            ${renderKeoSelectDropdown(mini1Sub1KeoMode, 'changeSub1KeoMode')}
          </div>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th style="width:45px;">STT</th>
                <th style="width:75px; text-align:center;">THỂ LOẠI</th>
                <th colspan="2" class="th-team-a" style="color:#fff !important;">🟢 ĐỘI A</th>
                <th style="width:75px;">TỶ SỐ</th>
                <th colspan="2" class="th-team-b" style="color:#fff !important;">🔵 ĐỘI B</th>
                ${mini1Sub1KeoMode === 'free' ? '<th style="width:100px;" class="th-money">MỆNH GIÁ</th>' : ''}
                <th style="width:75px;">TRẠNG THÁI</th>
                <th style="width:60px;">KẾT QUẢ</th>
              </tr>
            </thead>
            <tbody>
              ${mini1Sub1TeamA.length > 0 && mini1Sub1TeamB.length > 0 ? miniGame1Sub1Matches.map((m, idx) => {
                let sA = parseInt(m.scoreA);
                let sB = parseInt(m.scoreB);
                let resText = "-";
                let matchStatusHtml = `<span style="color:#f59e0b; font-weight:bold; font-size:10px;">⏳ Chưa đánh</span>`;

                if (!isNaN(sA) && !isNaN(sB)) {
                  matchStatusHtml = `<span style="color:#16a34a; font-weight:bold; font-size:10px;">✅ Đã xong</span>`;
                  if (sA > sB) resText = "<span class='txt-win'>Đội A</span>";
                  else if (sB > sA) resText = "<span style='color:#0284c7; font-weight:bold;'>Đội B</span>";
                  else resText = "Hòa";
                }

                const colorA1 = m.a1 ? VDV_COLORS[vdvs.indexOf(m.a1) % VDV_COLORS.length] : "#334155";
                const colorA2 = m.a2 ? VDV_COLORS[vdvs.indexOf(m.a2) % VDV_COLORS.length] : "#334155";
                const colorB1 = m.b1 ? VDV_COLORS[vdvs.indexOf(m.b1) % VDV_COLORS.length] : "#334155";
                const colorB2 = m.b2 ? VDV_COLORS[vdvs.indexOf(m.b2) % VDV_COLORS.length] : "#334155";

                let customKeoCell = "";
                if (mini1Sub1KeoMode === 'free') {
                  customKeoCell = `
                    <td>
                      <div style="display:flex; gap:2px; justify-content:center;">
                        <input type="number" placeholder="Thắng" style="width:48px;" value="${m.customWin !== undefined ? m.customWin : 5}" onchange="updateSub1MatchKeo(${idx}, 'customWin', parseInt(this.value))">
                        <input type="number" placeholder="Thua" style="width:48px;" value="${m.customLose !== undefined ? m.customLose : -15}" onchange="updateSub1MatchKeo(${idx}, 'customLose', parseInt(this.value))">
                      </div>
                    </td>
                  `;
                }

                return `
                  <tr>
                    <td><strong>Trận ${m.id}</strong></td>
                    <td style="text-align: center; padding: 4px; font-weight:bold; color:#334155;">${m.category}</td>
                    <td>
                      <select style="color:${colorA1}; font-weight:800;" onchange="updateSub1MatchVdv(${idx}, 'a1', this.value)">
                        <option value="">-- Chọn A1 --</option>
                        ${generateVdvOptionsHtml(m.a1, mini1Sub1TeamA)}
                      </select>
                    </td>
                    <td>
                      <select style="color:${colorA2}; font-weight:800;" onchange="updateSub1MatchVdv(${idx}, 'a2', this.value)">
                        <option value="">-- Chọn A2 --</option>
                        ${generateVdvOptionsHtml(m.a2, mini1Sub1TeamA)}
                      </select>
                    </td>
                    <td>
                      <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
                        <input type="number" min="0" class="score-input" value="${m.scoreA ?? ''}" oninput="updateSub1Field(${idx}, 'scoreA', this.value)">
                        <span>-</span>
                        <input type="number" min="0" class="score-input" value="${m.scoreB ?? ''}" oninput="updateSub1Field(${idx}, 'scoreB', this.value)">
                      </div>
                    </td>
                    <td>
                      <select style="color:${colorB1}; font-weight:800;" onchange="updateSub1MatchVdv(${idx}, 'b1', this.value)">
                        <option value="">-- Chọn B1 --</option>
                        ${generateVdvOptionsHtml(m.b1, mini1Sub1TeamB)}
                      </select>
                    </td>
                    <td>
                      <select style="color:${colorB2}; font-weight:800;" onchange="updateSub1MatchVdv(${idx}, 'b2', this.value)">
                        <option value="">-- Chọn B2 --</option>
                        ${generateVdvOptionsHtml(m.b2, mini1Sub1TeamB)}
                      </select>
                    </td>
                    ${customKeoCell}
                    <td>${matchStatusHtml}</td>
                    <td>${resText}</td>
                  </tr>
                `;
              }).join('') : ''}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" style="margin-top: 14px;">
        <div class="card-header-flex">
          <h2 class="card-title">📊 BẢNG TỔNG HỢP KÈO - ${titlesConfig.subSub1}</h2>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th style="text-align: left; padding-left: 8px;">PICK THỦ</th>
                <th>SỐ TRẬN</th>
                <th>THẮNG/K</th>
                <th>THUA/K</th>
                <th>MANG VỀ</th>
                <th>TỔNG</th>
                <th>THỰC TẾ</th>
                <th>NOTE</th>
              </tr>
            </thead>
            <tbody>
              ${summaryRowsHtml}
              <tr class="total-summary-row">
                <td style="color: red; text-align: left; padding-left: 8px;"><strong>Tổng Tiền BTC Thu Về</strong></td>
                <td></td><td></td><td></td>
                <td style="color: blue;"><strong>${sumBringBack}</strong></td>
                <td style="color: red;"><strong>${btcThuVeCalculated}</strong></td>
                <td style="color: blue;"><strong>${sumThucThu}</strong></td>
                <td></td>
              </tr>
              <tr class="total-summary-row">
                <td style="color: red; text-align: left; padding-left: 8px;" colspan="4"><strong>Quỹ Còn</strong></td>
                <td colspan="2" style="color: red; font-size: 13px;"><strong>${quyCon}</strong></td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
</script>
<!-- ▲▲▲ KẾT THÚC KHỐI [MINIGAME1-SUB1-TAB] ▲▲▲ -->

<!-- ▼▼▼ KHỐI [MINIGAME1-SUB2-DATA] · JS · Dữ liệu Sub2 (17 trận) ▼▼▼ BẮT ĐẦU -->
<script>
  const minigame2010Matches = [
    { id: 1, code: "M01", teamAKey: "nam_1", teamBKey: "nam_2", type: "Nam - Nam", group: "Nam Cao" },
    { id: 2, code: "M02", teamAKey: "nu_1", teamBKey: "nu_2", type: "Nữ - Nữ (Đơn)", group: "Nữ Đơn" },
    { id: 3, code: "M03", teamAKey: "nam_3", teamBKey: "nam_3", type: "Nam - Nam", group: "Nam Cân" },
    { id: 4, code: "M04", teamAKey: "nam_4", teamBKey: "nam_5", type: "Nam - Nam", group: "Nam Thấp" },
    { id: 5, code: "M05", teamAKey: "nam_1", teamBKey: "nam_3", type: "Nam - Nam", group: "Nam Cao" },
    { id: 6, code: "M06", teamAKey: "nu_1", teamBKey: "nam_1", type: "Nam - Nữ", group: "Hỗn Hợp" },
    { id: 7, code: "M07", teamAKey: "nam_2", teamBKey: "nam_4", type: "Nam - Nam", group: "Chéo Hạng" },
    { id: 8, code: "M08", teamAKey: "nu_2_doi", teamBKey: "nu_1_doi", type: "Nữ - Nữ (Đôi)", group: "Nữ Đôi" },
    { id: 9, code: "M09", teamAKey: "nam_3", teamBKey: "nam_5", type: "Nam - Nam", group: "Chéo Hạng" },
    { id: 10, code: "M10", teamAKey: "nam_1", teamBKey: "nam_2", type: "Nam - Nam", group: "Nam Cao" },
    { id: 11, code: "M11", teamAKey: "nam_4", teamBKey: "nam_4", type: "Nam - Nam", group: "Nam Thấp" },
    { id: 12, code: "M12", teamAKey: "nu_2", teamBKey: "nam_3", type: "Nam - Nữ", group: "Hỗn Hợp" },
    { id: 13, code: "M13", teamAKey: "nam_2", teamBKey: "nam_3", type: "Nam - Nam", group: "Nam Cao" },
    { id: 14, code: "M14", teamAKey: "nam_5", teamBKey: "nam_5", type: "Nam - Nam", group: "Nam Thấp" },
    { id: 15, code: "M15", teamAKey: "nu_1", teamBKey: "nam_2", type: "Nam - Nữ", group: "Hỗn Hợp" },
    { id: 16, code: "M16", teamAKey: "nam_1", teamBKey: "nam_5", type: "Nam - Nam", group: "Chéo Hạng" },
    { id: 17, code: "M17", teamAKey: "nam_3", teamBKey: "nam_4", type: "Nam - Nam", group: "Chéo Hạng" }
  ];

  let mini1Sub2TeamA = ["Tuấn La", "Phú Mỗ", "Tiến Thọ", "Châu Sĩ", "Long Diễn", "Vân Đình", "Minh Hạnh", "Cẩm Ly"];
  let mini1Sub2TeamB = ["Thành Sóc", "Trường Giang", "Trí Đỏ", "Lợi Trí", "Thanh Đàm", "Gà Tre", "Minh Vượng", "Hải Hà"];
  let mini1Sub2KeoMode = "default";
  let mini1Sub2Payment = {};
  let miniGame1Sub2Matches = [];
</script>
<!-- ▲▲▲ KẾT THÚC KHỐI [MINIGAME1-SUB2-DATA] ▲▲▲ -->

<!-- ▼▼▼ KHỐI [MINIGAME1-SUB2-FUNCS] · JS · Thao tác Sub2 ▼▼▼ BẮT ĐẦU -->
<script>
  window.getCurrentRoster = function() {
    let malesA = mini1Sub2TeamA.filter(name => {
      let p = players.find(x => x.name === name);
      return p ? p.gender === 'Nam' : true;
    });
    let femalesA = mini1Sub2TeamA.filter(name => !malesA.includes(name));

    let malesB = mini1Sub2TeamB.filter(name => {
      let p = players.find(x => x.name === name);
      return p ? p.gender === 'Nam' : true;
    });
    let femalesB = mini1Sub2TeamB.filter(name => !malesB.includes(name));

    while (malesA.length < 5) malesA.push("");
    while (femalesA.length < 3) femalesA.push("");
    while (malesB.length < 5) malesB.push("");
    while (femalesB.length < 3) femalesB.push("");

    return {
      "nam_1": malesA[0],
      "nam_2": malesA[1],
      "nam_3": malesA[2],
      "nam_4": malesA[3],
      "nam_5": malesA[4],
      "nu_1": femalesA[0],
      "nu_2": femalesA[1],
      "nu_1_doi": femalesB[0] || femalesA[0],
      "nu_2_doi": femalesB[1] || femalesA[1]
    };
  };

  function generateDynamicSub2Matches() {
    const currentRoster = window.getCurrentRoster ? window.getCurrentRoster() : {};

    if (!miniGame1Sub2Matches || miniGame1Sub2Matches.length === 0) {
      miniGame1Sub2Matches = minigame2010Matches.map((match, idx) => ({
        id: match.id,
        code: match.code,
        category: match.type,
        group: match.group,
        a1: currentRoster[match.teamAKey] || "",
        a2: "",
        scoreA: "",
        scoreB: "",
        b1: currentRoster[match.teamBKey] || "",
        b2: "",
        customWin: 5,
        customLose: -15
      }));
    }
  }

  function handleMinigame2010Click() {
    const currentRoster = window.getCurrentRoster ? window.getCurrentRoster() : {};
    const synchronizedMatches = minigame2010Matches.map(match => ({
      ...match,
      teamA: currentRoster[match.teamAKey] || `[VDV ${match.teamAKey.toUpperCase()}]`,
      teamB: currentRoster[match.teamBKey] || `[VDV ${match.teamBKey.toUpperCase()}]`
    }));

    if (typeof renderMatchTable === "function") {
      renderMatchTable(synchronizedMatches);
    }
  }

  function toggleSub2Payment(payKey) {
    if (!isAdminVerified) {
      alert("🔒 Tính năng này đang bị khóa. Vui lòng bấm nút 'Đăng Nhập Admin' ở góc trên để mở khóa.");
      return;
    }
    mini1Sub2Payment[payKey] = !mini1Sub2Payment[payKey];
    saveDataToFirestore();
    renderCurrentTab();
  }

  function changeSub2KeoMode(mode) {
    mini1Sub2KeoMode = mode;
    saveDataToFirestore();
    renderCurrentTab();
  }

  function updateSub2MatchKeo(idx, field, val) {
    if (miniGame1Sub2Matches[idx]) {
      miniGame1Sub2Matches[idx][field] = val;
      saveDataToFirestore();
      renderCurrentTab();
    }
  }

  function addSub2Match() {
    const newId = miniGame1Sub2Matches.length + 1;
    miniGame1Sub2Matches.push({
      id: newId,
      category: "Đôi Nam Nữ",
      a1: "",
      a2: "",
      scoreA: "",
      scoreB: "",
      b1: "",
      b2: "",
      customWin: 5,
      customLose: -15
    });
    saveDataToFirestore();
    renderCurrentTab();
  }

  function deleteSub2Match(idx) {
    if (confirm(`Bạn có chắc muốn xóa Trận ${idx + 1}?`)) {
      miniGame1Sub2Matches.splice(idx, 1);
      miniGame1Sub2Matches.forEach((m, i) => m.id = i + 1);
      saveDataToFirestore();
      renderCurrentTab();
    }
  }

  function addSub2Vdv(team) {
    const vdvName = prompt(`Nhập tên VĐV thêm vào Team ${team}:`);
    if (vdvName && vdvName.trim() !== "") {
      const name = vdvName.trim();
      if (team === 'A') {
        if (mini1Sub2TeamB.includes(name)) return alert("⚠️ VĐV này đã có trong Team B!");
        if (!mini1Sub2TeamA.includes(name)) mini1Sub2TeamA.push(name);
      } else {
        if (mini1Sub2TeamA.includes(name)) return alert("⚠️ VĐV này đã có trong Team A!");
        if (!mini1Sub2TeamB.includes(name)) mini1Sub2TeamB.push(name);
      }
      if (!vdvs.includes(name)) {
        players.push({ id: players.length + 1, name: name, gender: "Nam" });
        syncVdvsFromPlayers();
      }
      saveDataToFirestore();
      renderCurrentTab();
    }
  }

  function editSub2Vdv(team, oldName) {
    const newName = prompt(`Sửa tên VĐV "${oldName}":`, oldName);
    if (newName && newName.trim() !== "" && newName.trim() !== oldName) {
      const trimmed = newName.trim();
      if (team === 'A') {
        let idx = mini1Sub2TeamA.indexOf(oldName);
        if (idx !== -1) mini1Sub2TeamA[idx] = trimmed;
      } else {
        let idx = mini1Sub2TeamB.indexOf(oldName);
        if (idx !== -1) mini1Sub2TeamB[idx] = trimmed;
      }
      let pObj = players.find(p => p.name === oldName);
      if (pObj) pObj.name = trimmed;
      syncVdvsFromPlayers();
      saveDataToFirestore();
      renderCurrentTab();
    }
  }

  function removeSub2Vdv(team, name) {
    if (confirm(`Xóa VĐV ${name} khỏi Team ${team}?`)) {
      if (team === 'A') mini1Sub2TeamA = mini1Sub2TeamA.filter(v => v !== name);
      else mini1Sub2TeamB = mini1Sub2TeamB.filter(v => v !== name);
      saveDataToFirestore();
      renderCurrentTab();
    }
  }

  function moveSub2Vdv(team, index, direction) {
    let list = team === 'A' ? mini1Sub2TeamA : mini1Sub2TeamB;
    let targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    let temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    saveDataToFirestore();
    renderCurrentTab();
  }

  function updateSub2Field(idx, field, val) {
    miniGame1Sub2Matches[idx][field] = val;
    saveDataToFirestore();
    renderCurrentTab();
  }

  function updateSub2VdvField(idx, field, val) {
    miniGame1Sub2Matches[idx][field] = val;
    saveDataToFirestore();
    renderCurrentTab();
  }
</script>
<!-- ▲▲▲ KẾT THÚC KHỐI [MINIGAME1-SUB2-FUNCS] ▲▲▲ -->

<!-- ▼▼▼ KHỐI [MINIGAME1-SUB2-TAB] · JS · Tab Minigame 17 trận ▼▼▼ BẮT ĐẦU -->
<script>
  function renderMiniGame1Sub2Tab(container) {
    generateDynamicSub2Matches();

    let winA2 = 0, winB2 = 0, scoreAAll2 = 0, scoreBAll2 = 0, playedCount2 = 0;

    miniGame1Sub2Matches.forEach(m => {
      let sA = parseInt(m.scoreA);
      let sB = parseInt(m.scoreB);
      if (!isNaN(sA) && !isNaN(sB)) {
        playedCount2++;
        scoreAAll2 += sA;
        scoreBAll2 += sB;
        if (sA > sB) winA2++;
        else if (sB > sA) winB2++;
      }
    });

    const totalM2 = miniGame1Sub2Matches.length;
    const isCompletedAll2 = (playedCount2 === totalM2 && totalM2 > 0);
    let statusA2 = "", statusB2 = "";

    if (winA2 > winB2) {
      statusA2 = isCompletedAll2 ? "🏆 THẮNG CHUNG CUỘC" : "🟢 TẠM DẪN TRƯỚC";
      statusB2 = isCompletedAll2 ? "❌ THUA CHUNG CUỘC" : "🔴 TẠM BỊ DẪN";
    } else if (winB2 > winA2) {
      statusB2 = isCompletedAll2 ? "🏆 THẮNG CHUNG CUỘC" : "🟢 TẠM DẪN TRƯỚC";
      statusA2 = isCompletedAll2 ? "❌ THUA CHUNG CUỘC" : "🔴 TẠM BỊ DẪN";
    } else {
      statusA2 = isCompletedAll2 ? "🤝 HÒA CHUNG CUỘC" : "🤝 TẠM HÒA";
      statusB2 = isCompletedAll2 ? "🤝 HÒA CHUNG CUỘC" : "🤝 TẠM HÒA";
    }

    let allSub2Vdvs = Array.from(new Set([...mini1Sub2TeamA, ...mini1Sub2TeamB]));
    let sub2Stats = {};
    allSub2Vdvs.forEach(v => { sub2Stats[v] = { played: 0, winK: 0, loseK: 0, total: 0 }; });

    miniGame1Sub2Matches.forEach(m => {
      let sA = parseInt(m.scoreA);
      let sB = parseInt(m.scoreB);
      let { winAmt, loseAmt } = getMiniKeoValues(mini1Sub2KeoMode, m);

      if (!isNaN(sA) && !isNaN(sB)) {
        let teamAPair = [m.a1, m.a2].filter(Boolean);
        let teamBPair = [m.b1, m.b2].filter(Boolean);
        let isHam = (sA === 0 || sB === 0);
        let effWin = isHam ? (winAmt > 0 ? winAmt * 2 : 0) : winAmt;
        let effLose = isHam ? loseAmt * 2 : loseAmt;

        if (sA > sB) {
          teamAPair.forEach(v => { if (sub2Stats[v]) { sub2Stats[v].played++; sub2Stats[v].winK += effWin; sub2Stats[v].total += effWin; } });
          teamBPair.forEach(v => { if (sub2Stats[v]) { sub2Stats[v].played++; sub2Stats[v].loseK += effLose; sub2Stats[v].total += effLose; } });
        } else if (sB > sA) {
          teamBPair.forEach(v => { if (sub2Stats[v]) { sub2Stats[v].played++; sub2Stats[v].winK += effWin; sub2Stats[v].total += effWin; } });
          teamAPair.forEach(v => { if (sub2Stats[v]) { sub2Stats[v].played++; sub2Stats[v].loseK += effLose; sub2Stats[v].total += effLose; } });
        }
      }
    });

    let sumBringBack2 = 0, sumThucThu2 = 0, sumAmThucTe2 = 0;
    let summaryRowsHtml2 = "";

    allSub2Vdvs.forEach(v => {
      const st = sub2Stats[v];
      if (st && st.played > 0) {
        const payKey = `sub2_${v}`;
        const isPaid = mini1Sub2Payment[payKey] || false;
        const vIndex = vdvs.indexOf(v);
        const vColor = vIndex !== -1 ? VDV_COLORS[vIndex % VDV_COLORS.length] : '#1e293b';

        let bringBack = 0;
        if (st.played >= 4 && st.total > 0) { bringBack = st.total; sumBringBack2 += bringBack; }
        if (st.total < 0) { sumAmThucTe2 += st.total; if (isPaid) sumThucThu2 += Math.abs(st.total); }

        let noteText = "";
        if (st.total < 0) {
          noteText = isPaid ? `<span class="note-paid">Đã nộp</span>` : `<span class="note-unpaid">Chưa nộp</span>`;
        } else if (st.total > 0) {
          noteText = isPaid ? `<span class="note-paid">Đã nhận</span>` : `<span class="note-unpaid">Chưa nhận</span>`;
        }

        const checkboxClass = isAdminVerified ? "checkbox-cell admin-active" : "checkbox-cell";

        summaryRowsHtml2 += `
          <tr>
            <td style="color: ${vColor}; font-weight: 800; font-size:12px; text-align: left; padding-left: 8px;">${v}</td>
            <td>${st.played}</td>
            <td class="txt-win">${st.winK > 0 ? st.winK : ''}</td>
            <td class="txt-lose">${st.loseK < 0 ? st.loseK : ''}</td>
            <td style="color:#2563eb; font-weight:bold;">${bringBack > 0 ? bringBack : ''}</td>
            <td class="${st.total < 0 ? 'txt-lose' : (st.total > 0 ? 'txt-win' : '')}"><strong>${st.total}</strong></td>
            <td><input type="checkbox" class="${checkboxClass}" ${isPaid ? 'checked' : ''} onclick="toggleSub2Payment('${payKey}')" title="${isAdminVerified ? '' : 'Cần đăng nhập Admin'}"></td>
            <td>${noteText}</td>
          </tr>
        `;
      }
    });

    let btcThuVeCalculated2 = sumAmThucTe2 + sumBringBack2; 
    let quyCon2 = sumThucThu2 - Math.abs(btcThuVeCalculated2);

    let html = `
      <div class="card" style="margin-bottom:12px;">
        <div class="card-header-flex">
          <h2 class="card-title">
            <span>🌸 TỔNG HỢP KẾT QUẢ - ${titlesConfig.subSub2}</span>
            <button onclick="editTitlePrompt('subSub2', '${titlesConfig.subSub2}')" style="background:none; border:none; color:#2563eb; cursor:pointer; font-size:12px;" title="Sửa tên tiêu đề"><i class="fa-solid fa-pen"></i></button>
          </h2>
          <span style="font-size:11px; font-weight:bold; color:#d97706;">Đã đấu: ${playedCount2}/${totalM2} Trận</span>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th style="width:120px;">TÊN ĐỘI</th>
                <th>SỐ TRẬN THẮNG</th>
                <th>TỔNG ĐIỂM GHI ĐƯỢC</th>
                <th>HIỆU SỐ ĐIỂM</th>
                <th>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background:#f0fdf4;">
                <td style="color:#15803d; font-weight:900; text-align:left; padding-left:10px;">🟢 TEAM A</td>
                <td class="txt-win" style="font-size:13px;">${winA2}</td>
                <td><strong>${scoreAAll2}</strong></td>
                <td class="${(scoreAAll2 - scoreBAll2) > 0 ? 'txt-win' : ((scoreAAll2 - scoreBAll2) < 0 ? 'txt-lose' : '')}">
                  <strong>${(scoreAAll2 - scoreBAll2) > 0 ? '+' + (scoreAAll2 - scoreBAll2) : (scoreAAll2 - scoreBAll2)}</strong>
                </td>
                <td style="font-weight:900; color:#15803d;">${statusA2}</td>
              </tr>
              <tr style="background:#f0f9ff;">
                <td style="color:#0369a1; font-weight:900; text-align:left; padding-left:10px;">🔵 TEAM B</td>
                <td class="txt-win" style="font-size:13px;">${winB2}</td>
                <td><strong>${scoreBAll2}</strong></td>
                <td class="${(scoreBAll2 - scoreAAll2) > 0 ? 'txt-win' : ((scoreBAll2 - scoreAAll2) < 0 ? 'txt-lose' : '')}">
                  <strong>${(scoreBAll2 - scoreAAll2) > 0 ? '+' + (scoreBAll2 - scoreAAll2) : (scoreBAll2 - scoreAAll2)}</strong>
                </td>
                <td style="font-weight:900; color:#0369a1;">${statusB2}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div class="card-header-flex">
          <h2 class="card-title">👥 DANH SÁCH VĐV - ${titlesConfig.subSub2}</h2>
        </div>
        <div class="grid-2col">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; background:#15803d; color:#fff; padding:6px 8px; border-radius:6px; margin-bottom:6px;">
              <span style="font-weight:bold; font-size:11px;">🟢 DANH SÁCH TEAM A (${mini1Sub2TeamA.length} VĐV)</span>
              <button class="btn btn-green btn-sm" style="background:#fff; color:#15803d;" onclick="addSub2Vdv('A')">➕ Thêm VĐV</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              ${mini1Sub2TeamA.map((v, index) => {
                const idx = vdvs.indexOf(v);
                const color = idx !== -1 ? VDV_COLORS[idx % VDV_COLORS.length] : '#15803d';
                return `
                  <div style="background: #f8fafc; padding: 5px 8px; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight:800; color:${color}; font-size: 11px;">Hạng ${index + 1}. ${v}</span>
                    <div>
                      <button style="border:none; background:none; color:#475569; cursor:pointer; font-weight:bold; margin-right:4px;" onclick="moveSub2Vdv('A', ${index}, -1)">⬆</button>
                      <button style="border:none; background:none; color:#475569; cursor:pointer; font-weight:bold; margin-right:6px;" onclick="moveSub2Vdv('A', ${index}, 1)">⬇</button>
                      <button style="border:none; background:none; color:#2563eb; cursor:pointer; font-weight:bold; margin-right:6px;" onclick="editSub2Vdv('A', '${v}')"><i class="fa-solid fa-pen-to-square"></i></button>
                      <button style="border:none; background:none; color:red; cursor:pointer; font-weight:bold;" onclick="removeSub2Vdv('A', '${v}')"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; background:#0369a1; color:#fff; padding:6px 8px; border-radius:6px; margin-bottom:6px;">
              <span style="font-weight:bold; font-size:11px;">🔵 DANH SÁCH TEAM B (${mini1Sub2TeamB.length} VĐV)</span>
              <button class="btn btn-green btn-sm" style="background:#fff; color:#0369a1;" onclick="addSub2Vdv('B')">➕ Thêm VĐV</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              ${mini1Sub2TeamB.map((v, index) => {
                const idx = vdvs.indexOf(v);
                const color = idx !== -1 ? VDV_COLORS[idx % VDV_COLORS.length] : '#0369a1';
                return `
                  <div style="background: #f8fafc; padding: 5px 8px; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight:800; color:${color}; font-size: 11px;">Hạng ${index + 1}. ${v}</span>
                    <div>
                      <button style="border:none; background:none; color:#475569; cursor:pointer; font-weight:bold; margin-right:4px;" onclick="moveSub2Vdv('B', ${index}, -1)">⬆</button>
                      <button style="border:none; background:none; color:#475569; cursor:pointer; font-weight:bold; margin-right:6px;" onclick="moveSub2Vdv('B', ${index}, 1)">⬇</button>
                      <button style="border:none; background:none; color:#2563eb; cursor:pointer; font-weight:bold; margin-right:6px;" onclick="editSub2Vdv('B', '${v}')"><i class="fa-solid fa-pen-to-square"></i></button>
                      <button style="border:none; background:none; color:red; cursor:pointer; font-weight:bold;" onclick="removeSub2Vdv('B', '${v}')"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header-flex">
          <h2 class="card-title">▶ LỊCH THI ĐẤU - ${titlesConfig.subSub2} & TÙY CHỌN KÈO</h2>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:11px; font-weight:bold;">Tùy Chọn Kèo:</span>
            ${renderKeoSelectDropdown(mini1Sub2KeoMode, 'changeSub2KeoMode')}
            <button class="btn btn-green" onclick="addSub2Match()">➕ Thêm Trận Đấu</button>
          </div>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th style="width:55px;">THAO TÁC</th>
                <th style="width:80px; text-align:center;">THỂ LOẠI</th>
                <th colspan="2" class="th-team-a" style="color:#fff !important;">🟢 ĐỘI A</th>
                <th style="width:75px;">TỶ SỐ</th>
                <th colspan="2" class="th-team-b" style="color:#fff !important;">🔵 ĐỘI B</th>
                ${mini1Sub2KeoMode === 'free' ? '<th style="width:100px;" class="th-money">MỆNH GIÁ</th>' : ''}
                <th style="width:75px;">TRẠNG THÁI</th>
                <th style="width:60px;">KẾT QUẢ</th>
              </tr>
            </thead>
            <tbody>
              ${mini1Sub2TeamA.length > 0 && mini1Sub2TeamB.length > 0 ? miniGame1Sub2Matches.map((m, idx) => {
                let sA = parseInt(m.scoreA);
                let sB = parseInt(m.scoreB);
                let resText = "-";
                let matchStatusHtml = `<span style="color:#f59e0b; font-weight:bold; font-size:10px;">⏳ Chưa đánh</span>`;

                if (!isNaN(sA) && !isNaN(sB)) {
                  matchStatusHtml = `<span style="color:#16a34a; font-weight:bold; font-size:10px;">✅ Đã xong</span>`;
                  if (sA > sB) resText = "<span class='txt-win'>Đội A</span>";
                  else if (sB > sA) resText = "<span style='color:#0284c7; font-weight:bold;'>Đội B</span>";
                  else resText = "Hòa";
                }

                const colorA1 = m.a1 ? VDV_COLORS[vdvs.indexOf(m.a1) % VDV_COLORS.length] : "#334155";
                const colorA2 = m.a2 ? VDV_COLORS[vdvs.indexOf(m.a2) % VDV_COLORS.length] : "#334155";
                const colorB1 = m.b1 ? VDV_COLORS[vdvs.indexOf(m.b1) % VDV_COLORS.length] : "#334155";
                const colorB2 = m.b2 ? VDV_COLORS[vdvs.indexOf(m.b2) % VDV_COLORS.length] : "#334155";

                let customKeoCell = "";
                if (mini1Sub2KeoMode === 'free') {
                  customKeoCell = `
                    <td>
                      <div style="display:flex; gap:2px; justify-content:center;">
                        <input type="number" placeholder="Thắng" style="width:48px;" value="${m.customWin !== undefined ? m.customWin : 5}" onchange="updateSub2MatchKeo(${idx}, 'customWin', parseInt(this.value))">
                        <input type="number" placeholder="Thua" style="width:48px;" value="${m.customLose !== undefined ? m.customLose : -15}" onchange="updateSub2MatchKeo(${idx}, 'customLose', parseInt(this.value))">
                      </div>
                    </td>
                  `;
                }

                return `
                  <tr>
                    <td>
                      <div style="display:flex; align-items:center; justify-content:center; gap:4px;">
                        <button style="border:none; background:none; color:red; cursor:pointer; font-weight:bold; font-size:12px;" onclick="deleteSub2Match(${idx})" title="Xóa">🗑️</button>
                        <strong>Trận ${m.id}</strong>
                      </div>
                    </td>
                    <td style="text-align: center; padding: 4px;">
                      <input type="text" style="font-size:10px; font-weight:bold; color:#475569;" value="${m.category}" onchange="updateSub2VdvField(${idx}, 'category', this.value)">
                    </td>
                    <td>
                      <select style="color:${colorA1}; font-weight:800;" onchange="updateSub2VdvField(${idx}, 'a1', this.value)">
                        <option value="">-- Chọn A1 --</option>
                        ${generateVdvOptionsHtml(m.a1, mini1Sub2TeamA)}
                      </select>
                    </td>
                    <td>
                      <select style="color:${colorA2}; font-weight:800;" onchange="updateSub2VdvField(${idx}, 'a2', this.value)">
                        <option value="">-- Chọn A2 --</option>
                        ${generateVdvOptionsHtml(m.a2, mini1Sub2TeamA)}
                      </select>
                    </td>
                    <td>
                      <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
                        <input type="number" min="0" class="score-input" value="${m.scoreA ?? ''}" oninput="updateSub2Field(${idx}, 'scoreA', this.value)">
                        <span>-</span>
                        <input type="number" min="0" class="score-input" value="${m.scoreB ?? ''}" oninput="updateSub2Field(${idx}, 'scoreB', this.value)">
                      </div>
                    </td>
                    <td>
                      <select style="color:${colorB1}; font-weight:800;" onchange="updateSub2VdvField(${idx}, 'b1', this.value)">
                        <option value="">-- Chọn B1 --</option>
                        ${generateVdvOptionsHtml(m.b1, mini1Sub2TeamB)}
                      </select>
                    </td>
                    <td>
                      <select style="color:${colorB2}; font-weight:800;" onchange="updateSub2VdvField(${idx}, 'b2', this.value)">
                        <option value="">-- Chọn B2 --</option>
                        ${generateVdvOptionsHtml(m.b2, mini1Sub2TeamB)}
                      </select>
                    </td>
                    ${customKeoCell}
                    <td>${matchStatusHtml}</td>
                    <td>${resText}</td>
                  </tr>
                `;
              }).join('') : ''}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" style="margin-top: 14px;">
        <div class="card-header-flex">
          <h2 class="card-title">📊 BẢNG TỔNG HỢP KÈO - ${titlesConfig.subSub2}</h2>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th style="text-align: left; padding-left: 8px;">PICK THỦ</th>
                <th>SỐ TRẬN</th>
                <th>THẮNG/K</th>
                <th>THUA/K</th>
                <th>MANG VỀ</th>
                <th>TỔNG</th>
                <th>THỰC TẾ</th>
                <th>NOTE</th>
              </tr>
            </thead>
            <tbody>
              ${summaryRowsHtml2}
              <tr class="total-summary-row">
                <td style="color: red; text-align: left; padding-left: 8px;"><strong>Tổng Tiền BTC Thu Về</strong></td>
                <td></td><td></td><td></td>
                <td style="color: blue;"><strong>${sumBringBack2}</strong></td>
                <td style="color: red;"><strong>${btcThuVeCalculated2}</strong></td>
                <td style="color: blue;"><strong>${sumThucThu2}</strong></td>
                <td></td>
              </tr>
              <tr class="total-summary-row">
                <td style="color: red; text-align: left; padding-left: 8px;" colspan="4"><strong>Quỹ Còn</strong></td>
                <td colspan="2" style="color: red; font-size: 13px;"><strong>${quyCon2}</strong></td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
</script>
<!-- ▲▲▲ KẾT THÚC KHỐI [MINIGAME1-SUB2-TAB] ▲▲▲ -->
