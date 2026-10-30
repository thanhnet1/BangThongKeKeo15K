/* ==========================================================================
   CLB PICKLEBALL - CMTD · js/main.js — FILE XỬ LÝ CHÍNH DUY NHẤT.
   Giao diện (HTML) nằm trong thư mục components/. Tìm  KHỐI [MÃ-KHỐI]  để đến từng khối / module.
   ========================================================================== */

/* ████████████████ MODULE CORE · NẠP COMPONENT HTML ████████████████ */
/* ▼▼▼ KHỐI [CORE-COMPONENTS] · Nạp & ghép các component (components/*.html) ▼▼▼ BẮT ĐẦU */
    const COMPONENT_FILES = ['header', 'admin', 'autobackup', 'home', 'players', 'pickthu', 'setting', 'tonghop', 'minigame1', 'minigame2', 'common'];
    const COMPONENT_PARTS = {};   // 'home.day-tab' -> nội dung HTML

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

    function formatScoreDisplay(score) {
      if (score === 0 || score === "0" || score === 0) {
        return '<span class="text-red-600 font-bold">HẦM</span>';
      }
      return score !== undefined && score !== null && score !== "" ? score : "";
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
          } catch (e) {
            console.debug(`Bỏ qua component nav: ${item.key}`);
          }
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
/* ▼▼▼ KHỐI [CORE-DATA] · Dữ liệu lõi: tiêu đề menu, tab hiện tại ▼▼▼ BẮT ĐẦU */
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
/* ▼▼▼ KHỐI [CORE-NAV] · Điều hướng: đổi tiêu đề menu, mở/đóng menu, chuyển tab, router vẽ tab ▼▼▼ BẮT ĐẦU */
    function updateNavbarTitles() {
      if (document.getElementById("navLabelMini1")) document.getElementById("navLabelMini1").innerText = titlesConfig.navMini1;
      if (document.getElementById("subLabelMini1")) document.getElementById("subLabelMini1").innerText = titlesConfig.subMini1;
      if (document.getElementById("subLabelSub1")) document.getElementById("subLabelSub1").innerText = titlesConfig.subSub1;
      if (document.getElementById("subLabelSub2")) document.getElementById("subLabelSub2").innerText = titlesConfig.subSub2;
      if (document.getElementById("navLabelMini2")) document.getElementById("navLabelMini2").innerText = titlesConfig.navMini2;
      if (document.getElementById("subLabelMini2")) document.getElementById("subLabelMini2").innerText = titlesConfig.subSub2;
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
/* ▲▲▲ KẾT THÚC KHỐI [CORE-NAV] ▲▲▲ */

/* ████████████████ MODULE ADMIN · ADMIN ████████████████ */
/* ▼▼▼ KHỐI [ADMIN-DATA] · Dữ liệu Admin: mật mã + trạng thái đăng nhập ▼▼▼ BẮT ĐẦU */
    const ADMIN_PASSCODE = "123456";
    let isAdminVerified = false;
/* ▲▲▲ KẾT THÚC KHỐI [ADMIN-DATA] ▲▲▲ */
/* ▼▼▼ KHỐI [ADMIN-FUNCS] · Đăng nhập Admin, cập nhật giao diện khóa/mở, xác nhận BTC chuyển tổng ngày ▼▼▼ BẮT ĐẦU */
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
      if (!paymentStatus[date]) {
        paymentStatus[date] = {};
      } else if (typeof paymentStatus[date] !== 'object') {
        const oldVal = paymentStatus[date];
        paymentStatus[date] = { paid: oldVal };
      }
      paymentStatus[date].btcNoteAdminOption = status;
      saveDataToFirestore();
      renderCurrentTab();
    }
/* ▲▲▲ KẾT THÚC KHỐI [ADMIN-FUNCS] ▲▲▲ */

/* ████████████████ MODULE PICKTHU · PICK THỦ ████████████████ */
/* ▼▼▼ KHỐI [PICKTHU-DATA] · Dữ liệu Pick Thủ: màu VĐV, danh sách players, vdvs ▼▼▼ BẮT ĐẦU */
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
/* ▲▲▲ KẾT THÚC KHỐI [PICKTHU-DATA] ▲▲▲ */
/* ▼▼▼ KHỐI [PICKTHU-FUNCS] · Thêm / sửa / xóa Pick Thủ + bảng Pick Thủ ▼▼▼ BẮT ĐẦU */
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

      if (!name) {
        alert("Vui lòng nhập tên Pick Thủ!");
        return;
      }

      if (id) {
        const player = players.find(p => p.id == id);
        if (player) {
          player.name = name;
          player.gender = gender;
        }
      } else {
        const newId = players.length ? Math.max(...players.map(p => p.id)) + 1 : 1;
        players.push({ id: newId, name, gender });
      }

      closePlayerModal();
      saveDataToFirestore();
      renderCurrentTab();
    }

    function editPlayer(id) {
      const player = players.find(p => p.id == id);
      if (player) {
        document.getElementById('modal-title').innerText = "Chỉnh Sửa Pick Thủ";
        document.getElementById('player-id').value = player.id;
        document.getElementById('player-name').value = player.name;
        document.getElementById('player-gender').value = player.gender;
        document.getElementById('player-modal').classList.remove('hidden');
      }
    }

    function deletePlayer(id) {
      if (confirm("Bạn có chắc chắn muốn xóa Pick Thủ này khỏi danh sách?")) {
        players = players.filter(p => p.id != id);
        saveDataToFirestore();
        renderCurrentTab();
      }
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

/* ████████████████ MODULE HOME · HOME (TRANG CHỦ & CÁC TAB NGÀY) ████████████████ */
/* ▼▼▼ KHỐI [HOME-DATA] · Dữ liệu ngày: dates, matchesData, dateKeoMode, paymentStatus, mức phạt nghỉ ▼▼▼ BẮT ĐẦU */
    let dates = [];
    let matchesData = {};
    let dateKeoMode = {}; 
    let paymentStatus = {};
    const ABSENT_FINE_K = 30;
/* ▲▲▲ KẾT THÚC KHỐI [HOME-DATA] ▲▲▲ */
/* ▼▼▼ KHỐI [HOME-NAV] · Trang chủ: tìm ngày gần nhất + nút HOME ▼▼▼ BẮT ĐẦU */
    function getClosestOrCurrentDate(dateArray) {
      if (!dateArray || dateArray.length === 0) return "tonghop";
      const now = new Date();
      const todayStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear().toString().substr(-2)}`;

      if (dateArray.includes(todayStr)) return todayStr;

      let closestDate = dateArray[0];
      let minDiff = Infinity;

      const parseDateStr = (str) => {
        const parts = str.split('/');
        if (parts.length === 3) {
          let day = parseInt(parts[0], 10);
          let month = parseInt(parts[1], 10) - 1;
          let year = parseInt(parts[2], 10);
          if (year < 100) year += 2000;
          return new Date(year, month, day);
        }
        return new Date(0);
      };

      dateArray.forEach(dStr => {
        const dObj = parseDateStr(dStr);
        const diff = Math.abs(now - dObj);
        if (diff < minDiff) {
          minDiff = diff;
          closestDate = dStr;
        }
      });
      return closestDate;
    }

    function goHome() {
      currentTab = getClosestOrCurrentDate(dates);
      renderCurrentTab();
    }
/* ▲▲▲ KẾT THÚC KHỐI [HOME-NAV] ▲▲▲ */
/* ▼▼▼ KHỐI [HOME-MATCH-OPS] · Thao tác trận trong ngày: đổi kèo, thêm/xóa/sửa trận, tích nộp ▼▼▼ BẮT ĐẦU */
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
/* ▲▲▲ KẾT THÚC KHỐI [HOME-MATCH-OPS] ▲▲▲ */
/* ▼▼▼ KHỐI [HOME-KEO-HELPERS] · Hàm hỗ trợ: danh sách VĐV màu + giá trị kèo ▼▼▼ BẮT ĐẦU */
    function generateVdvOptionsHtml(selectedValue, filterList = null) {
      const listToRender = filterList || vdvs;
      return listToRender.map((v) => {
        const i = vdvs.indexOf(v);
        const color = i !== -1 ? VDV_COLORS[i % VDV_COLORS.length] : "#1e293b";
        const isSelected = selectedValue === v ? 'selected' : '';
        return renderComponent('home.vdv-option', {
          v,
          isSelected,
          color
        });
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
/* ▲▲▲ KẾT THÚC KHỐI [HOME-KEO-HELPERS] ▲▲▲ */
/* ▼▼▼ KHỐI [HOME-DAYTAB] · Bảng thống kê trận pick của ngày ▼▼▼ BẮT ĐẦU */
    function renderSingleDayTab(container, dateStr) {
      const matches = matchesData[dateStr] || [];
      const currentMode = dateKeoMode[dateStr] || "default";

      let html = renderComponent('home.day-tab', {
        dateStr,
        freeKeoHeader: (currentMode === 'free' ? '<th style="width: 120px;" class="th-money">MỆNH GIÁ THẮNG/THUA</th>' : ''),
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
        
        let keo1 = 0;
        let keo2 = 0;

        let { winAmt, loseAmt } = getKeoValues(currentMode, m);

        if (!isNaN(s1) && !isNaN(s2)) {
          let isHam = (s1 === 0 || s2 === 0);
          let effectiveWin = isHam ? (winAmt > 0 ? winAmt * 2 : 0) : winAmt;
          let effectiveLose = isHam ? loseAmt * 2 : loseAmt;

          if (s1 > s2) { keo1 = effectiveWin; keo2 = effectiveLose; } 
          else if (s2 > s1) { keo1 = effectiveLose; keo2 = effectiveWin; } 
          else { keo1 = 0; keo2 = 0; }
        }

        const score1Inner = renderComponent('home.day-tab-input-1', {
          m_score1: (m.score1 || ''),
          dateStr,
          idx
        });

        const score2Inner = renderComponent('home.day-tab-input-2', {
          m_score2: (m.score2 || ''),
          dateStr,
          idx
        });

        const c1_p1_color = m.c1_p1 ? VDV_COLORS[vdvs.indexOf(m.c1_p1) % VDV_COLORS.length] : "#334155";
        const c1_p2_color = m.c1_p2 ? VDV_COLORS[vdvs.indexOf(m.c1_p2) % VDV_COLORS.length] : "#334155";
        const c2_p1_color = m.c2_p1 ? VDV_COLORS[vdvs.indexOf(m.c2_p1) % VDV_COLORS.length] : "#334155";
        const c2_p2_color = m.c2_p2 ? VDV_COLORS[vdvs.indexOf(m.c2_p2) % VDV_COLORS.length] : "#334155";

        let customKeoInputHtml = "";
        if (currentMode === 'free') {
          customKeoInputHtml = renderComponent('home.day-tab-td-1', {
            m_customWin_or_default: (m.customWin !== undefined ? m.customWin : winAmt),
            dateStr,
            idx,
            m_customLose_or_default: (m.customLose !== undefined ? m.customLose : loseAmt)
          });
        }

        html += renderComponent('home.day-tab-tr-1', {
          dateStr,
          idx,
          m_id: m.id,
          c1_p1_color,
          generateVdvOptionsHtml_m_c1_p1: (generateVdvOptionsHtml(m.c1_p1)),
          c1_p2_color,
          generateVdvOptionsHtml_m_c1_p2: (generateVdvOptionsHtml(m.c1_p2)),
          c2_p1_color,
          generateVdvOptionsHtml_m_c2_p1: (generateVdvOptionsHtml(m.c2_p1)),
          c2_p2_color,
          generateVdvOptionsHtml_m_c2_p2: (generateVdvOptionsHtml(m.c2_p2)),
          score1Inner,
          score2Inner,
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
/* ▼▼▼ KHỐI [HOME-ABSENT] · VĐV XIN NGHỈ ▼▼▼ BẮT ĐẦU */
    const ABSENT_COUNT_OPTIONS = [0, 1, 2, 3, 4, 5];

    function escAbsentAttr(str) {
      return String(str == null ? '' : str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function escAbsentJs(str) {
      return String(str == null ? '' : str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }

    function getDayStatusObj(dateStr, create) {
      let o = paymentStatus[dateStr];
      if (!o || typeof o !== 'object') {
        if (!create) return null;
        o = (o === undefined || o === null || o === false) ? {} : { paid: o };
        paymentStatus[dateStr] = o;
      }
      return o;
    }

    function getAbsentInfo(dateStr) {
      const o = getDayStatusObj(dateStr, false) || {};
      let players = Array.isArray(o.absentPlayers) ? o.absentPlayers.map(x => x || '') : [];
      let count = parseInt(o.absentCount);
      if (isNaN(count)) count = players.filter(Boolean).length;
      while (players.length < count) players.push('');
      if (players.length > count) players = players.slice(0, count);
      return { count: count, players: players, status: o.absentStatusMap || {} };
    }

    function getAbsentFineMap(dateStr) {
      const info = getAbsentInfo(dateStr);
      const valid = new Set(vdvs);
      const map = {};
      info.players.forEach(name => {
        if (!name || !valid.has(name)) return;
        map[name] = (info.status[name] === 'excused') ? 0 : -ABSENT_FINE_K;
      });
      return map;
    }

    function persistAbsentChange() {
      saveDataToFirestore();
      renderCurrentTab();
    }

    function setAbsentCount(dateStr, val) {
      const n = Math.max(0, parseInt(val) || 0);
      const o = getDayStatusObj(dateStr, true);
      const info = getAbsentInfo(dateStr);
      let players = info.players.slice(0, n);
      while (players.length < n) players.push('');
      o.absentCount = n;
      o.absentPlayers = players;
      const status = o.absentStatusMap || {};
      Object.keys(status).forEach(k => { if (!players.includes(k)) delete status[k]; });
      o.absentStatusMap = status;
      persistAbsentChange();
    }

    function setAbsentPlayerSlot(dateStr, slotIdx, name) {
      const o = getDayStatusObj(dateStr, true);
      const info = getAbsentInfo(dateStr);
      const players = info.players.slice();
      if (slotIdx < 0 || slotIdx >= players.length) return;
      if (name && players.some((p, i) => i !== slotIdx && p === name)) {
        alert("VĐV này đã được chọn nghỉ ở ô khác!");
        renderCurrentTab();
        return;
      }
      const oldName = players[slotIdx];
      players[slotIdx] = name || '';
      o.absentCount = info.count;
      o.absentPlayers = players;
      const status = o.absentStatusMap || {};
      if (oldName && oldName !== name && !players.includes(oldName)) delete status[oldName];
      if (name && !status[name]) status[name] = 'unexcused';
      o.absentStatusMap = status;
      persistAbsentChange();
    }

    function setAbsentStatus(dateStr, slotIdx, statusValue) {
      const o = getDayStatusObj(dateStr, true);
      const info = getAbsentInfo(dateStr);
      const playerName = info.players[slotIdx];
      if (!o.absentStatusMap) o.absentStatusMap = {};
      if (playerName) {
        o.absentStatusMap[playerName] = (statusValue === 'excused') ? 'excused' : 'unexcused';
      }
      persistAbsentChange();
    }

    function buildAbsentSelectorRow(dateStr, colspan) {
      const info = getAbsentInfo(dateStr);
      const d = escAbsentJs(dateStr);
      const names = Array.from(new Set(vdvs));

      const countOpts = ABSENT_COUNT_OPTIONS.slice();
      if (!countOpts.includes(info.count)) { countOpts.push(info.count); countOpts.sort((a, b) => a - b); }
      const countSelect = renderComponent('home.absent-select-row-select-1', {
        d,
        countOpts_rows: (countOpts.map(n => renderComponent('home.absent-select-row-option-1', {
          n,
          selected_info_count_n: (info.count === n ? 'selected' : ''),
          if_n_0: (n === 0 ? 'Không có VĐV nghỉ' : n + ' VĐV nghỉ')
        })).join(''))
      });

      const slots = info.players.map((cur, i) => {
        const opts = names.map(nm => {
          const idx = vdvs.indexOf(nm);
          const color = idx !== -1 ? VDV_COLORS[idx % VDV_COLORS.length] : "#1e293b";
          const taken = info.players.some((p, j) => j !== i && p === nm);
          return renderComponent('home.absent-select-row-option-3', {
            escAbsentAttr_nm: (escAbsentAttr(nm)),
            selected_cur_nm: (cur === nm ? 'selected' : ''),
            if_taken: (taken ? 'disabled' : ''),
            color,
            nm
          });
        }).join('');

        const isUnexcused = (info.status[cur] !== 'excused');
        const fineColor = isUnexcused ? '#dc2626' : '#16a34a';

        return renderComponent('home.absent-select-row-option-2', {
          d,
          i,
          i_plus1: (i + 1),
          opts,
          color: cur ? VDV_COLORS[vdvs.indexOf(cur) % VDV_COLORS.length] : '#334155',
          fine_color: fineColor,
          selected_unexcused: (isUnexcused ? 'selected' : ''),
          selected_excused: (!isUnexcused ? 'selected' : '')
        });
      }).join('');

      return renderComponent('home.absent-select-row', {
        colspan,
        countSelect,
        slots
      });
    }
/* ▲▲▲ KẾT THÚC KHỐI [HOME-ABSENT] ▲▲▲ */
/* ▼▼▼ KHỐI [HOME-SUMMARY] · Bảng Tổng Hợp Ngày (Cập nhật Note theo Trạng thái Checkbox Thực tế) ▼▼▼ BẮT ĐẦU */
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

      let sumBringBack = 0, sumThucThu = 0, sumAmThucTe = 0, sumFine = 0;
      const fineMap = getAbsentFineMap(dateStr);
      let summaryRowsHtml = "";

      const uniqueVdvs = Array.from(new Set(vdvs));

      uniqueVdvs.forEach((v) => {
        const st = stats[v];
        const isAbsent = Object.prototype.hasOwnProperty.call(fineMap, v);
        
        if (st && (st.played > 0 || isAbsent)) {
          const payKey = `${dateStr}_${v}`;
          const isPaid = paymentStatus[payKey] || false;
          const vIndex = vdvs.indexOf(v);
          const vColor = VDV_COLORS[vIndex % VDV_COLORS.length];

          const fine = isAbsent ? fineMap[v] : 0;
          const netTotal = st.total + fine;
          sumFine += fine;

          let bringBack = 0;
          if (st.played >= 4 && netTotal > 0) { bringBack = netTotal; sumBringBack += bringBack; }
          if (netTotal < 0) { sumAmThucTe += netTotal; if (isPaid) sumThucThu += Math.abs(netTotal); }

          // --- LOGIC GÁN GHI CHÚ (NOTE) THEO YÊU CẦU ---
          let noteText = "";
          let noteStyle = "";
          let noteClass = "";

          if (isAbsent && st.played === 0) {
            if (fine < 0) {
              noteText = isPaid ? "Đã nộp phạt" : `Nghỉ không phép (-${ABSENT_FINE_K}K)`;
              noteStyle = isPaid ? "color:#16a34a; font-weight:bold;" : "color:#dc2626; font-weight:bold;";
            } else {
              noteText = "Nghỉ có phép (0K)";
              noteStyle = "color:#64748b;";
            }
          } else if (netTotal < 0) {
            // Trường hợp Âm (Tiền phạt/thua): Chưa nộp (Đỏ) / Đã nộp (Xanh)
            if (isPaid) {
              noteText = "Đã nộp";
              noteStyle = "color:#16a34a; font-weight:bold;";
            } else {
              noteText = "Chưa nộp";
              noteStyle = "color:#dc2626; font-weight:bold;";
            }
          } else if (netTotal > 0) {
            // Trường hợp Dương (Thắng/quỹ): Chưa nhận quỹ (Xanh nhạt/đậm) / Đã nhận (Xanh lá)
            if (isPaid) {
              noteText = "Đã nhận";
              noteStyle = "color:#16a34a; font-weight:bold;";
            } else {
              noteText = "Chưa nhận quỹ";
              noteStyle = "color:#0284c7; font-weight:bold;";
            }
          } else {
            if (isAbsent) {
              noteText = "Nghỉ phép";
              noteStyle = "color:#64748b;";
            }
          }

          const checkboxClass = isAdminVerified ? "checkbox-cell admin-active" : "checkbox-cell";

          summaryRowsHtml += renderComponent('home.summary-tr-1', {
            vColor,
            v,
            st_played: st.played,
            if_st_winK_0: (st.winK > 0 ? `+${st.winK}K` : '-'),
            if_st_loseK_0: (st.loseK < 0 ? `${st.loseK}K` : '-'),
            if_bringBack_0: (bringBack > 0 ? `+${bringBack}K` : '-'),
            if_st_total_0_class: (netTotal < 0 ? 'number-neg' : (netTotal > 0 ? 'number-pos' : 'number-zero')),
            st_total: (netTotal > 0 ? `+${netTotal}K` : `${netTotal}K`),
            checkboxClass,
            if_isPaid: (isPaid ? 'checked' : ''),
            payKey,
            if_isAdminVerified: (isAdminVerified ? '' : 'Cần đăng nhập Admin'),
            noteText,
            noteStyle,
            noteClass
          });
        }
      });

      let btcThuVeCalculated = sumAmThucTe + sumBringBack; 
      let quyCon = sumThucThu - Math.abs(btcThuVeCalculated);

      const pStatus = paymentStatus[dateStr];
      const currentBtcAdminOption = (pStatus && typeof pStatus === 'object' && pStatus.btcNoteAdminOption) 
        ? pStatus.btcNoteAdminOption 
        : "NO";
      const isYes = currentBtcAdminOption === "YES";

      let summaryTableHtml = renderComponent('home.summary', {
        summaryRowsHtml,
        buildAbsentSelectorRow_dateStr_9: (buildAbsentSelectorRow(dateStr, 8)),
        sumBringBack: (sumBringBack > 0 ? `+${sumBringBack}K` : `${sumBringBack}K`),
        btcThuVeCalculated: (btcThuVeCalculated > 0 ? `+${btcThuVeCalculated}K` : `${btcThuVeCalculated}K`),
        sumFine_color: (sumFine < 0 ? '#dc2626' : '#64748b'),
        sumFine_value: (sumFine < 0 ? `${sumFine}K` : '0K'),
        sumThucThu: `${sumThucThu}K`,
        dateStr,
        isYes_color: (isYes ? '#16a34a' : '#dc2626'),
        selected_isYes: (isYes ? 'selected' : ''),
        selected_not_isYes: (!isYes ? 'selected' : ''),
        quyCon: (quyCon > 0 ? `+${quyCon}K` : `${quyCon}K`)
      });

      container.innerHTML = matchesHtml + summaryTableHtml;
    }
/* ▲▲▲ KẾT THÚC KHỐI [HOME-SUMMARY] ▲▲▲ */

/* ████████████████ MODULE SETTING · SETTING ████████████████ */
/* ▼▼▼ KHỐI [SETTING-DATES] · Thêm / sửa tên / xóa ngày ▼▼▼ BẮT ĐẦU */
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
/* ▲▲▲ KẾT THÚC KHỐI [SETTING-DATES] ▲▲▲ */
/* ▼▼▼ KHỐI [SETTING-EXCEL] · Xuất dữ liệu Excel ▼▼▼ BẮT ĐẦU */
    function exportToExcel() {
      closeAllDropdowns();
      let wb = XLSX.utils.book_new();
      
      dates.forEach(d => {
        let matches = matchesData[d] || [];
        let rows = matches.map((m, idx) => ({
          "Trận": idx + 1,
          "Cặp 1 - VĐV 1": m.c1_p1 || "",
          "Cặp 1 - VĐV 2": m.c1_p2 || "",
          "Cặp 2 - VĐV 1": m.c2_p1 || "",
          "Cặp 2 - VĐV 2": m.c2_p2 || "",
          "Điểm 1": m.score1 || "",
          "Điểm 2": m.score2 || ""
        }));
        let ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, d.replace(/\//g, "-"));
      });

      XLSX.writeFile(wb, `CLB_Pickleball_CMTD_ThongKe.xlsx`);
    }
/* ▲▲▲ KẾT THÚC KHỐI [SETTING-EXCEL] ▲▲▲ */
/* ▼▼▼ KHỐI [SETTING-JSON-BACKUP] · Sao lưu / phục hồi file JSON ▼▼▼ BẮT ĐẦU */
    function backupDataJSON() {
      closeAllDropdowns();
      const backupData = autoBackupMemory || {
        players, vdvs, dates, matchesData, dateKeoMode, paymentStatus, 
        miniGame1Content, miniGame2Content, titlesConfig, mini1TeamA, mini1TeamB, mini1KeoMode, mini1Payment, mini1Sub1TeamA, mini1Sub1TeamB, mini1Sub1KeoMode, mini1Sub1Payment, miniGame1Sub1Matches, mini1Sub2TeamA, mini1Sub2TeamB, mini1Sub2KeoMode, mini1Sub2Payment, miniGame1Sub2Matches, 
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
/* ▲▲▲ KẾT THÚC KHỐI [SETTING-JSON-BACKUP] ▲▲▲ */

/* ████████████████ MODULE TONGHOP · TỔNG HỢP CÁC NGÀY ████████████████ */
/* ▼▼▼ KHỐI [TONGHOP-MENU] · Danh sách ngày trong menu ▼▼▼ BẮT ĐẦU */
    function renderDatesMenu() {
      const container = document.getElementById("datesMenuList");
      if (!container) return;
      container.innerHTML = dates.map(d => renderComponent('tonghop.dates-menu-item', {
        if_currentTab_d_class: (currentTab === d ? 'number-pos font-bold' : ''),
        d
      })).join('');
    }
/* ▲▲▲ KẾT THÚC KHỐI [TONGHOP-MENU] ▲▲▲ */
/* ▼▼▼ KHỐI [TONGHOP-TAB] · Bảng Tổng Hợp Các Ngày ▼▼▼ BẮT ĐẦU */
    function renderTongHopTab(container) {
      let activeDates = dates.filter(d => {
        const matches = matchesData[d] || [];
        const hasMatchData = matches.some(m => (!isNaN(parseInt(m.score1)) && !isNaN(parseInt(m.score2))) || m.c1_p1 || m.c1_p2 || m.c2_p1 || m.c2_p2);
        const pStatus = paymentStatus[d];
        const isYes = (pStatus && typeof pStatus === 'object' && pStatus.btcNoteAdminOption === "YES");
        return hasMatchData || isYes;
      });

      if (activeDates.length === 0) {
        container.innerHTML = renderComponent('tonghop.tab-head-div-1');
        return;
      }

      let vdvDayTotals = {};
      let vdvRowKeoSum = {};
      const uniqueVdvs = Array.from(new Set(vdvs));
      
      uniqueVdvs.forEach(v => {
        vdvDayTotals[v] = {};
        vdvRowKeoSum[v] = 0;
        activeDates.forEach(d => { vdvDayTotals[v][d] = 0; });
      });

      let dayTotalsSum = {};
      activeDates.forEach(d => { dayTotalsSum[d] = 0; });

      activeDates.forEach(d => {
        const matches = matchesData[d] || [];
        const currentMode = dateKeoMode[d] || "default";

        let statsDay = {};
        uniqueVdvs.forEach(v => { statsDay[v] = { played: 0, total: 0 }; });

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
              pair1.forEach(v => { if (statsDay[v]) { statsDay[v].played++; statsDay[v].total += effectiveWin; } });
              pair2.forEach(v => { if (statsDay[v]) { statsDay[v].played++; statsDay[v].total += effectiveLose; } });
            } else if (s2 > s1) {
              pair2.forEach(v => { if (statsDay[v]) { statsDay[v].played++; statsDay[v].total += effectiveWin; } });
              pair1.forEach(v => { if (statsDay[v]) { statsDay[v].played++; statsDay[v].total += effectiveLose; } });
            }
          }
        });

        const fineMapDay = getAbsentFineMap(d);
        uniqueVdvs.forEach(v => {
          if (Object.prototype.hasOwnProperty.call(fineMapDay, v)) {
            statsDay[v].total += fineMapDay[v];
            statsDay[v].absent = true;
          }
        });

        let sumAmDay = 0;
        let sumBringBackDay = 0;

        uniqueVdvs.forEach(v => {
          let st = statsDay[v];
          if (st.played > 0 || st.absent) {
            vdvDayTotals[v][d] = st.total;
            vdvRowKeoSum[v] += st.total;

            if (st.total < 0) {
              sumAmDay += st.total;
            } else if (st.played >= 4 && st.total > 0) {
              sumBringBackDay += st.total;
            }
          }
        });

        const pStatus = paymentStatus[d];
        const isYes = (pStatus && typeof pStatus === 'object' && pStatus.btcNoteAdminOption === "YES");

        if (isYes) {
          dayTotalsSum[d] = sumAmDay - sumBringBackDay;
        } else {
          dayTotalsSum[d] = 0;
        }
      });

      let grandTotalAllDays = 0;

      let html = renderComponent('tonghop.tab-head', {
        activeDates_rows: (activeDates.map(d => `<th>NGÀY ${d}</th>`).join(''))
      });

      uniqueVdvs.forEach((v, index) => {
        let dayCells = activeDates.map(d => {
          let val = vdvDayTotals[v][d];
          let cls = val > 0 ? 'number-pos' : (val < 0 ? 'number-neg' : 'number-zero');
          let displayVal = val !== 0 ? (val > 0 ? `+${val}K` : `${val}K`) : '-';
          return `<td class="${cls}">${displayVal}</td>`;
        }).join('');

        let rowSum = vdvRowKeoSum[v];
        let totalCls = rowSum > 0 ? 'number-pos' : (rowSum < 0 ? 'number-neg' : 'number-zero');
        let vdvColor = VDV_COLORS[index % VDV_COLORS.length];

        html += renderComponent('tonghop.tab-head-tr-1', {
          vdvColor,
          v,
          dayCells,
          totalCls,
          rowSum_text: (rowSum !== 0 ? (rowSum > 0 ? `+${rowSum}K` : `${rowSum}K`) : '0K')
        });
      });

      let daySumCells = activeDates.map(d => {
        let val = dayTotalsSum[d];
        grandTotalAllDays += val;
        let cls = val < 0 ? 'number-neg' : (val > 0 ? 'number-pos' : 'number-zero');
        return renderComponent('tonghop.tab-head-td-1', {
          cls,
          val_text: (val !== 0 ? (val > 0 ? `+${val}K` : `${val}K`) : '0K')
        });
      }).join('');

      let grandTotalCls = grandTotalAllDays < 0 ? 'number-neg' : (grandTotalAllDays > 0 ? 'number-pos' : 'number-zero');

      html += renderComponent('tonghop.tab-head-tr-2', {
        daySumCells,
        grandTotalCls,
        grandTotalAllDays_text: (grandTotalAllDays !== 0 ? (grandTotalAllDays > 0 ? `+${grandTotalAllDays}K` : `${grandTotalAllDays}K`) : '0K')
      });

      container.innerHTML = html;
    }
/* ▲▲▲ KẾT THÚC KHỐI [TONGHOP-TAB] ▲▲▲ */

/* ████████████████ MODULE MINIGAME · MINIGAME - DÙNG CHUNG ████████████████ */
/* ▼▼▼ KHỐI [MINIGAME-COMMON-DATA] · Dữ liệu chung ▼▼▼ BẮT ĐẦU */
    let miniGame1Content = "Lịch Thi Đấu Team A & Team B Xoay V vòng.";
    let miniGame2Content = "Giải đấu Chia 2 Bảng A & B Thi đấu vòng tròn.";
    let activeGameEditing = 1;
/* ▲▲▲ KẾT THÚC KHỐI [MINIGAME-COMMON-DATA] ▲▲▲ */
/* ▼▼▼ KHỐI [MINIGAME-COMMON-FUNCS] · Hộp thoại thể lệ + kèo ▼▼▼ BẮT ĐẦU */
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
      if (mode === "k25") { winAmt = 0; loseAmt = -25; }
      else if (mode === "no_keo") { winAmt = 0; loseAmt = 0; }
      else if (mode === "free") {
        winAmt = matchObj && matchObj.customWin !== undefined ? parseInt(matchObj.customWin) : 5;
        loseAmt = matchObj && matchObj.customLose !== undefined ? parseInt(matchObj.customLose) : -15;
      }
      return { winAmt, loseAmt };
    }

    function renderKeoSelectDropdown(currentMode, onChangeFuncStr) {
      return renderComponent('common.keo-select', {
        onChangeFuncStr,
        selected_currentMode_default: (currentMode === 'default' ? 'selected' : ''),
        selected_currentMode_k25: (currentMode === 'k25' ? 'selected' : ''),
        selected_currentMode_no_keo: (currentMode === 'no_keo' ? 'selected' : ''),
        selected_currentMode_free: (currentMode === 'free' ? 'selected' : '')
      });
    }
/* ▲▲▲ KẾT THÚC KHỐI [MINIGAME-COMMON-FUNCS] ▲▲▲ */

/* ████████████████ MODULE MINIGAME1 · MINIGAME 1 ████████████████ */
/* ▼▼▼ KHỐI [MINIGAME1-TEAM-DATA] ▼▼▼ BẮT ĐẦU */
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
/* ▲▲▲ KẾT THÚC KHỐI [MINIGAME1-TEAM-DATA] ▲▲▲ */
/* ▼▼▼ KHỐI [MINIGAME1-TEAM-FUNCS] ▼▼▼ BẮT ĐẦU */
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
/* ▲▲▲ KẾT THÚC KHỐI [MINIGAME1-TEAM-FUNCS] ▲▲▲ */
/* ▼▼▼ KHỐI [MINIGAME1-TEAM-TAB] ▼▼▼ BẮT ĐẦU */
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
            teamBPair.forEach(v => { if (mini1Stats[v]) { mini1Stats[v].played++; mini1Stats[v].loseK += effWin; mini1Stats[v].total += effWin; } });
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
            noteText = isPaid ? "Đã nộp" : "Chưa nộp";
          } else if (st.total > 0) {
            noteText = isPaid ? "Đã nhận" : "Chưa nhận quỹ";
          }

          const checkboxClass = isAdminVerified ? "checkbox-cell admin-active" : "checkbox-cell";

          summaryRowsHtml1 += renderComponent('minigame1.team-tab-tr-1', {
            vColor,
            v,
            st_played: st.played,
            if_st_winK_0: (st.winK > 0 ? `+${st.winK}` : ''),
            if_st_loseK_0: (st.loseK < 0 ? st.loseK : ''),
            if_bringBack_0: (bringBack > 0 ? `+${bringBack}` : ''),
            if_st_total_0_class: (st.total < 0 ? 'number-neg' : (st.total > 0 ? 'number-pos' : 'number-zero')),
            st_total: (st.total > 0 ? `+${st.total}` : st.total),
            checkboxClass,
            if_isPaid: (isPaid ? 'checked' : ''),
            payKey,
            if_isAdminVerified: (isAdminVerified ? '' : 'Cần đăng nhập Admin'),
            noteText
          });
        }
      });

      let btcThuVeCalculated1 = sumAmThucTe1 + sumBringBack1; 
      let quyCon1 = sumThucThu1 - Math.abs(btcThuVeCalculated1);

      let html = renderComponent('minigame1.team-tab', {
        matchesPlayedCount, totalMatches, winCountA, totalScoreA,
        diffClass_totalScoreA: ((totalScoreA - totalScoreB) > 0 ? 'number-pos' : ((totalScoreA - totalScoreB) < 0 ? 'number-neg' : 'number-zero')),
        diffText_totalScoreA: ((totalScoreA - totalScoreB) > 0 ? `+${totalScoreA - totalScoreB}` : (totalScoreA - totalScoreB)),
        statusA, winCountB, totalScoreB,
        diffClass_totalScoreB: ((totalScoreB - totalScoreA) > 0 ? 'number-pos' : ((totalScoreB - totalScoreA) < 0 ? 'number-neg' : 'number-zero')),
        diffText_totalScoreB: ((totalScoreB - totalScoreA) > 0 ? `+${totalScoreB - totalScoreA}` : (totalScoreB - totalScoreA)),
        statusB,
        mini1TeamA_length: mini1TeamA.length,
        mini1TeamA_rows: (mini1TeamA.map((v, index) => {
          const idx = vdvs.indexOf(v);
          const color = idx !== -1 ? VDV_COLORS[idx % VDV_COLORS.length] : '#15803d';
          return renderComponent('minigame1.team-tab-div-1', { color, index_plus1: (index + 1), v, index });
        }).join('')),
        mini1TeamB_length: mini1TeamB.length,
        mini1TeamB_rows: (mini1TeamB.map((v, index) => {
          const idx = vdvs.indexOf(v);
          const color = idx !== -1 ? VDV_COLORS[idx % VDV_COLORS.length] : '#0369a1';
          return renderComponent('minigame1.team-tab-div-2', { color, index_plus1: (index + 1), v, index });
        }).join('')),
        titlesConfig_subMini1: titlesConfig.subMini1,
        renderKeoSelectDropdown: (renderKeoSelectDropdown(mini1KeoMode, 'changeMini1KeoMode')),
        freeKeoHeader: (mini1KeoMode === 'free' ? '<th style="width:100px;" class="th-money">MỆNH GIÁ</th>' : ''),
        miniGame1Matches_rows: (mini1TeamA.length > 0 && mini1TeamB.length > 0 ? miniGame1Matches.map((m, idx) => {
          let sA = parseInt(m.scoreA);
          let sB = parseInt(m.scoreB);
          let resText = "-";
          let matchStatusHtml = renderComponent('minigame1.team-tab-span-5');

          if (!isNaN(sA) && !isNaN(sB)) {
            matchStatusHtml = renderComponent('minigame1.team-tab-span-6');
            if (sA > sB) resText = "<span class='number-pos'>Đội A</span>";
            else if (sB > sA) resText = "<span style='color:#0284c7; font-weight:bold;'>Đội B</span>";
            else resText = "Hòa";
          }

          const colorA1 = m.a1 ? VDV_COLORS[vdvs.indexOf(m.a1) % VDV_COLORS.length] : "#334155";
          const colorA2 = m.a2 ? VDV_COLORS[vdvs.indexOf(m.a2) % VDV_COLORS.length] : "#334155";
          const colorB1 = m.b1 ? VDV_COLORS[vdvs.indexOf(m.b1) % VDV_COLORS.length] : "#334155";
          const colorB2 = m.b2 ? VDV_COLORS[vdvs.indexOf(m.b2) % VDV_COLORS.length] : "#334155";

          let customKeoCell1 = "";
          if (mini1KeoMode === 'free') {
            customKeoCell1 = renderComponent('minigame1.team-tab-td-1', {
              m_customWin_or_default: (m.customWin !== undefined ? m.customWin : 5), idx,
              m_customLose_or_default: (m.customLose !== undefined ? m.customLose : -15)
            });
          }

          return renderComponent('minigame1.team-tab-tr-2', {
            idx, m_id: m.id, m_category: m.category, colorA1,
            generateVdvOptionsHtml_m_a1_mini1TeamA: (generateVdvOptionsHtml(m.a1, mini1TeamA)),
            colorA2, generateVdvOptionsHtml_m_a2_mini1TeamA: (generateVdvOptionsHtml(m.a2, mini1TeamA)),
            m_scoreA: (m.scoreA ?? ''), m_scoreB: (m.scoreB ?? ''), colorB1,
            generateVdvOptionsHtml_m_b1_mini1TeamB: (generateVdvOptionsHtml(m.b1, mini1TeamB)),
            colorB2, generateVdvOptionsHtml_m_b2_mini1TeamB: (generateVdvOptionsHtml(m.b2, mini1TeamB)),
            customKeoCell1, matchStatusHtml, resText
          });
        }).join('') : ''),
        summaryRowsHtml1,
        sumBringBack1: (sumBringBack1 > 0 ? `+${sumBringBack1}` : sumBringBack1),
        btcThuVeCalculated1: (btcThuVeCalculated1 > 0 ? `+${btcThuVeCalculated1}` : btcThuVeCalculated1),
        sumThucThu1,
        quyCon1: (quyCon1 > 0 ? `+${quyCon1}` : quyCon1)
      });

      container.innerHTML = html;
    }
/* ▲▲▲ KẾT THÚC KHỐI [MINIGAME1-TEAM-TAB] ▲▲▲ */
/* ▼▼▼ KHỐI [MINIGAME1-SUB1-DATA] ▼▼▼ BẮT ĐẦU */
    let mini1Sub1TeamA = ["Tuấn La", "Phú Mỗ", "Tiến Thọ", "Châu Sĩ", "Long Diễn", "Vân Đình", "Minh Hạnh", "Cẩm Ly"];
    let mini1Sub1TeamB = ["Thành Sóc", "Trường Giang", "Trí Đỏ", "Lợi Trí", "Thanh Đàm", "Gà Tre", "Minh Vượng", "Hải Hà"];
    let mini1Sub1KeoMode = "default";
    let mini1Sub1Payment = {};
    let miniGame1Sub1Matches = [];
/* ▲▲▲ KẾT THÚC KHỐI [MINIGAME1-SUB1-DATA] ▲▲▲ */
/* ▼▼▼ KHỐI [MINIGAME1-SUB1-FUNCS] ▼▼▼ BẮT ĐẦU */
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
        { cat: "Đôi Nam",     a1: malesA[2], a2: femalesA[3], b1: malesB[2], b2: femalesB[3] },
        { cat: "Đôi Nam",     a1: malesA[0], a2: femalesA[4], b1: malesB[0], b2: femalesB[4] },
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
/* ▲▲▲ KẾT THÚC KHỐI [MINIGAME1-SUB1-FUNCS] ▲▲▲ */
/* ▼▼▼ KHỐI [MINIGAME1-SUB1-TAB] ▼▼▼ BẮT ĐẦU */
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
            noteText = isPaid ? "Đã nộp" : "Chưa nộp";
          } else if (st.total > 0) {
            noteText = isPaid ? "Đã nhận" : "Chưa nhận quỹ";
          }

          const checkboxClass = isAdminVerified ? "checkbox-cell admin-active" : "checkbox-cell";

          summaryRowsHtml += renderComponent('minigame1.sub1-tab-tr-1', {
            vColor, v, st_played: st.played,
            if_st_winK_0: (st.winK > 0 ? `+${st.winK}` : ''),
            if_st_loseK_0: (st.loseK < 0 ? st.loseK : ''),
            if_bringBack_0: (bringBack > 0 ? `+${bringBack}` : ''),
            if_st_total_0_class: (st.total < 0 ? 'number-neg' : (st.total > 0 ? 'number-pos' : 'number-zero')),
            st_total: (st.total > 0 ? `+${st.total}` : st.total),
            checkboxClass, if_isPaid: (isPaid ? 'checked' : ''), payKey,
            if_isAdminVerified: (isAdminVerified ? '' : 'Cần đăng nhập Admin'),
            noteText
          });
        }
      });

      let btcThuVeCalculated = sumAmThucTe + sumBringBack; 
      let quyCon = sumThucThu - Math.abs(btcThuVeCalculated);

      let html = renderComponent('minigame1.sub1-tab', {
        titlesConfig_subSub1: titlesConfig.subSub1,
        playedCount, totalM, winA, scoreAAll,
        diffClass_scoreAAll: ((scoreAAll - scoreBAll) > 0 ? 'number-pos' : ((scoreAAll - scoreBAll) < 0 ? 'number-neg' : 'number-zero')),
        diffText_scoreAAll: ((scoreAAll - scoreBAll) > 0 ? `+${scoreAAll - scoreBAll}` : (scoreAAll - scoreBAll)),
        statusA, winB, scoreBAll,
        diffClass_scoreBAll: ((scoreBAll - scoreAAll) > 0 ? 'number-pos' : ((scoreBAll - scoreAAll) < 0 ? 'number-neg' : 'number-zero')),
        diffText_scoreBAll: ((scoreBAll - scoreAAll) > 0 ? `+${scoreBAll - scoreAAll}` : (scoreBAll - scoreAAll)),
        statusB,
        mini1Sub1TeamA_length: mini1Sub1TeamA.length,
        mini1Sub1TeamA_rows: (mini1Sub1TeamA.map((v, index) => {
          const idx = vdvs.indexOf(v);
          const color = idx !== -1 ? VDV_COLORS[idx % VDV_COLORS.length] : '#15803d';
          return renderComponent('minigame1.sub1-tab-div-1', { color, index_plus1: (index + 1), v, index });
        }).join('')),
        mini1Sub1TeamB_length: mini1Sub1TeamB.length,
        mini1Sub1TeamB_rows: (mini1Sub1TeamB.map((v, index) => {
          const idx = vdvs.indexOf(v);
          const color = idx !== -1 ? VDV_COLORS[idx % VDV_COLORS.length] : '#0369a1';
          return renderComponent('minigame1.sub1-tab-div-2', { color, index_plus1: (index + 1), v, index });
        }).join('')),
        renderKeoSelectDropdown: (renderKeoSelectDropdown(mini1Sub1KeoMode, 'changeSub1KeoMode')),
        freeKeoHeader: (mini1Sub1KeoMode === 'free' ? '<th style="width:100px;" class="th-money">MỆNH GIÁ</th>' : ''),
        miniGame1Sub1Matches_rows: (mini1Sub1TeamA.length > 0 && mini1Sub1TeamB.length > 0 ? miniGame1Sub1Matches.map((m, idx) => {
          let sA = parseInt(m.scoreA);
          let sB = parseInt(m.scoreB);
          let resText = "-";
          let matchStatusHtml = renderComponent('minigame1.sub1-tab-span-5');

          if (!isNaN(sA) && !isNaN(sB)) {
            matchStatusHtml = renderComponent('minigame1.sub1-tab-span-6');
            if (sA > sB) resText = "<span class='number-pos'>Đội A</span>";
            else if (sB > sA) resText = "<span style='color:#0284c7; font-weight:bold;'>Đội B</span>";
            else resText = "Hòa";
          }

          const colorA1 = m.a1 ? VDV_COLORS[vdvs.indexOf(m.a1) % VDV_COLORS.length] : "#334155";
          const colorA2 = m.a2 ? VDV_COLORS[vdvs.indexOf(m.a2) % VDV_COLORS.length] : "#334155";
          const colorB1 = m.b1 ? VDV_COLORS[vdvs.indexOf(m.b1) % VDV_COLORS.length] : "#334155";
          const colorB2 = m.b2 ? VDV_COLORS[vdvs.indexOf(m.b2) % VDV_COLORS.length] : "#334155";

          let customKeoCell = "";
          if (mini1Sub1KeoMode === 'free') {
            customKeoCell = renderComponent('minigame1.sub1-tab-td-1', {
              m_customWin_or_default: (m.customWin !== undefined ? m.customWin : 5), idx,
              m_customLose_or_default: (m.customLose !== undefined ? m.customLose : -15)
            });
          }

          return renderComponent('minigame1.sub1-tab-tr-2', {
            m_id: m.id, m_category: m.category, colorA1, idx,
            generateVdvOptionsHtml_m_a1_mini1Sub1TeamA: (generateVdvOptionsHtml(m.a1, mini1Sub1TeamA)),
            colorA2, generateVdvOptionsHtml_m_a2_mini1Sub1TeamA: (generateVdvOptionsHtml(m.a2, mini1Sub1TeamA)),
            m_scoreA: (m.scoreA ?? ''), m_scoreB: (m.scoreB ?? ''), colorB1,
            generateVdvOptionsHtml_m_b1_mini1Sub1TeamB: (generateVdvOptionsHtml(m.b1, mini1Sub1TeamB)),
            colorB2, generateVdvOptionsHtml_m_b2_mini1Sub1TeamB: (generateVdvOptionsHtml(m.b2, mini1Sub1TeamB)),
            customKeoCell, matchStatusHtml, resText
          });
        }).join('') : ''),
        summaryRowsHtml,
        sumBringBack: (sumBringBack > 0 ? `+${sumBringBack}` : sumBringBack),
        btcThuVeCalculated: (btcThuVeCalculated > 0 ? `+${btcThuVeCalculated}` : btcThuVeCalculated),
        sumThucThu,
        quyCon: (quyCon > 0 ? `+${quyCon}` : quyCon)
      });

      container.innerHTML = html;
    }
/* ▲▲▲ KẾT THÚC KHỐI [MINIGAME1-SUB1-TAB] ▲▲▲ */
/* ▼▼▼ KHỐI [MINIGAME1-SUB2-DATA] ▼▼▼ BẮT ĐẦU */
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
/* ▲▲▲ KẾT THÚC KHỐI [MINIGAME1-SUB2-DATA] ▲▲▲ */
/* ▼▼▼ KHỐI [MINIGAME1-SUB2-FUNCS] ▼▼▼ BẮT ĐẦU */
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
        "nam_1": malesA[0], "nam_2": malesA[1], "nam_3": malesA[2], "nam_4": malesA[3], "nam_5": malesA[4],
        "nu_1": femalesA[0], "nu_2": femalesA[1], "nu_1_doi": femalesB[0] || femalesA[0], "nu_2_doi": femalesB[1] || femalesA[1]
      };
    };

    function generateDynamicSub2Matches() {
      const currentRoster = window.getCurrentRoster ? window.getCurrentRoster() : {};
      if (!miniGame1Sub2Matches || miniGame1Sub2Matches.length === 0) {
        miniGame1Sub2Matches = minigame2010Matches.map((match, idx) => ({
          id: match.id, code: match.code, category: match.type, group: match.group,
          a1: currentRoster[match.teamAKey] || "", a2: "", scoreA: "", scoreB: "",
          b1: currentRoster[match.teamBKey] || "", b2: "", customWin: 5, customLose: -15
        }));
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
        id: newId, category: "Đôi Nam Nữ", a1: "", a2: "", scoreA: "", scoreB: "", b1: "", b2: "", customWin: 5, customLose: -15
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
/* ▲▲▲ KẾT THÚC KHỐI [MINIGAME1-SUB2-FUNCS] ▲▲▲ */
/* ▼▼▼ KHỐI [MINIGAME1-SUB2-TAB] ▼▼▼ BẮT ĐẦU */
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
            noteText = isPaid ? "Đã nộp" : "Chưa nộp";
          } else if (st.total > 0) {
            noteText = isPaid ? "Đã nhận" : "Chưa nhận quỹ";
          }

          const checkboxClass = isAdminVerified ? "checkbox-cell admin-active" : "checkbox-cell";

          summaryRowsHtml2 += renderComponent('minigame1.sub2-tab-tr-1', {
            vColor, v, st_played: st.played,
            if_st_winK_0: (st.winK > 0 ? `+${st.winK}` : ''),
            if_st_loseK_0: (st.loseK < 0 ? st.loseK : ''),
            if_bringBack_0: (bringBack > 0 ? `+${bringBack}` : ''),
            if_st_total_0_class: (st.total < 0 ? 'number-neg' : (st.total > 0 ? 'number-pos' : 'number-zero')),
            st_total: (st.total > 0 ? `+${st.total}` : st.total),
            checkboxClass, if_isPaid: (isPaid ? 'checked' : ''), payKey,
            if_isAdminVerified: (isAdminVerified ? '' : 'Cần đăng nhập Admin'),
            noteText
          });
        }
      });

      let btcThuVeCalculated2 = sumAmThucTe2 + sumBringBack2; 
      let quyCon2 = sumThucThu2 - Math.abs(btcThuVeCalculated2);

      let html = renderComponent('minigame1.sub2-tab', {
        titlesConfig_subSub2: titlesConfig.subSub2,
        playedCount2, totalM2, winA2, scoreAAll2,
        diffClass_scoreAAll2: ((scoreAAll2 - scoreBAll2) > 0 ? 'number-pos' : ((scoreAAll2 - scoreBAll2) < 0 ? 'number-neg' : 'number-zero')),
        diffText_scoreAAll2: ((scoreAAll2 - scoreBAll2) > 0 ? `+${scoreAAll2 - scoreBAll2}` : (scoreAAll2 - scoreBAll2)),
        statusA2, winB2, scoreBAll2,
        diffClass_scoreBAll2: ((scoreBAll2 - scoreAAll2) > 0 ? 'number-pos' : ((scoreBAll2 - scoreAAll2) < 0 ? 'number-neg' : 'number-zero')),
        diffText_scoreBAll2: ((scoreBAll2 - scoreAAll2) > 0 ? `+${scoreBAll2 - scoreAAll2}` : (scoreBAll2 - scoreAAll2)),
        statusB2,
        mini1Sub2TeamA_length: mini1Sub2TeamA.length,
        mini1Sub2TeamA_rows: (mini1Sub2TeamA.map((v, index) => {
          const idx = vdvs.indexOf(v);
          const color = idx !== -1 ? VDV_COLORS[idx % VDV_COLORS.length] : '#15803d';
          return renderComponent('minigame1.sub2-tab-div-1', { color, index_plus1: (index + 1), v, index });
        }).join('')),
        mini1Sub2TeamB_length: mini1Sub2TeamB.length,
        mini1Sub2TeamB_rows: (mini1Sub2TeamB.map((v, index) => {
          const idx = vdvs.indexOf(v);
          const color = idx !== -1 ? VDV_COLORS[idx % VDV_COLORS.length] : '#0369a1';
          return renderComponent('minigame1.sub2-tab-div-2', { color, index_plus1: (index + 1), v, index });
        }).join('')),
        renderKeoSelectDropdown: (renderKeoSelectDropdown(mini1Sub2KeoMode, 'changeSub2KeoMode')),
        freeKeoHeader: (mini1Sub2KeoMode === 'free' ? '<th style="width:100px;" class="th-money">MỆNH GIÁ</th>' : ''),
        miniGame1Sub2Matches_rows: (mini1Sub2TeamA.length > 0 && mini1Sub2TeamB.length > 0 ? miniGame1Sub2Matches.map((m, idx) => {
          let sA = parseInt(m.scoreA);
          let sB = parseInt(m.scoreB);
          let resText = "-";
          let matchStatusHtml = renderComponent('minigame1.sub2-tab-span-5');

          if (!isNaN(sA) && !isNaN(sB)) {
            matchStatusHtml = renderComponent('minigame1.sub2-tab-span-6');
            if (sA > sB) resText = "<span class='number-pos'>Đội A</span>";
            else if (sB > sA) resText = "<span style='color:#0284c7; font-weight:bold;'>Đội B</span>";
            else resText = "Hòa";
          }

          const colorA1 = m.a1 ? VDV_COLORS[vdvs.indexOf(m.a1) % VDV_COLORS.length] : "#334155";
          const colorA2 = m.a2 ? VDV_COLORS[vdvs.indexOf(m.a2) % VDV_COLORS.length] : "#334155";
          const colorB1 = m.b1 ? VDV_COLORS[vdvs.indexOf(m.b1) % VDV_COLORS.length] : "#334155";
          const colorB2 = m.b2 ? VDV_COLORS[vdvs.indexOf(m.b2) % VDV_COLORS.length] : "#334155";

          let customKeoCell = "";
          if (mini1Sub2KeoMode === 'free') {
            customKeoCell = renderComponent('minigame1.sub2-tab-td-1', {
              m_customWin_or_default: (m.customWin !== undefined ? m.customWin : 5), idx,
              m_customLose_or_default: (m.customLose !== undefined ? m.customLose : -15)
            });
          }

          return renderComponent('minigame1.sub2-tab-tr-2', {
            idx, m_id: m.id, m_category: m.category, colorA1,
            generateVdvOptionsHtml_m_a1_mini1Sub2TeamA: (generateVdvOptionsHtml(m.a1, mini1Sub2TeamA)),
            colorA2, generateVdvOptionsHtml_m_a2_mini1Sub2TeamA: (generateVdvOptionsHtml(m.a2, mini1Sub2TeamA)),
            m_scoreA: (m.scoreA ?? ''), m_scoreB: (m.scoreB ?? ''), colorB1,
            generateVdvOptionsHtml_m_b1_mini1Sub2TeamB: (generateVdvOptionsHtml(m.b1, mini1Sub2TeamB)),
            colorB2, generateVdvOptionsHtml_m_b2_mini1Sub2TeamB: (generateVdvOptionsHtml(m.b2, mini1Sub2TeamB)),
            customKeoCell, matchStatusHtml, resText
          });
        }).join('') : ''),
        summaryRowsHtml2,
        sumBringBack2: (sumBringBack2 > 0 ? `+${sumBringBack2}` : sumBringBack2),
        btcThuVeCalculated2: (btcThuVeCalculated2 > 0 ? `+${btcThuVeCalculated2}` : btcThuVeCalculated2),
        sumThucThu2,
        quyCon2: (quyCon2 > 0 ? `+${quyCon2}` : quyCon2)
      });

      container.innerHTML = html;
    }
/* ▲▲▲ KẾT THÚC KHỐI [MINIGAME1-SUB2-TAB] ▲▲▲ */

/* ████████████████ MODULE MINIGAME2 · MINIGAME 2 ████████████████ */
/* ▼▼▼ KHỐI [MINIGAME2-DATA] ▼▼▼ BẮT ĐẦU */
    let mini2PairsA = [];
    let mini2PairsB = [];
    let mini2MatchesA = [];
    let mini2MatchesB = [];
    let mini2Knockout = {
      bkc1: { p1: "Nhất A", p2: "Nhì B", s1: "", s2: "" },
      bkc2: { p1: "Nhất B", p2: "Nhì A", s1: "", s2: "" },
      rank34: { p1: "Thua BK1", p2: "Thua BK2", s1: "", s2: "" },
      final: { p1: "Thắng BK1", p2: "Thắng BK2", s1: "", s2: "" },
      champion: "", runnerUp: "", thirdPlace: ""
    };
    let mini2Tour1Content = "Nội dung chi tiết và lịch thi đấu của Giải Đấu Bổ Sung 1.";
    let mini2Tour2Content = "Nội dung chi tiết và lịch thi đấu của Giải Đấu Bổ Sung 2.";
    let mini2KeoMode = "default";
    let mini2Payment = {};
/* ▲▲▲ KẾT THÚC KHỐI [MINIGAME2-DATA] ▲▲▲ */
/* ▼▼▼ KHỐI [MINIGAME2-FUNCS] ▼▼▼ BẮT ĐẦU */
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
          matches.push({ id: matchId++, pair1Index: i, pair2Index: j, score1: "", score2: "", customWin: 5, customLose: -15 });
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
      let stats = pairs.map((p, idx) => ({ index: idx, name: p.name, points: 0, scoreFor: 0, scoreAgainst: 0, diff: 0 }));
      let headToHead = {};
      for (let i = 0; i < pairs.length; i++) { headToHead[i] = {}; }

      matches.forEach(m => {
        let s1 = parseInt(m.score1);
        let s2 = parseInt(m.score2);
        if (!isNaN(s1) && !isNaN(s2)) {
          let idx1 = m.pair1Index;
          let idx2 = m.pair2Index;

          if (stats[idx1] && stats[idx2]) {
            stats[idx1].scoreFor += s1; stats[idx1].scoreAgainst += s2;
            stats[idx2].scoreFor += s2; stats[idx2].scoreAgainst += s1;

            if (s1 > s2) {
              stats[idx1].points += 1;
              headToHead[idx1][idx2] = 1; headToHead[idx2][idx1] = -1;
            } else if (s2 > s1) {
              stats[idx2].points += 1;
              headToHead[idx2][idx1] = 1; headToHead[idx1][idx2] = -1;
            }
          }
        }
      });

      stats.forEach(s => { s.diff = s.scoreFor - s.scoreAgainst; });
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
/* ▲▲▲ KẾT THÚC KHỐI [MINIGAME2-FUNCS] ▲▲▲ */
/* ▼▼▼ KHỐI [MINIGAME2-TOUR] ▼▼▼ BẮT ĐẦU */
    function renderMiniGame2Tour1Tab(container) {
      container.innerHTML = renderComponent('minigame2.tour1-tab', {
        titlesConfig_subTour1: titlesConfig.subTour1, mini2Tour1Content
      });
    }

    function saveTour1Content() {
      const val = document.getElementById("tour1Input").value;
      mini2Tour1Content = val;
      saveDataToFirestore();
      alert("✅ Đã cập nhật thành công Giải Đấu Bổ Sung 1!");
      renderCurrentTab();
    }

    function renderMiniGame2Tour2Tab(container) {
      container.innerHTML = renderComponent('minigame2.tour2-tab', {
        titlesConfig_subTour2: titlesConfig.subTour2, mini2Tour2Content
      });
    }

    function saveTour2Content() {
      const val = document.getElementById("tour2Input").value;
      mini2Tour2Content = val;
      saveDataToFirestore();
      alert("✅ Đã cập nhật thành công Giải Đấu Bổ Sung 2!");
      renderCurrentTab();
    }
/* ▲▲▲ KẾT THÚC KHỐI [MINIGAME2-TOUR] ▲▲▲ */
/* ▼▼▼ KHỐI [MINIGAME2-TAB] ▼▼▼ BẮT ĐẦU */
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
            team1Members.forEach(ind => { if (mini2Stats[ind]) { mini2Stats[ind].played++; mini2Stats[ind].winK += winAmt; mini2Stats[ind].total += winAmt; } });
            team2Members.forEach(ind => { if (mini2Stats[ind]) { mini2Stats[ind].played++; mini2Stats[ind].loseK += loseAmt; mini2Stats[ind].total += loseAmt; } });
          } else if (s2 > s1) {
            team2Members.forEach(ind => { if (mini2Stats[ind]) { mini2Stats[ind].played++; mini2Stats[ind].winK += winAmt; mini2Stats[ind].total += winAmt; } });
            team1Members.forEach(ind => { if (mini2Stats[ind]) { mini2Stats[ind].played++; mini2Stats[ind].loseK += loseAmt; mini2Stats[ind].total += loseAmt; } });
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
            noteText = isPaid ? "Đã nộp" : "Chưa nộp";
          } else if (st.total > 0) {
            noteText = isPaid ? "Đã nhận" : "Chưa nhận quỹ";
          }

          const checkboxClass = isAdminVerified ? "checkbox-cell admin-active" : "checkbox-cell";

          summaryRowsHtml2 += renderComponent('minigame2.tab-tr-1', {
            indColor, indName, st_played: st.played,
            if_st_winK_0: (st.winK > 0 ? `+${st.winK}` : ''),
            if_st_loseK_0: (st.loseK < 0 ? st.loseK : ''),
            if_bringBack_0: (bringBack > 0 ? `+${bringBack}` : ''),
            if_st_total_0_class: (st.total < 0 ? 'number-neg' : (st.total > 0 ? 'number-pos' : 'number-zero')),
            st_total: (st.total > 0 ? `+${st.total}` : st.total),
            checkboxClass, if_isPaid: (isPaid ? 'checked' : ''), payKey,
            if_isAdminVerified: (isAdminVerified ? '' : 'Cần đăng nhập Admin'),
            noteText
          });
        }
      });

      let btcThuVeCalculated2 = sumAmThucTe2 + sumBringBack2; 
      let quyCon2 = sumThucThu2 - Math.abs(btcThuVeCalculated2);

      let html = renderComponent('minigame2.tab', {
        titlesConfig_subMini2: titlesConfig.subMini2,
        renderKeoSelectDropdown: (renderKeoSelectDropdown(mini2KeoMode, 'changeMini2KeoMode')),
        selected_mini2PairsA_length_4: (mini2PairsA.length === 4 ? 'selected' : ''),
        selected_mini2PairsA_length_5: (mini2PairsA.length === 5 ? 'selected' : ''),
        standingsA_rows: (standingsA.map((st, i) => renderComponent('minigame2.tab-tr-2', {
          i_plus1: (i + 1), st_index_mod5: (st.index % 5), st_name: st.name, st_points: st.points,
          if_st_diff_0_color: (st.diff > 0 ? '#16a34a' : (st.diff < 0 ? '#dc2626' : '#334155')),
          if_st_diff_0: (st.diff > 0 ? `+${st.diff}` : st.diff), st_index: st.index
        })).join('')),
        mini2KeoMode_colspan: (mini2KeoMode === 'free' ? 5 : 4),
        freeKeoHeader: (mini2KeoMode === 'free' ? '<th style="width:110px;" class="th-money">MỆNH GIÁ</th>' : ''),
        mini2MatchesA_rows: (mini2MatchesA.map((m, idx) => {
          let customKeoA = "";
          if (mini2KeoMode === 'free') {
            customKeoA = renderComponent('minigame2.tab-td-1', {
              m_customWin_or_default: (m.customWin !== undefined ? m.customWin : 5), idx,
              m_customLose_or_default: (m.customLose !== undefined ? m.customLose : -15)
            });
          }
          return renderComponent('minigame2.tab-tr-3', {
            m_id: m.id,
            if_mini2PairsA_m_pair1Index: (mini2PairsA[m.pair1Index] ? renderComponent('minigame2.tab-span-5', {
              m_pair1Index_mod5: (m.pair1Index % 5), mini2PairsA_m_pair1Index_name: (mini2PairsA[m.pair1Index].name)
            }) : ''),
            m_score1: (m.score1 ?? ''), idx, m_score2: (m.score2 ?? ''),
            if_mini2PairsA_m_pair2Index: (mini2PairsA[m.pair2Index] ? renderComponent('minigame2.tab-span-6', {
              m_pair2Index_mod5: (m.pair2Index % 5), mini2PairsA_m_pair2Index_name: (mini2PairsA[m.pair2Index].name)
            }) : ''),
            customKeoA
          });
        }).join('')),
        selected_mini2PairsB_length_4: (mini2PairsB.length === 4 ? 'selected' : ''),
        selected_mini2PairsB_length_5: (mini2PairsB.length === 5 ? 'selected' : ''),
        standingsB_rows: (standingsB.map((st, i) => renderComponent('minigame2.tab-tr-4', {
          i_plus1: (i + 1), st_index_mod5: (st.index % 5), st_name: st.name, st_points: st.points,
          if_st_diff_0_color: (st.diff > 0 ? '#16a34a' : (st.diff < 0 ? '#dc2626' : '#334155')),
          if_st_diff_0: (st.diff > 0 ? `+${st.diff}` : st.diff), st_index: st.index
        })).join('')),
        mini2MatchesB_rows: (mini2MatchesB.map((m, idx) => {
          let customKeoB = "";
          if (mini2KeoMode === 'free') {
            customKeoB = renderComponent('minigame2.tab-td-2', {
              m_customWin_or_default: (m.customWin !== undefined ? m.customWin : 5), idx,
              m_customLose_or_default: (m.customLose !== undefined ? m.customLose : -15)
            });
          }
          return renderComponent('minigame2.tab-tr-5', {
            m_id: m.id,
            if_mini2PairsB_m_pair1Index: (mini2PairsB[m.pair1Index] ? renderComponent('minigame2.tab-span-7', {
              m_pair1Index_mod5: (m.pair1Index % 5), mini2PairsB_m_pair1Index_name: (mini2PairsB[m.pair1Index].name)
            }) : ''),
            m_score1: (m.score1 ?? ''), idx, m_score2: (m.score2 ?? ''),
            if_mini2PairsB_m_pair2Index: (mini2PairsB[m.pair2Index] ? renderComponent('minigame2.tab-span-8', {
              m_pair2Index_mod5: (m.pair2Index % 5), mini2PairsB_m_pair2Index_name: (mini2PairsB[m.pair2Index].name)
            }) : ''),
            customKeoB
          });
        }).join('')),
        mini2Knockout_bkc1_p1: (mini2Knockout.bkc1.p1 || 'Nhất A'),
        mini2Knockout_bkc1_s1: (mini2Knockout.bkc1.s1 ?? ''),
        mini2Knockout_bkc1_s2: (mini2Knockout.bkc1.s2 ?? ''),
        mini2Knockout_bkc1_p2: (mini2Knockout.bkc1.p2 || 'Nhì B'),
        mini2Knockout_bkc2_p1: (mini2Knockout.bkc2.p1 || 'Nhất B'),
        mini2Knockout_bkc2_s1: (mini2Knockout.bkc2.s1 ?? ''),
        mini2Knockout_bkc2_s2: (mini2Knockout.bkc2.s2 ?? ''),
        mini2Knockout_bkc2_p2: (mini2Knockout.bkc2.p2 || 'Nhì A'),
        mini2Knockout_rank34_p1: (mini2Knockout.rank34.p1 || 'Thua BK1'),
        mini2Knockout_rank34_s1: (mini2Knockout.rank34.s1 ?? ''),
        mini2Knockout_rank34_s2: (mini2Knockout.rank34.s2 ?? ''),
        mini2Knockout_rank34_p2: (mini2Knockout.rank34.p2 || 'Thua BK2'),
        mini2Knockout_final_p1: (mini2Knockout.final.p1 || 'Thắng BK1'),
        mini2Knockout_final_s1: (mini2Knockout.final.s1 ?? ''),
        mini2Knockout_final_s2: (mini2Knockout.final.s2 ?? ''),
        mini2Knockout_final_p2: (mini2Knockout.final.p2 || 'Thắng BK2'),
        mini2Knockout_champion: (mini2Knockout.champion || ''),
        mini2Knockout_runnerUp: (mini2Knockout.runnerUp || ''),
        mini2Knockout_thirdPlace: (mini2Knockout.thirdPlace || ''),
        summaryRowsHtml2,
        sumBringBack2: (sumBringBack2 > 0 ? `+${sumBringBack2}` : sumBringBack2),
        btcThuVeCalculated2: (btcThuVeCalculated2 > 0 ? `+${btcThuVeCalculated2}` : btcThuVeCalculated2),
        sumThucThu2,
        quyCon2: (quyCon2 > 0 ? `+${quyCon2}` : quyCon2)
      });

      container.innerHTML = html;
    }
/* ▲▲▲ KẾT THÚC KHỐI [MINIGAME2-TAB] ▲▲▲ */

/* ████████████████ MODULE AUTOBACKUP · TỰ ĐỘNG SAO LƯU FIRESTORE ONLINE ████████████████ */
/* ▼▼▼ KHỐI [AUTOBACKUP-CONFIG] ▼▼▼ BẮT ĐẦU */
    const firebaseConfig = {
      apiKey: "AIzaSyCXxjGAHhAOtIo2DoqW6u8LW9NOUOI7PqY",
      authDomain: "pickleball-cmtd.firebaseapp.com",
      projectId: "pickleball-cmtd",
      storageBucket: "pickleball-cmtd.appspot.com",
      messagingSenderId: "648591152243",
      appId: "1:648591152243:web:3343caf2da821373070606"
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    const db = firebase.firestore();
    db.settings({ experimentalAutoDetectLongPolling: true });

    const docRef = db.collection("clubs").doc("cmtd_main_data");

    let autoBackupMemory = null;
/* ▲▲▲ KẾT THÚC KHỐI [AUTOBACKUP-CONFIG] ▲▲▲ */
/* ▼▼▼ KHỐI [AUTOBACKUP-FUNCS] ▼▼▼ BẮT ĐẦU */
    function listenToFirestore() {
      docRef.onSnapshot((doc) => {
        const statusEl = document.getElementById("cloudStatus");
        if (doc.exists) {
          const data = doc.data();
          if (data.players && data.players.length > 0) {
            players = data.players;
          } else if (data.vdvs && data.vdvs.length > 0) {
            players = data.vdvs.map((v, idx) => ({ id: idx + 1, name: v, gender: "Nam" }));
          }
          syncVdvsFromPlayers();

          if (data.titlesConfig) {
            titlesConfig = Object.assign(titlesConfig, data.titlesConfig);
          }
          updateNavbarTitles();

          dates = data.dates || [];
          matchesData = data.matchesData || {};
          dateKeoMode = data.dateKeoMode || {};
          paymentStatus = data.paymentStatus || {};
          miniGame1Content = data.miniGame1Content || miniGame1Content;
          miniGame2Content = data.miniGame2Content || miniGame2Content;
          
          if (data.mini1TeamA) mini1TeamA = data.mini1TeamA;
          if (data.mini1TeamB) mini1TeamB = data.mini1TeamB;
          if (data.mini1KeoMode) mini1KeoMode = data.mini1KeoMode;
          if (data.mini1Payment) mini1Payment = data.mini1Payment;

          if (data.mini1Sub1TeamA) mini1Sub1TeamA = data.mini1Sub1TeamA;
          if (data.mini1Sub1TeamB) mini1Sub1TeamB = data.mini1Sub1TeamB;
          if (data.mini1Sub1KeoMode) mini1Sub1KeoMode = data.mini1Sub1KeoMode;
          if (data.mini1Sub1Payment) mini1Sub1Payment = data.mini1Sub1Payment;

          if (data.miniGame1Sub1Matches && data.miniGame1Sub1Matches.length > 0) {
            miniGame1Sub1Matches = data.miniGame1Sub1Matches;
          } else {
            generateDynamicSub1Matches();
          }

          if (data.mini1Sub2TeamA) mini1Sub2TeamA = data.mini1Sub2TeamA;
          if (data.mini1Sub2TeamB) mini1Sub2TeamB = data.mini1Sub2TeamB;
          if (data.mini1Sub2KeoMode) mini1Sub2KeoMode = data.mini1Sub2KeoMode;
          if (data.mini1Sub2Payment) mini1Sub2Payment = data.mini1Sub2Payment;

          if (data.miniGame1Sub2Matches && data.miniGame1Sub2Matches.length > 0) {
            miniGame1Sub2Matches = data.miniGame1Sub2Matches;
          } else {
            generateDynamicSub2Matches();
          }

          if (data.miniGame1Matches && data.miniGame1Matches.length > 0) {
            miniGame1Matches = data.miniGame1Matches;
          } else {
            miniGame1Matches = DEFAULT_MINI1_DATA;
          }

          if (data.mini2PairsA) mini2PairsA = data.mini2PairsA;
          if (data.mini2PairsB) mini2PairsB = data.mini2PairsB;
          if (data.mini2MatchesA) mini2MatchesA = data.mini2MatchesA;
          if (data.mini2MatchesB) mini2MatchesB = data.mini2MatchesB;
          if (data.mini2Knockout) {
            mini2Knockout = Object.assign(mini2Knockout, data.mini2Knockout);
          }
          if (data.mini2Tour1Content) mini2Tour1Content = data.mini2Tour1Content;
          if (data.mini2Tour2Content) mini2Tour2Content = data.mini2Tour2Content;
          if (data.mini2KeoMode) mini2KeoMode = data.mini2KeoMode;
          if (data.mini2Payment) mini2Payment = data.mini2Payment;

          if (!mini2MatchesA || mini2MatchesA.length === 0) generateMini2MatchesForGroup('A');
          if (!mini2MatchesB || mini2MatchesB.length === 0) generateMini2MatchesForGroup('B');

          autoBackupMemory = JSON.parse(JSON.stringify(data));

          const validTabs = [...dates, "tonghop", "players", "minigame1", "minigame1_sub1", "minigame1_sub2", "minigame2", "minigame2_tour1", "minigame2_tour2"];
          if (!currentTab || !validTabs.includes(currentTab)) {
            currentTab = getClosestOrCurrentDate(dates);
          }
          statusEl.className = "cloud-status cloud-online";
          statusEl.innerHTML = "☁️ Tự Động Lưu (Firestore Online)";
          renderDatesMenu();
          renderCurrentTab();
        } else {
          initDefaultFirestore();
        }
      }, (error) => {
        console.error("Firestore error:", error);
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

      miniGame1Matches = DEFAULT_MINI1_DATA;
      generateDynamicSub1Matches();
      generateDynamicSub2Matches();
      generateMini2MatchesForGroup('A');
      generateMini2MatchesForGroup('B');
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

      const payload = { 
        players, vdvs, dates, matchesData, dateKeoMode, paymentStatus, 
        miniGame1Content, miniGame2Content, titlesConfig,
        mini1TeamA, mini1TeamB, mini1KeoMode, mini1Payment,
        mini1Sub1TeamA, mini1Sub1TeamB, mini1Sub1KeoMode, mini1Sub1Payment, miniGame1Sub1Matches, 
        mini1Sub2TeamA, mini1Sub2TeamB, mini1Sub2KeoMode, mini1Sub2Payment, miniGame1Sub2Matches,
        miniGame1Matches,
        mini2PairsA, mini2PairsB, mini2MatchesA, mini2MatchesB, mini2Knockout,
        mini2Tour1Content, mini2Tour2Content, mini2KeoMode, mini2Payment
      };

      autoBackupMemory = JSON.parse(JSON.stringify(payload));

      docRef.set(payload, { merge: true }).then(() => {
        if (statusEl) {
          statusEl.className = "cloud-status cloud-online";
          statusEl.innerHTML = "☁️ Tự Động Lưu (Firestore Online)";
        }
      }).catch((err) => {
        console.error("Lỗi khi tự động lưu dữ liệu:", err);
        if (statusEl) {
          statusEl.className = "cloud-status cloud-error";
          statusEl.innerHTML = "⚠ Lỗi kết nối tự động lưu!";
        }
      });
    }
/* ▲▲▲ KẾT THÚC KHỐI [AUTOBACKUP-FUNCS] ▲▲▲ */

/* ████████████████ MODULE CORE · LÕI HỆ THỐNG ████████████████ */
/* ▼▼▼ KHỐI [CORE-INIT] · Khởi động: window.onload ▼▼▼ BẮT ĐẦU */
    window.onload = async function() {
      try {
        await loadComponents();
      } catch (err) {
        showComponentError(err);
        return;
      }
      mountShell();

      document.addEventListener('click', closeAllDropdowns);
      
      setTimeout(() => {
        const statusEl = document.getElementById("cloudStatus");
        if (statusEl && statusEl.innerText.includes("Khởi Tạo")) {
          initDefaultFirestore();
        }
      }, 3000);

      listenToFirestore();
    };
/* ▲▲▲ KẾT THÚC KHỐI [CORE-INIT] ▲▲▲ */
