# Grabbitt User App - PRD

## Project Overview
Grabbitt is a customer loyalty app that lets users earn reward points at nearby stores by showing a personal QR code. Users earn points when a seller scans their QR during a purchase and can later redeem those points for rewards or discounts.

## Architecture
- **Platform**: React Native / Expo (SDK 53)
- **State Management**: Zustand (authStore)
- **UI Framework**: React Native Paper
- **Navigation**: Expo Router with Drawer + Tabs
- **Backend**: Firebase (external API)
- **Styling**: Custom theme system with light/dark mode support

## Tech Stack
- React Native 0.79.2
- Expo ~53.0.17
- expo-router ~6.0.22
- react-native-paper ^5.14.4
- zustand ^5.0.5
- axios
- firebase (external backend)

---

## What's Been Implemented

### Session 1 - QR Feature Overhaul
- Removed QR scanning feature (users show QR, sellers scan)
- Created `MyQRCard` component with loading/placeholder states
- QR display on Home screen (compact tappable card)
- QR display on Profile page (full with share)

### Session 2 - Production Readiness

#### Utils Layer (`/app/utils/`)
- `constants.ts` - Centralized constants
- `formatters.ts` - Date, currency, formatting utilities
- `errorHandler.ts` - Unified error handling
- `styles.ts` - Reusable style patterns
- `helper.ts` - Utility functions (debounce, isEmpty, etc.)
- `app-routes.ts` - Type-safe route definitions

#### Services Layer (`/app/services/`)
- `api.ts` - Centralized API service
- `axiosInstance.ts` - Enhanced with 401 handling

#### Hooks Layer (`/app/hooks/`)
- `useRefresh.ts` - Generic data fetching
- `useForm.ts` - Form state management

#### Common Components (`/app/components/common/`)
- Spacer, Divider, Badge, IconButton, InfoRow, EmptyStateView, SectionHeader

### Session 3 - Navigation & Error Handling ✅

#### Navigation Improvements
1. **Enhanced GradientHeader** (`/app/components/shared/app-header.tsx`)
   - Proper back navigation with `useNavigation().canGoBack()` check
   - Fallback to home screen when no back history
   - Touch feedback on back button
   - Added `testID` support for testing

2. **BackHeader & BackHeaderV2** - Alternative header styles for different screens

3. **Screen-level Navigation**
   - All screens now use `useNavigation` for proper back handling
   - Consistent fallback to `/(drawer)/(tabs)/home` when stack is empty
   - Fixed redemption QR "Done" button to go home properly

#### Error Handling System
1. **New Error Components** (`/app/components/shared/screen-error.tsx`)
   - `ScreenError` - Full-screen error with retry
   - `NetworkError` - WiFi/connection issues
   - `NotFoundError` - 404 cases
   - `PermissionError` - Access denied
   - `InlineError` - Smaller error display for sections

2. **Global Error Boundary** (`/app/components/shared/ErrorBoundary.tsx`) ✅ NEW
   - Catches all React crashes app-wide
   - Shows friendly "Oops!" screen with restart options
   - "Restart App" button uses Expo Updates to reload
   - "Try Again" button attempts state reset
   - Shows error details in development mode
   - Contact support info displayed

3. **Screen Error Boundary** (`/app/components/shared/ScreenErrorBoundary.tsx`) ✅ NEW
   - Lightweight boundary for individual screens
   - Allows screen-level recovery without full app restart

4. **Store Details** - Now shows proper error states instead of auto-navigating back

#### Fixed Issues
- Removed unused `subscription-watcher.ts` import from authStore
- Fixed Android swipe back gesture
- Consistent back navigation across all screens

---

## File Structure

```
/app/
├── app/
│   ├── (drawer)/
│   │   ├── (tabs)/
│   │   │   ├── home.tsx
│   │   │   ├── my-qr.tsx
│   │   │   ├── wallet.tsx
│   │   │   └── _layout.tsx
│   │   ├── profile.tsx
│   │   ├── store/
│   │   │   └── store-details.tsx  ✅ Enhanced
│   │   ├── redeem/
│   │   │   ├── redeem-home.tsx    ✅ Enhanced
│   │   │   ├── redemption-qr.tsx  ✅ Enhanced
│   │   │   └── redemption-history.tsx
│   │   └── _layout.tsx
│   └── auth/
├── components/
│   ├── common/
│   │   ├── index.tsx
│   │   └── ScreenWrapper.tsx
│   ├── qr/
│   │   └── my-qr-card.tsx
│   ├── shared/
│   │   ├── index.ts
│   │   ├── app-header.tsx
│   │   ├── loading-view.tsx
│   │   ├── screen-error.tsx
│   │   ├── ErrorBoundary.tsx      ✅ NEW
│   │   └── ScreenErrorBoundary.tsx ✅ NEW
│   └── ui/
├── hooks/
│   ├── index.ts
│   ├── useForm.ts
│   └── useRefresh.ts
├── services/
│   ├── index.ts
│   ├── api.ts
│   └── axiosInstance.ts
├── store/
│   └── authStore.ts            ✅ Fixed import
└── utils/
    ├── index.ts
    ├── constants.ts
    ├── errorHandler.ts
    ├── formatters.ts
    └── styles.ts
```

---

## Navigation Flow

```
Home (default fallback)
├── Store Details → Back to Home/Previous
├── Redeem Home → Back to Store/Previous
│   └── Redemption QR → Done → Home
├── Redemption History → Back to Home/Previous
├── Perks History → Back to Home/Previous
└── Profile → Back to Home/Previous
```

---

## Error Handling Patterns

### Screen-Level Errors
```typescript
if (error && !loading) {
  return (
    <SafeAreaView>
      <GradientHeader title="..." onBackPress={handleBack} />
      {error.type === 'network' ? (
        <NetworkError onRetry={fetchData} />
      ) : error.type === 'notfound' ? (
        <NotFoundError itemName="Store" />
      ) : (
        <ScreenError message={error.message} onRetry={fetchData} />
      )}
    </SafeAreaView>
  );
}
```

### Navigation Handler Pattern
```typescript
const handleBack = () => {
  if (navigation.canGoBack()) {
    router.back();
  } else {
    router.replace("/(drawer)/(tabs)/home");
  }
};
```

---

## Prioritized Backlog

### P0 (Critical - Backend)
- [ ] Generate unique QR on user registration
- [ ] Return QR in user profile API

### P1 (Important)
- [ ] Offline QR caching
- [ ] QR brightness boost
- [ ] Unit tests for utilities
- [ ] Sentry integration for production error tracking

### P2 (Nice to Have)
- [ ] Save QR to gallery
- [ ] Biometric lock for QR display
- [ ] Push notification for points earned

---

## Next Tasks
1. Backend: Implement QR generation
2. Add offline QR storage
3. Test all navigation flows on Android/iOS
4. Add error boundary wrapper
