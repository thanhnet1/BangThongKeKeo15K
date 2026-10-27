let miniGame2Content = "Thể lệ Giải Đấu Mini Game 2: Chia 2 bảng A và B thi đấu vòng tròn tính điểm chọn vào Bán kết & Chung kết.";
let mini2PairsA = [
  { id: "A1", p1: "", p2: "" },
  { id: "A2", p1: "", p2: "" },
  { id: "A3", p1: "", p2: "" }
];
let mini2PairsB = [
  { id: "B1", p1: "", p2: "" },
  { id: "B2", p1: "", p2: "" },
  { id: "B3", p1: "", p2: "" }
];
let mini2MatchesA = [];
let mini2MatchesB = [];
let mini2Knockout = {
  semi1: { pair1: "", pair2: "", score1: "", score2: "" },
  semi2: { pair1: "", pair2: "", score1: "", score2: "" },
  final: { pair1: "", pair2: "", score1: "", score2: "" }
};

let mini2Tour1Content = "Thể lệ Giải đấu bổ sung 1: Nội dung thi đấu tùy chỉnh.";
let mini2Tour2Content = "Thể lệ Giải đấu bổ sung 2: Nội dung thi đấu tùy chỉnh.";
let mini2KeoMode = "default";
let mini2Payment = {};

function updateMini2Pair(group, idx, field, value) {
  let list = group === 'A' ? mini2PairsA : mini2PairsB;
  if (list[idx]) {
    list[idx][field] = value;
    saveDataToFirestore();
    renderCurrentTab();
  }
}

function updateMini2MatchScore(group, matchIdx, field, value) {
  let list = group === 'A' ? mini2MatchesA : mini2MatchesB;
  if (list[matchIdx]) {
    list[matchIdx][field] = value;
    saveDataToFirestore();
    renderCurrentTab();
  }
}

function updateMini2KnockoutScore(matchKey, field, value) {
  if (mini2Knockout[matchKey]) {
    mini2Knockout[matchKey][field] = value;
    saveDataToFirestore();
    renderCurrentTab();
  }
}

function renderMiniGame2Tab(container) {
  let html = `
    <div class="card">
      <div class="card-header-flex">
        <h2 class="card-title">🏆 ${titlesConfig.subMini2}</h2>
      </div>
      <div style="background:#f1f5f9; padding:8px 12px; border-radius:6px; margin-bottom:12px; font-size:11px;">
        <strong>📜 Thể lệ:</strong> ${miniGame2Content || 'Chưa cập nhật thể lệ.'}
      </div>

      <div class="grid-2col mb-4">
        <!-- BẢNG A -->
        <div class="card" style="margin-bottom:0;">
          <h3 class="card-title" style="color:#15803d; margin-bottom:8px;">🟢 BẢNG A</h3>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>VĐV 1</th>
                  <th>VĐV 2</th>
                </tr>
              </thead>
              <tbody>
                ${mini2PairsA.map((p, i) => `
                  <tr>
                    <td><span class="pair-badge badge-p${i}">${p.id}</span></td>
                    <td><select onchange="updateMini2Pair('A', ${i}, 'p1', this.value)"><option value="">-- Select --</option>${generateVdvOptionsHtml(p.p1)}</select></td>
                    <td><select onchange="updateMini2Pair('A', ${i}, 'p2', this.value)"><option value="">-- Select --</option>${generateVdvOptionsHtml(p.p2)}</select></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- BẢNG B -->
        <div class="card" style="margin-bottom:0;">
          <h3 class="card-title" style="color:#0369a1; margin-bottom:8px;">🔵 BẢNG B</h3>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>VĐV 1</th>
                  <th>VĐV 2</th>
                </tr>
              </thead>
              <tbody>
                ${mini2PairsB.map((p, i) => `
                  <tr>
                    <td><span class="pair-badge badge-p${i}">${p.id}</span></td>
                    <td><select onchange="updateMini2Pair('B', ${i}, 'p1', this.value)"><option value="">-- Select --</option>${generateVdvOptionsHtml(p.p1)}</select></td>
                    <td><select onchange="updateMini2Pair('B', ${i}, 'p2', this.value)"><option value="">-- Select --</option>${generateVdvOptionsHtml(p.p2)}</select></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
  container.innerHTML = html;
}

function renderMiniGame2Tour1Tab(container) {
  container.innerHTML = `
    <div class="card">
      <div class="card-header-flex">
        <h2 class="card-title">⭐ ${titlesConfig.subTour1}</h2>
      </div>
      <div style="background:#f1f5f9; padding:8px 12px; border-radius:6px; margin-bottom:12px; font-size:11px;">
        <strong>📜 Thể lệ:</strong> ${mini2Tour1Content || 'Chưa cập nhật thể lệ.'}
      </div>
      <p class="text-xs text-slate-500 text-center py-4">Giao diện giải đấu đang được cập nhật...</p>
    </div>
  `;
}

function renderMiniGame2Tour2Tab(container) {
  container.innerHTML = `
    <div class="card">
      <div class="card-header-flex">
        <h2 class="card-title">🚀 ${titlesConfig.subTour2}</h2>
      </div>
      <div style="background:#f1f5f9; padding:8px 12px; border-radius:6px; margin-bottom:12px; font-size:11px;">
        <strong>📜 Thể lệ:</strong> ${mini2Tour2Content || 'Chưa cập nhật thể lệ.'}
      </div>
      <p class="text-xs text-slate-500 text-center py-4">Giao diện giải đấu đang được cập nhật...</p>
    </div>
  `;
}
