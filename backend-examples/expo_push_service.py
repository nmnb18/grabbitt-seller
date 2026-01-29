"""
Expo Push Notification Service - Backend Implementation
Use this to send push notifications from your backend server

Prerequisites:
- pip install httpx (or use requests)
- Store user's Expo push tokens in your database

Expo Push API: https://docs.expo.dev/push-notifications/sending-notifications/
"""

import httpx
from typing import List, Optional, Dict, Any
from dataclasses import dataclass
from enum import Enum


class NotificationPriority(str, Enum):
    DEFAULT = "default"
    NORMAL = "normal"
    HIGH = "high"


class NotificationChannel(str, Enum):
    DEFAULT = "default"
    ORDERS = "orders"
    PROMOTIONS = "promotions"
    REMINDERS = "reminders"


@dataclass
class PushNotification:
    """Push notification payload"""
    to: str  # Expo push token (ExponentPushToken[xxx])
    title: str
    body: str
    data: Optional[Dict[str, Any]] = None
    sound: str = "default"
    badge: Optional[int] = None
    channel_id: Optional[str] = None  # Android channel
    priority: NotificationPriority = NotificationPriority.HIGH
    ttl: int = 86400  # Time to live in seconds (default 1 day)
    subtitle: Optional[str] = None  # iOS only


class ExpoPushService:
    """
    Service to send push notifications via Expo's Push API
    
    Usage:
        service = ExpoPushService()
        
        # Send single notification
        result = await service.send_notification(
            token="ExponentPushToken[xxxxx]",
            title="New Order!",
            body="You have a new order #1234",
            data={"type": "order", "order_id": "1234"}
        )
        
        # Send to multiple users
        results = await service.send_bulk_notifications([
            PushNotification(to="token1", title="Hello", body="World"),
            PushNotification(to="token2", title="Hello", body="World"),
        ])
    """
    
    EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def send_notification(
        self,
        token: str,
        title: str,
        body: str,
        data: Optional[Dict[str, Any]] = None,
        sound: str = "default",
        badge: Optional[int] = None,
        channel_id: str = NotificationChannel.DEFAULT,
        priority: NotificationPriority = NotificationPriority.HIGH,
        subtitle: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Send a single push notification
        
        Args:
            token: Expo push token (ExponentPushToken[xxx])
            title: Notification title
            body: Notification body text
            data: Custom data payload (for deep linking, etc.)
            sound: Sound to play ("default" or custom sound name)
            badge: Badge count for iOS
            channel_id: Android notification channel
            priority: Notification priority
            subtitle: iOS subtitle
            
        Returns:
            Response from Expo Push API
        """
        notification = PushNotification(
            to=token,
            title=title,
            body=body,
            data=data or {},
            sound=sound,
            badge=badge,
            channel_id=channel_id,
            priority=priority,
            subtitle=subtitle,
        )
        
        results = await self.send_bulk_notifications([notification])
        return results[0] if results else {"status": "error", "message": "No response"}
    
    async def send_bulk_notifications(
        self,
        notifications: List[PushNotification]
    ) -> List[Dict[str, Any]]:
        """
        Send multiple push notifications in a single request
        
        Args:
            notifications: List of PushNotification objects
            
        Returns:
            List of responses from Expo Push API
        """
        if not notifications:
            return []
        
        # Build payload
        messages = []
        for notif in notifications:
            message = {
                "to": notif.to,
                "title": notif.title,
                "body": notif.body,
                "data": notif.data or {},
                "sound": notif.sound,
                "priority": notif.priority.value,
                "ttl": notif.ttl,
            }
            
            if notif.badge is not None:
                message["badge"] = notif.badge
            if notif.channel_id:
                message["channelId"] = notif.channel_id
            if notif.subtitle:
                message["subtitle"] = notif.subtitle
                
            messages.append(message)
        
        # Send request
        try:
            response = await self.client.post(
                self.EXPO_PUSH_URL,
                json=messages,
                headers={
                    "Accept": "application/json",
                    "Accept-Encoding": "gzip, deflate",
                    "Content-Type": "application/json",
                }
            )
            response.raise_for_status()
            
            result = response.json()
            return result.get("data", [])
            
        except httpx.HTTPError as e:
            print(f"[ExpoPush] HTTP Error: {e}")
            return [{"status": "error", "message": str(e)} for _ in notifications]
        except Exception as e:
            print(f"[ExpoPush] Error: {e}")
            return [{"status": "error", "message": str(e)} for _ in notifications]
    
    async def send_to_user(
        self,
        user_tokens: List[str],
        title: str,
        body: str,
        data: Optional[Dict[str, Any]] = None,
        channel_id: str = NotificationChannel.DEFAULT,
    ) -> List[Dict[str, Any]]:
        """
        Send notification to all devices of a single user
        
        Args:
            user_tokens: List of Expo push tokens for the user
            title: Notification title
            body: Notification body
            data: Custom data payload
            channel_id: Android channel
            
        Returns:
            List of responses
        """
        notifications = [
            PushNotification(
                to=token,
                title=title,
                body=body,
                data=data,
                channel_id=channel_id,
            )
            for token in user_tokens
        ]
        
        return await self.send_bulk_notifications(notifications)
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


# ============================================
# Example FastAPI Integration
# ============================================

"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/notifications", tags=["notifications"])

# Initialize service (do this once at app startup)
push_service = ExpoPushService()


class RegisterTokenRequest(BaseModel):
    push_token: str
    platform: str
    device_name: Optional[str] = None
    device_model: Optional[str] = None


class SendNotificationRequest(BaseModel):
    user_id: str
    title: str
    body: str
    data: Optional[dict] = None
    channel_id: str = "default"


@router.post("/registerPushToken")
async def register_push_token(request: RegisterTokenRequest, user_id: str):
    '''
    Register a device's push token for a user
    Store this in your database associated with the user
    '''
    # Example: Store in MongoDB
    await db.push_tokens.update_one(
        {"user_id": user_id, "token": request.push_token},
        {
            "$set": {
                "platform": request.platform,
                "device_name": request.device_name,
                "device_model": request.device_model,
                "updated_at": datetime.utcnow(),
            },
            "$setOnInsert": {
                "created_at": datetime.utcnow(),
            }
        },
        upsert=True
    )
    
    return {"success": True, "message": "Token registered"}


@router.post("/unregisterPushToken")
async def unregister_push_token(push_token: str, user_id: str):
    '''
    Unregister a device's push token (e.g., on logout)
    '''
    await db.push_tokens.delete_one({
        "user_id": user_id,
        "token": push_token
    })
    
    return {"success": True, "message": "Token unregistered"}


@router.post("/send")
async def send_notification(request: SendNotificationRequest):
    '''
    Send notification to a specific user
    '''
    # Get all tokens for the user
    tokens = await db.push_tokens.find(
        {"user_id": request.user_id}
    ).to_list(100)
    
    if not tokens:
        raise HTTPException(status_code=404, detail="No push tokens found for user")
    
    # Send to all user devices
    results = await push_service.send_to_user(
        user_tokens=[t["token"] for t in tokens],
        title=request.title,
        body=request.body,
        data=request.data,
        channel_id=request.channel_id,
    )
    
    return {"success": True, "results": results}


@router.post("/broadcast")
async def broadcast_notification(title: str, body: str, data: Optional[dict] = None):
    '''
    Send notification to all registered users
    '''
    # Get all tokens
    all_tokens = await db.push_tokens.distinct("token")
    
    notifications = [
        PushNotification(to=token, title=title, body=body, data=data)
        for token in all_tokens
    ]
    
    # Expo recommends sending in batches of 100
    results = []
    for i in range(0, len(notifications), 100):
        batch = notifications[i:i+100]
        batch_results = await push_service.send_bulk_notifications(batch)
        results.extend(batch_results)
    
    return {"success": True, "sent": len(results), "results": results}
"""


# ============================================
# Utility Functions
# ============================================

def is_valid_expo_token(token: str) -> bool:
    """Check if a token is a valid Expo push token"""
    return token.startswith("ExponentPushToken[") and token.endswith("]")


def extract_failed_tokens(results: List[Dict]) -> List[str]:
    """
    Extract tokens that failed from push results
    These should be removed from your database
    """
    failed = []
    for result in results:
        if result.get("status") == "error":
            details = result.get("details", {})
            if details.get("error") in ["DeviceNotRegistered", "InvalidCredentials"]:
                # Token is no longer valid - remove from DB
                failed.append(result.get("id"))
    return failed


# ============================================
# Example Usage
# ============================================

async def example_usage():
    """Example of how to use the push service"""
    
    service = ExpoPushService()
    
    try:
        # Send a single notification
        result = await service.send_notification(
            token="ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
            title="🎉 New Order!",
            body="You received a new order #12345",
            data={
                "type": "new_order",
                "order_id": "12345",
                "screen": "/(drawer)/redemptions",
            },
            channel_id=NotificationChannel.ORDERS,
            priority=NotificationPriority.HIGH,
        )
        print(f"Single notification result: {result}")
        
        # Send bulk notifications
        notifications = [
            PushNotification(
                to="ExponentPushToken[token1]",
                title="Daily Summary",
                body="You earned 150 points today!",
                data={"type": "summary"},
                channel_id=NotificationChannel.DEFAULT,
            ),
            PushNotification(
                to="ExponentPushToken[token2]",
                title="Special Offer",
                body="20% off on all orders today!",
                data={"type": "offer", "screen": "/(drawer)/whats-new/whats-new-home"},
                channel_id=NotificationChannel.PROMOTIONS,
            ),
        ]
        
        results = await service.send_bulk_notifications(notifications)
        print(f"Bulk notification results: {results}")
        
        # Check for failed tokens
        failed = extract_failed_tokens(results)
        if failed:
            print(f"Failed tokens to remove: {failed}")
            # Remove these tokens from your database
        
    finally:
        await service.close()


if __name__ == "__main__":
    import asyncio
    asyncio.run(example_usage())
