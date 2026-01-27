# Grabbitt Seller App - PRD

## Project Overview
Grabbitt Seller is the merchant-side app for the Grabbitt loyalty platform. Sellers use this app to:
- Generate QR codes for customers to scan (earn points)
- Scan customer redemption QR codes
- Manage offers and promotions ("What's New")
- View analytics and insights
- Manage subscription plans

## Architecture
- **Platform**: React Native / Expo (SDK 54)
- **State Management**: Zustand
- **UI Framework**: React Native Paper
- **Navigation**: Expo Router with Drawer + Tabs
- **Backend**: Firebase (external API)
- **In-App Purchases**: react-native-iap (iOS)

## Tech Stack
- React Native 0.81.5
- Expo ~54.0.0
- expo-router ~6.0.13
- react-native-paper ^5.14.5
- zustand ^5.0.8
- expo-camera (QR scanning)
- react-native-iap

---

## What's Been Implemented (Jan 27, 2025)

### ✅ Refactoring & Production Readiness

#### 1. Global Error Boundary
- Added `ErrorBoundary` wrapper in `_layout.tsx`
- Catches all React crashes with friendly recovery UI
- "Restart App" and "Try Again" options
- Error details in development mode

#### 2. Navigation & Gesture Handling
- Updated drawer layout with `GestureHandlerRootView`
- Proper swipe gesture configuration
- Enhanced back navigation in `app-header.tsx`
- Uses `navigation.canGoBack()` with home fallback

#### 3. Drawer Menu Improvements
- Added `testID` props for testing
- Uses `EXTERNAL_LINKS` from constants
- Proper logout with destructive style
- Touch feedback with `activeOpacity`

### ✅ Bug Fixes

#### 1. Generate QR Screen - Notes Section (Light Theme)
- **Issue**: White background on Dynamic QR notes card
- **Fix**: Changed `backgroundColor: 'transparent'` to `theme.colors.surfaceVariant`
- **File**: `/app/app/(drawer)/(tabs)/generate-qr.tsx`

#### 2. Registration - Location Mandatory
- **Issue**: Location was optional during registration
- **Fix**: Made latitude/longitude mandatory with proper error message
- **File**: `/app/hooks/use-seller-registration.ts`

#### 3. Business Verification Validation
- **Issue**: No format validation for GST/PAN numbers
- **Fix**: Added regex validation with helper text
  - GST: `22AAAAA0000A1Z5` format
  - PAN: `ABCDE1234F` format
- **File**: `/app/components/auth/verification-step.tsx`

#### 4. Scan QR Button on Wallet Page
- **Issue**: Button navigated to wrong route (`my-qr`)
- **Fix**: Now navigates to `/(drawer)/(tabs)/redeem-qr`
- **File**: `/app/components/wallet/empty-state.tsx`

#### 5. Rewards Accordion Color (Light Theme)
- **Issue**: Poor visibility with backdrop color in light theme
- **Fix**: Uses `surfaceVariant` for light theme, `backdrop` for dark
- **File**: `/app/components/store/rewards-card.tsx`

#### 6. Calendar Date Range for What's New
- **Issue**: Could only select single date for offers
- **Fix**: Added date range mode with "Single Day" / "Date Range" toggle
- Saves offers for all dates in selected range
- **File**: `/app/app/(drawer)/whats-new/offer-add.tsx`

---

## File Structure

```
/app/
├── app/
│   ├── _layout.tsx              ✅ ErrorBoundary added
│   ├── (drawer)/
│   │   ├── _layout.tsx          ✅ GestureHandlerRootView
│   │   ├── (tabs)/
│   │   │   ├── dashboard.tsx
│   │   │   ├── generate-qr.tsx  ✅ Fixed light theme
│   │   │   ├── redeem-qr.tsx
│   │   │   └── ai-insights.tsx
│   │   ├── whats-new/
│   │   │   ├── whats-new-home.tsx
│   │   │   └── offer-add.tsx    ✅ Date range added
│   │   └── ...
│   └── auth/
│       └── register.tsx
├── components/
│   ├── auth/
│   │   ├── location-step.tsx
│   │   └── verification-step.tsx ✅ GST/PAN validation
│   ├── shared/
│   │   ├── app-header.tsx       ✅ Enhanced navigation
│   │   └── ErrorBoundary.tsx
│   ├── store/
│   │   └── rewards-card.tsx     ✅ Fixed accordion color
│   └── wallet/
│       └── empty-state.tsx      ✅ Fixed scan button
├── hooks/
│   └── use-seller-registration.ts ✅ Location mandatory
└── utils/
    └── constants.ts
```

---

## Validation Rules Added

### GST Number
- Format: `22AAAAA0000A1Z5`
- Regex: `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/`

### PAN Number
- Format: `ABCDE1234F`
- Regex: `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/`

---

## Prioritized Backlog

### P0 (Critical)
- [ ] Test all QR code generation flows
- [ ] Verify redemption QR scanning works

### P1 (Important)
- [ ] Add offline support for QR generation
- [ ] Performance optimization for dashboard
- [ ] Analytics improvements

### P2 (Nice to Have)
- [ ] Dark/light theme toggle in settings
- [ ] Export transaction history
- [ ] Push notifications for redemptions

---

## Next Tasks
1. Test all fixed bugs on device
2. Add unit tests for validation functions
3. Implement Sentry for error tracking
4. Review UI consistency across all screens
