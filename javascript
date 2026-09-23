// Đặt mật khẩu Admin của bạn ở đây (Ví dụ: 123456)
const ADMIN_PASSCODE = "123456"; 

// Biến lưu trạng thái đã xác thực mật khẩu trong phiên làm việc (giúp không phải nhập lại nhiều lần)
let isPasscodeVerified = false;

// Hàm xử lý khi bấm vào ô checkbox cột "THỰC TẾ"
async function handleThucTeChange(event, docId, newValue) {
  // 1. Nếu chưa xác thực mật khẩu Admin trong phiên này
  if (!isPasscodeVerified) {
    // Ngăn không cho tích chọn ngay lập tức
    event.preventDefault(); 
    
    // Hiện hộp thoại yêu cầu nhập mật khẩu
    const inputPass = prompt("🔑 Nhập mật khẩu Admin để thay đổi cột Thực tế:");
    
    if (inputPass === ADMIN_PASSCODE) {
      isPasscodeVerified = true; // Lưu lại trạng thái đúng mật khẩu
      alert("Đã mở khóa quyền Admin!");
      // Thực hiện tích chọn ô checkbox
      event.target.checked = newValue;
    } else if (inputPass !== null) {
      alert("❌ Mật khẩu không chính xác! Bạn không có quyền sửa cột này.");
      return; // Dừng lại, không cho sửa
    } else {
      return; // Người dùng bấm Hủy (Cancel)
    }
  }

  // 2. Cập nhật dữ liệu lên Cloud Firestore khi mật khẩu hợp lệ
  try {
    await db.collection('thong_ke_keo').doc(docId).update({
      thucTe: event.target.checked
    });
    console.log("Cập nhật thành công!");
  } catch (error) {
    alert("Lỗi khi lưu dữ liệu: " + error.message);
  }
}
