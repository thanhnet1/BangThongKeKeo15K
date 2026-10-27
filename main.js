/* ==========================================================================
   MAIN.JS - TRUNG TÂM ĐIỀU HƯỚNG, DỮ LIỆU & LOGIC HỆ THỐNG
   ========================================================================== */

// Hàm tiện ích để tải các thành phần HTML vào giao diện bất đồng bộ
async function loadComponent(id, file) {
    try {
        const response = await fetch(file);
        if (response.ok) {
            const html = await response.text();
            document.getElementById(id).innerHTML = html;
        }
    } catch (error) {
        console.error(`Không thể tải component ${file}:`, error);
    }
}

// Khởi động toàn bộ giao diện thành phần khi trang vừa tải xong
document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
        loadComponent("component-brand-title", "components/brand-title.html"),
        loadComponent("component-admin-button", "components/admin-button.html"),
        loadComponent("component-cloud-status", "components/cloud-status.html"),
        loadComponent("component-nav-home", "components/nav-home.html"),
        loadComponent("component-nav-pickthu", "components/nav-pickthu.html"),
        loadComponent("component-nav-setting", "components/nav-setting.html"),
        loadComponent("component-nav-tonghop", "components/nav-tonghop.html"),
        loadComponent("component-nav-minigame1", "components/nav-minigame1.html"),
        loadComponent("component-nav-minigame2", "components/nav-minigame2.html"),
        loadComponent("component-modal-game", "components/modal-game.html"),
        loadComponent("component-modal-player", "components/modal-player.html")
    ]);
    
    // Kích hoạt hệ thống khởi động sau khi tải xong thành phần
    initSystem();
});

/* --- DỮ LIỆU & BIẾN TOÀN CỤC --- */
let titlesConfig = {
    navMini1: "MINI GAME 1",
    subMini1: "Lịch Thi Đấu Team A & B",
    subSub1: "Minigame 20/10",
    subSub2: "Minigame 20/10 - 17 Trận",
    navMini2: "GIẢI ĐẤU MINI GAME 2",
    subMini2: "Giải Đấu Mini Game 2 (Chia Bảng A & B)",
    subTour1: "Giải Đấu Bổ Sung 1",
    subTour2: "Giải Đấu Bổ Sung 2"
};

let currentTab = "";
const ADMIN_PASSCODE = "123456";
let isAdminVerified = false;

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
let dates = [];
let matchesData = {};
let dateKeoMode = {};
let paymentStatus = {};
const ABSENT_FINE_K = 30;

let miniGame1Content = "Lịch Thi Đấu Team A & Team B Xoay Vòng.";
let miniGame2Content = "Giải đấu Chia 2 Bảng A & B Thi đấu vòng tròn.";
let activeGameEditing = 1;

function initSystem() {
    document.addEventListener('click', closeAllDropdowns);
    setTimeout(() => {
        const statusEl = document.getElementById("cloudStatus");
        if (statusEl && statusEl.innerText.includes("Khởi Tạo")) {
            initDefaultFirestore();
        }
    }, 3000);
    listenToFirestore();
}

/* --- ĐIỀU HƯỚNG & ROUTER --- */
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
    if (typeof renderDatesMenu === 'function') renderDatesMenu();
    renderCurrentTab();
}

function renderCurrentTab() {
    const content = document.getElementById("tabContent");
    if (!content) return;
    
    if (currentTab === "tonghop") {
        if (typeof renderTongHopTab === 'function') renderTongHopTab(content);
        else content.innerHTML = `<div class="card"><h3 class="card-title">BẢNG TỔNG HỢP</h3></div>`;
    } else if (currentTab === "players") {
        if (typeof renderPlayersTab === 'function') renderPlayersTab(content);
        else content.innerHTML = `<div class="card"><h3 class="card-title">QUẢN LÝ VĐV</h3></div>`;
    } else {
        if (typeof renderSingleDayTab === 'function') {
            renderSingleDayTab(content, currentTab);
        } else {
            content.innerHTML = `<div class="card"><h3 class="card-title">LỊCH THI ĐẤU NGÀY ${currentTab}</h3></div>`;
        }
    }
    updateAdminUIState();
    updateNavbarTitles();
}

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

function syncVdvsFromPlayers() {
    vdvs = players.map(p => p.name);
    const btn = document.getElementById("vdvCountBtn");
    if (btn) btn.innerText = players.length;
}

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

// --- Firebase & Tự động lưu ---
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

function listenToFirestore() {
    docRef.onSnapshot((doc) => {
        const statusEl = document.getElementById("cloudStatus");
        if (doc.exists) {
            const data = doc.data();
            if (data.players) players = data.players;
            syncVdvsFromPlayers();
            dates = data.dates || [];
            matchesData = data.matchesData || {};
            currentTab = getClosestOrCurrentDate(dates);
            if (statusEl) {
                statusEl.className = "cloud-status cloud-online";
                statusEl.innerHTML = "☁️ Tự Động Lưu (Firestore Online)";
            }
            renderCurrentTab();
        } else {
            initDefaultFirestore();
        }
    });
}

function initDefaultFirestore() {
    const nowObj = new Date();
    const todayStr = `${nowObj.getDate()}/${nowObj.getMonth() + 1}/${nowObj.getFullYear().toString().substr(-2)}`;
    dates = [todayStr];
    matchesData = {};
    matchesData[todayStr] = [
        { id: 1, c1_p1: "Trí Đỏ", c1_p2: "Long Diễn", c2_p1: "Tuấn La", c2_p2: "Thành Sóc", score1: "11", score2: "9" }
    ];
    currentTab = todayStr;
    syncVdvsFromPlayers();
    renderCurrentTab();
}

function saveDataToFirestore() {
    const statusEl = document.getElementById("cloudStatus");
    if (statusEl) {
        statusEl.className = "cloud-status cloud-syncing";
        statusEl.innerHTML = "⏳ Đang tự động lưu...";
    }
    syncVdvsFromPlayers();
    const payload = { players, vdvs, dates, matchesData, paymentStatus };
    docRef.set(payload, { merge: true }).then(() => {
        if (statusEl) {
            statusEl.className = "cloud-status cloud-online";
            statusEl.innerHTML = "☁️ Tự Động Lưu (Firestore Online)";
        }
    });
}
