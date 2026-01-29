# Push Notifications - Complete Guide

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │     │  Your Backend   │     │   Expo Push     │
│  (React Native) │     │   (API Server)  │     │    Service      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │  1. Get Push Token    │                       │
         │  (Expo SDK)           │                       │
         │◄──────────────────────┼───────────────────────┤
         │                       │                       │
         │  2. Register Token    │                       │
         │  POST /registerToken  │                       │
         ├──────────────────────►│                       │
         │                       │  3. Store in DB       │
         │                       │                       │
         │                       │  4. Send Notification │
         │                       │  POST to Expo API     │
         │                       ├──────────────────────►│
         │                       │                       │
         │  5. Receive Push      │                       │
         │◄──────────────────────┼───────────────────────┤
         │                       │                       │
```

## Flow Explanation

### 1. App Side (Already Implemented)

The app automatically:
- Requests notification permissions on startup
- Gets the Expo Push Token
- Sends token to your backend via `POST /registerPushToken`
- Handles incoming notifications
- Navigates to screens based on notification data

### 2. Backend Side (You Need to Implement)

Your backend needs to:
- Store push tokens in database (linked to user_id)
- Send notifications via Expo Push API when events occur
- Handle invalid tokens (remove from DB)

## Database Schema

```sql
-- PostgreSQL example
CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    platform VARCHAR(10) NOT NULL, -- 'ios' or 'android'
    device_name VARCHAR(255),
    device_model VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, token)
);

CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
```

```javascript
// MongoDB example
{
  user_id: "seller_123",
  token: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  platform: "android",
  device_name: "Pixel 7",
  device_model: "Pixel 7 Pro",
  created_at: ISODate("2025-01-29T10:00:00Z"),
  updated_at: ISODate("2025-01-29T10:00:00Z")
}
```

## API Endpoints to Implement

### 1. Register Token
```http
POST /registerPushToken
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "android",
  "device_name": "Pixel 7",
  "device_model": "Pixel 7 Pro"
}
```

### 2. Unregister Token (on logout)
```http
POST /unregisterPushToken
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

## Sending Notifications from Backend

### Using Expo Push API Directly

```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "title": "New Order!",
    "body": "You have a new order #12345",
    "data": {
      "type": "new_order",
      "order_id": "12345",
      "screen": "/(drawer)/redemptions"
    },
    "sound": "default",
    "channelId": "orders"
  }'
```

### Using Python (see `/backend-examples/expo_push_service.py`)

```python
from expo_push_service import ExpoPushService, NotificationChannel

service = ExpoPushService()

# Send notification
await service.send_notification(
    token="ExponentPushToken[xxxxx]",
    title="🎉 New Order!",
    body="Customer John placed order #12345",
    data={
        "type": "new_order",
        "order_id": "12345",
        "screen": "/(drawer)/redemptions"
    },
    channel_id=NotificationChannel.ORDERS
)
```

### Using Node.js (see `/backend-examples/expoPushService.ts`)

```typescript
import { pushService, NotificationChannel } from './expoPushService';

// Send notification
await pushService.sendNotification({
  token: "ExponentPushToken[xxxxx]",
  title: "🎉 New Order!",
  body: "Customer John placed order #12345",
  data: {
    type: "new_order",
    orderId: "12345",
    screen: "/(drawer)/redemptions"
  },
  channelId: NotificationChannel.ORDERS
});
```

## Notification Channels (Android)

| Channel ID    | Purpose                          | Importance |
|---------------|----------------------------------|------------|
| `default`     | General notifications            | MAX        |
| `orders`      | Orders & transactions            | HIGH       |
| `promotions`  | Special offers & promotions      | DEFAULT    |
| `reminders`   | Daily summaries & reminders      | HIGH       |

## Deep Linking

When you send a notification with `data`, include a `screen` field:

```json
{
  "data": {
    "type": "new_order",
    "screen": "/(drawer)/redemptions",
    "params": { "orderId": "12345" }
  }
}
```

The app will automatically navigate to this screen when the user taps the notification.

## When to Send Notifications

| Event                    | Title                  | Channel      |
|--------------------------|------------------------|--------------|
| New customer scan        | "⭐ Points Awarded"    | orders       |
| Redemption request       | "🎁 New Redemption"    | orders       |
| Offer goes live          | "📅 Offer Live"        | reminders    |
| Daily summary            | "📊 Daily Summary"     | reminders    |
| Promotional              | Custom                 | promotions   |

## Testing

1. **Physical Device Required**: Push notifications don't work on simulators
2. **Expo Go**: For testing, use Expo Go app
3. **Production Build**: For production, create a standalone build

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No token received | Check if running on physical device |
| Notification not showing | Check Android channel configuration |
| Token invalid | Token expired, get new one |
| Permission denied | Guide user to settings |

## Files Reference

- **App Service**: `/app/services/pushNotification.ts`
- **App Hook**: `/app/hooks/usePushNotifications.ts`
- **App Context**: `/app/contexts/NotificationContext.tsx`
- **Settings UI**: `/app/components/profile/notification-settings.tsx`
- **Python Backend**: `/app/backend-examples/expo_push_service.py`
- **Node.js Backend**: `/app/backend-examples/expoPushService.ts`
