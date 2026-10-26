const VDV_COLORS = [
    "#d97706", "#2563eb", "#059669", "#dc2626", "#7c3aed", 
    "#db2777", "#0284c7", "#15803d", "#b45309", "#4338ca", 
    "#c026d3", "#0d9488", "#ea580c", "#4f46e5"
];
let players = [
    { id: 1, name: "Tiến Thọ", gender: "Nam" }, { id: 2, name: "Châu Sĩ", gender: "Nam" },
    { id: 3, name: "Vân Đình", gender: "Nữ" }, { id: 4, name: "Cẩm Ly", gender: "Nữ" },
    { id: 5, name: "Phú Mỗ", gender: "Nam" }, { id: 6, name: "Hà Giấy", gender: "Nam" },
    { id: 7, name: "Long Diễn", gender: "Nam" }, { id: 8, name: "Tuấn La", gender: "Nam" },
    { id: 9, name: "Trí Đỏ", gender: "Nam" }, { id: 10, name: "Thành Sóc", gender: "Nam" },
    { id: 11, name: "Quỳnh Cool", gender: "Nữ" }, { id: 12, name: "Hải Hà", gender: "Nữ" },
    { id: 13, name: "Dũng Ngạc", gender: "Nam" }, { id: 14, name: "Lợi Trí", gender: "Nam" },
    { id: 15, name: "Thanh Đàm", gender: "Nam" }, { id: 16, name: "Điền Chèm", gender: "Nam" },
    { id: 17, name: "Minh Hạnh", gender: "Nữ" }, { id: 18, name: "Minh Vượng", gender: "Nam" },
    { id: 19, name: "Gà Tre", gender: "Nữ" }, { id: 20, name: "Trường Giang", gender: "Nam" }
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
    let html = `
    <div class="bg-white rounded-xl shadow-sm p-4 md:p-6 text-slate-800 border border-slate-200">
        <div class="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
            <div>
                <h2 class="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
                    <i class="fa-solid fa-users text-blue-600"></i> Quản Lý Danh Sách Pick Thủ CLB
                </h2>
                <p class="text-xs text-slate-500 mt-0.5">Danh sách các vận động viên đăng ký thi đấu chính thức</p>
            </div>
            <button onclick="openPlayerModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow transition">
                <i class="fa-solid fa-plus"></i> Thêm Pick Thủ
            </button>
        </div>
        <div class="smooth-scroll">
            <table class="w-full text-left border-collapse border border-slate-200" style="min-width: 100%;">
                <thead>
                    <tr class="bg-slate-50 text-slate-700 text-xs uppercase font-extrabold">
                        <th class="p-3 border border-slate-200 w-16 text-center">STT</th>
                        <th class="p-3 border border-slate-200 text-left pl-4">Tên Pick Thủ</th>
                        <th class="p-3 border border-slate-200 w-28 text-center">Giới tính</th>
                        <th class="p-3 border border-slate-200 text-center w-40">Thao Tác</th>
                    </tr>
                </thead>
                <tbody class="text-xs divide-y divide-slate-200">
                    ${players.map((p, index) => {
                        const color = VDV_COLORS[index % VDV_COLORS.length];
                        return `
                        <tr class="hover:bg-blue-50/60 transition">
                            <td class="p-2.5 border border-slate-200 text-center font-bold text-slate-500">${index + 1}</td>
                            <td class="p-2.5 border border-slate-200 text-left pl-4 font-extrabold" style="color: ${color}; font-size:12px;">
                                <span class="inline-block">${p.name}</span>
                            </td>
                            <td class="p-2.5 border border-slate-200 text-center">
                                <span class="px-2.5 py-1 text-[10px] rounded-full ${p.gender === 'Nam' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-pink-50 text-pink-700 border border-pink-200'} font-bold">
                                    ${p.gender}
                                </span>
                            </td>
                            <td class="p-2.5 border border-slate-200 text-center whitespace-nowrap">
                                <button onclick="editPlayer(${p.id})" class="text-blue-600 hover:text-blue-800 mr-3 font-bold text-xs inline-flex items-center gap-1">
                                    <i class="fa-solid fa-pen-to-square"></i> Sửa
                                </button>
                                <button onclick="deletePlayer(${p.id})" class="text-red-600 hover:text-red-800 font-bold text-xs inline-flex items-center gap-1">
                                    <i class="fa-solid fa-trash"></i> Xóa
                                </button>
                            </td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    </div>`;
    container.innerHTML = html;
}
