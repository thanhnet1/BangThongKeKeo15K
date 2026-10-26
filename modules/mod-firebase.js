// ==========================================
// CẤU HÌNH & KẾT NỐI FIREBASE FIRESTORE
// ==========================================
const firebaseConfig = { 
  apiKey : "AIzaSyCXxjGAHhAOtIo2DoqW6u8LW9NOUOI7PqY" , 
  authDomain : "pickleball-cmtd.firebaseapp.com" , 
  projectId : "pickleball-cmtd" , 
  storageBucket : "pickleball-cmtd.firebasestorage.app" , 
  messagingSenderId : "648591152243" , 
  appId : "1:648591152243:web:3343caf2da821373070606" , 
  measurementId : "G-T91KPDZFJR" 
};

// Khởi tạo Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Biến lưu trạng thái đồng bộ
let isInitialLoaded = false;
let autoBackupMemory = null;

// Hàm cập nhật hiển thị trạng thái Cloud trên Header
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
db.collection("cmtd_pickleball").doc("main_data").onSnapshot((doc) => {
    updateCloudStatus("syncing", "Đang đồng bộ dữ liệu...");
    if (doc.exists) {
        const data = doc.data();
        autoBackupMemory = data;

        if (data.players) players = data.players;
        if (data.vdvs) vdvs = data.vdvs;
        if (data.dates) dates = data.dates;
        if (data.matchesData) matchesData = data.matchesData;
        if (data.dateKeoMode) dateKeoMode = data.dateKeoMode;
        if (data.paymentStatus) paymentStatus = data.paymentStatus;
        
        if (data.titlesConfig) titlesConfig = Object.assign(titlesConfig, data.titlesConfig);
        if (data.miniGame1Content) miniGame1Content = data.miniGame1Content;
        if (data.miniGame2Content) miniGame2Content = data.miniGame2Content;

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
        if (data.miniGame1Matches) miniGame1Matches = data.miniGame1Matches;

        if (data.mini2PairsA) mini2PairsA = data.mini2PairsA;
        if (data.mini2PairsB) mini2PairsB = data.mini2PairsB;
        if (data.mini2MatchesA) mini2MatchesA = data.mini2MatchesA;
        if (data.mini2MatchesB) mini2MatchesB = data.mini2MatchesB;
        if (data.mini2Knockout) mini2Knockout = Object.assign(mini2Knockout, data.mini2Knockout);
        if (data.miniGame2Tour1Content) mini2Tour1Content = data.miniGame2Tour1Content;
        if (data.miniGame2Tour2Content) mini2Tour2Content = data.miniGame2Tour2Content;
        if (data.mini2KeoMode) mini2KeoMode = data.mini2KeoMode;
        if (data.mini2Payment) mini2Payment = data.mini2Payment;

        if (typeof syncVdvsFromPlayers === 'function') syncVdvsFromPlayers();
        updateNavbarTitles();

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
        
        renderCurrentTab();
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

// ==========================================
// HÀM LƯU DỮ LIỆU LÊN FIRESTORE
// ==========================================
let saveTimeout = null;
function saveDataToFirestore() {
    updateCloudStatus("syncing", "Đang lưu thay đổi...");
    
    const payload = {
        players, vdvs, dates, matchesData, dateKeoMode, paymentStatus,
        titlesConfig, miniGame1Content, miniGame2Content,
        mini1TeamA, mini1TeamB, mini1KeoMode, mini1Payment,
        mini1Sub1TeamA, mini1Sub1TeamB, mini1Sub1KeoMode, mini1Sub1Payment, miniGame1Sub1Matches,
        mini1Sub2TeamA, mini1Sub2TeamB, mini1Sub2KeoMode, mini1Sub2Payment, miniGame1Sub2Matches,
        miniGame1Matches, mini2PairsA, mini2PairsB, mini2MatchesA, mini2MatchesB, mini2Knockout,
        mini2Tour1Content, mini2Tour2Content, mini2KeoMode, mini2Payment,
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
