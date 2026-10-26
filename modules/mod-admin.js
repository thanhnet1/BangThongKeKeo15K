const ADMIN_PASSCODE = "123456";
let isAdminVerified = false;

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
