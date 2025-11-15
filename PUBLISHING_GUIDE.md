# 📱 Grabbitt - Complete Publishing Guide

This guide will help you publish both **Grabbitt for Business** (Seller App) and **Grabbitt** (User App) to Apple App Store and Google Play Store.

---

## 🎯 Prerequisites

### 1. **Expo Account**
- Sign up at: https://expo.dev
- Create an account (free)
- Login via CLI: `eas login`

### 2. **Apple Developer Account** (for iOS)
- Cost: $99/year
- Sign up at: https://developer.apple.com
- Required for App Store publishing - nmnbakliwal18@gmail.com

### 3. **Google Play Console Account** (for Android)
- One-time fee: $25
- Sign up at: https://play.google.com/console
- Required for Play Store publishing - nmnbakliwal18@gmail.com

---

## 🚀 Step-by-Step Publishing Process

### STEP 1: Login to Expo/EAS

```bash
# Login to your Expo account
eas login

# If you don't have an account, create one at expo.dev first
```

---

### STEP 2: Configure Each App

#### For **Seller App** (Grabbitt for Business):

```bash
cd /app/seller-app

# Initialize EAS project (if not already done)
eas init

# Configure project
# You'll be asked to create a new project or link to existing
# Choose: Create a new project
# Project name: grabbitt-seller (or similar)
```

#### For **User App** (Grabbitt):

```bash
cd /app/user-app

# Initialize EAS project
eas init

# Configure project
# Project name: grabbitt-user (or similar)
```

---

### STEP 3: Build Apps

#### Option A: **Android APK** (Testing)

Build APK for testing (doesn't require Play Store account):

```bash
# Seller App
cd /app/seller-app
eas build --platform android --profile preview

# User App
cd /app/user-app
eas build --platform android --profile preview
```

This will:
- Upload your code to Expo servers
- Build the APK
- Give you a download link
- You can install APK directly on Android devices for testing

#### Option B: **Android AAB** (Production - Play Store)

Build AAB for Google Play Store:

```bash
# Seller App
cd /app/seller-app
eas build --platform android --profile production

# User App
cd /app/user-app
eas build --platform android --profile production
```

You'll need to:
1. **Create a keystore** (EAS can generate one for you)
2. **Save the keystore** credentials securely
3. Download the AAB file after build completes

#### Option C: **iOS** (App Store)

Build for iOS (requires Apple Developer account):

```bash
# Seller App
cd /app/seller-app
eas build --platform ios --profile production

# User App
cd /app/user-app
eas build --platform ios --profile production
```

You'll need to:
1. **Apple Developer credentials** (Apple ID)
2. **App Store Connect** setup
3. **Certificates and provisioning profiles** (EAS can manage these)

---

### STEP 4: Update App Metadata

Before submitting, update your `app.json` files with proper information:

#### **Seller App** (`/app/seller-app/app.json`):

```json
{
  "expo": {
    "name": "Grabbitt for Business",
    "slug": "grabbitt-seller",
    "version": "1.0.0",
    "description": "Manage your loyalty rewards program",
    "icon": "./assets/images/icon.png",
    "splash": {
      "image": "./assets/images/splash.png",
      "backgroundColor": "#0D7377"
    },
    "ios": {
      "bundleIdentifier": "com.grabbitt.seller",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.grabbitt.seller",
      "versionCode": 1,
      "permissions": ["CAMERA"] // For QR generation/scanning
    },
    "privacy": "public"
  }
}
```

#### **User App** (`/app/user-app/app.json`):

```json
{
  "expo": {
    "name": "Grabbitt",
    "slug": "grabbitt",
    "version": "1.0.0",
    "description": "Scan QR codes and earn loyalty rewards",
    "icon": "./assets/images/icon.png",
    "splash": {
      "image": "./assets/images/splash.png",
      "backgroundColor": "#14B8A6"
    },
    "ios": {
      "bundleIdentifier": "com.grabbitt.app",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.grabbitt.app",
      "versionCode": 1,
      "permissions": ["CAMERA"] // For QR scanning
    },
    "privacy": "public"
  }
}
```

---

### STEP 5: Submit to App Stores

#### **Android - Google Play Store:**

1. **Go to Google Play Console**: https://play.google.com/console
2. **Create Two Apps**:
   - "Grabbitt for Business"
   - "Grabbitt"
3. **Upload AAB files** to respective apps
4. **Fill in store listing**:
   - App description
   - Screenshots (at least 2)
   - App icon
   - Feature graphic
   - Privacy policy URL
   - Category
5. **Set pricing** (Free)
6. **Content rating** questionnaire
7. **Submit for review**

**OR use EAS Submit:**

```bash
# Seller App
cd /app/seller-app
eas submit --platform android

# User App
cd /app/user-app
eas submit --platform android
```

#### **iOS - Apple App Store:**

1. **Go to App Store Connect**: https://appstoreconnect.apple.com
2. **Create Two Apps**:
   - "Grabbitt for Business"
   - "Grabbitt"
3. **Upload builds via EAS**:
   ```bash
   # Seller App
   cd /app/seller-app
   eas submit --platform ios
   
   # User App
   cd /app/user-app
   eas submit --platform ios
   ```
4. **Fill in App Information**:
   - Description
   - Keywords
   - Screenshots (required for all device sizes)
   - Privacy policy URL
   - Category
5. **Set pricing** (Free)
6. **Submit for review**

---

## 📋 Store Listing Information

### **Seller App - Grabbitt for Business**

**Title:** Grabbitt for Business

**Short Description:**
Manage your loyalty rewards program with ease

**Full Description:**
Grabbitt for Business helps you create and manage digital loyalty programs for your customers. Generate QR codes, track customer visits, and build lasting relationships with your patrons.

Features:
• Generate QR codes (Dynamic, Static, Hidden)
• Track customer points and rewards
• View business analytics
• AI-powered insights
• Manage reward rules
• Professional dashboard

Perfect for:
- Restaurants & Cafes
- Retail Stores
- Service Businesses
- Any business wanting to reward loyal customers

**Category:** Business

**Keywords:** loyalty, rewards, business, QR code, points, customers

---

### **User App - Grabbitt**

**Title:** Grabbitt - Loyalty Rewards

**Short Description:**
Scan QR codes, earn points, and get rewarded

**Full Description:**
Grabbitt makes earning loyalty rewards simple and fun. Scan QR codes at your favorite businesses, collect points, and redeem exciting rewards!

Features:
• Discover local businesses with loyalty programs
• Scan QR codes to earn points
• Track points across all your favorite stores
• View transaction history
• Redeem rewards when you reach milestones
• Easy-to-use digital wallet

Benefits:
- No physical cards needed
- All your loyalty points in one app
- Real-time updates
- Exclusive rewards
- Support local businesses

**Category:** Lifestyle / Shopping

**Keywords:** loyalty, rewards, points, QR code, discounts, shopping, local

---

## 🎨 Assets Needed

Before submitting, prepare these assets:

### **App Icons:**
- **iOS:** 1024x1024 px (PNG, no transparency, no rounded corners)
- **Android:** 512x512 px (PNG, can have transparency)

### **Splash Screens:**
- **Seller App:** Dark teal background (#0D7377)
- **User App:** Bright teal background (#14B8A6)

### **Screenshots:**
Minimum 2 screenshots for each:
- **iOS:** 1290x2796 px (iPhone Pro Max)
- **Android:** 1080x1920 px or higher

Recommended screenshots to capture:
1. Splash/Welcome screen
2. Auth/Login screen
3. Main dashboard/home
4. Key feature screen (QR for seller, Wallet for user)

### **Privacy Policy:**
You'll need a privacy policy URL. Required information:
- What data you collect
- How you use Firebase Auth
- Data storage (Firestore)
- User rights

---

## 🔐 Important Security Notes

### **Environment Variables:**
Make sure sensitive data is NOT in your app bundle:
- Firebase config is OK (it's meant to be public)
- Backend API URLs are OK
- Any API keys should be in backend only

### **Backend URL:**
Ensure your backend is:
- Hosted on a production server (not localhost)
- Has HTTPS enabled
- Properly configured CORS
- Secured endpoints with Firebase Auth

---

## ⚡ Quick Commands Reference

### **Build Commands:**

```bash
# Android APK (Testing)
eas build --platform android --profile preview

# Android AAB (Production)
eas build --platform android --profile production

# iOS (Production)
eas build --platform ios --profile production

# Both platforms
eas build --platform all --profile production
```

### **Submit Commands:**

```bash
# Android
eas submit --platform android

# iOS
eas submit --platform ios

# Both
eas submit --platform all
```

### **Check Build Status:**

```bash
eas build:list
```

---

## 📞 Need Help?

### **Expo Documentation:**
- EAS Build: https://docs.expo.dev/build/introduction/
- EAS Submit: https://docs.expo.dev/submit/introduction/
- App Store Guide: https://docs.expo.dev/submit/ios/
- Play Store Guide: https://docs.expo.dev/submit/android/

### **Support:**
- Expo Forums: https://forums.expo.dev/
- Expo Discord: https://chat.expo.dev/

---

## ✅ Publishing Checklist

### **Before Building:**
- [ ] All features tested and working
- [ ] App icons created (1024x1024 iOS, 512x512 Android)
- [ ] Splash screens configured
- [ ] Bundle identifiers unique and correct
- [ ] Version numbers set (1.0.0)
- [ ] Permissions configured in app.json
- [ ] Backend hosted and accessible
- [ ] Firebase configured correctly

### **Before Submitting:**
- [ ] Build completed successfully
- [ ] Tested build on real devices
- [ ] Screenshots captured (minimum 2)
- [ ] App descriptions written
- [ ] Privacy policy created and hosted
- [ ] Store listing information complete
- [ ] Pricing set (Free)
- [ ] Content rating completed

### **Post-Submission:**
- [ ] Monitor review status
- [ ] Respond to review feedback if needed
- [ ] Plan for app updates
- [ ] Monitor crash reports
- [ ] Collect user feedback

---

## 🎉 You're Ready!

Your apps are configured and ready for publishing. Start with building APKs for testing, then move to production builds when ready.

Good luck with your launch! 🚀


# npx eas-cli@latest build --platform all --auto-submit