/* ==========================================================================
   CLB PICKLEBALL - CMTD · js/main.js — FILE XỬ LÝ CHÍNH DUY NHẤT.
   ========================================================================== */

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

// Hàm hỗ trợ tự động bọc thẻ màu sắc cho số Âm (Đỏ) và Dương (Xanh)
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

// KHỐI GỌI AN TOÀN TRÁNH LỖI DÒNG 2996 (MOUNT SHELL)
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

/* KHỞI ĐỘNG HỆ THỐNG */
window.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadComponents();
        mountShell();
        if (typeof loadDataFromFirestore === 'function') {
            await loadDataFromFirestore();
        }
    } catch (e) {
        console.error("Lỗi khởi động ứng dụng:", e);
    }
});
