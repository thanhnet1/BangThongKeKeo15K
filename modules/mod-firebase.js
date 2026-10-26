// ==========================================
// CẤU HÌNH & KẾT NỐI FIREBASE FIRESTORE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyCXxjGAHhAOtIo2DoqW6u8LW9NOUOI7PqY",
    authDomain: "pickleball-cmtd.firebaseapp.com",
    projectId: "pickleball-cmtd",
    storageBucket: "pickleball-cmtd.firebasestorage.app",
    messagingSenderId: "648591152243",
    appId: "1:648591152243:web:3343caf2da821373070606",
    measurementId: "G-T91KPDZFJR"
};

// Khởi tạo Firebase an toàn
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = (typeof firebase !== 'undefined' && firebase.apps.length > 0) ? firebase.firestore() : null;

let isInitialLoaded = false;
let autoBackupMemory = null;

function updateCloudStatus(status, text) {
    const el = document.getElementById("cloudStatus");
    if (!el) return;
    el.className = "cloud-status";
    if (status === "online") {
        el.classList.add("cloud-online");
        el.innerText = `☁ ${text}`;
    } else if (status === "syncing") {
        el.classList.add("cloud-syncing");
        el.innerText = `⏳ ${text}`;
    } else {
        el.classList.add("cloud-error");
        el.innerText = `❌ ${text}`;
    }
}

// ==========================================
// ĐỒNG BỘ DỮ LIỆU THỜI GIAN THỰC (REALTIME)
// ==========================================
if (db) {
    db.collection("cmtd_pickleball").doc("main_data").onSnapshot((doc) => {
        updateCloudStatus("syncing", "Đang đồng bộ dữ liệu...");
        if (doc.exists) {
            const data = doc.data();
            autoBackupMemory = data;

            if (data.players && typeof players !== 'undefined') players = data.players;
            if (data.vdvs && typeof vdvs !== 'undefined') vdvs = data.vdvs;
            if (data.dates && typeof dates !== 'undefined') dates = data.dates;
            if (data.matchesData && typeof matchesData !== 'undefined') matchesData = data.matchesData;
            if (data.dateKeoMode && typeof dateKeoMode !== 'undefined') dateKeoMode = data.dateKeoMode;
            if (data.paymentStatus && typeof paymentStatus !== 'undefined') paymentStatus = data.paymentStatus;
            
            if (data.titlesConfig && typeof titlesConfig !== 'undefined') titlesConfig = Object.assign(titlesConfig, data.titlesConfig);
            if (data.miniGame1Content && typeof miniGame1Content !== 'undefined') miniGame1Content = data.miniGame1Content;
            if (data.miniGame2Content && typeof miniGame2Content !== 'undefined') miniGame2Content = data.miniGame2Content;

            // Mini Game 1 & Sub
            if (data.mini1TeamA && typeof mini1TeamA !== 'undefined') mini1TeamA = data.mini1TeamA;
            if (data.mini1TeamB && typeof mini1TeamB !== 'undefined') mini1TeamB = data.mini1TeamB;
            if (data.mini1KeoMode && typeof mini1KeoMode !== 'undefined') mini1KeoMode = data.mini1KeoMode;
            if (data.mini1Payment && typeof mini1Payment !== 'undefined') mini1Payment = data.mini1Payment;
            if (data.mini1Sub1TeamA && typeof mini1Sub1TeamA !== 'undefined') mini1Sub1TeamA = data.mini1Sub1TeamA;
            if (data.mini1Sub1TeamB && typeof mini1Sub1TeamB !== 'undefined') mini1Sub1TeamB = data.mini1Sub1TeamB;
            if (data.mini1Sub1KeoMode && typeof mini1Sub1KeoMode !== 'undefined') mini1Sub1KeoMode = data.mini1Sub1KeoMode;
            if (data.mini1Sub1Payment && typeof mini1Sub1Payment !== 'undefined') mini1Sub1Payment = data.mini1Sub1Payment;
            if (data.miniGame1Sub1Matches && typeof miniGame1Sub1Matches !== 'undefined') miniGame1Sub1Matches = data.miniGame1Sub1Matches;
            if (data.mini1Sub2TeamA && typeof mini1Sub2TeamA !== 'undefined') mini1Sub2TeamA = data.mini1Sub2TeamA;
            if (data.mini1Sub2TeamB && typeof mini1Sub2TeamB !== 'undefined') mini1Sub2TeamB = data.mini1Sub2TeamB;
            if (data.mini1Sub2KeoMode && typeof mini1Sub2KeoMode !== 'undefined') mini1Sub2KeoMode = data.mini1Sub2KeoMode;
            if (data.mini1Sub2Payment && typeof mini1Sub2Payment !== 'undefined') mini1Sub2Payment = data.mini1Sub2Payment;
            if (data.miniGame1Sub2Matches && typeof miniGame1Sub2Matches !== 'undefined') miniGame1Sub2Matches = data.miniGame1Sub2Matches;
            if (data.miniGame1Matches && typeof miniGame1Matches !== 'undefined') miniGame1Matches = data.miniGame1Matches;

            // Mini Game 2 & Tournaments
            if (data.mini2PairsA && typeof mini2PairsA !== 'undefined') mini2PairsA = data.mini2PairsA;
            if (data.mini2PairsB && typeof mini2PairsB !== 'undefined') mini2PairsB = data.mini2PairsB;
            if (data.mini2MatchesA && typeof mini2MatchesA !== 'undefined') mini2MatchesA = data.mini2MatchesA;
            if (data.mini2MatchesB && typeof mini2MatchesB !== 'undefined') mini2MatchesB = data.mini2MatchesB;
            if (data.mini2Knockout && typeof mini2Knockout !== 'undefined') mini2Knockout = Object.assign(mini2Knockout, data.mini2Knockout);
            if (data.miniGame2Tour1Content && typeof mini2Tour1Content !== 'undefined') mini2Tour1Content = data.miniGame2Tour1Content;
            if (data.miniGame2Tour2Content && typeof mini2Tour2Content !== 'undefined') mini2Tour2Content = data.miniGame2Tour2Content;
            if (data.mini2KeoMode && typeof mini2KeoMode !== 'undefined') mini2KeoMode = data.mini2KeoMode;
            if (data.mini2Payment && typeof mini2Payment !== 'undefined') mini2Payment = data.mini2Payment;

            if (typeof syncVdvsFromPlayers === 'function') syncVdvsFromPlayers();
            if (typeof updateNavbarTitles === 'function') updateNavbarTitles();

            if (!isInitialLoaded) {
                isInitialLoaded = true;
                if (!dates || dates.length === 0) {
                    dates = ["28/9/26"];
                    matchesData["28/9/26"] = Array.from({ length: 5 }, (_, i) => ({
                        id: i + 1, c1_p1: "", c1_p2: "", c2_p1: "", c2_p2: "", score1: "", score2: "", customWin: 5, customLose: -15
                    }));
                }
                currentTab = getClosestOrCurrentDate(dates);
            }
            
            if (typeof renderCurrentTab === 'function') renderCurrentTab();
            updateCloudStatus("online", "Đã lưu Cloud (Realtime)");
        } else {
            updateCloudStatus("syncing", "Khởi tạo dữ liệu ban đầu...");
            dates = ["28/9/26"];
            matchesData["28/9/26"] = Array.from({ length: 5 }, (_, i) => ({
                id: i + 1, c1_p1: "", c1_p2: "", c2_p1: "", c2_p2: "", score1: "", score2: "", customWin: 5, customLose: -15
            }));
            currentTab = "28/9/26";
            saveDataToFirestore();
        }
    }, (error) => {
        console.error("Lỗi lắng nghe Firestore: ", error);
        updateCloudStatus("error", "Lỗi kết nối Cloud!");
    });
}

// ==========================================
// HÀM LƯU DỮ LIỆU LÊN FIRESTORE
// ==========================================
let saveTimeout = null;
function saveDataToFirestore() {
    if (!db) return;
    updateCloudStatus("syncing", "Đang lưu thay đổi...");
    
    const payload = {
        players: typeof players !== 'undefined' ? players : [],
        vdvs: typeof vdvs !== 'undefined' ? vdvs : [],
        dates: typeof dates !== 'undefined' ? dates : [],
        matchesData: typeof matchesData !== 'undefined' ? matchesData : {},
        dateKeoMode: typeof dateKeoMode !== 'undefined' ? dateKeoMode : {},
        paymentStatus: typeof paymentStatus !== 'undefined' ? paymentStatus : {},
        titlesConfig: typeof titlesConfig !== 'undefined' ? titlesConfig : {},
        miniGame1Content: typeof miniGame1Content !== 'undefined' ? miniGame1Content : "",
        miniGame2Content: typeof miniGame2Content !== 'undefined' ? miniGame2Content : "",
        mini1TeamA: typeof mini1TeamA !== 'undefined' ? mini1TeamA : [],
        mini1TeamB: typeof mini1TeamB !== 'undefined' ? mini1TeamB : [],
        mini1KeoMode: typeof mini1KeoMode !== 'undefined' ? mini1KeoMode : "default",
        mini1Payment: typeof mini1Payment !== 'undefined' ? mini1Payment : {},
        mini1Sub1TeamA: typeof mini1Sub1TeamA !== 'undefined' ? mini1Sub1TeamA : [],
        mini1Sub1TeamB: typeof mini1Sub1TeamB !== 'undefined' ? mini1Sub1TeamB : [],
        mini1Sub1KeoMode: typeof mini1Sub1KeoMode !== 'undefined' ? mini1Sub1KeoMode : "default",
        mini1Sub1Payment: typeof mini1Sub1Payment !== 'undefined' ? mini1Sub1Payment : {},
        miniGame1Sub1Matches: typeof miniGame1Sub1Matches !== 'undefined' ? miniGame1Sub1Matches : [],
        mini1Sub2TeamA: typeof mini1Sub2TeamA !== 'undefined' ? mini1Sub2TeamA : [],
        mini1Sub2TeamB: typeof mini1Sub2TeamB !== 'undefined' ? mini1Sub2TeamB : [],
        mini1Sub2KeoMode: typeof mini1Sub2KeoMode !== 'undefined' ? mini1Sub2KeoMode : "default",
        mini1Sub2Payment: typeof mini1Sub2Payment !== 'undefined' ? mini1Sub2Payment : {},
        miniGame1Sub2Matches: typeof miniGame1Sub2Matches !== 'undefined' ? miniGame1Sub2Matches : [],
        miniGame1Matches: typeof miniGame1Matches !== 'undefined' ? miniGame1Matches : [],
        mini2PairsA: typeof mini2PairsA !== 'undefined' ? mini2PairsA : [],
        mini2PairsB: typeof mini2PairsB !== 'undefined' ? mini2PairsB : [],
        mini2MatchesA: typeof mini2MatchesA !== 'undefined' ? mini2MatchesA : [],
        mini2MatchesB: typeof mini2MatchesB !== 'undefined' ? mini2MatchesB : [],
        mini2Knockout: typeof mini2Knockout !== 'undefined' ? mini2Knockout : {},
        mini2Tour1Content: typeof mini2Tour1Content !== 'undefined' ? mini2Tour1Content : "",
        mini2Tour2Content: typeof mini2Tour2Content !== 'undefined' ? mini2Tour2Content : "",
        mini2KeoMode: typeof mini2KeoMode !== 'undefined' ? mini2KeoMode : "default",
        mini2Payment: typeof mini2Payment !== 'undefined' ? mini2Payment : {},
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    };

    autoBackupMemory = payload;

    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        db.collection("cmtd_pickleball").doc("main_data").set(payload, { merge: true })
            .then(() => {
                updateCloudStatus("online", "Đã lưu Cloud (Realtime)");
            })
            .catch((error) => {
                console.error("Lỗi khi lưu dữ liệu lên Firestore: ", error);
                updateCloudStatus("error", "Lỗi lưu Cloud!");
            });
    }, 500);
}
