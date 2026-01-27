# Grabbitt User App - PRD

## Project Overview
Grabbitt is a customer loyalty app that lets users earn reward points at nearby stores by showing a personal QR code. Users earn points when a seller scans their QR during a purchase and can later redeem those points for rewards or discounts.

## Architecture
- **Platform**: React Native / Expo
- **State Management**: Zustand
- **UI Framework**: React Native Paper
- **Navigation**: Expo Router with Drawer + Tabs
- **Backend**: Firebase (external API)

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

## What's Been Implemented (Jan 27, 2025)

### ✅ Completed Features

1. **Removed QR Scanning Feature**
   - Deleted `scan-qr.tsx` tab (users don't scan, sellers do)
   - Removed camera-related code and components
   - Cleaned up unused scan-success routes

2. **New "My QR" Tab**
   - Created `MyQRCard` component (`/components/qr/my-qr-card.tsx`)
   - Created `my-qr.tsx` screen to replace scan-qr tab
   - Updated tab navigation with "My QR" tab icon

3. **QR Display on Home Screen**
   - Added compact QR card at top of home page
   - Tappable to navigate to full QR screen

4. **QR Display on Profile Page**
   - Added full QR card with share functionality
   - Shows QR code prominently with user name

5. **Updated Navigation**
   - Added "My QR Code" menu item to drawer
   - Updated empty state button text from "Scan QR" to "Show My QR"

6. **Android Swipe Back Fix**
   - `predictiveBackGestureEnabled: false` already in app.json
   - Added `GestureHandlerRootView` wrapper to drawer layout
   - Configured proper gesture handling properties

7. **Code Refactoring**
   - Updated types to include `UserQRCode` interface
   - Cleaned up imports and removed unused FAB component
   - Improved drawer navigation structure

### Files Modified
- `/app/app/(drawer)/(tabs)/_layout.tsx` - Tab navigation
- `/app/app/(drawer)/_layout.tsx` - Drawer navigation
- `/app/components/home/user-home.tsx` - Home screen with QR
- `/app/app/(drawer)/profile.tsx` - Profile with QR
- `/app/components/wallet/empty-state.tsx` - Updated CTA
- `/app/types/auth.ts` - Added UserQRCode type

### Files Created
- `/app/components/qr/my-qr-card.tsx` - QR card component
- `/app/app/(drawer)/(tabs)/my-qr.tsx` - My QR screen

### Files Deleted
- `/app/app/(drawer)/(tabs)/scan-qr.tsx` - Removed scanning
- `/app/components/scan-qr/` - Removed scan components

## Prioritized Backlog

### P0 (Critical - Backend Required)
- [ ] Backend: Generate unique QR on user registration
- [ ] Backend: Store QR in `customer_profile.qr_code`
- [ ] Backend: API to return QR data in user details response

### P1 (Important)
- [ ] Offline QR caching (store base64 locally)
- [ ] QR brightness boost when displaying
- [ ] Pull-to-refresh QR data

### P2 (Nice to Have)
- [ ] Save QR to photo gallery
- [ ] QR fullscreen mode with max brightness
- [ ] Animated QR display effect

## Next Tasks
1. Coordinate with backend team to implement QR generation on signup
2. Test QR display once backend returns data
3. Add offline QR caching for low connectivity
4. Implement brightness control for QR display

## Notes
- QR is currently showing "Loading..." until backend returns `qr_code` in user profile
- Backend needs to generate QR with format: `grabbitt://{unique_id}`
- QR should be generated once and never change (permanent)
