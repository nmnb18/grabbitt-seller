# Grabbitt Seller App - PRD

## Project Overview
Grabbitt Seller is the merchant-side app for the Grabbitt loyalty platform. Sellers use this app to:
- **Scan customer QR codes** to award reward points (NEW FLOW)
- Scan customer redemption QR codes to process redemptions
- **Manage special offers and promotions ("What's New")** - REDESIGNED
- View analytics and insights
- Manage subscription plans
- **Configure reward programs** via Profile Settings (redesigned UI)

## Architecture
- **Platform**: React Native / Expo (SDK 54)
- **State Management**: Zustand
- **UI Framework**: React Native Paper
- **Navigation**: Expo Router with Drawer + Tabs
- **Backend**: Firebase (external API)
- **In-App Purchases**: react-native-iap (iOS)

---

## What's Been Implemented

### Session 1 - Bug Fixes & Refactoring
- ErrorBoundary wrapper
- Drawer gesture handling
- Navigation improvements
- UI bug fixes (light theme issues)
- Date range picker for offers

### Session 2 - Major Feature Changes ✅

#### 🎯 Remove QR Generation - Scan Customer QR Instead

**Old Flow (Removed):**
- Seller generates QR code (Dynamic/Static/Multiple)
- Customer scans seller's QR to earn points

**New Flow (Implemented):**
- Customer has permanent QR code (from User app)
- Seller scans customer's QR to award points
- Reward calculation based on seller's `reward_type`:
  - `default` → Fixed points (immediate award)
  - `percentage` → % of order amount (requires amount input)
  - `slab` → Tier-based points (requires amount input)

### Session 3 - Reward Settings UI Redesign ✅ (December 2025)

#### 🎨 Redesigned Reward Settings Component

**Changes Made:**
- **Cleaner View Mode**: Active reward type displayed in a color-coded card with status badge
- **Horizontal Pill Selector**: Replaced vertical cards with compact horizontal pills for reward type selection
- **Color-Coded Types**: 
  - Fixed Points: Green (#10B981)
  - Percentage: Amber (#F59E0B)
  - Tiered: Purple (#8B5CF6)
- **Collapsible Advanced Section**: Offers and UPI IDs hidden by default to reduce UI clutter
- **Better Visual Hierarchy**: Icon badge in header, clear section titles
- **React Native Compatibility**: Changed `data-testid` to `testID` throughout
- **State Sync**: Added `useEffect` to sync state when rewards data changes from store

**Files Modified:**
- `/app/components/profile/reward-settings.tsx` - Complete redesign
- `/app/components/shared/index.ts` - Fixed export errors
- `/app/components/shared/app-header.tsx` - Fixed testID attributes

**Test IDs Added:**
- `reward-settings-card`
- `edit-reward-btn`
- `cancel-edit-btn`
- `save-reward-btn`
- `reward-type-default`
- `reward-type-percentage`
- `reward-type-slab`
- `points-input`
- `percentage-input`

#### New Files Created

**Hooks:**
- `/app/hooks/useCustomerScan.ts` - Main hook for scanning and awarding points
  - `processScan()` - Validates customer QR
  - `awardPoints()` - Awards points to customer
  - `calculatePoints()` - Calculates points based on reward type
  - `needsOrderAmount` - Whether to show amount input

**Components:**
- `/app/components/scan/OrderAmountInput.tsx` - Order amount entry screen
  - Shows when `reward_type` is percentage/slab
  - Live points preview as user types
  - Shows reward tiers for slab type

- `/app/components/scan/ScanSuccess.tsx` - Success animation screen
  - Animated checkmark
  - Points awarded badge
  - "Scan Another" / "Done" actions

- `/app/components/scan/index.ts` - Barrel export

**Screens:**
- `/app/app/(drawer)/(tabs)/scan-customer.tsx` - Main scan screen
  - Camera permission handling
  - QR scanning with CameraView
  - State machine: scanning → amount_input → processing → success

#### Files Modified

**Tab Layout:**
- `/app/app/(drawer)/(tabs)/_layout.tsx`
  - Replaced "QR Codes" tab with "Scan QR"
  - Hidden old `generate-qr` tab with `href: null`
  - Updated icons

**Dashboard:**
- `/app/components/dashboard/dashboard.tsx`
  - Removed Active QR section
  - Added Quick Actions section with:
    - Scan Customer QR
    - Redeem Points
    - What's New
  - Updated FAB to "Scan" action

- `/app/app/(drawer)/(tabs)/dashboard.tsx`
  - Removed `useSellerQR` hook dependency
  - Removed `activeQR` state and fetching

**Scanner Overlay:**
- `/app/components/shared/scan-overlay.tsx`
  - Made title/subtitle/bottomText customizable via props

---

## Reward Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  SELLER SCANS CUSTOMER QR                │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────────┐
              │   Validate Customer QR      │
              │   (API: /validateCustomerQR)│
              └─────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────────┐
              │   Check reward_type         │
              └─────────────────────────────┘
                     │            │
          ┌──────────┘            └──────────┐
          ▼                                  ▼
   ┌──────────────┐                 ┌──────────────────┐
   │   DEFAULT    │                 │ PERCENTAGE/SLAB  │
   │ Fixed points │                 │ Need order amt   │
   └──────────────┘                 └──────────────────┘
          │                                  │
          │                                  ▼
          │                         ┌──────────────────┐
          │                         │ Order Amount     │
          │                         │ Input Screen     │
          │                         └──────────────────┘
          │                                  │
          └──────────┬───────────────────────┘
                     ▼
          ┌──────────────────────┐
          │  Award Points        │
          │  (API: /awardPoints) │
          └──────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Success Screen      │
          │  +{points} awarded   │
          └──────────────────────┘
```

---

## File Structure

```
/app/
├── app/
│   ├── (drawer)/
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx         ✅ Updated tabs
│   │   │   ├── dashboard.tsx       ✅ Removed QR refs
│   │   │   ├── scan-customer.tsx   ✅ NEW - Main scan screen
│   │   │   ├── redeem-qr.tsx
│   │   │   ├── ai-insights.tsx
│   │   │   └── generate-qr.tsx     (hidden, kept for reference)
│   │   └── ...
├── components/
│   ├── dashboard/
│   │   └── dashboard.tsx           ✅ Quick Actions added
│   ├── scan/                       ✅ NEW folder
│   │   ├── index.ts
│   │   ├── OrderAmountInput.tsx
│   │   └── ScanSuccess.tsx
│   ├── shared/
│   │   └── scan-overlay.tsx        ✅ Customizable props
│   └── ...
├── hooks/
│   ├── index.ts                    ✅ Export useCustomerScan
│   ├── useCustomerScan.ts          ✅ NEW - Scan & award hook
│   └── ...
```

---

## API Requirements (Backend)

### New Endpoints Needed:

**1. POST /validateCustomerQR**
```typescript
Request: { qr_data: string, customer_id?: string }
Response: {
  success: boolean,
  customer_id: string,
  customer_name: string,
  qr_id: string,
  error?: string
}
```

**2. POST /awardPointsToCustomer**
```typescript
Request: {
  customer_id: string,
  points: number,
  order_amount?: number,
  reward_type: 'default' | 'percentage' | 'slab' | 'flat'
}
Response: {
  success: boolean,
  points_awarded: number,
  customer_name: string,
  transaction_id: string,
  error?: string
}
```

---

## Prioritized Backlog

### P0 (Critical)
- [x] Redesign Reward Settings UI for better UX
- [ ] Backend: Implement /validateCustomerQR endpoint
- [ ] Backend: Implement /awardPointsToCustomer endpoint
- [ ] Test full scan → award flow on device

### P1 (Important)
- [ ] Comprehensive E2E testing with Detox or Appium
- [ ] Add transaction history for points awarded
- [x] Add sound/haptic feedback on successful scan
- [ ] Offline queue for poor connectivity

### P2 (Nice to Have)
- [ ] Bulk scan mode for high-volume periods
- [ ] Daily/weekly points limit per customer
- [ ] Receipt generation
- [ ] Sentry error monitoring integration

---

## Known TypeScript Issues - ALL FIXED ✅
All TypeScript errors have been resolved in Session 3:
- ✅ Added `text` property to theme colors for backward compatibility
- ✅ Added `style` prop to custom Button component
- ✅ Fixed duplicate type exports in types/index.ts
- ✅ Fixed missing module declarations (lottie-react-native, firebase)
- ✅ Fixed type errors in useForm, subscription-watcher, ErrorBoundary
- ✅ Removed unused gestureHandlerProps from drawer layout
- ✅ Fixed boolean coercion in verification-step component

---

### Session 4 - What's New Feature Redesign ✅ (January 2025)

#### 🎯 Complete Redesign of "What's New" (Offers Management)

**New Features:**
1. **Single Date or Date Range Selection**
   - Toggle between "Single Day" and "Date Range" modes
   - Visual date picker with theme support
   - Shows count of days selected for ranges

2. **Tiered Offers (Min 2, Max 10)**
   - Configure multiple offers per date
   - Each offer: Title + Minimum Spend + Terms (optional)
   - Auto-sorted by minimum spend amount
   - Real-time preview section

3. **Future-Only Date Validation**
   - Can only create offers for tomorrow onwards (today+1)
   - Clear info message explaining the rule
   - End date must also be in the future for ranges

4. **Edit Restrictions**
   - Can only edit offers for future dates
   - If today's date equals offer date → READ-ONLY
   - Edit/Delete buttons hidden for non-editable offers

5. **Expired Tab with Copy Feature**
   - Expired offers shown with "Copy" button
   - Copy opens modal with:
     - Original date reference
     - Date picker (single/range) for new date
     - Editable offers list
     - All validation rules apply

6. **Interactive UX**
   - Tab badges showing count per category
   - Real-time offer preview
   - Validation errors with inline helper text
   - Loading states and overlays

**Files Modified:**
- `/app/app/(drawer)/whats-new/whats-new-home.tsx` - Complete redesign with copy modal
- `/app/app/(drawer)/whats-new/offer-add.tsx` - Redesigned with edit support
- `/app/components/whats-new/offer-card.tsx` - Updated with copy button for expired

**Files Created:**
- `/app/types/perks.ts` - Perk status types

**Test IDs Added:**
- `tab-active`, `tab-upcoming`, `tab-expired`
- `add-offer-fab`

---

### Session 5 - Push Notifications Implementation ✅ (January 2025)

#### 🔔 Production-Ready Expo Push Notifications

**Features Implemented:**
1. **Permission Handling**
   - Automatic permission request on app start
   - Graceful fallback with settings redirect option
   - Permission status tracking

2. **Android Notification Channels**
   - `default` - General notifications
   - `orders` - Order & transaction alerts
   - `promotions` - Special offers
   - `reminders` - Daily summaries

3. **Token Management**
   - Automatic token generation via Expo
   - Backend registration on login
   - Token refresh handling

4. **Notification Types**
   - Push notifications (remote)
   - Local notifications (scheduled)
   - Badge count management

5. **Deep Linking**
   - Navigate to specific screens from notification tap
   - Handles app opened from notification

6. **Settings UI**
   - NotificationSettings component in Profile
   - Toggle individual notification categories
   - Permission status indicator

**Files Created:**
- `/app/services/pushNotification.ts` - Core notification service
- `/app/hooks/usePushNotifications.ts` - React hook for notifications
- `/app/contexts/NotificationContext.tsx` - Global notification state
- `/app/components/profile/notification-settings.tsx` - Settings UI

**Files Modified:**
- `/app/app/_layout.tsx` - Added NotificationProvider
- `/app/app/(drawer)/profile-setup.tsx` - Added NotificationSettings
- `/app/app.json` - Added expo-notifications plugin & iOS background modes

**API Endpoints Required (Backend):**
- `POST /registerPushToken` - Register device token
- `POST /unregisterPushToken` - Unregister on logout

---

## Next Tasks
1. Backend team: Implement push token storage and notification sending
2. Test scan flow with real customer QR codes
3. Add analytics tracking for scans
4. Consider offline caching for customer data
