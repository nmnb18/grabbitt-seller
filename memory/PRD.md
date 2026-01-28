# Grabbitt Seller App - PRD

## Project Overview
Grabbitt Seller is the merchant-side app for the Grabbitt loyalty platform. Sellers use this app to:
- **Scan customer QR codes** to award reward points (NEW FLOW)
- Scan customer redemption QR codes to process redemptions
- Manage offers and promotions ("What's New")
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

## Known TypeScript Issues (Pre-existing)
These issues exist in the codebase but don't affect app functionality:
- `theme.colors.text` should be `theme.colors.onSurface` in multiple components
- `dayjs` module type declarations missing
- Custom Button component doesn't accept `style` prop
- Some missing type declarations for expo-updates

---

## Next Tasks
1. Backend team: Implement new API endpoints
2. Test scan flow with real customer QR codes
3. Add analytics tracking for scans
4. Consider offline caching for customer data
5. Fix remaining TypeScript errors for cleaner builds
