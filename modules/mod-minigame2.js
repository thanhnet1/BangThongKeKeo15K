<!-- ========================================== -->
<!-- MODULE MINIGAME2 · MINI GAME 2           -->
<!-- ========================================== -->

<!-- ▼▼▼ KHỐI [MINIGAME2-BTN] · HTML · Nút GIẢI ĐẤU MINI GAME 2 ▼▼▼ BẮT ĐẦU -->

<!-- ▲▲▲ KẾT THÚC KHỐI [MINIGAME2-BTN] ▲▲▲ -->

<!-- ▼▼▼ KHỐI [MINIGAME2-DATA] · JS · Dữ liệu Bảng A, B & Knockout ▼▼▼ BẮT ĐẦU -->
<script>
  let mini2PairsA = [];
  let mini2PairsB = [];
  let mini2MatchesA = [];
  let mini2MatchesB = [];

  let mini2Knockout = {
    bkc1: { p1: "Nhất A", p2: "Nhì B", s1: "", s2: "" },
    bkc2: { p1: "Nhất B", p2: "Nhì A", s1: "", s2: "" },
    rank34: { p1: "Thua BK1", p2: "Thua BK2", s1: "", s2: "" },
    final: { p1: "Thắng BK1", p2: "Thắng BK2", s1: "", s2: "" },
    champion: "",
    runnerUp: "",
    thirdPlace: ""
  };

  let mini2Tour1Content = "Nội dung chi tiết và lịch thi đấu của Giải Đấu Bổ Sung 1.";
  let mini2Tour2Content = "Nội dung chi tiết và lịch thi đấu của Giải Đấu Bổ Sung 2.";
  let mini2KeoMode = "default";
  let mini2Payment = {};
</script>
<!-- ▲▲▲ KẾT THÚC KHỐI [MINIGAME2-DATA] ▲▲▲ -->

<!-- ▼▼▼ KHỐI [MINIGAME2-FUNCS] · JS · Thao tác Bảng A, B, Knockout ▼▼▼ BẮT ĐẦU -->
<script>
  function toggleMini2Payment(payKey) {
    if (!isAdminVerified) {
      alert("🔒 Tính năng này đang bị khóa. Vui lòng bấm nút 'Đăng Nhập Admin' ở góc trên để mở khóa.");
      return;
    }
    mini2Payment[payKey] = !mini2Payment[payKey];
    saveDataToFirestore();
    renderCurrentTab();
  }

  function generateMini2MatchesForGroup(group) {
    let pairs = group === 'A' ? mini2PairsA : mini2PairsB;
    let matches = [];
    let matchId = 1;
    for (let i = 0; i < pairs.length; i++) {
      for (let j = i + 1; j < pairs.length; j++) {
        matches.push({
          id: matchId++,
          pair1Index: i,
          pair2Index: j,
          score1: "",
          score2: "",
          customWin: 5,
          customLose: -15
        });
      }
    }
    if (group === 'A') mini2MatchesA = matches;
    else mini2MatchesB = matches;
  }

  function setMini2PairCount(group, count) {
    count = parseInt(count);
    let pairs = group === 'A' ? mini2PairsA : mini2PairsB;
    const defaultNames = group === 'A' 
      ? ['Trí Đỏ - Tiến Thọ', 'Điền Chèm - Lợi Trí', 'Cẩm Ly - Hải Hà', 'Châu Sĩ - Long Diễn', 'Phú Mỗ - Dũng Ngạc'] 
      : ['Thành Sóc - Thành Sóc', 'Tuấn La - Hà Giấy', 'Vân Đình - Quỳnh Cool', 'Minh Hạnh - Minh Vượng', 'Tự Do'];

    if (pairs.length < count) {
      while (pairs.length < count) {
        let nextIdx = pairs.length;
        pairs.push({ name: defaultNames[nextIdx] || (`Cặp ${nextIdx+1}`) });
      }
    } else if (pairs.length > count) {
      pairs.splice(count);
    }

    generateMini2MatchesForGroup(group);
    saveDataToFirestore();
    renderCurrentTab();
  }

  function editMini2PairName(group, index) {
    let pairs = group === 'A' ? mini2PairsA : mini2PairsB;
    let oldName = pairs[index].name;
    let newName = prompt(`Nhập tên mới cho Cặp/Đội (${oldName}):`, oldName);
    if (newName !== null && newName.trim() !== "") {
      pairs[index].name = newName.trim();
      saveDataToFirestore();
      renderCurrentTab();
    }
  }

  function deleteMini2Pair(group, index) {
    let pairs = group === 'A' ? mini2PairsA : mini2PairsB;
    if (pairs.length <= 2) {
      alert("Bảng phải có ít nhất 2 cặp VĐV!");
      return;
    }
    if (confirm(`Bạn có chắc muốn xóa cặp VĐV "${pairs[index].name}"?`)) {
      pairs.splice(index, 1);
      generateMini2MatchesForGroup(group);
      saveDataToFirestore();
      renderCurrentTab();
    }
  }

  function updateMini2MatchScore(group, matchIdx, field, val) {
    let matches = group === 'A' ? mini2MatchesA : mini2MatchesB;
    if (matches[matchIdx]) {
      matches[matchIdx][field] = val;
      saveDataToFirestore();
      renderCurrentTab();
    }
  }

  function updateMini2MatchKeo(group, matchIdx, field, val) {
    let matches = group === 'A' ? mini2MatchesA : mini2MatchesB;
    if (matches[matchIdx]) {
      matches[matchIdx][field] = val;
      saveDataToFirestore();
      renderCurrentTab();
    }
  }

  function changeMini2KeoMode(mode) {
    mini2KeoMode = mode;
    saveDataToFirestore();
    renderCurrentTab();
  }

  function updateMini2Knockout(stage, field, val) {
    if (mini2Knockout[stage] !== undefined) {
      mini2Knockout[stage][field] = val;
      saveDataToFirestore();
      renderCurrentTab();
    }
  }

  function updateMini2WinnerField(field, val) {
    mini2Knockout[field] = val;
    saveDataToFirestore();
    renderCurrentTab();
  }

  function computeGroupStandings(pairs, matches) {
    let stats = pairs.map((p, idx) => ({
      index: idx,
      name: p.name,
      points: 0,
      scoreFor: 0,
      scoreAgainst: 0,
      diff: 0
    }));

    let headToHead = {};
    for (let i = 0; i < pairs.length; i++) {
      headToHead[i] = {};
    }

    matches.forEach(m => {
      let s1 = parseInt(m.score1);
      let s2 = parseInt(m.score2);
      if (!isNaN(s1) && !isNaN(s2)) {
        let idx1 = m.pair1Index;
        let idx2 = m.pair2Index;

        if (stats[idx1] && stats[idx2]) {
          stats[idx1].scoreFor += s1;
          stats[idx1].scoreAgainst += s2;
          stats[idx2].scoreFor += s2;
          stats[idx2].scoreAgainst += s1;

          if (s1 > s2) {
            stats[idx1].points += 1;
            headToHead[idx1][idx2] = 1;
            headToHead[idx2][idx1] = -1;
          } else if (s2 > s1) {
            stats[idx2].points += 1;
            headToHead[idx2][idx1] = 1;
            headToHead[idx1][idx2] = -1;
          }
        }
      }
    });

    stats.forEach(s => {
      s.diff = s.scoreFor - s.scoreAgainst;
    });

    stats.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.diff !== a.diff) return b.diff - a.diff;
      if (headToHead[a.index] && headToHead[a.index][b.index]) {
        return -headToHead[a.index][b.index];
      }
      return 0;
    });

    return stats;
  }
</script>
<!-- ▲▲▲ KẾT THÚC KHỐI [MINIGAME2-FUNCS] ▲▲▲ -->

<!-- ▼▼▼ KHỐI [MINIGAME2-TOUR] · JS · Giải đấu Bổ Sung 1 & 2 ▼▼▼ BẮT ĐẦU -->
<script>
  function renderMiniGame2Tour1Tab(container) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header-flex">
          <h2 class="card-title">
            <span>⭐ ${titlesConfig.subTour1}</span>
            <button onclick="editTitlePrompt('subTour1', '${titlesConfig.subTour1}')" style="background:none; border:none; color:#2563eb; cursor:pointer; font-size:12px;" title="Sửa tên tiêu đề"><i class="fa-solid fa-pen"></i></button>
          </h2>
        </div>
        <div style="padding: 16px; font-size: 12px; color: #334155;">
          <p style="font-weight: bold; margin-bottom: 8px;">Thể lệ & Mô tả:</p>
          <textarea id="tour1Input" rows="4" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-size:11px;" placeholder="Nhập thể lệ giải đấu...">${mini2Tour1Content}</textarea>
          <button class="btn btn-green" style="margin-top: 10px;" onclick="saveTour1Content()">Lưu Nội Dung Giải 1</button>
        </div>
      </div>
    `;
  }

  function saveTour1Content() {
    const val = document.getElementById("tour1Input").value;
    mini2Tour1Content = val;
    saveDataToFirestore();
    alert("✅ Đã cập nhật thành công Giải Đấu Bổ Sung 1!");
    renderCurrentTab();
  }

  function renderMiniGame2Tour2Tab(container) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header-flex">
          <h2 class="card-title">
            <span>🚀 ${titlesConfig.subTour2}</span>
            <button onclick="editTitlePrompt('subTour2', '${titlesConfig.subTour2}')" style="background:none; border:none; color:#2563eb; cursor:pointer; font-size:12px;" title="Sửa tên tiêu đề"><i class="fa-solid fa-pen"></i></button>
          </h2>
        </div>
        <div style="padding: 16px; font-size: 12px; color: #334155;">
          <p style="font-weight: bold; margin-bottom: 8px;">Thể lệ & Mô tả:</p>
          <textarea id="tour2Input" rows="4" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-size:11px;" placeholder="Nhập thể lệ giải đấu...">${mini2Tour2Content}</textarea>
          <button class="btn btn-green" style="margin-top: 10px;" onclick="saveTour2Content()">Lưu Nội Dung Giải 2</button>
        </div>
      </div>
    `;
  }

  function saveTour2Content() {
    const val = document.getElementById("tour2Input").value;
    mini2Tour2Content = val;
    saveDataToFirestore();
    alert("✅ Đã cập nhật thành công Giải Đấu Bổ Sung 2!");
    renderCurrentTab();
  }
</script>
<!-- ▲▲▲ KẾT THÚC KHỐI [MINIGAME2-TOUR] ▲▲▲ -->

<!-- ▼▼▼ KHỐI [MINIGAME2-TAB] · JS · Tab Giao diện Mini Game 2 ▼▼▼ BẮT ĐẦU -->
<script>
  function renderMiniGame2Tab(container) {
    let standingsA = computeGroupStandings(mini2PairsA, mini2MatchesA);
    let standingsB = computeGroupStandings(mini2PairsB, mini2MatchesB);

    let allMini2Individuals = [];
    const addIndividualFromPair = (pairName) => {
      if (!pairName) return;
      let parts = pairName.split('-');
      parts.forEach(p => {
        let trimmed = p.trim();
        if (trimmed && trimmed.toLowerCase() !== 'tự do' && !allMini2Individuals.includes(trimmed)) {
          allMini2Individuals.push(trimmed);
        }
      });
    };

    mini2PairsA.forEach(p => addIndividualFromPair(p.name));
    mini2PairsB.forEach(p => addIndividualFromPair(p.name));

    let mini2Stats = {};
    allMini2Individuals.forEach(indName => { mini2Stats[indName] = { played: 0, winK: 0, loseK: 0, total: 0 }; });

    const processMini2MatchStats = (m, pairsList) => {
      let s1 = parseInt(m.score1);
      let s2 = parseInt(m.score2);
      if (!isNaN(s1) && !isNaN(s2)) {
        let p1Obj = pairsList[m.pair1Index];
        let p2Obj = pairsList[m.pair2Index];
        if (!p1Obj || !p2Obj) return;

        let team1Members = p1Obj.name.split('-').map(x => x.trim()).filter(x => x && x.toLowerCase() !== 'tự do');
        let team2Members = p2Obj.name.split('-').map(x => x.trim()).filter(x => x && x.toLowerCase() !== 'tự do');

        let { winAmt, loseAmt } = getMiniKeoValues(mini2KeoMode, m);

        if (s1 > s2) {
          team1Members.forEach(ind => {
            if (mini2Stats[ind]) { mini2Stats[ind].played++; mini2Stats[ind].winK += winAmt; mini2Stats[ind].total += winAmt; }
          });
          team2Members.forEach(ind => {
            if (mini2Stats[ind]) { mini2Stats[ind].played++; mini2Stats[ind].loseK += loseAmt; mini2Stats[ind].total += loseAmt; }
          });
        } else if (s2 > s1) {
          team2Members.forEach(ind => {
            if (mini2Stats[ind]) { mini2Stats[ind].played++; mini2Stats[ind].winK += winAmt; mini2Stats[ind].total += winAmt; }
          });
          team1Members.forEach(ind => {
            if (mini2Stats[ind]) { mini2Stats[ind].played++; mini2Stats[ind].loseK += loseAmt; mini2Stats[ind].total += loseAmt; }
          });
        }
      }
    };

    mini2MatchesA.forEach(m => processMini2MatchStats(m, mini2PairsA));
    mini2MatchesB.forEach(m => processMini2MatchStats(m, mini2PairsB));

    let sumBringBack2 = 0, sumThucThu2 = 0, sumAmThucTe2 = 0;
    let summaryRowsHtml2 = "";

    allMini2Individuals.forEach(indName => {
      const st = mini2Stats[indName];
      if (st && st.played > 0) {
        const payKey = `mini2_ind_${indName}`;
        const isPaid = mini2Payment[payKey] || false;
        const vIndex = vdvs.indexOf(indName);
        const indColor = vIndex !== -1 ? VDV_COLORS[vIndex % VDV_COLORS.length] : '#1e293b';

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
            <td style="color: ${indColor}; font-weight: 800; font-size:12px; text-align: left; padding-left: 8px;">${indName}</td>
            <td>${st.played}</td>
            <td class="txt-win">${st.winK > 0 ? st.winK : ''}</td>
            <td class="txt-lose">${st.loseK < 0 ? st.loseK : ''}</td>
            <td style="color:#2563eb; font-weight:bold;">${bringBack > 0 ? bringBack : ''}</td>
            <td class="${st.total < 0 ? 'txt-lose' : (st.total > 0 ? 'txt-win' : '')}"><strong>${st.total}</strong></td>
            <td><input type="checkbox" class="${checkboxClass}" ${isPaid ? 'checked' : ''} onclick="toggleMini2Payment('${payKey}')" title="${isAdminVerified ? '' : 'Cần đăng nhập Admin'}"></td>
            <td>${noteText}</td>
          </tr>
        `;
      }
    });

    let btcThuVeCalculated2 = sumAmThucTe2 + sumBringBack2; 
    let quyCon2 = sumThucThu2 - Math.abs(btcThuVeCalculated2);

    let html = `
      <div class="card" style="margin-bottom: 12px; padding: 10px 12px;">
        <div class="card-header-flex" style="border-bottom: none; margin-bottom: 4px; padding-bottom: 0;">
          <h2 class="card-title" style="display:flex; align-items:center; gap:6px;">
            <i class="fa-solid fa-trophy text-yellow-500"></i> 
            <span>${titlesConfig.subMini2}</span>
            <button onclick="editTitlePrompt('subMini2', '${titlesConfig.subMini2}')" style="background:none; border:none; color:#2563eb; cursor:pointer; font-size:12px;" title="Sửa tên tiêu đề"><i class="fa-solid fa-pen"></i></button>
          </h2>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:11px; font-weight:bold;">Tùy Chọn Kèo:</span>
            ${renderKeoSelectDropdown(mini2KeoMode, 'changeMini2KeoMode')}
          </div>
        </div>
        <div style="font-size: 11px; color: #334155; background: #ffffff; padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: 500;">
          Giải đấu Chia 2 Bảng A & B Thi đấu vòng tròn.
        </div>
      </div>

      <div class="card" style="margin-bottom: 14px;">
        <div class="card-header-flex" style="border-bottom: none; margin-bottom: 8px; padding-bottom: 0;">
          <h3 style="margin:0; font-size:12px; color:#c2410c; font-weight:900;">⚡ BẢNG A</h3>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-weight:bold; font-size:10px; color:#475569;">Số cặp VĐV:</span>
            <select style="width: auto; padding: 2px 6px; font-weight:bold; font-size:10px;" onchange="setMini2PairCount('A', this.value)">
              <option value="4" ${mini2PairsA.length === 4 ? 'selected' : ''}>4 Cặp VĐV</option>
              <option value="5" ${mini2PairsA.length === 5 ? 'selected' : ''}>5 Cặp VĐV</option>
            </select>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="table-responsive">
            <table>
              <thead>
                <tr><th colspan="5" style="padding: 4px;">BẢNG XẾP HẠNG BẢNG A</th></tr>
                <tr>
                  <th style="width:35px;">STT</th>
                  <th style="text-align: left; padding-left: 8px;">Pickleball - Cặp VĐV Bảng A</th>
                  <th style="width:50px;">Điểm</th>
                  <th style="width:55px;">Hệ số</th>
                  <th style="width:65px;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                ${standingsA.map((st, i) => `
                  <tr>
                    <td><strong>${i + 1}</strong></td>
                    <td style="text-align: left; padding-left: 8px; font-weight:bold;">
                      <span class="pair-badge badge-p${st.index % 5}">${st.name}</span>
                    </td>
                    <td class="txt-win" style="font-size:11px;">${st.points}</td>
                    <td style="font-weight:bold; color:${st.diff > 0 ? '#16a34a' : (st.diff < 0 ? '#dc2626' : '#334155')}">${st.diff > 0 ? '+' + st.diff : st.diff}</td>
                    <td>
                      <button onclick="editMini2PairName('A', ${st.index})" title="Đổi tên">✏️</button>
                      <button style="color:red;" onclick="deleteMini2Pair('A', ${st.index})" title="Xóa">🗑️</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="table-responsive">
            <table>
              <thead>
                <tr><th colspan="${mini2KeoMode === 'free' ? 5 : 4}" style="padding: 4px;">LỊCH THI ĐẤU BẢNG A</th></tr>
                <tr>
                  <th style="width:40px;">Trận</th>
                  <th>Đội 1</th>
                  <th style="width:80px;">Tỷ Số</th>
                  <th>Đội 2</th>
                  ${mini2KeoMode === 'free' ? '<th style="width:110px;" class="th-money">MỆNH GIÁ</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${mini2MatchesA.map((m, idx) => {
                  let customKeoA = "";
                  if (mini2KeoMode === 'free') {
                    customKeoA = `
                      <td>
                        <div style="display:flex; gap:2px; justify-content:center;">
                          <input type="number" placeholder="Thắng" style="width:48px;" value="${m.customWin !== undefined ? m.customWin : 5}" onchange="updateMini2MatchKeo('A', ${idx}, 'customWin', parseInt(this.value))">
                          <input type="number" placeholder="Thua" style="width:48px;" value="${m.customLose !== undefined ? m.customLose : -15}" onchange="updateMini2MatchKeo('A', ${idx}, 'customLose', parseInt(this.value))">
                        </div>
                      </td>
                    `;
                  }
                  return `
                    <tr>
                      <td><strong>${m.id}</strong></td>
                      <td style="text-align: center;">${mini2PairsA[m.pair1Index] ? `<span class="pair-badge badge-p${m.pair1Index % 5}">${mini2PairsA[m.pair1Index].name}</span>` : ''}</td>
                      <td>
                        <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
                          <input type="number" min="0" class="score-input" value="${m.score1 ?? ''}" oninput="updateMini2MatchScore('A', ${idx}, 'score1', this.value)">
                          <span>-</span>
                          <input type="number" min="0" class="score-input" value="${m.score2 ?? ''}" oninput="updateMini2MatchScore('A', ${idx}, 'score2', this.value)">
                        </div>
                      </td>
                      <td style="text-align: center;">${mini2PairsA[m.pair2Index] ? `<span class="pair-badge badge-p${m.pair2Index % 5}">${mini2PairsA[m.pair2Index].name}</span>` : ''}</td>
                      ${customKeoA}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 14px;">
        <div class="card-header-flex" style="border-bottom: none; margin-bottom: 8px; padding-bottom: 0;">
          <h3 style="margin:0; font-size:12px; color:#0369a1; font-weight:900;">⚡ BẢNG B</h3>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-weight:bold; font-size:10px; color:#475569;">Số cặp VĐV:</span>
            <select style="width: auto; padding: 2px 6px; font-weight:bold; font-size:10px;" onchange="setMini2PairCount('B', this.value)">
              <option value="4" ${mini2PairsB.length === 4 ? 'selected' : ''}>4 Cặp VĐV</option>
              <option value="5" ${mini2PairsB.length === 5 ? 'selected' : ''}>5 Cặp VĐV</option>
            </select>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="table-responsive">
            <table>
              <thead>
                <tr><th colspan="5" style="padding: 4px;">BẢNG XẾP HẠNG BẢNG B</th></tr>
                <tr>
                  <th style="width:35px;">STT</th>
                  <th style="text-align: left; padding-left: 8px;">Pickleball - Cặp VĐV Bảng B</th>
                  <th style="width:50px;">Điểm</th>
                  <th style="width:55px;">Hệ số</th>
                  <th style="width:65px;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                ${standingsB.map((st, i) => `
                  <tr>
                    <td><strong>${i + 1}</strong></td>
                    <td style="text-align: left; padding-left: 8px; font-weight:bold;">
                      <span class="pair-badge badge-p${st.index % 5}">${st.name}</span>
                    </td>
                    <td class="txt-win" style="font-size:11px;">${st.points}</td>
                    <td style="font-weight:bold; color:${st.diff > 0 ? '#16a34a' : (st.diff < 0 ? '#dc2626' : '#334155')}">${st.diff > 0 ? '+' + st.diff : st.diff}</td>
                    <td>
                      <button onclick="editMini2PairName('B', ${st.index})" title="Đổi tên">✏️</button>
                      <button style="color:red;" onclick="deleteMini2Pair('B', ${st.index})" title="Xóa">🗑️</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="table-responsive">
            <table>
              <thead>
                <tr><th colspan="${mini2KeoMode === 'free' ? 5 : 4}" style="padding: 4px;">LỊCH THI ĐẤU BẢNG B</th></tr>
                <tr>
                  <th style="width:40px;">Trận</th>
                  <th>Đội 1</th>
                  <th style="width:80px;">Tỷ Số</th>
                  <th>Đội 2</th>
                  ${mini2KeoMode === 'free' ? '<th style="width:110px;" class="th-money">MỆNH GIÁ</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${mini2MatchesB.map((m, idx) => {
                  let customKeoB = "";
                  if (mini2KeoMode === 'free') {
                    customKeoB = `
                      <td>
                        <div style="display:flex; gap:2px; justify-content:center;">
                          <input type="number" placeholder="Thắng" style="width:48px;" value="${m.customWin !== undefined ? m.customWin : 5}" onchange="updateMini2MatchKeo('B', ${idx}, 'customWin', parseInt(this.value))">
                          <input type="number" placeholder="Thua" style="width:48px;" value="${m.customLose !== undefined ? m.customLose : -15}" onchange="updateMini2MatchKeo('B', ${idx}, 'customLose', parseInt(this.value))">
                        </div>
                      </td>
                    `;
                  }
                  return `
                    <tr>
                      <td><strong>${m.id}</strong></td>
                      <td style="text-align: center;">${mini2PairsB[m.pair1Index] ? `<span class="pair-badge badge-p${m.pair1Index % 5}">${mini2PairsB[m.pair1Index].name}</span>` : ''}</td>
                      <td>
                        <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
                          <input type="number" min="0" class="score-input" value="${m.score1 ?? ''}" oninput="updateMini2MatchScore('B', ${idx}, 'score1', this.value)">
                          <span>-</span>
                          <input type="number" min="0" class="score-input" value="${m.score2 ?? ''}" oninput="updateMini2MatchScore('B', ${idx}, 'score2', this.value)">
                        </div>
                      </td>
                      <td style="text-align: center;">${mini2PairsB[m.pair2Index] ? `<span class="pair-badge badge-p${m.pair2Index % 5}">${mini2PairsB[m.pair2Index].name}</span>` : ''}</td>
                      ${customKeoB}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 14px;">
        <div class="card-header-flex" style="border-bottom: none; margin-bottom: 6px; padding-bottom: 0;">
          <h3 style="margin:0; font-size:12px; color:#1e293b; font-weight:900;">🏆 VÒNG KNOCKOUT (BÁN KẾT - CHUNG KẾT)</h3>
        </div>
        <div class="table-responsive" style="margin-bottom: 12px;">
          <table>
            <thead>
              <tr>
                <th style="width:120px;">VÒNG ĐẤU</th>
                <th>ĐỘI 1</th>
                <th style="width:80px;">TỶ SỐ</th>
                <th>ĐỘI 2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Bán Kết 1</strong></td>
                <td><input type="text" value="${mini2Knockout.bkc1.p1 || 'Nhất A'}" onchange="updateMini2Knockout('bkc1', 'p1', this.value)"></td>
                <td>
                  <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
                    <input type="number" min="0" class="score-input" value="${mini2Knockout.bkc1.s1 ?? ''}" oninput="updateMini2Knockout('bkc1', 's1', this.value)">
                    <span>-</span>
                    <input type="number" min="0" class="score-input" value="${mini2Knockout.bkc1.s2 ?? ''}" oninput="updateMini2Knockout('bkc1', 's2', this.value)">
                  </div>
                </td>
                <td><input type="text" value="${mini2Knockout.bkc1.p2 || 'Nhì B'}" onchange="updateMini2Knockout('bkc1', 'p2', this.value)"></td>
              </tr>
              <tr>
                <td><strong>Bán Kết 2</strong></td>
                <td><input type="text" value="${mini2Knockout.bkc2.p1 || 'Nhất B'}" onchange="updateMini2Knockout('bkc2', 'p1', this.value)"></td>
                <td>
                  <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
                    <input type="number" min="0" class="score-input" value="${mini2Knockout.bkc2.s1 ?? ''}" oninput="updateMini2Knockout('bkc2', 's1', this.value)">
                    <span>-</span>
                    <input type="number" min="0" class="score-input" value="${mini2Knockout.bkc2.s2 ?? ''}" oninput="updateMini2Knockout('bkc2', 's2', this.value)">
                  </div>
                </td>
                <td><input type="text" value="${mini2Knockout.bkc2.p2 || 'Nhì A'}" onchange="updateMini2Knockout('bkc2', 'p2', this.value)"></td>
              </tr>
              <tr style="background:#fffbeb;">
                <td><strong style="color:#b45309;">Tranh 3 - 4</strong></td>
                <td><input type="text" value="${mini2Knockout.rank34.p1 || 'Thua BK1'}" onchange="updateMini2Knockout('rank34', 'p1', this.value)"></td>
                <td>
                  <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
                    <input type="number" min="0" class="score-input" value="${mini2Knockout.rank34.s1 ?? ''}" oninput="updateMini2Knockout('rank34', 's1', this.value)">
                    <span>-</span>
                    <input type="number" min="0" class="score-input" value="${mini2Knockout.rank34.s2 ?? ''}" oninput="updateMini2Knockout('rank34', 's2', this.value)">
                  </div>
                </td>
                <td><input type="text" value="${mini2Knockout.rank34.p2 || 'Thua BK2'}" onchange="updateMini2Knockout('rank34', 'p2', this.value)"></td>
              </tr>
              <tr style="background:#f0fdf4;">
                <td><strong style="color:#15803d;"><i class="fa-solid fa-trophy text-amber-500"></i> CHUNG KẾT</strong></td>
                <td><input type="text" value="${mini2Knockout.final.p1 || 'Thắng BK1'}" onchange="updateMini2Knockout('final', 'p1', this.value)"></td>
                <td>
                  <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
                    <input type="number" min="0" class="score-input" value="${mini2Knockout.final.s1 ?? ''}" oninput="updateMini2Knockout('final', 's1', this.value)">
                    <span>-</span>
                    <input type="number" min="0" class="score-input" value="${mini2Knockout.final.s2 ?? ''}" oninput="updateMini2Knockout('final', 's2', this.value)">
                  </div>
                </td>
                <td><input type="text" value="${mini2Knockout.final.p2 || 'Thắng BK2'}" onchange="updateMini2Knockout('final', 'p2', this.value)"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px; background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #cbd5e1;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-weight:900; color:#d97706; width:140px; font-size:13px;"><i class="fa-solid fa-medal"></i> Đội Vô Địch:</span>
            <input type="text" style="font-weight:900; font-size:14px; padding:6px; background:#fffbeb; color:#b45309;" value="${mini2Knockout.champion || ''}" placeholder="Nhập tên cặp đội Vô Địch..." onchange="updateMini2WinnerField('champion', this.value)">
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-weight:900; color:#475569; width:140px; font-size:13px;"><i class="fa-solid fa-award"></i> Đội Về Nhì:</span>
            <input type="text" style="font-weight:900; font-size:14px; padding:6px; background:#f1f5f9; color:#334155;" value="${mini2Knockout.runnerUp || ''}" placeholder="Nhập tên cặp đội Về Nhì..." onchange="updateMini2WinnerField('runnerUp', this.value)">
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-weight:900; color:#b45309; width:140px; font-size:13px;"><i class="fa-solid fa-star"></i> Đội Về Ba:</span>
            <input type="text" style="font-weight:900; font-size:14px; padding:6px; background:#fff7ed; color:#9a3412;" value="${mini2Knockout.thirdPlace || ''}" placeholder="Nhập tên cặp đội Về Ba..." onchange="updateMini2WinnerField('thirdPlace', this.value)">
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header-flex">
          <h2 class="card-title">📊 BẢNG TỔNG HỢP KÈO - GIẢI MINI GAME 2</h2>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th style="text-align: left; padding-left: 8px;">PICK THỦ (CÁ NHÂN)</th>
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
<!-- ▲▲▲ KẾT THÚC KHỐI [MINIGAME2-TAB] ▲▲▲ -->
