const fs = require('fs');
const path = require('path');

// Đọc file tiếng Trung
const zhTWPath = path.join(__dirname, 'src/i18n/locales/zh-TW.json');
const zhTWContent = fs.readFileSync(zhTWPath, 'utf8');
const zhTWData = JSON.parse(zhTWContent);

// Bản dịch từ tiếng Trung sang tiếng Việt
const translations = {
  // Common
  "載入中...": "Đang tải...",
  "錯誤": "Lỗi",
  "成功": "Thành công",
  "取消": "Hủy",
  "儲存": "Lưu",
  "刪除": "Xóa",
  "編輯": "Chỉnh sửa",
  "新增": "Thêm",
  "提交": "Gửi",
  "返回": "Quay lại",
  "下一步": "Tiếp theo",
  "上一步": "Trước",
  "關閉": "Đóng",
  "確認": "Xác nhận",
  "是": "Có",
  "否": "Không",
  "搜尋": "Tìm kiếm",
  "篩選": "Lọc",
  "排序": "Sắp xếp",
  "重新整理": "Làm mới",
  "下載": "Tải xuống",
  "上傳": "Tải lên",
  "匯出": "Xuất",
  "匯入": "Nhập",
  "語言": "Ngôn ngữ",
  "English": "English",
  "繁體中文": "繁體中文",
  "重試": "Thử lại",
  "儲存中...": "Đang lưu...",
  "日期": "Ngày",
  "全部": "Tất cả",
  "頁面大小": "Kích thước trang",
  "第 {{current}} 頁，共 {{total}} 頁": "Trang {{current}} trong {{total}}",
  
  // Auth
  "登入": "Đăng nhập",
  "註冊": "Đăng ký",
  "登出": "Đăng xuất",
  "電子郵件": "Email",
  "密碼": "Mật khẩu",
  "確認密碼": "Xác nhận mật khẩu",
  "忘記密碼？": "Quên mật khẩu?",
  "記住我": "Ghi nhớ đăng nhập",
  "還沒有帳號？": "Chưa có tài khoản?",
  "已有帳號？": "Đã có tài khoản?",
  "註冊": "Đăng ký",
  "登入": "Đăng nhập",
  "電子郵件驗證": "Xác thực email",
  "驗證碼": "Mã xác thực",
  "重新發送驗證碼": "Gửi lại mã",
  "驗證電子郵件": "Xác thực email",
  "電子郵件驗證成功！": "Email đã được xác thực thành công!",
  "電子郵件或密碼錯誤": "Email hoặc mật khẩu không đúng",
  "密碼不匹配": "Mật khẩu không khớp",
  "請輸入電子郵件": "Vui lòng nhập email",
  "請輸入密碼": "Vui lòng nhập mật khẩu",
  "密碼至少需要6個字元": "Mật khẩu phải có ít nhất 6 ký tự",
  "姓名": "Họ và tên",
  "請輸入您的姓名": "Nhập họ và tên của bạn",
  "請輸入您的電子郵件": "Nhập email của bạn",
  "請輸入您的密碼（至少6個字元）": "Nhập mật khẩu của bạn (tối thiểu 6 ký tự)",
  "推薦碼": "Mã giới thiệu",
  "選填": "Tùy chọn",
  "如果您有推薦碼請輸入": "Nhập mã giới thiệu nếu bạn có",
  "建立帳號中...": "Đang tạo tài khoản...",
  "建立帳號": "Tạo tài khoản",
  "建立您的帳號開始進行預測": "Tạo tài khoản để bắt đầu dự đoán",
  "請填寫所有必填欄位": "Vui lòng điền đầy đủ các trường bắt buộc",
  "缺少資訊": "Thiếu thông tin",
  "密碼太短": "Mật khẩu quá ngắn",
  "註冊成功！": "Đăng ký thành công!",
  "帳號建立成功！請檢查您的電子郵件進行驗證。": "Tài khoản đã được tạo thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
  "註冊失敗": "Đăng ký thất bại",
  "建立帳號失敗，請重試。": "Không thể tạo tài khoản. Vui lòng thử lại.",
  "註冊過程中發生錯誤": "Đã xảy ra lỗi trong quá trình đăng ký",
  "無效的驗證連結。未提供令牌。": "Liên kết xác thực không hợp lệ. Không có token được cung cấp.",
  "驗證失敗": "Xác thực thất bại",
  "驗證過程中發生意外錯誤。": "Đã xảy ra lỗi không mong muốn trong quá trình xác thực.",
  "驗證電子郵件中...": "Đang xác thực email...",
  "請稍等，我們正在驗證您的電子郵件地址。": "Vui lòng chờ trong khi chúng tôi xác thực địa chỉ email của bạn.",
  "您的電子郵件已成功驗證。您現在可以登入您的帳號。": "Email của bạn đã được xác thực thành công. Bây giờ bạn có thể đăng nhập vào tài khoản.",
  "驗證您的電子郵件地址時發生問題。": "Có vấn đề khi xác thực địa chỉ email của bạn.",
  "繼續登入": "Tiếp tục đăng nhập",
  "前往登入": "Đi đến đăng nhập",
  "需要幫助？請聯繫支援尋求協助。": "Cần trợ giúp? Liên hệ hỗ trợ để được hỗ trợ.",
  "這可能需要幾分鐘...": "Điều này có thể mất vài phút...",
  "登入您的帳號以進行預測。": "Truy cập tài khoản để thực hiện dự đoán.",
  "加入以開始進行預測並賺取積分。": "Tham gia để bắt đầu dự đoán và kiếm điểm.",
  "登入成功": "Đăng nhập thành công",
  "歡迎回來！": "Chào mừng trở lại!",
  "登入失敗。": "Đăng nhập thất bại.",
  "註冊失敗。": "Đăng ký thất bại.",
  "請填寫所有欄位。": "Vui lòng điền đầy đủ các trường.",
  "名稱": "Tên"
};

// Hàm dịch đệ quy
function translateObject(obj) {
  if (typeof obj === 'string') {
    return translations[obj] || obj;
  } else if (Array.isArray(obj)) {
    return obj.map(translateObject);
  } else if (obj && typeof obj === 'object') {
    const translated = {};
    for (const key in obj) {
      translated[key] = translateObject(obj[key]);
    }
    return translated;
  }
  return obj;
}

// Dịch toàn bộ dữ liệu
const translatedData = translateObject(zhTWData);

// Thêm tiếng Việt vào common
translatedData.common.vietnamese = "Tiếng Việt";

// Ghi file tiếng Việt
const viPath = path.join(__dirname, 'src/i18n/locales/vi.json');
fs.writeFileSync(viPath, JSON.stringify(translatedData, null, 2), 'utf8');

console.log('Đã dịch xong file tiếng Việt!');
