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

## User Personas
1. **Customer/User**: Earns loyalty points by showing QR at stores
2. **Seller**: Scans customer QR to award points (separate app)

## Core Requirements (Functional)
### QR Code System
- **User QR**: Unique, permanent, non-editable QR generated at signup
- **Redemption QR**: Single-use, time-bound (handled by backend)

### Performance Requirements
- Work with low internet
- Work on slow devices
- Minimal steps at checkout

---

## What's Been Implemented

### Session 1 (Jan 27, 2025) - Initial Setup & QR Feature

#### ✅ QR Feature Overhaul
- Removed QR scanning feature (users show QR, sellers scan)
- Created `MyQRCard` component (`/components/qr/my-qr-card.tsx`)
- Created `my-qr.tsx` screen replacing scan-qr tab
- QR display on Home screen (compact tappable card)
- QR display on Profile page (full with share)
- Updated navigation (drawer + tabs)

### Session 2 (Jan 27, 2025) - Production Readiness Refactoring

#### ✅ Code Architecture Improvements

**Utils Layer** (`/app/utils/`)
- `constants.ts` - Centralized app constants, business types, status metadata
- `formatters.ts` - Date, currency, phone, points formatting utilities
- `errorHandler.ts` - Unified error handling with alerts and logging
- `styles.ts` - Common reusable styles (layout, card, text, button)
- `helper.ts` - Enhanced with debounce, delay, isEmpty, safeJsonParse utilities
- `app-routes.ts` - Type-safe route definitions
- `index.ts` - Barrel export for easy imports

**Services Layer** (`/app/services/`)
- `api.ts` - Centralized API service (user, store, wallet, redemption, perks APIs)
- `axiosInstance.ts` - Enhanced with better error handling & token refresh
- `userService.ts` - Refactored to use new API service
- `index.ts` - Barrel export

**Hooks Layer** (`/app/hooks/`)
- `useRefresh.ts` - Generic data fetching with loading/error states
- `useForm.ts` - Form state management with validation
- `index.ts` - Barrel export

**Components Layer**
- `/components/common/index.tsx` - Reusable UI: Spacer, Divider, Badge, IconButton, InfoRow, EmptyStateView, SectionHeader
- `/components/common/ScreenWrapper.tsx` - Consistent screen layout wrapper
- `/components/shared/loading-view.tsx` - Enhanced with LoadingPlaceholder, ErrorView components
- `/components/shared/index.ts` - Barrel export
- `/components/ui/index.ts` - Barrel export

**Types Layer** (`/app/types/`)
- `auth.ts` - Added UserQRCode interface
- `index.ts` - Barrel export for all types

#### ✅ UI/UX Improvements
- Android swipe back gesture handling fixed (GestureHandlerRootView)
- Drawer menu with proper test IDs for automation
- QR card with loading/placeholder states
- Consistent external links from constants

#### ✅ Code Quality
- Removed duplicate business types definition
- Cleaned up unused imports (BackHandler, FAB)
- Proper TypeScript types across new utilities
- Consistent error handling pattern

---

## File Structure (After Refactoring)

```
/app/
├── app/                    # Expo Router screens
│   ├── (drawer)/
│   │   ├── (tabs)/
│   │   │   ├── home.tsx
│   │   │   ├── my-qr.tsx     # NEW
│   │   │   ├── wallet.tsx
│   │   │   └── _layout.tsx
│   │   ├── profile.tsx
│   │   ├── store/
│   │   ├── redeem/
│   │   └── _layout.tsx
│   ├── auth/
│   └── _layout.tsx
├── components/
│   ├── common/              # NEW - Reusable components
│   │   ├── index.tsx
│   │   └── ScreenWrapper.tsx
│   ├── home/
│   ├── modals/
│   ├── perks/
│   ├── profile/
│   ├── qr/                  # NEW
│   │   └── my-qr-card.tsx
│   ├── shared/
│   │   ├── index.ts
│   │   ├── app-header.tsx
│   │   └── loading-view.tsx
│   ├── store/
│   ├── ui/
│   │   ├── index.ts         # NEW
│   │   └── ...
│   ├── wallet/
│   └── wrappers/
├── hooks/
│   ├── index.ts             # NEW
│   ├── useForm.ts           # NEW
│   ├── useRefresh.ts        # NEW
│   └── ...
├── services/
│   ├── index.ts             # NEW
│   ├── api.ts               # NEW
│   ├── axiosInstance.ts     # IMPROVED
│   └── ...
├── store/
│   └── authStore.ts
├── types/
│   ├── index.ts             # NEW
│   ├── auth.ts              # IMPROVED
│   └── ...
└── utils/
    ├── index.ts             # NEW
    ├── constants.ts         # NEW (replaces constant.ts)
    ├── errorHandler.ts      # NEW
    ├── formatters.ts        # NEW
    ├── styles.ts            # NEW
    └── ...
```

---

## Prioritized Backlog

### P0 (Critical - Backend Required)
- [ ] Backend: Generate unique QR on user registration
- [ ] Backend: Store QR in `customer_profile.qr_code`
- [ ] Backend: API to return QR data in user details response

### P1 (Important)
- [ ] Offline QR caching (store base64 locally)
- [ ] QR brightness boost when displaying
- [ ] Pull-to-refresh QR data
- [ ] Error boundary implementation

### P2 (Nice to Have)
- [ ] Save QR to photo gallery
- [ ] QR fullscreen mode with max brightness
- [ ] Animated QR display effect
- [ ] Performance monitoring (Sentry)

---

## Next Tasks
1. Coordinate with backend team to implement QR generation on signup
2. Test QR display once backend returns data
3. Add offline QR caching for low connectivity
4. Implement brightness control for QR display
5. Add unit tests for utility functions

---

## Notes
- QR is currently showing placeholder until backend returns `qr_code` in user profile
- Backend needs to generate QR with format: `grabbitt://{unique_id}`
- QR should be generated once and never change (permanent)
- All external links centralized in `utils/constants.ts`
- Use barrel exports (`import { X } from "@/utils"`) for cleaner imports
