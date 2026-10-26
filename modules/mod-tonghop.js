function renderDatesMenu() {
    const container = document.getElementById("datesMenuList");
    if (!container) return;
    container.innerHTML = dates.map(d => `
        <div class="dropdown-item ${currentTab === d ? 'txt-win' : ''}" onclick="switchTab('${d}')">
            📅 Ngày ${d}
        </div>
    `).join('');
}

function renderTongHopTab(container) {
    let activeDates = dates.filter(d => {
        const matches = matchesData[d] || [];
        const hasMatchData = matches.some(m => (!isNaN(parseInt(m.score1)) && !isNaN(parseInt(m.score2))) || m.c1_p1 || m.c1_p2 || m.c2_p1 || m.c2_p2);
        const pStatus = paymentStatus[d];
        const isYes = (pStatus && typeof pStatus === 'object' && pStatus.btcNoteAdminOption === "YES");
        return hasMatchData || isYes;
    });
    if (activeDates.length === 0) {
        container.innerHTML = `
        <div class="card">
            <div class="card-header-flex">
                <h2 class="card-title">BẢNG TỔNG HỢP CÁC NGÀY</h2>
            </div>
            <div style="padding: 20px; text-align: center; font-weight: bold; color: #64748b;">
                Hiện chưa có ngày nào phát sinh dữ liệu trận đấu hoặc chuyển tổng tiền.
            </div>
        </div>`;
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
                if (st.total < 0) { sumAmDay += st.total; }
                else if (st.played >= 4 && st.total > 0) { sumBringBackDay += st.total; }
            }
        });
        const pStatus = paymentStatus[d];
        const isYes = (pStatus && typeof pStatus === 'object' && pStatus.btcNoteAdminOption === "YES");
        if (isYes) { dayTotalsSum[d] = sumAmDay - sumBringBackDay; }
        else { dayTotalsSum[d] = 0; }
    });
    let grandTotalAllDays = 0;
    let html = `
    <div class="card">
        <div class="card-header-flex">
            <h2 class="card-title">BẢNG TỔNG HỢP CÁC NGÀY (CHỈ NGÀY ĐÃ TẠO)</h2>
        </div>
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th style="width: 140px; text-align: left; padding-left: 8px;">VĐV (PICK THỦ)</th>
                        ${activeDates.map(d => `<th>NGÀY ${d}</th>`).join('')}
                        <th style="background-color: #fef08a; color: #854d0e;">TỔNG KÈO</th>
                    </tr>
                </thead>
                <tbody>`;
    uniqueVdvs.forEach((v, index) => {
        let dayCells = activeDates.map(d => {
            let val = vdvDayTotals[v][d];
            let cls = val > 0 ? 'txt-win' : (val < 0 ? 'txt-lose' : '');
            return `<td class="${cls}">${val !== 0 ? (val > 0 ? '+' + val + 'K' : val + 'K') : '-'}</td>`;
        }).join('');
        let rowSum = vdvRowKeoSum[v];
        let totalCls = rowSum > 0 ? 'txt-win' : (rowSum < 0 ? 'txt-lose' : '');
        let vdvColor = VDV_COLORS[index % VDV_COLORS.length];
        html += `
        <tr>
            <td style="color: ${vdvColor}; font-weight: 800; font-size: 11px; text-align: left; padding-left: 8px;">${v}</td>
            ${dayCells}
            <td class="${totalCls}" style="background-color: #fef9c3;"><strong>${rowSum !== 0 ? (rowSum > 0 ? '+' + rowSum + 'K' : rowSum + 'K') : '0K'}</strong></td>
        </tr>`;
    });
    let daySumCells = activeDates.map(d => {
        let val = dayTotalsSum[d];
        grandTotalAllDays += val;
        let cls = val < 0 ? 'txt-lose' : (val > 0 ? 'txt-win' : '');
        return `<td class="${cls}"><strong>${val !== 0 ? val + 'K' : '0K'}</strong></td>`;
    }).join('');
    let grandTotalCls = grandTotalAllDays < 0 ? 'txt-lose' : (grandTotalAllDays > 0 ? 'txt-win' : '');
    html += `
                <tr class="total-summary-row">
                    <td style="color: red; text-align: center;"><strong>TỔNG NGÀY</strong></td>
                    ${daySumCells}
                    <td class="${grandTotalCls}" style="background-color: #fef08a;"><strong>${grandTotalAllDays !== 0 ? grandTotalAllDays + 'K' : '0K'}</strong></td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>`;
    container.innerHTML = html;
}
