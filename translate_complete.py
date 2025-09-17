#!/usr/bin/env python3
import json
import re

# Bản dịch từ tiếng Trung sang tiếng Việt - phiên bản đầy đủ
translations = {
    # Common
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
    "重試": "Thử lại",
    "儲存中...": "Đang lưu...",
    "日期": "Ngày",
    "全部": "Tất cả",
    "頁面大小": "Kích thước trang",
    "第 {{current}} 頁，共 {{total}} 頁": "Trang {{current}} trong {{total}}",
    
    # Auth
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
    "名稱": "Tên",
    
    # Navigation
    "儀表板": "Bảng điều khiển",
    "預測": "Dự đoán",
    "競賽": "Cuộc thi",
    "問卷調查": "Khảo sát",
    "投票": "Bình chọn",
    "個人資料": "Hồ sơ",
    "推薦": "Giới thiệu",
    "簽到": "Điểm danh",
    "意見回饋": "Phản hồi",
    "管理員": "Quản trị",
    "員工": "Nhân viên",
    "使用者": "Người dùng",
    "問題": "Câu hỏi",
    "訂單": "Đơn hàng",
    "統計": "Thống kê",
    "更多": "Thêm",
    
    # Dashboard
    "歡迎": "Chào mừng",
    "總積分": "Tổng điểm",
    "總預測數": "Tổng dự đoán",
    "正確預測": "Dự đoán đúng",
    "準確率": "Độ chính xác",
    "排名": "Xếp hạng",
    "最近活動": "Hoạt động gần đây",
    "快速操作": "Thao tác nhanh",
    "每日簽到": "Điểm danh hàng ngày",
    "提交意見回饋": "Gửi phản hồi",
    "查看預測": "Xem dự đoán",
    "參與問卷調查": "Tham gia khảo sát",
    "歡迎回來，{{name}}！": "Chào mừng trở lại, {{name}}!",
    "今天發生了什麼？": "Hôm nay có gì?",
    "您的積分": "Điểm của bạn",
    "積分": "Điểm",
    "獲得積分": "Điểm kiếm được",
    "花費積分": "Điểm đã sử dụng",
    "積分餘額": "Số dư điểm",
    "積分歷史": "Lịch sử điểm",
    "今日獲得積分": "Điểm kiếm được hôm nay",
    "簽到連續記錄": "Chuỗi điểm danh",
    "總推薦數": "Tổng giới thiệu",
    "進行中的預測": "Dự đoán đang hoạt động",
    "載入預測失敗，請重試。": "Không thể tải dự đoán. Vui lòng thử lại.",
    "儀表板已更新": "Bảng điều khiển đã cập nhật",
    "儀表板已成功重新整理。": "Bảng điều khiển đã được làm mới thành công.",
    "完成每日簽到以獲得積分並維持您的連續記錄": "Hoàn thành điểm danh hàng ngày để kiếm điểm và duy trì chuỗi của bạn",
    "完成簽到": "Hoàn thành điểm danh",
    "查看並參與進行中的預測挑戰": "Xem và tham gia các thử thách dự đoán đang hoạt động",
    "查看所有預測": "Xem tất cả dự đoán",
    "最近的預測": "Dự đoán gần đây",
    "平台上最新建立的預測挑戰": "Các thử thách dự đoán mới nhất được tạo trên nền tảng",
    "查看全部": "Xem tất cả",
    "載入預測中...": "Đang tải dự đoán...",
    "暫無預測": "Không có dự đoán nào",
    "稍後再回來查看新挑戰！": "Hãy quay lại sau để xem các thử thách mới!",
    "查看詳情": "Xem chi tiết",
    
    # Predictions
    "預測": "Dự đoán",
    "進行中的預測": "Dự đoán đang hoạt động",
    "建立預測": "Tạo dự đoán",
    "預測標題": "Tiêu đề dự đoán",
    "預測描述": "Mô tả dự đoán",
    "預測選項": "Tùy chọn dự đoán",
    "新增選項": "Thêm tùy chọn",
    "移除選項": "Xóa tùy chọn",
    "開始日期": "Ngày bắt đầu",
    "結束日期": "Ngày kết thúc",
    "狀態": "Trạng thái",
    "進行中": "Đang hoạt động",
    "非活動": "Không hoạt động",
    "待處理": "Chờ xử lý",
    "已完成": "Đã hoàn thành",
    "參與者": "Người tham gia",
    "您的預測": "Dự đoán của bạn",
    "提交預測": "Gửi dự đoán",
    "預測提交成功！": "Dự đoán đã được gửi thành công!",
    "暫無預測": "Không có dự đoán nào",
    "載入預測失敗，請重試。": "Không thể tải dự đoán. Vui lòng thử lại.",
    "預測已更新": "Dự đoán đã được cập nhật",
    "預測清單已重新整理。": "Danh sách dự đoán đã được làm mới.",
    "進行您的預測並贏得積分！如果您有足夠的積分可以多次預測。": "Thực hiện dự đoán và giành điểm! Nếu bạn có đủ điểm có thể dự đoán nhiều lần.",
    "預測系統": "Hệ thống dự đoán",
    "可用": "Có sẵn",
    "多個預測可供選擇": "Nhiều dự đoán để lựa chọn",
    "獎勵系統": "Hệ thống phần thưởng",
    "正確預測的回報": "Phần thưởng cho dự đoán đúng",
    "運作方式": "Cách hoạt động",
    "1. 支付參與費用": "1. Thanh toán phí tham gia",
    "2. 進行預測": "2. Thực hiện dự đoán",
    "3. 正確預測可獲得150%回報！": "3. Dự đoán đúng nhận được 150% phần thưởng!",
    "進行中": "Đang hoạt động",
    "暫無進行中的預測": "Không có dự đoán nào đang hoạt động",
    "目前沒有進行中的預測，請稍後再查看新的挑戰！": "Hiện tại không có dự đoán nào đang hoạt động, hãy quay lại sau để xem các thử thách mới!",
    "立即重新整理": "Làm mới ngay",
    "最近完成": "Hoàn thành gần đây",
    "預測如何運作": "Dự đoán hoạt động như thế nào",
    "了解預測系統": "Hiểu về hệ thống dự đoán",
    "選擇預測": "Chọn dự đoán",
    "瀏覽可用的預測並選擇您感興趣的": "Duyệt các dự đoán có sẵn và chọn những gì bạn quan tâm",
    "支付參與費用": "Thanh toán phí tham gia",
    "每個預測需要一定數量的積分才能參與": "Mỗi dự đoán cần một số điểm nhất định để tham gia",
    "進行您的預測": "Thực hiện dự đoán của bạn",
    "提交您的答案 - 如果您有足夠的積分可以多次預測": "Gửi câu trả lời của bạn - nếu bạn có đủ điểm có thể dự đoán nhiều lần",
    "等待結果": "Chờ kết quả",
    "正確預測可獲得參與費用150%的積分！": "Dự đoán đúng nhận được 150% phí tham gia bằng điểm!",
    
    # Surveys
    "問卷調查": "Khảo sát",
    "問卷標題": "Tiêu đề khảo sát",
    "問卷描述": "Mô tả khảo sát",
    "問題": "Câu hỏi",
    "新增問題": "Thêm câu hỏi",
    "問題類型": "Loại câu hỏi",
    "多選題": "Câu hỏi nhiều lựa chọn",
    "文字": "Văn bản",
    "評分": "Đánh giá",
    "問題文字": "Nội dung câu hỏi",
    "選項": "Tùy chọn",
    "必填": "Bắt buộc",
    "提交問卷": "Gửi khảo sát",
    "問卷提交成功！": "Khảo sát đã được gửi thành công!",
    "暫無問卷": "Không có khảo sát nào",
    "參與": "Tham gia",
    "結果": "Kết quả",
    "可用問卷": "Khảo sát có sẵn",
    "完成問卷以賺取積分！": "Hoàn thành khảo sát để kiếm điểm!",
    "載入可用問卷失敗": "Không thể tải khảo sát có sẵn",
    "暫無可用問卷": "Không có khảo sát nào có sẵn",
    "請稍後再回來查看新問卷。": "Hãy quay lại sau để xem khảo sát mới.",
    "賺取 {{points}} 積分": "Kiếm {{points}} điểm",
    "結束於": "Kết thúc vào",
    "開始問卷": "Bắt đầu khảo sát",
    "載入問卷失敗。": "Không thể tải khảo sát.",
    "提交已標記": "Gửi đã được đánh dấu",
    "提交錯誤": "Lỗi gửi",
    "無法提交您的答案。": "Không thể gửi câu trả lời của bạn.",
    "載入問卷中...": "Đang tải khảo sát...",
    "問卷已完成": "Khảo sát đã hoàn thành",
    "謝謝！您已經為此問卷提交了答案。": "Cảm ơn! Bạn đã gửi câu trả lời cho khảo sát này.",
    "返回問卷列表": "Quay lại danh sách khảo sát",
    "找不到問卷。": "Không tìm thấy khảo sát.",
    "其他": "Khác",
    "請指定": "Vui lòng chỉ định",
    "提交中...": "Đang gửi...",
    "提交答案": "Gửi câu trả lời"
}

def translate_text(text):
    """Dịch văn bản từ tiếng Trung sang tiếng Việt"""
    if isinstance(text, str):
        # Tìm kiếm và thay thế các từ tiếng Trung (ưu tiên các từ dài hơn trước)
        sorted_translations = sorted(translations.items(), key=lambda x: len(x[0]), reverse=True)
        for chinese, vietnamese in sorted_translations:
            if chinese in text:
                text = text.replace(chinese, vietnamese)
        return text
    return text

def translate_object(obj):
    """Dịch đệ quy một object"""
    if isinstance(obj, dict):
        return {key: translate_object(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [translate_object(item) for item in obj]
    elif isinstance(obj, str):
        return translate_text(obj)
    else:
        return obj

# Đọc file tiếng Trung
with open('src/i18n/locales/zh-TW.json', 'r', encoding='utf-8') as f:
    zh_data = json.load(f)

# Dịch toàn bộ dữ liệu
vi_data = translate_object(zh_data)

# Thêm tiếng Việt vào common
vi_data['common']['vietnamese'] = 'Tiếng Việt'

# Ghi file tiếng Việt
with open('src/i18n/locales/vi.json', 'w', encoding='utf-8') as f:
    json.dump(vi_data, f, ensure_ascii=False, indent=2)

print("Đã dịch xong file tiếng Việt hoàn chỉnh!")


