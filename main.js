/* ==========================================================================
   CLB PICKLEBALL - CMTD · js/main.js — FILE XỬ LÝ CHÍNH DUY NHẤT.
   Giao diện (HTML) nằm trong thư mục components/. Tìm  KHỐI [MÃ-KHỐI]  để đến từng khối / module.
   ========================================================================== */

/* ████████████████ MODULE CORE · NẠP COMPONENT HTML ████████████████ */
/* ▼▼▼ KHỐI [CORE-COMPONENTS] · Nạp & ghép các component (components/*.html) ▼▼▼ BẮT ĐẦU */
    const COMPONENT_FILES = ['header', 'admin', 'autobackup', 'home', 'players', 'setting', 'tonghop', 'minigame1', 'minigame2', 'common'];
    const COMPONENT_PARTS = {};

    async function loadComponents() {
      await Promise.all(COMPONENT_FILES.map(async (name) => {
        const res = await fetch('components/' + name + '.html', { cache: 'no-cache' });
        if (!res.ok) throw new Error('Không tải được components/' + name + '.html (HTTP ' + res.status + ')');
        const text = (await res.text()).replace(/\r\n/g, '\n');
        const re = /<!-- \[PART: ([\w.\-]+)\] -->\n([\s\S]*?)\n<!-- \[\/PART\] -->/g;
        let m;
        while ((m = re.exec(text)) !== null) COMPONENT_PARTS[name + '.' + m[1]] = m[2];
      }));
    }

    function renderComponent(key, slots) {
      const tpl = COMPONENT_PARTS[key];
      if (tpl === undefined) {
        console.debug('Bỏ qua component chưa định nghĩa: ' + key);
        return '';
      }
      return tpl.replace(/\{\{(\w+)\}\}/g, (match, slotName) =>
        (slots && Object.prototype.hasOwnProperty.call(slots, slotName)) ? String(slots[slotName]) : match);
    }

    function formatMoneyOrScore(val) {
      const num = parseFloat(val);
      if (isNaN(num) || val === "" || val === null || val === undefined) return val || "";
      const formattedNum = Number(num).toLocaleString('vi-VN');
      if (num > 0) {
        return `<span class="number-pos">+${formattedNum}</span>`;
      } else if (num < 0) {
        return `<span class="number-neg">${formattedNum}</span>`;
      } else {
        return `<span class="number-zero">0</span>`;
      }
    }

    function mountShell() {
      const navItems = [
        { key: 'pickthu', part: 'pickthu.nav' },
        { key: 'tonghop', part: 'tonghop.nav' },
        { key: 'minigame1', part: 'minigame1.nav' },
        { key: 'minigame2', part: 'minigame2.nav' },
        { key: 'setting', part: 'setting.nav' }
      ];
      
      navItems.forEach(item => {
        const targetContainer = document.getElementById(`component-nav-${item.key}`);
        if (targetContainer) {
          try {
            const rendered = renderComponent(item.part);
            if (rendered) targetContainer.innerHTML = rendered;
          } catch (e) {}
        }
      });

      const adminBtnContainer = document.getElementById('component-admin-button');
      if (adminBtnContainer) {
        try {
          const adminHtml = renderComponent('admin.button');
          if (adminHtml) adminBtnContainer.innerHTML = adminHtml;
        } catch (e) {}
      }

      const cloudStatusContainer = document.getElementById('cloudStatus');
      if (cloudStatusContainer && !cloudStatusContainer.innerHTML.trim()) {
        try {
          const cloudHtml = renderComponent('autobackup.status');
          if (cloudHtml) cloudStatusContainer.outerHTML = cloudHtml;
        } catch (e) {}
      }

      try {
        const modals = (renderComponent('common.game-modal') || '') + (renderComponent('players.modal') || '');
        if (modals && !document.getElementById('injectedModals')) {
          const wrapper = document.createElement('div');
          wrapper.id = 'injectedModals';
          wrapper.innerHTML = modals;
          document.body.appendChild(wrapper);
        }
      } catch (e) {}
    }
/* ▲▲▲ KẾT THÚC KHỐI [CORE-COMPONENTS] ▲▲▲ */

/* ████████████████ MODULE CORE · LÕI HỆ THỐNG ████████████████ */
/* ▼▼▼ KHỐI [CORE-DATA] · Dữ liệu lõi ▼▼▼ BẮT ĐẦU */
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
/* ▲▲▲ KẾT THÚC KHỐI [CORE-DATA] ▲▲▲ */
/* ▼▼▼ KHỐI [CORE-NAV] · Điều hướng & router tab ▼▼▼ BẮT ĐẦU */
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
      if (!isAlreadyShow) targetMenu.classList.add("show");
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
/* ▲▲▲ KẾT THÚC KHỐI [CORE-NAV] ▲▲▲ */

/* ████████████████ MODULE ADMIN · ADMIN ████████████████ */
/* ▼▼▼ KHỐI [ADMIN-DATA] · Trạng thái Admin ▼▼▼ BẮT ĐẦU */
    const ADMIN_PASSCODE = "123456";
    let isAdminVerified = false;
/* ▲▲▲ KẾT THÚC KHỐI [ADMIN-DATA] ▲▲▲ */
/* ▼▼▼ KHỐI [ADMIN-FUNCS] · Đăng nhập & phân quyền ▼▼▼ BẮT ĐẦU */
    function toggleAdminPermission() {
      if (!isAdminVerified) {
        const pass = prompt("🔑 Nhập mật khẩu Quản trị viên:");
        if (pass === ADMIN_PASSCODE) {
          isAdminVerified = true;
          alert("✅ Đã cấp quyền Quản trị viên thành công!");
        } else if (pass !== null) {
          alert("❌ Mật khẩu không đúng!");
        }
      } else {
        if (confirm("🔒 Bạn có muốn khóa lại quyền Quản trị viên không?")) {
          isAdminVerified = false;
          alert("🔒 Đã khóa quyền Quản trị viên.");
        }
      }
      updateAdminUIState();
      renderCurrentTab();
    }

    function updateAdminUIState() {
      const btn = document.getElementById("adminAuthBtn");
      const icon = document.getElementById("adminLockIcon");
      const text = document.getElementById("adminBtnText");
      if (btn && icon && text) {
        if (isAdminVerified) {
          btn.style.backgroundColor = "#16a34a";
          icon.className = "fa-solid fa-lock-open";
          text.innerText = "Admin (Đã mở)";
        } else {
          btn.style.backgroundColor = "#334155";
          icon.className = "fa-solid fa-lock";
          text.innerText = "Đăng Nhập Admin";
        }
      }
    }

    function handleBtcNoteAdminChange(date, selectElement) {
      const selectedValue = selectElement.value;
      if (selectedValue === "YES") {
        if (!isAdminVerified) {
          alert("🔒 Tính năng này đang bị khóa. Vui lòng bấm nút 'Đăng Nhập Admin' ở góc trên để mở khóa.");
          selectElement.value = "NO";
          return;
        } else {
          updateBtcNoteAdminPermission(date, "YES");
        }
      } else {
        updateBtcNoteAdminPermission(date, "NO");
      }
    }

    function updateBtcNoteAdminPermission(date, status) {
      if (!paymentStatus[date]) paymentStatus[date] = {};
      else if (typeof paymentStatus[date] !== 'object') paymentStatus[date] = { paid: paymentStatus[date] };
      paymentStatus[date].btcNoteAdminOption = status;
      saveDataToFirestore();
      renderCurrentTab();
    }
/* ▲▲▲ KẾT THÚC KHỐI [ADMIN-FUNCS] ▲▲▲ */

/* ████████████████ MODULE PICKTHU · PICK THỦ ████████████████ */
/* ▼▼▼ KHỐI [PICKTHU-DATA & FUNCS] ▼▼▼ BẮT ĐẦU */
    const VDV_COLORS = [
      "#d97706", "#2563eb", "#059669", "#dc2626", "#7c3aed", 
      "#db2777", "#0284c7", "#15803d", "#b45309", "#4338ca",
      "#c026d3", "#0d9488", "#ea580c", "#4f46e5"
    ];

    let players = [
      { id: 1, name: "Tiến Thọ", gender: "Nam" },
      { id: 2, name: "Châu Sĩ", gender: "Nam" },
      { id: 3, name: "Vân Đình", gender: "Nữ" },
      { id: 4, name: "Cẩm Ly", gender: "Nữ" },
      { id: 5, name: "Phú Mỗ", gender: "Nam" },
      { id: 6, name: "Hà Giấy", gender: "Nam" },
      { id: 7, name: "Long Diễn", gender: "Nam" },
      { id: 8, name: "Tuấn La", gender: "Nam" },
      { id: 9, name: "Trí Đỏ", gender: "Nam" },
      { id: 10, name: "Thành Sóc", gender: "Nam" },
      { id: 11, name: "Quỳnh Cool", gender: "Nữ" },
      { id: 12, name: "Hải Hà", gender: "Nữ" },
      { id: 13, name: "Dũng Ngạc", gender: "Nam" },
      { id: 14, name: "Lợi Trí", gender: "Nam" },
      { id: 15, name: "Thanh Đàm", gender: "Nam" },
      { id: 16, name: "Điền Chèm", gender: "Nam" },
      { id: 17, name: "Minh Hạnh", gender: "Nữ" },
      { id: 18, name: "Minh Vượng", gender: "Nam" },
      { id: 19, name: "Gà Tre", gender: "Nữ" },
      { id: 20, name: "Trường Giang", gender: "Nam" }
    ];

    let vdvs = players.map(p => p.name);

    function syncVdvsFromPlayers() {
      vdvs = players.map(p => p.name);
      const btn = document.getElementById("vdvCountBtn");
      if (btn) btn.innerText = players.length;
    }

    function openPlayerModal() {
      document.getElementById('modal-title').innerText = "Thêm Pick Thủ Mới";
      document.getElementById('player-id').value = "";
      document.getElementById('player-name').value = "";
      document.getElementById('player-gender').value = "Nam";
      document.getElementById('player-modal').classList.remove('hidden');
    }

    function closePlayerModal() {
      document.getElementById('player-modal').classList.add('hidden');
    }

    function savePlayer() {
      const id = document.getElementById('player-id').value;
      const name = document.getElementById('player-name').value.trim();
      const gender = document.getElementById('player-gender').value;
      if (!name) return alert("Vui lòng nhập tên Pick Thủ!");
      if (id) {
        const player = players.find(p => p.id == id);
        if (player) { player.name = name; player.gender = gender; }
      } else {
        const newId = players.length ? Math.max(...players.map(p => p.id)) + 1 : 1;
        players.push({ id: newId, name, gender });
      }
      closePlayerModal();
      saveDataToFirestore();
      renderCurrentTab();
    }

    function renderPlayersTab(container) {
      syncVdvsFromPlayers();
      let html = renderComponent('players.tab', {
        players_rows: (players.map((p, index) => {
          const color = VDV_COLORS[index % VDV_COLORS.length];
          return renderComponent('players.tab-tr-1', {
            index_plus1: (index + 1),
            color,
            p_name: p.name,
            if_p_gender_Nam_class: (p.gender === 'Nam' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-pink-50 text-pink-700 border border-pink-200'),
            p_gender: p.gender,
            p_id: p.id
          });
        }).join(''))
      });
      container.innerHTML = html;
    }
/* ▲▲▲ KẾT THÚC KHỐI [PICKTHU-FUNCS] ▲▲▲ */

/* ████████████████ MODULE HOME · HOME & NGÀY ĐẤU ████████████████ */
/* ▼▼▼ KHỐI [HOME-DATA & NAV] ▼▼▼ BẮT ĐẦU */
    let dates = [];
    let matchesData = {};
    let dateKeoMode = {}; 
    let paymentStatus = {};
    const ABSENT_FINE_K = 30;

    function getClosestOrCurrentDate(dateArray) {
      if (!dateArray || dateArray.length === 0) return "tonghop";
      const now = new Date();
      const todayStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear().toString().substr(-2)}`;
      if (dateArray.includes(todayStr)) return todayStr;
      return dateArray[0];
    }

    function goHome() {
      currentTab = getClosestOrCurrentDate(dates);
      renderCurrentTab();
    }

    function changeKeoMode(dateStr, mode) {
      dateKeoMode[dateStr] = mode;
      saveDataToFirestore();
      renderCurrentTab();
    }

    function addMatch(dateStr) {
      if (!matchesData[dateStr]) matchesData[dateStr] = [];
      const newId = matchesData[dateStr].length + 1;
      matchesData[dateStr].push({
        id: newId, c1_p1: "", c1_p2: "", c2_p1: "", c2_p2: "", score1: "", score2: "", customWin: 5, customLose: -15
      });
      saveDataToFirestore();
      renderCurrentTab();
    }

    function deleteSpecificMatch(dateStr, matchIndex) {
      if (matchesData[dateStr] && matchesData[dateStr][matchIndex]) {
        if (confirm(`Bạn có chắc muốn xóa Trận ${matchIndex + 1}?`)) {
          matchesData[dateStr].splice(matchIndex, 1);
          matchesData[dateStr].forEach((m, idx) => m.id = idx + 1);
          saveDataToFirestore();
          renderCurrentTab();
        }
      }
    }

    function updateMatch(dateStr, matchIndex, field, value) {
      if (!matchesData[dateStr]) matchesData[dateStr] = [];
      matchesData[dateStr][matchIndex][field] = value;
      saveDataToFirestore();
      if (field === 'score1' || field === 'score2' || field === 'customWin' || field === 'customLose') {
        renderCurrentTab();
      }
    }

    function togglePayment(payKey) {
      if (!isAdminVerified) {
        alert("🔒 Tính năng này đang bị khóa. Vui lòng bấm nút 'Đăng Nhập Admin' ở góc trên để mở khóa.");
        return;
      }
      paymentStatus[payKey] = !paymentStatus[payKey];
      saveDataToFirestore();
      renderCurrentTab();
    }

    function generateVdvOptionsHtml(selectedValue, filterList = null) {
      const listToRender = filterList || vdvs;
      return listToRender.map((v) => {
        const i = vdvs.indexOf(v);
        const color = i !== -1 ? VDV_COLORS[i % VDV_COLORS.length] : "#1e293b";
        const isSelected = selectedValue === v ? 'selected' : '';
        return renderComponent('home.vdv-option', { v, isSelected, color });
      }).join('');
    }

    function getKeoValues(mode, matchObj) {
      let winAmt = 5, loseAmt = -15;
      if (mode === "k25") { winAmt = 0; loseAmt = -25; }
      else if (mode === "no_keo") { winAmt = 0; loseAmt = 0; }
      else if (mode === "free") {
        winAmt = matchObj && matchObj.customWin !== undefined ? parseInt(matchObj.customWin) : 5;
        loseAmt = matchObj && matchObj.customLose !== undefined ? parseInt(matchObj.customLose) : -15;
      }
      return { winAmt, loseAmt };
    }
/* ▲▲▲ KẾT THÚC KHỐI [HOME-NAV] ▲▲▲ */
/* ▼▼▼ KHỐI [HOME-DAYTAB] · Vẽ bảng trận đấu khớp theo ảnh mẫu ▼▼▼ BẮT ĐẦU */
    function renderSingleDayTab(container, dateStr) {
      const matches = matchesData[dateStr] || [];
      const currentMode = dateKeoMode[dateStr] || "default";

      let html = renderComponent('home.day-tab', {
        dateStr,
        freeKeoHeader: (currentMode === 'free' ? '<th style="width: 110px;">THẮNG/THUA</th>' : ''),
        selected_currentMode_default: (currentMode === 'default' ? 'selected' : ''),
        selected_currentMode_k25: (currentMode === 'k25' ? 'selected' : ''),
        selected_currentMode_no_keo: (currentMode === 'no_keo' ? 'selected' : ''),
        selected_currentMode_free: (currentMode === 'free' ? 'selected' : '')
      });

      matches.forEach((m, idx) => {
        const val1 = (m.score1 || "").toString().trim();
        const val2 = (m.score2 || "").toString().trim();
        const s1 = parseInt(val1);
        const s2 = parseInt(val2);
        
        let keo1 = 0, keo2 = 0;
        let { winAmt, loseAmt } = getKeoValues(currentMode, m);

        if (!isNaN(s1) && !isNaN(s2)) {
          let isHam = (s1 === 0 || s2 === 0);
          let effectiveWin = isHam ? (winAmt > 0 ? winAmt * 2 : 0) : winAmt;
          let effectiveLose = isHam ? loseAmt * 2 : loseAmt;

          if (s1 > s2) { keo1 = effectiveWin; keo2 = effectiveLose; } 
          else if (s2 > s1) { keo1 = effectiveLose; keo2 = effectiveWin; } 
          else { keo1 = 0; keo2 = 0; }
        }

        const isScore1Zero = (val1 === "0" || s1 === 0);
        const isScore2Zero = (val2 === "0" || s2 === 0);

        const score1Inner = isScore1Zero ? renderComponent('home.day-tab-span-1') : renderComponent('home.day-tab-input-1', { m_score1: (m.score1 || ''), dateStr, idx });
        const score2Inner = isScore2Zero ? renderComponent('home.day-tab-span-2') : renderComponent('home.day-tab-input-2', { m_score2: (m.score2 || ''), dateStr, idx });

        const c1_p1_color = m.c1_p1 ? VDV_COLORS[vdvs.indexOf(m.c1_p1) % VDV_COLORS.length] : "#334155";
        const c1_p2_color = m.c1_p2 ? VDV_COLORS[vdvs.indexOf(m.c1_p2) % VDV_COLORS.length] : "#334155";
        const c2_p1_color = m.c2_p1 ? VDV_COLORS[vdvs.indexOf(m.c2_p1) % VDV_COLORS.length] : "#334155";
        const c2_p2_color = m.c2_p2 ? VDV_COLORS[vdvs.indexOf(m.c2_p2) % VDV_COLORS.length] : "#334155";

        let customKeoInputHtml = "";
        if (currentMode === 'free') {
          customKeoInputHtml = renderComponent('home.day-tab-td-1', {
            m_customWin_or_default: (m.customWin !== undefined ? m.customWin : winAmt),
            dateStr, idx,
            m_customLose_or_default: (m.customLose !== undefined ? m.customLose : loseAmt)
          });
        }

        html += renderComponent('home.day-tab-tr-1', {
          dateStr, idx,
          m_id: m.id,
          c1_p1_color, generateVdvOptionsHtml_m_c1_p1: generateVdvOptionsHtml(m.c1_p1),
          c1_p2_color, generateVdvOptionsHtml_m_c1_p2: generateVdvOptionsHtml(m.c1_p2),
          c2_p1_color, generateVdvOptionsHtml_m_c2_p1: generateVdvOptionsHtml(m.c2_p1),
          c2_p2_color, generateVdvOptionsHtml_m_c2_p2: generateVdvOptionsHtml(m.c2_p2),
          isScore1Zero, score1Inner,
          isScore2Zero, score2Inner,
          customKeoInputHtml,
          winLoseClass_keo1: (keo1 > 0 ? 'number-pos' : (keo1 < 0 ? 'number-neg' : 'number-zero')),
          keo1: (keo1 > 0 ? `+${keo1}` : keo1),
          winLoseClass_keo2: (keo2 > 0 ? 'number-pos' : (keo2 < 0 ? 'number-neg' : 'number-zero')),
          keo2: (keo2 > 0 ? `+${keo2}` : keo2)
        });
      });

      html += renderComponent('home.day-tab-end-tbody-1');
      renderSingleDaySummaryTable(dateStr, html, container);
    }
/* ▲▲▲ KẾT THÚC KHỐI [HOME-DAYTAB] ▲▲▲ */

/* ████████████████ MODULE SUMMARY · BẢNG TỔNG HỢP KẾT QUẢ & THU CHI ████████████████ */
/* ▼▼▼ KHỐI [HOME-SUMMARY] · Khớp hoàn toàn với tiêu đề bảng ở ảnh mẫu ▼▼▼ BẮT ĐẦU */
    function renderSingleDaySummaryTable(dateStr, matchesHtml, container) {
      const matches = matchesData[dateStr] || [];
      const currentMode = dateKeoMode[dateStr] || "default";
      let stats = {};

      vdvs.forEach(v => { stats[v] = { played: 0, winK: 0, loseK: 0, total: 0 }; });

      matches.forEach(m => {
        const s1 = parseInt(m.score1);
        const s2 = parseInt(m.score2);
        let { winAmt, loseAmt } = getKeoValues(currentMode, m);

        if (!isNaN(s1) && !isNaN(s2)) {
          const pair1 = [m.c1_p1, m.c1_p2].filter(Boolean);
          const pair2 = [m.c2_p1, m.c2_p2].filter(Boolean);
          let isHam = (s1 === 0 || s2 === 0);
          let effectiveWin = isHam ? (winAmt > 0 ? winAmt * 2 : 0) : winAmt;
          let effectiveLose = isHam ? loseAmt * 2 : loseAmt;

          if (s1 > s2) {
            pair1.forEach(v => { if (stats[v]) { stats[v].played++; stats[v].winK += effectiveWin; stats[v].total += effectiveWin; } });
            pair2.forEach(v => { if (stats[v]) { stats[v].played++; stats[v].loseK += effectiveLose; stats[v].total += effectiveLose; } });
          } else if (s2 > s1) {
            pair2.forEach(v => { if (stats[v]) { stats[v].played++; stats[v].winK += effectiveWin; stats[v].total += effectiveWin; } });
            pair1.forEach(v => { if (stats[v]) { stats[v].played++; stats[v].loseK += effectiveLose; stats[v].total += effectiveLose; } });
          }
        }
      });

      let sumBringBack = 0, sumThucThu = 0, sumAmThucTe = 0;
      let summaryRowsHtml = "";
      const uniqueVdvs = Array.from(new Set(vdvs));

      uniqueVdvs.forEach((v) => {
        const st = stats[v];
        if (st && st.played > 0) {
          const payKey = `${dateStr}_${v}`;
          const isPaid = paymentStatus[payKey] || false;
          const vIndex = vdvs.indexOf(v);
          const vColor = VDV_COLORS[vIndex % VDV_COLORS.length];
          const netTotal = st.total;

          let bringBack = 0;
          if (st.played >= 4 && netTotal > 0) { bringBack = netTotal; sumBringBack += bringBack; }
          if (netTotal < 0) { sumAmThucTe += netTotal; if (isPaid) sumThucThu += Math.abs(netTotal); }

          let noteText = "";
          if (netTotal < 0) {
            noteText = isPaid ? renderComponent('home.summary-span-1') : renderComponent('home.summary-span-2');
          } else if (netTotal > 0) {
            noteText = isPaid ? renderComponent('home.summary-span-3') : renderComponent('home.summary-span-4');
          }

          const checkboxClass = isAdminVerified ? "checkbox-cell admin-active" : "checkbox-cell";

          summaryRowsHtml += renderComponent('home.summary-tr-1', {
            vColor, v,
            st_played: st.played,
            if_st_winK_0: (st.winK !== 0 ? (st.winK > 0 ? `+${st.winK}` : st.winK) : ''),
            if_st_loseK_0: (st.loseK !== 0 ? (st.loseK > 0 ? `+${st.loseK}` : st.loseK) : ''),
            if_bringBack_0: (bringBack > 0 ? `+${bringBack}` : ''),
            if_st_total_0_class: (netTotal < 0 ? 'number-neg' : (netTotal > 0 ? 'number-pos' : 'number-zero')),
            st_total: (netTotal > 0 ? `+${netTotal}` : netTotal),
            checkboxClass,
            if_isPaid: (isPaid ? 'checked' : ''),
            payKey,
            noteText
          });
        }
      });

      let btcThuVeCalculated = sumAmThucTe + sumBringBack; 
      let quyCon = sumThucThu - Math.abs(btcThuVeCalculated);

      const pStatus = paymentStatus[dateStr];
      const currentBtcAdminOption = (pStatus && typeof pStatus === 'object' && pStatus.btcNoteAdminOption) ? pStatus.btcNoteAdminOption : "NO";
      const isYes = currentBtcAdminOption === "YES";

      let summaryTableHtml = renderComponent('home.summary', {
        summaryRowsHtml,
        btcThuVeCalculated: (btcThuVeCalculated !== 0 ? (btcThuVeCalculated > 0 ? `+${btcThuVeCalculated}` : btcThuVeCalculated) : 0),
        sumThucThu: (sumThucThu !== 0 ? `+${sumThucThu}` : 0),
        dateStr,
        selected_isYes: (isYes ? 'selected' : ''),
        selected_not_isYes: (!isYes ? 'selected' : ''),
        quyCon: (quyCon !== 0 ? (quyCon > 0 ? `+${quyCon}` : quyCon) : 0)
      });

      container.innerHTML = matchesHtml + summaryTableHtml;
    }
/* ▲▲▲ KẾT THÚC KHỐI [HOME-SUMMARY] ▲▲▲ */

/* ████████████████ MODULE SETTING & TONGHOP & MINIGAME ████████████████ */
/* ▼▼▼ CÁC TIỆN ÍCH QUẢN LÝ KHÁC ▼▼▼ BẮT ĐẦU */
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

    function exportToExcel() {
      closeAllDropdowns();
      let wb = XLSX.utils.book_new();
      dates.forEach(d => {
        let matches = matchesData[d] || [];
        let rows = matches.map((m, idx) => ({
          "Trận": idx + 1, "Cặp 1 VĐV 1": m.c1_p1 || "", "Cặp 1 VĐV 2": m.c1_p2 || "",
          "Cặp 2 VĐV 1": m.c2_p1 || "", "Cặp 2 VĐV 2": m.c2_p2 || "", "Điểm 1": m.score1 || "", "Điểm 2": m.score2 || ""
        }));
        let ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, d.replace(/\//g, "-"));
      });
      XLSX.writeFile(wb, `CLB_Pickleball_CMTD_ThongKe.xlsx`);
    }

    function renderDatesMenu() {
      const container = document.getElementById("datesMenuList");
      if (!container) return;
      container.innerHTML = dates.map(d => renderComponent('tonghop.dates-menu-item', {
        if_currentTab_d_class: (currentTab === d ? 'number-pos font-bold' : ''),
        d
      })).join('');
    }

    function renderTongHopTab(container) {
      container.innerHTML = `<div class="card"><h3 class="card-title">Đang phát triển bảng tổng hợp nhiều ngày</h3></div>`;
    }
/* ▲▲▲ KẾT THÚC KHỐI [TIỆN ÍCH KHÁC] ▲▲▲ */

/* ████████████████ MODULE AUTOBACKUP · KẾT NỐI FIRESTORE ONLINE ████████████████ */
/* ▼▼▼ KHỐI [AUTOBACKUP] ▼▼▼ BẮT ĐẦU */
    const firebaseConfig = {
      apiKey: "AIzaSyCXxjGAHhAOtIo2DoqW6u8LW9NOUOI7PqY",
      authDomain: "pickleball-cmtd.firebaseapp.com",
      projectId: "pickleball-cmtd",
      storageBucket: "pickleball-cmtd.appspot.com",
      messagingSenderId: "648591152243",
      appId: "1:648591152243:web:3343caf2da821373070606"
    };

    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    db.settings({ experimentalAutoDetectLongPolling: true });
    const docRef = db.collection("clubs").doc("cmtd_main_data");
    let autoBackupMemory = null;

    function listenToFirestore() {
      docRef.onSnapshot((doc) => {
        const statusEl = document.getElementById("cloudStatus");
        if (doc.exists) {
          const data = doc.data();
          if (data.players) players = data.players;
          syncVdvsFromPlayers();
          dates = data.dates || [];
          matchesData = data.matchesData || {};
          dateKeoMode = data.dateKeoMode || {};
          paymentStatus = data.paymentStatus || {};
          
          if (!currentTab || (!dates.includes(currentTab) && currentTab !== "tonghop" && currentTab !== "players")) {
            currentTab = getClosestOrCurrentDate(dates);
          }
          if (statusEl) {
            statusEl.className = "cloud-status cloud-online";
            statusEl.innerHTML = "☁️ Tự Động Lưu (Firestore Online)";
          }
          renderDatesMenu();
          renderCurrentTab();
        } else {
          initDefaultFirestore();
        }
      }, (error) => {
        initDefaultFirestore();
      });
    }

    function initDefaultFirestore() {
      const nowObj = new Date();
      const todayStr = `${nowObj.getDate()}/${nowObj.getMonth() + 1}/${nowObj.getFullYear().toString().substr(-2)}`;
      dates = [todayStr];
      matchesData = {};
      matchesData[todayStr] = [
        { id: 1, c1_p1: "Trí Đỏ", c1_p2: "Long Diễn", c2_p1: "Tuấn La", c2_p2: "Thành Sóc", score1: "11", score2: "9", customWin: 5, customLose: -15 }
      ];
      dateKeoMode[todayStr] = "default";
      currentTab = todayStr;
      syncVdvsFromPlayers();
      renderDatesMenu();
      updateNavbarTitles();
      renderCurrentTab();
      saveDataToFirestore();
    }

    function saveDataToFirestore() {
      const statusEl = document.getElementById("cloudStatus");
      if (statusEl) {
        statusEl.className = "cloud-status cloud-syncing";
        statusEl.innerHTML = "⏳ Đang tự động lưu...";
      }
      syncVdvsFromPlayers();
      const payload = { players, vdvs, dates, matchesData, dateKeoMode, paymentStatus, titlesConfig };
      autoBackupMemory = JSON.parse(JSON.stringify(payload));
      docRef.set(payload, { merge: true }).then(() => {
        if (statusEl) {
          statusEl.className = "cloud-status cloud-online";
          statusEl.innerHTML = "☁️ Tự Động Lưu (Firestore Online)";
        }
      }).catch((err) => {
        if (statusEl) {
          statusEl.className = "cloud-status cloud-error";
          statusEl.innerHTML = "⚠ Lỗi tự động lưu!";
        }
      });
    }

    window.onload = async function() {
      try {
        await loadComponents();
      } catch (err) {}
      mountShell();
      document.addEventListener('click', closeAllDropdowns);
      setTimeout(() => {
        const statusEl = document.getElementById("cloudStatus");
        if (statusEl && statusEl.innerText.includes("Khởi Tạo")) initDefaultFirestore();
      }, 3000);
      listenToFirestore();
    };
/* ▲▲▲ KẾT THÚC KHỐI [AUTOBACKUP & INIT] ▲▲▲ */
