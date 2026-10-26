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
        return `<option value="${v}" ${isSelected} style="color: ${color}; font-weight: 800; font-size: 11px;">${v}</option>`;
    }).join('');
}

function getKeoValues(mode, matchObj) {
    let winAmt = 5, loseAmt = -15;
    if (mode === "k25") {
        winAmt = 0; loseAmt = -25;
    } else if (mode === "no_keo") {
        winAmt = 0; loseAmt = 0;
    } else if (mode === "free") {
        winAmt = matchObj && matchObj.customWin !== undefined ? parseInt(matchObj.customWin) : 5;
        loseAmt = matchObj && matchObj.customLose !== undefined ? parseInt(matchObj.customLose) : -15;
    }
    return { winAmt, loseAmt };
}

function renderSingleDayTab(container, dateStr) {
    const matches = matchesData[dateStr] || [];
    const currentMode = dateKeoMode[dateStr] || "default";
    let html = `
    <div class="card">
        <div class="card-header-flex">
            <h2 class="card-title">BẢNG THỐNG KÊ TRẬN PICK - NGÀY ${dateStr}</h2>
            <div class="table-actions-toolbar">
                <button class="btn btn-green" onclick="addMatch('${dateStr}')">➕ Thêm Trận</button>
            </div>
        </div>
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th style="width: 55px;">STT</th>
                        <th colspan="2" class="th-pick1">CẶP PICK 1</th>
                        <th colspan="2" class="th-pick2">CẶP PICK 2</th>
                        <th style="width: 88px;">TỶ SỐ</th>
                        ${currentMode === 'free' ? '<th style="width: 120px;" class="th-money">MỆNH GIÁ THẮNG/THUA</th>' : ''}
                        <th colspan="2" class="th-money" style="padding: 4px;">
                            <div style="font-size: 10px; margin-bottom: 2px;">KÈO BAN ĐẦU</div>
                            <select style="font-size: 10px; padding: 2px; width: 95%; font-weight: bold; background: #fff8e1; border: 1px solid #d97706;" onchange="changeKeoMode('${dateStr}', this.value)">
                                <option value="default" ${currentMode === 'default' ? 'selected' : ''}>Kèo 5k / -15k (Mặc định)</option>
                                <option value="k25" ${currentMode === 'k25' ? 'selected' : ''}>Kèo 25k (0k / -25k)</option>
                                <option value="no_keo" ${currentMode === 'no_keo' ? 'selected' : ''}>No Kèo (0k / 0k)</option>
                                <option value="free" ${currentMode === 'free' ? 'selected' : ''}>Kèo Tự Do (Tùy Chỉnh)</option>
                            </select>
                        </th>
                    </tr>
                </thead>
                <tbody>
    `;
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
        const score1Inner = isScore1Zero ? `<span class="ham-text">HẦM</span>` : `<input type="text" class="score-input" value="${m.score1 || ''}" onchange="updateMatch('${dateStr}', ${idx}, 'score1', this.value)">`;
        const score2Inner = isScore2Zero ? `<span class="ham-text">HẦM</span>` : `<input type="text" class="score-input" value="${m.score2 || ''}" onchange="updateMatch('${dateStr}', ${idx}, 'score2', this.value)">`;
        const c1_p1_color = m.c1_p1 ? VDV_COLORS[vdvs.indexOf(m.c1_p1) % VDV_COLORS.length] : "#334155";
        const c1_p2_color = m.c1_p2 ? VDV_COLORS[vdvs.indexOf(m.c1_p2) % VDV_COLORS.length] : "#334155";
        const c2_p1_color = m.c2_p1 ? VDV_COLORS[vdvs.indexOf(m.c2_p1) % VDV_COLORS.length] : "#334155";
        const c2_p2_color = m.c2_p2 ? VDV_COLORS[vdvs.indexOf(m.c2_p2) % VDV_COLORS.length] : "#334155";
        let customKeoInputHtml = "";
        if (currentMode === 'free') {
            customKeoInputHtml = `
            <td>
                <div style="display:flex; gap:2px; justify-content:center;">
                    <input type="number" placeholder="Thắng" style="width:48px;" value="${m.customWin !== undefined ? m.customWin : winAmt}" onchange="updateMatch('${dateStr}', ${idx}, 'customWin', parseInt(this.value))">
                    <input type="number" placeholder="Thua" style="width:48px;" value="${m.customLose !== undefined ? m.customLose : loseAmt}" onchange="updateMatch('${dateStr}', ${idx}, 'customLose', parseInt(this.value))">
                </div>
            </td>`;
        }
        html += `
        <tr>
            <td>
                <div style="display:flex; align-items:center; justify-content:center; gap:3px;">
                    <button style="border:none; background:none; color:red; cursor:pointer; font-weight:bold; font-size:12px; padding:0;" onclick="deleteSpecificMatch('${dateStr}', ${idx})" title="Xóa trận này">🗑️</button>
                    <strong>Trận ${m.id}</strong>
                </div>
            </td>
            <td>
                <select style="color: ${c1_p1_color}; font-weight:800;" onchange="updateMatch('${dateStr}', ${idx}, 'c1_p1', this.value)">
                    <option value="">-- Select --</option>
                    ${generateVdvOptionsHtml(m.c1_p1)}
                </select>
            </td>
            <td>
                <select style="color: ${c1_p2_color}; font-weight:800;" onchange="updateMatch('${dateStr}', ${idx}, 'c1_p2', this.value)">
                    <option value="">-- Select --</option>
                    ${generateVdvOptionsHtml(m.c1_p2)}
                </select>
            </td>
            <td>
                <select style="color: ${c2_p1_color}; font-weight:800;" onchange="updateMatch('${dateStr}', ${idx}, 'c2_p1', this.value)">
                    <option value="">-- Select --</option>
                    ${generateVdvOptionsHtml(m.c2_p1)}
                </select>
            </td>
            <td>
                <select style="color: ${c2_p2_color}; font-weight:800;" onchange="updateMatch('${dateStr}', ${idx}, 'c2_p2', this.value)">
                    <option value="">-- Select --</option>
                    ${generateVdvOptionsHtml(m.c2_p2)}
                </select>
            </td>
            <td>
                <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
                    <div class="score-input" onclick="if(${isScore1Zero}) updateMatch('${dateStr}', ${idx}, 'score1', '')">${score1Inner}</div>
                    <span style="font-weight:bold;">-</span>
                    <div class="score-input" onclick="if(${isScore2Zero}) updateMatch('${dateStr}', ${idx}, 'score2', '')">${score2Inner}</div>
                </div>
            </td>
            ${customKeoInputHtml}
            <td class="${keo1 > 0 ? 'txt-win' : (keo1 < 0 ? 'txt-lose' : '')}">${keo1}</td>
            <td class="${keo2 > 0 ? 'txt-win' : (keo2 < 0 ? 'txt-lose' : '')}">${keo2}</td>
        </tr>`;
    });
    html += `</tbody></table></div></div>`;
    renderSingleDaySummaryTable(dateStr, html, container);
}

// Xử lý VĐV xin nghỉ
const ABSENT_COUNT_OPTIONS = [0, 2, 3, 4];
function escAbsentAttr(str) { return String(str == null ? '' : str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function escAbsentJs(str) { return String(str == null ? '' : str).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }
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
function persistAbsentChange() { saveDataToFirestore(); renderCurrentTab(); }
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
function setAbsentStatus(dateStr, playerName, statusValue) {
    const o = getDayStatusObj(dateStr, true);
    if (!o.absentStatusMap) o.absentStatusMap = {};
    o.absentStatusMap[playerName] = (statusValue === 'excused') ? 'excused' : 'unexcused';
    persistAbsentChange();
}
function buildAbsentFineCell(dateStr, playerName, isAbsent, fine) {
    if (!isAbsent) return `<td class="absent-fine-cell"></td>`;
    const unexcused = fine < 0;
    const d = escAbsentJs(dateStr);
    const n = escAbsentJs(playerName);
    return `
    <td class="absent-fine-cell">
        <div class="${unexcused ? 'txt-lose' : ''}" style="${unexcused ? '' : 'color:#64748b; font-weight:800;'}">${unexcused ? fine : 0}</div>
        <select onchange="setAbsentStatus('${d}', '${n}', this.value)" style="color: ${unexcused ? '#dc2626' : '#16a34a'};">
            <option value="unexcused" ${unexcused ? 'selected' : ''}>Nộp phạt (-${ABSENT_FINE_K}K)</option>
            <option value="excused" ${!unexcused ? 'selected' : ''}>Không nộp phạt (0K)</option>
        </select>
    </td>`;
}
function buildAbsentSelectorRow(dateStr, colspan) {
    const info = getAbsentInfo(dateStr);
    const d = escAbsentJs(dateStr);
    const names = Array.from(new Set(vdvs));
    const countOpts = ABSENT_COUNT_OPTIONS.slice();
    if (!countOpts.includes(info.count)) { countOpts.push(info.count); countOpts.sort((a, b) => a - b); }
    const countSelect = `
    <select onchange="setAbsentCount('${d}', this.value)" style="color:#be123c;">
        ${countOpts.map(n => `<option value="${n}" ${info.count === n ? 'selected' : ''}>${n === 0 ? 'Không có VĐV nghỉ' : n + ' VĐV nghỉ'}</option>`).join('')}
    </select>`;
    const slots = info.players.map((cur, i) => {
        const opts = names.map(nm => {
            const idx = vdvs.indexOf(nm);
            const color = idx !== -1 ? VDV_COLORS[idx % VDV_COLORS.length] : "#1e293b";
            const taken = info.players.some((p, j) => j !== i && p === nm);
            return `<option value="${escAbsentAttr(nm)}" ${cur === nm ? 'selected' : ''} ${taken ? 'disabled' : ''} style="color:${color}; font-weight:800;">${escAbsentAttr(nm)}</option>`;
        }).join('');
        return `
        <select onchange="setAbsentPlayerSlot('${d}', ${i}, this.value)">
            <option value="">-- Chọn VĐV nghỉ ${i + 1} --</option>
            ${opts}
        </select>`;
    }).join('');
    return `
    <tr class="absent-select-row">
        <td colspan="${colspan}">
            <span class="absent-label">🙋 VĐV XIN NGHỈ HÔM NAY:</span> ${countSelect} ${slots}
            <span class="absent-hint">VĐV được chọn sẽ hiện trong bảng; chọn "Nộp phạt" (-${ABSENT_FINE_K}K) hoặc "Không nộp phạt" ở cột XIN NGHỈ.</span>
        </td>
    </tr>`;
}

// Bảng Tổng Hợp Ngày
function renderSingleDaySummaryTable(dateStr, matchesHtml, container) {
    const matches = matchesData[dateStr] || [];
    const currentMode = dateKeoMode[dateStr] || "default";
    let stats = {};
    uniqueVdvs = Array.from(new Set(vdvs));
    uniqueVdvs.forEach(v => { stats[v] = { played: 0, winK: 0, loseK: 0, total: 0 }; });
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
            let noteText = "";
            if (netTotal < 0) { noteText = isPaid ? `<span class="note-paid">Đã nộp</span>` : `<span class="note-unpaid">Chưa nộp</span>`; }
            else if (netTotal > 0) { noteText = isPaid ? `<span class="note-paid">Đã nhận</span>` : `<span class="note-unpaid">Chưa nhận</span>`; }
            else if (isAbsent) { noteText = `<span style="color:#64748b; font-weight:800;">Nghỉ - không phạt</span>`; }
            const checkboxClass = isAdminVerified ? "checkbox-cell admin-active" : "checkbox-cell";
            summaryRowsHtml += `
            <tr>
                <td style="color: ${vColor}; font-weight: 800; font-size:12px; text-align: left; padding-left: 8px;">${v}</td>
                <td>${st.played}</td>
                <td class="txt-win">${st.winK > 0 ? st.winK : ''}</td>
                <td class="txt-lose">${st.loseK < 0 ? st.loseK : ''}</td>
                <td style="color:#2563eb; font-weight:bold;">${bringBack > 0 ? bringBack : ''}</td>
                <td class="${st.total < 0 ? 'txt-lose' : (st.total > 0 ? 'txt-win' : '')}"><strong>${st.total}</strong></td>
                ${buildAbsentFineCell(dateStr, v, isAbsent, fine)}
                <td><input type="checkbox" class="${checkboxClass}" ${isPaid ? 'checked' : ''} onclick="togglePayment('${payKey}')" title="${isAdminVerified ? '' : 'Cần đăng nhập Admin'}"></td>
                <td>${noteText}</td>
            </tr>`;
        }
    });
    let btcThuVeCalculated = sumAmThucTe + sumBringBack;
    let quyCon = sumThucThu - Math.abs(btcThuVeCalculated);
    const pStatus = paymentStatus[dateStr];
    const currentBtcAdminOption = (pStatus && typeof pStatus === 'object' && pStatus.btcNoteAdminOption) ? pStatus.btcNoteAdminOption : "NO";
    const isYes = currentBtcAdminOption === "YES";
    let summaryTableHtml = `
    <div class="card">
        <div class="card-header-flex">
            <h2 class="card-title">BẢNG TỔNG HỢP NGÀY</h2>
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
                        <th class="th-absent">XIN NGHỈ</th>
                        <th>THỰC TẾ</th>
                        <th>NOTE</th>
                    </tr>
                </thead>
                <tbody>
                    ${summaryRowsHtml}
                    ${buildAbsentSelectorRow(dateStr, 9)}
                    <tr class="total-summary-row">
                        <td style="color: red; text-align: left; padding-left: 8px;"><strong>Tổng Tiền BTC Thu Về</strong></td>
                        <td></td><td></td><td></td>
                        <td style="color: blue;"><strong>${sumBringBack}</strong></td>
                        <td style="color: red;" title="Đã gồm tiền phạt nghỉ"><strong>${btcThuVeCalculated}</strong></td>
                        <td style="color: ${sumFine < 0 ? '#dc2626' : '#64748b'};"><strong>${sumFine < 0 ? sumFine : 0}</strong></td>
                        <td style="color: blue;"><strong>${sumThucThu}</strong></td>
                        <td class="note-cell" style="padding: 2px;">
                            <select onchange="handleBtcNoteAdminChange('${dateStr}', this)" style="font-weight: 800; color: ${isYes ? '#16a34a' : '#dc2626'};">
                                <option value="YES" ${isYes ? 'selected' : ''}>YES (Chuyển tổng ngày)</option>
                                <option value="NO" ${!isYes ? 'selected' : ''}>NO (Không chuyển)</option>
                            </select>
                        </td>
                    </tr>
                    <tr class="total-summary-row">
                        <td style="color: red; text-align: left; padding-left: 8px;" colspan="4"><strong>Quỹ Còn</strong></td>
                        <td colspan="2" style="color: red; font-size: 13px;"><strong>${quyCon}</strong></td>
                        <td colspan="3"></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>`;
    container.innerHTML = matchesHtml + summaryTableHtml;
}
