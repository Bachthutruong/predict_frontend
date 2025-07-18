# Đa ngôn ngữ (Internationalization - i18n) Setup

## Tổng quan

Ứng dụng đã được tích hợp tính năng đa ngôn ngữ với hỗ trợ:
- Tiếng Anh (English)
- Tiếng Trung phồn thể (繁體中文 - Traditional Chinese)

## Cấu trúc thư mục

```
src/
├── i18n/
│   ├── index.ts              # Cấu hình i18n chính
│   └── locales/
│       ├── en.json           # Translation tiếng Anh
│       └── zh-TW.json        # Translation tiếng Trung phồn thể
├── hooks/
│   └── useLanguage.ts        # Hook tùy chỉnh cho quản lý ngôn ngữ
├── components/
│   └── ui/
│       ├── language-switcher.tsx  # Component chuyển đổi ngôn ngữ
│       └── dropdown-menu.tsx      # Component dropdown menu
└── types/
    └── i18n.d.ts             # Type declarations cho i18n
```

## Cách sử dụng

### 1. Import và sử dụng hook useLanguage

```tsx
import { useLanguage } from '../hooks/useLanguage';

const MyComponent: React.FC = () => {
  const { t, currentLanguage, changeLanguage } = useLanguage();

  return (
    <div>
      <h1>{t('common.title')}</h1>
      <p>{t('common.description')}</p>
      <button onClick={() => changeLanguage('zh-TW')}>
        {t('common.chinese')}
      </button>
    </div>
  );
};
```

### 2. Sử dụng translation key

```tsx
// Sử dụng key đơn giản
t('auth.login')

// Sử dụng key nested
t('navigation.dashboard')

// Sử dụng interpolation
t('checkIn.checkInSuccess', { points: 100 })
```

### 3. Thêm LanguageSwitcher vào component

```tsx
import { LanguageSwitcher } from '../components/ui/language-switcher';

const Header: React.FC = () => {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
};
```

## Thêm ngôn ngữ mới

### 1. Tạo file translation mới

Tạo file `src/i18n/locales/[language-code].json`:

```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error"
  },
  "auth": {
    "login": "Login",
    "register": "Register"
  }
}
```

### 2. Cập nhật cấu hình i18n

Trong `src/i18n/index.ts`, thêm ngôn ngữ mới:

```typescript
import newLanguage from './locales/[language-code].json';

const resources = {
  en: {
    translation: en,
  },
  'zh-TW': {
    translation: zhTW,
  },
  '[language-code]': {
    translation: newLanguage,
  },
};
```

### 3. Cập nhật hook useLanguage

Trong `src/hooks/useLanguage.ts`, thêm ngôn ngữ mới:

```typescript
const getAvailableLanguages = useCallback(() => {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
    { code: '[language-code]', name: 'Language Name', nativeName: 'Native Name' }
  ];
}, []);
```

## Cấu trúc Translation Keys

### Common
- `common.loading` - Loading text
- `common.error` - Error text
- `common.success` - Success text
- `common.language` - Language label

### Authentication
- `auth.login` - Login button/label
- `auth.register` - Register button/label
- `auth.email` - Email field label
- `auth.password` - Password field label

### Navigation
- `navigation.dashboard` - Dashboard link
- `navigation.predictions` - Predictions link
- `navigation.surveys` - Surveys link
- `navigation.voting` - Voting link

### Dashboard
- `dashboard.welcome` - Welcome message
- `dashboard.totalPoints` - Total points label
- `dashboard.totalPredictions` - Total predictions label

### Predictions
- `predictions.title` - Predictions page title
- `predictions.createPrediction` - Create prediction button
- `predictions.predictionTitle` - Prediction title field

### Surveys
- `surveys.title` - Surveys page title
- `surveys.surveyTitle` - Survey title field
- `surveys.submitSurvey` - Submit survey button

### Voting
- `voting.title` - Voting page title
- `voting.campaignTitle` - Campaign title field
- `voting.vote` - Vote button

### Profile
- `profile.title` - Profile page title
- `profile.personalInfo` - Personal information section
- `profile.updateProfile` - Update profile button

### Admin
- `admin.title` - Admin dashboard title
- `admin.manageUsers` - Manage users link
- `admin.grantPoints` - Grant points button

### Staff
- `staff.title` - Staff dashboard title
- `staff.manageQuestions` - Manage questions link

### Feedback
- `feedback.title` - Feedback page title
- `feedback.submitFeedback` - Submit feedback button

### Check-in
- `checkIn.title` - Check-in page title
- `checkIn.checkInToday` - Check-in today button

### Errors
- `errors.networkError` - Network error message
- `errors.serverError` - Server error message
- `errors.unauthorized` - Unauthorized error message

### Messages
- `messages.welcomeBack` - Welcome back message
- `messages.loginSuccess` - Login success message
- `messages.dataSaved` - Data saved message

## Lưu ý

1. **Consistency**: Đảm bảo tất cả các key translation đều có trong cả hai ngôn ngữ
2. **Naming Convention**: Sử dụng camelCase cho key names
3. **Nesting**: Sử dụng cấu trúc nested để tổ chức translation keys
4. **Interpolation**: Sử dụng `{{variable}}` để chèn biến vào translation
5. **Pluralization**: i18next hỗ trợ pluralization tự động

## Testing

Để test tính năng đa ngôn ngữ:

1. Chạy ứng dụng: `npm run dev`
2. Sử dụng LanguageSwitcher trong header để chuyển đổi ngôn ngữ
3. Kiểm tra xem tất cả text đã được dịch chưa
4. Test với component LanguageDemo để xem demo

## Troubleshooting

### Lỗi TypeScript với JSON imports
Nếu gặp lỗi TypeScript với JSON imports, đảm bảo file `src/types/i18n.d.ts` đã được tạo và `tsconfig.app.json` bao gồm thư mục `src`.

### Translation không hiển thị
1. Kiểm tra key translation có tồn tại trong file JSON không
2. Đảm bảo đã import và sử dụng hook `useLanguage`
3. Kiểm tra console để xem có lỗi i18n không

### Ngôn ngữ không lưu
1. Kiểm tra localStorage có được enable không
2. Đảm bảo `changeLanguage` function được gọi đúng cách 