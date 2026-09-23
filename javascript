// 1. Đặt mật khẩu Admin của bạn ở đây
const PASSCODE_ADMIN = "123456"; 
let daXacNhanAdmin = false;

// 2. Hàm bắt buộc nhập mật khẩu khi bấm vào cột Thực Tế
function checkAdminThucTe(event, docId, isChecked, checkboxElem) {
  // Nếu chưa xác thực mật khẩu Admin trước đó trong phiên làm việc
  if (!daXacNhanAdmin) {
    event.preventDefault(); // Ngăn không cho ô tự động tích/bỏ tích

    const input = prompt("🔑 Nhập mật khẩu Admin để thay đổi cột THỰC TẾ:");
    
    if (input === PASSCODE_ADMIN) {
      daXacNhanAdmin = true;
      alert("✅ Xác thực Admin thành công!");
      
      // Đổi trạng thái ô checkbox và lưu
      checkboxElem.checked = !isChecked;
      luuDatabaseThucTe(docId, checkboxElem.checked);
    } else if (input !== null) {
      alert("❌ Mật khẩu không đúng! Bạn không có quyền chỉnh sửa cột này.");
    }
  } else {
    // Nếu đã nhập đúng mật khẩu rồi thì cho tích và lưu trực tiếp
    luuDatabaseThucTe(docId, isChecked);
  }
}

// 3. Hàm đẩy trạng thái lên Firebase Firestore
function luuDatabaseThucTe(docId, status) {
  db.collection('thong_ke_keo').doc(docId).update({
    thucTe: status
  }).then(() => {
    console.log("Đã cập nhật trạng thái Thực tế!");
  }).catch((err) => {
    alert("Lỗi lưu dữ liệu: " + err.message);
  });
}
