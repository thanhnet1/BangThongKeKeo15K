/* ==========================================================================
   CLB PICKLEBALL - CMTD · js/main.js — FILE XỬ LÝ CHÍNH DUY NHẤT.
   Giao diện (HTML) nằm trong thư mục components/.
   ========================================================================== */

/* ████████████████ MODULE CORE · NẠP COMPONENT HTML ████████████████ */
const COMPONENT_FILES = ['header', 'admin', 'autobackup', 'home', 'players', 'setting', 'tonghop', 'minigame1', 'minigame2', 'common'];
const COMPONENT_PARTS = {}; 

async function loadComponents() {
    await Promise.all(COMPONENT_FILES.map(async (name) => {
        const res = await fetch('components/' + name + '.html', { cache: 'no-cache' });
        if (!res.ok) throw new Error('Không tải được components/' + name + '.html (HTTP ' + res.status + ')');
        const text = (await res.text()).replace(/\r\n/g, '\n');
        const re = /<!-- \[PART: ([\w.\-]+)\] -->\n([\s\S]*?)\n<!-- \[\/PART\] -->/g;
        let m;
        while ((m = re.exec(text)) !== null) {
            COMPONENT_PARTS[name + '.' + m[1]] = m[2];
        }
    }));
}

function renderComponent(key, slots) {
    const tpl = COMPONENT_PARTS[key];
    if (tpl === undefined) {
        console.warn('Không tìm thấy component: ' + key);
        return '';
    }
    return tpl.replace(/\{\{(\w+)\}\}/g, (match, slotName) => 
        (slots && Object.prototype.hasOwnProperty.call(slots, slotName)) ? String(slots[slotName]) : match
    );
}

// KHỐI GỌI AN TOÀN TRÁNH LỖI DÒNG 2996 (MOUNT SHELL)
function mountShell() {
    // Danh sách các nút điều hướng chuẩn xác trên header
    const navItems = ['pickthu', 'tonghop', 'minigame1', 'minigame2', 'setting'];
    
    navItems.forEach(n => {
        const targetContainer = document.getElementById(`component-nav-${n}`);
        if (targetContainer) {
            try {
                const rendered = renderComponent(n + '.nav');
                if (rendered) targetContainer.innerHTML = rendered;
            } catch (e) {
                console.warn(`Không thể nạp component nav cho: ${n}`, e);
            }
        }
    });

    // Nạp nút Quản trị viên (Admin)
    const adminBtnContainer = document.getElementById('component-admin-button');
    if (adminBtnContainer) {
        try {
            const adminHtml = renderComponent('admin.button');
            if (adminHtml) adminBtnContainer.innerHTML = adminHtml;
        } catch (e) {
            console.warn('Lỗi nạp nút Admin', e);
        }
    }

    // Nạp trạng thái lưu trữ đám mây (Cloud Status)
    const cloudStatusContainer = document.getElementById('cloudStatus');
    if (cloudStatusContainer && !cloudStatusContainer.innerHTML.trim()) {
        try {
            const cloudHtml = renderComponent('autobackup.status');
            if (cloudHtml) cloudStatusContainer.outerHTML = cloudHtml;
        } catch (e) {
            console.warn('Lỗi nạp trạng thái Cloud', e);
        }
    }

    // Nạp các Modal ẩn hệ thống vào cuối body một cách an toàn (Tuyệt đối không gọi header.layout để tránh lặp giao diện)
    try {
        const modals = (renderComponent('common.game-modal') || '') + (renderComponent('players.modal') || '');
        if (modals) {
            document.body.insertAdjacentHTML('beforeend', modals);
        }
    } catch (e) {
        console.warn('Lỗi nạp Modal hệ thống', e);
    }
}

/* ████████████████ MODULE CORE · LÕI HỆ THỐNG ████████████████ */
let titlesConfig = {
    navMini1: "MINI GAME 1", subMini1: "Lịch Thi Đấu Team A & B",
    subSub1: "Minigame 20/10", subSub2: "Minigame 20/10 - 17 Trận",
    navMini2: "GIẢI ĐẤU MINI GAME 2", subMini2: "Giải Đấu Mini Game 2 (Chia Bảng A & B)",
    subTour1: "Giải Đấu Bổ Sung 1 (Nội Dung Khác)", subTour2: "Giải Đấu Bổ Sung 2 (Nội Dung Khác)"
};
let currentTab = "";

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
    if (e) e.stopPropagation();
    const targetMenu = document.getElementById(menuId);
    if (!targetMenu) return;
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

/* KHỞI ĐỘNG HỆ THỐNG */
window.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadComponents();
        mountShell();
        await loadDataFromFirestore();
        currentTab = getClosestOrCurrentDate(dates);
        renderDatesMenu();
        renderCurrentTab();
    } catch (e) {
        console.error("Lỗi khởi động ứng dụng:", e);
    }
});
