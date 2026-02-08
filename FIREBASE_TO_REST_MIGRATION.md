# Firebase Callable to REST API Migration - Complete

## Overview
Successfully migrated the Grabbitt Seller Frontend from Firebase Callable Functions to production-ready REST API calls with Bearer token authentication.

## Changes Made

### 1. **New REST API Service** (`services/restApi.ts`)
- Created comprehensive REST API service layer with all endpoints
- Proper error handling and consistency across all API calls
- Production-ready implementation with axios

#### Endpoints Structure:
```
User APIs:
  POST   /api/auth/login
  POST   /api/auth/register
  POST   /api/auth/forgot-password
  POST   /api/auth/reset-password
  POST   /api/auth/logout
  POST   /api/auth/change-password
  POST   /api/auth/refresh
  GET    /api/users/:uid
  PATCH  /api/users/profile/:section
  DELETE /api/users/account

Store/Seller APIs:
  GET    /api/sellers/nearby
  GET    /api/sellers/:sellerId
  GET    /api/sellers/:sellerId/balance
  POST   /api/sellers/register
  DELETE /api/sellers/:sellerId
  GET    /api/sellers/offers
  GET    /api/sellers/redeemed-perks
  DELETE /api/sellers/offers/:date
  POST   /api/sellers/offers
  PATCH  /api/sellers/media

Wallet APIs:
  GET    /api/wallet
  GET    /api/wallet/transactions

Redemption APIs:
  GET    /api/redemptions/history
  POST   /api/redemptions
  GET    /api/redemptions/:redemptionId/qr
  GET    /api/sellers/redemptions
  POST   /api/sellers/redemptions/process

Perks APIs:
  POST   /api/perks/claim
  GET    /api/sellers/:sellerId/perk

Notification APIs:
  POST   /api/notifications/register
  POST   /api/notifications/unregister
  GET    /api/notifications/unread-count
  GET    /api/notifications
  PATCH  /api/notifications/mark-read

QR Code APIs:
  POST   /api/qr/generate
  POST   /api/qr/scan
  GET    /api/qr/active
  POST   /api/qr/scan-user

Payment APIs:
  POST   /api/payments/orders
  POST   /api/payments/verify
  POST   /api/coupons/apply
  POST   /api/payments/verify-iap

Offers APIs:
  GET    /api/sellers/offers
  GET    /api/sellers/redeemed-perks
  DELETE /api/sellers/offers/:date
  POST   /api/sellers/offers
  POST   /api/offers/verify-code

Analytics APIs:
  GET    /api/analytics/stats
  GET    /api/analytics/advanced

Subscription APIs:
  GET    /api/subscriptions/history
```

### 2. **Enhanced Auth Store** (`store/authStore.ts`)
- Added token storage (`idToken`, `refreshTokenValue`)
- Tokens persisted in AsyncStorage
- New `setTokens()` method for token management
- Updated `refreshToken()` to handle token refresh logic
- Login now saves both user data and tokens
- Logout removes all auth data including tokens

```typescript
interface AuthStore {
  user: User | null;
  idToken: string | null;              // NEW: JWT access token
  refreshTokenValue: string | null;    // NEW: Refresh token
  loading: boolean;
  isLoggingOut: boolean;
  setUser: (user: User | null) => void;
  setTokens: (idToken: string | null, refreshToken: string | null) => void;  // NEW
  register: (payload: UserPayload) => Promise<void>;
  login: (email: string, password: string, role: "seller" | "user") => Promise<void>;
  fetchUserDetails: (uid: string, role: "seller" | "user") => Promise<void>;
  logout: (uid: string) => Promise<void>;
  loadUser: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}
```

### 3. **Production-Ready Axios Instance** (`services/axiosInstance.ts`)
- Request interceptor: Automatically attaches Bearer token to all requests
- Response interceptor: Handles 401 Unauthorized and token refresh automatically
- Headers: `Authorization: Bearer <idToken>`
- Auto-retry on token refresh

```typescript
// Request Interceptor Flow:
1. Get idToken from authStore
2. Add Authorization header: `Bearer {token}`
3. Send request

// Response Interceptor Flow:
1. If 401 Unauthorized:
   a. Get refreshToken from authStore
   b. Call refreshToken() to get new token
   c. Update Authorization header with new token
   d. Retry original request
2. If refresh fails, reject request
```

### 4. **Updated API Service** (`services/api.ts`)
- Now re-exports all REST API functions from `restApi.ts`
- Serves as the public API surface
- All legacy imports continue to work

```typescript
// Before: Firebase callable functions
import { userApi as fbUserApi } from "./firebaseFunctions";

// After: REST API
export { userApi, storeApi, ... } from './restApi';
```

### 5. **Services Index** (`services/index.ts`)
- Updated to export REST API service
- Added axiosInstance export for advanced use cases
- Maintains backwards compatibility

## Migration Benefits

1. **No Firebase Dependency**: Pure REST API calls
2. **Bearer Token Authentication**: Standard JWT/OAuth pattern
3. **Better Error Handling**: Consistent error structure across all endpoints
4. **Auto Token Refresh**: Interceptors handle 401s automatically
5. **Production Ready**: Proper timeouts, retries, error logging
6. **Type Safe**: Full TypeScript support
7. **Performance**: No Firebase library overhead

## Token Management Flow

```
Login:
┌─────────────────────────────────────────┐
│ User submits credentials                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ POST /api/auth/login                    │
│ Returns: { idToken, refreshToken, ... } │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ authStore.setTokens(idToken, refresh)   │
│ Save to AsyncStorage & state             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Store user in AsyncStorage               │
│ Set loading: false                       │
└─────────────────────────────────────────┘

API Request:
┌─────────────────────────────────────────┐
│ Request Interceptor                     │
│ Attach: Authorization: Bearer {idToken} │
└──────────────┬──────────────────────────┘
               │
               ▼
         [ API Call ]
               │
         ┌─────┴─────┐
         │           │
      Success      Error (401)
         │           │
         │           ▼
         │    ┌──────────────────────────┐
         │    │ Response Interceptor     │
         │    │ Detect 401 Unauthorized  │
         │    └─────────┬────────────────┘
         │              │
         │              ▼
         │    ┌──────────────────────────┐
         │    │ POST /api/auth/refresh   │
         │    │ Send: { refreshToken }   │
         │    └─────────┬────────────────┘
         │              │
         │              ▼
         │    ┌──────────────────────────┐
         │    │ Get new idToken          │
         │    │ Update store & header    │
         │    │ Retry original request   │
         │    └─────────┬────────────────┘
         │              │
         └──────┬───────┘
                │
                ▼
          [ Return Result ]

Logout:
┌──────────────────────────────────────┐
│ POST /api/auth/logout                │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Clear AsyncStorage                   │
│ - Remove "user"                      │
│ - Remove "idToken"                   │
│ - Remove "refreshToken"              │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Reset authStore state                │
│ - user = null                        │
│ - idToken = null                     │
│ - refreshTokenValue = null           │
└──────────────────────────────────────┘
```

## Usage Examples

### Using the API Service
```typescript
import { userApi, storeApi, offersApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

// Login
const response = await userApi.loginUser({ 
  email: 'seller@example.com', 
  password: 'password123',
  role: 'seller' 
});
// Automatically saves tokens via authStore

// Get user details (Bearer token attached automatically)
const userDetails = await userApi.getDetails(uid);

// Get seller offers (Bearer token attached automatically)
const offers = await offersApi.getSellerOffers();

// Token is automatically refreshed if it expires
```

### Manual Token Management
```typescript
import { useAuthStore } from '@/store/authStore';

const authStore = useAuthStore();

// Get current token
const token = authStore.idToken;

// Manually set tokens
authStore.setTokens(newIdToken, newRefreshToken);

// Manually refresh token
const newToken = await authStore.refreshToken();
```

### Using Axios Directly (Advanced)
```typescript
import { axiosInstance } from '@/services';

// Already has Bearer token attached via interceptor
const response = await axiosInstance.get('/api/custom-endpoint');

// Headers are automatically set
// Authorization: Bearer {idToken}
```

## Environment Configuration

Ensure your `.env.local` or `app.json` has:

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_BACKEND_URL": "https://api.yourdomain.com"
    }
  }
}
```

Or as environment variable:
```bash
EXPO_PUBLIC_BACKEND_URL=https://api.yourdomain.com
```

## Testing the Migration

### 1. Test Login
```typescript
await authStore.login('test@example.com', 'password', 'seller');
// Should save tokens to AsyncStorage
```

### 2. Test Token Persistence
```typescript
// Close app, reopen
await authStore.loadUser();
// Should restore tokens from AsyncStorage
```

### 3. Test API Calls
```typescript
const offers = await offersApi.getSellerOffers();
// Should automatically include Bearer token in request
```

### 4. Test Token Refresh
```typescript
// Simulate token expiry (manually for testing)
// API will auto-refresh when it detects 401
```

## Error Handling

All API errors follow this structure:
```typescript
{
  success: false,
  error: "Error message from server or axios",
  code: 401 | 400 | 500 | "UNKNOWN_ERROR"
}
```

## Rollback Instructions (If Needed)

To revert to Firebase callable functions:

1. Change imports in authStore:
```typescript
import { userApi as fbUserApi } from "@/services/firebaseFunctions";
```

2. Revert API service exports to firebase functions

However, **this migration is final** - all new code should use REST API.

## Next Steps

1. **Backend Implementation**: Ensure your backend has all listed endpoints
2. **Environment Setup**: Configure `EXPO_PUBLIC_BACKEND_URL`
3. **Testing**: Test all critical flows (login, API calls, token refresh)
4. **Monitoring**: Log API errors and token refresh events
5. **Firebase Cleanup**: Remove firebase callable functions from backend (optional)

## Files Modified

- ✅ `services/restApi.ts` - NEW: REST API service
- ✅ `services/api.ts` - Updated to export REST API
- ✅ `services/axiosInstance.ts` - Enhanced with interceptors
- ✅ `services/index.ts` - Updated exports
- ✅ `store/authStore.ts` - Enhanced with token management

## Notes

- Firebase callable functions service (`firebaseFunctions.ts`) is still available but deprecated
- All new code should import from `api.ts` which re-exports REST API
- Token refresh happens automatically - no manual intervention needed
- All tokens are persisted in AsyncStorage for app restarts
