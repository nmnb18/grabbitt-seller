# Tabs & Drawer Layout Analysis

## Overview
These are layout screens that manage navigation structure. They don't display content directly but configure how other screens are accessed. Both files have opportunities for component abstraction.

---

## 1️⃣ File: `app/(drawer)/_layout.tsx` (228 lines)

### Current Structure
```
DrawerLayout (main component)
├── GestureHandlerRootView
├── BlurLoader (conditional)
├── Drawer (with CustomDrawerContent)
└── Drawer.Screen (tabs)

CustomDrawerContent (menu items)
├── MenuItem component (inline, repeated 9x)
└── Static styling via createStyles
```

### Code Breakdown

#### Part 1: Main Component (Lines 1-47) - 47 lines
```tsx
export default function DrawerLayout() {
  const theme = useTheme();
  const { isLoggingOut } = useAuthStore();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {isLoggingOut && <BlurLoader />}
      <Drawer
        screenOptions={{
          // drawer config
        }}
        drawerContent={() => <CustomDrawerContent />}
      >
        <Drawer.Screen name="(tabs)" options={{...}} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
```
✅ **CLEAN** - No refactoring needed. Simple wrapper.

---

#### Part 2: CustomDrawerContent (Lines 51-180) - 130 lines
Currently contains:
- MenuItem component (inline sub-component, 15 lines)
- 9 menu items (MenuItem calls)
- Logout handler
- Styling logic

**Problems:**
1. MenuItem component is defined inside CustomDrawerContent (inline)
2. Menu items are repetitive TouchableOpacity + Icon + Text
3. Styling is inlined in JSX (View styles)
4. Logout container has unique styling

**Refactoring Strategy:**
Extract MenuItem into `<DrawerMenuItem />` component at top of file

```tsx
// NEW: DrawerMenuItem component
function DrawerMenuItem({
  label,
  icon,
  onPress,
  testID,
}: {
  label: string;
  icon: string;
  onPress: () => void;
  testID?: string;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createDrawerMenuItemStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      data-testid={testID}
      activeOpacity={0.7}
    >
      <GradientIcon name={icon} size={22} />
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );
}
```

---

#### Part 3: Menu Rendering (Lines 106-142) - 37 lines
**Current:**
```tsx
<ScrollView ...>
  <MenuItem label="Dashboard" icon="grid" onPress={() => ...} />
  <MenuItem label="Profile" icon="account" onPress={() => ...} />
  // 7 more items...
</ScrollView>

<View style={styles.logoutContainer}>
  <MenuItem label="Logout" icon="logout" onPress={handleLogout} />
</View>
```

**Refactoring Option:**
Move menu items to constant array to reduce repetition

```tsx
const DRAWER_MENU_ITEMS = [
  { label: "Dashboard", icon: "grid", route: "/(drawer)/(tabs)/dashboard" },
  { label: "Profile", icon: "account", route: "/(drawer)/profile-setup" },
  { label: "Plans", icon: "star", route: "/(drawer)/subscription" },
  // ... more items
];

// Then render:
{DRAWER_MENU_ITEMS.map(item => (
  <DrawerMenuItem
    key={item.label}
    label={item.label}
    icon={item.icon}
    onPress={() => router.push(item.route)}
    testID={`drawer-${item.label.toLowerCase()}`}
  />
))}
```

**Reduction:** 37 lines → 12 lines (68% less!)

---

#### Part 4: Styles (Lines 195-228) - 34 lines
```tsx
const createStyles = (theme: any) =>
  StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: theme.colors.background },
    container: { flex: 1, justifyContent: "space-between" },
    menuContainer: { padding: 16 },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      borderBottomColor: theme.colors.outline,
      borderBottomWidth: 1,
      gap: 16,
    },
    menuLabel: {
      fontSize: 16,
      color: theme.colors.onBackground,
      fontWeight: "500",
    },
    // ... more styles
  });
```

**Refactoring:** These styles are theme-dependent. Keep but extract into separate style functions for MenuItems.

---

### 📊 Drawer Refactoring Summary

| Section | Current | Refactored | Reduction |
|---------|---------|------------|-----------|
| MenuItem component | inline (15 lines) | extracted | -15 lines |
| Menu items rendering | 37 lines | 12 lines (array map) | -25 lines |
| Unused imports | 0 | 0 | 0 |
| Total | 228 lines | **~188 lines** | **-40 lines (17.5%)** |

**Key Changes:**
1. ✅ Extract `DrawerMenuItem` component
2. ✅ Move menu items to `DRAWER_MENU_ITEMS` constant
3. ✅ Map over constant instead of repeating MenuItem calls
4. ✅ Keep styles as-is (theme-dependent)

---

## 2️⃣ File: `app/(drawer)/(tabs)/_layout.tsx` (161 lines)

### Current Structure
```
SellerLayout (main component)
├── Tabs configuration (screenOptions)
│   ├── tabBar styles
│   ├── header styles
│   ├── headerTitle component (GradientText)
│   ├── headerLeft component (menu button)
│   └── headerRight component (notifications badge)
└── Tabs.Screen definitions (3 screens)
```

### Code Breakdown

#### Part 1: Component Setup (Lines 13-20) - 8 lines
```tsx
export default function SellerLayout() {
  const sellerTheme = useTheme();
  const { unreadCount } = useNotificationStore();
  const router = useRouter();
  const backgroundColor = useThemeColor({}, "background");
  const navigation = useNavigation<any>();
```
✅ **CLEAN** - Necessary hooks and state.

---

#### Part 2: Header Configuration (Lines 26-60) - 35 lines
**Issues:**
1. `headerTitle()` renders inline (8 lines)
2. `headerLeft()` renders inline (8 lines)
3. `headerRight()` renders inline (25 lines with badge logic)
4. All mixed in screenOptions object

**Refactoring Strategy:**
Extract header components into separate functions

```tsx
// NEW: Header component functions
function HeaderTitle() {
  return (
    <GradientText
      style={{
        fontFamily: "JostMedium",
        fontSize: 40,
        textAlignVertical: "center",
        includeFontPadding: false,
      }}
    >
      grabbitt
    </GradientText>
  );
}

function HeaderMenuButton({ sellerTheme }: { sellerTheme: any }) {
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      style={{ marginLeft: 16 }}
    >
      <Ionicons
        name="menu"
        size={26}
        color={sellerTheme.colors.onSurface}
      />
    </TouchableOpacity>
  );
}

function NotificationBadge({
  unreadCount,
  sellerTheme,
  router,
}: {
  unreadCount: number;
  sellerTheme: any;
  router: any;
}) {
  return (
    <TouchableOpacity
      onPress={() => router.push("/(drawer)/notifications")}
      style={{ marginRight: 16 }}
    >
      <Ionicons
        name="notifications-outline"
        size={24}
        color={sellerTheme.colors.onSurface}
      />
      {unreadCount > 0 && (
        <View
          style={{
            position: "absolute",
            top: -4,
            right: -6,
            backgroundColor: sellerTheme.colors.primary,
            borderRadius: 10,
            minWidth: 18,
            height: 18,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 11, fontWeight: "bold" }}>
            {unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
```

**Reduction:** 35 lines inline → 50 lines as functions, BUT main component becomes much cleaner and these can move to separate file later.

---

#### Part 3: TabBar Configuration (Lines 26-37) - 12 lines
```tsx
tabBarStyle: {
  backgroundColor,
  borderTopColor: "transparent",
  borderTopWidth: 1,
  paddingBottom: 20,
  paddingTop: 8,
  height: 80,
},
tabBarLabelStyle: {
  fontSize: 12,
  fontWeight: "600",
},
```

**Refactoring:** Move to StyleSheet constant to improve readability

```tsx
const TAB_BAR_STYLES = StyleSheet.create({
  tabBar: {
    backgroundColor: useThemeColor({}, "background"),
    borderTopColor: "transparent",
    borderTopWidth: 1,
    paddingBottom: 20,
    paddingTop: 8,
    height: 80,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});
```

**Problem:** Can't use hooks in StyleSheet. Keep inline or convert to function.

---

#### Part 4: Header Configuration (Lines 38-46) - 9 lines
```tsx
headerStyle: {
  height: Platform.OS === "ios" ? 120 : 90,
  backgroundColor,
  elevation: 0,
  shadowOpacity: 0,
  borderBottomWidth: 0,
},
```
✅ **CLEAN** - Platform-specific, necessary inline.

---

#### Part 5: Tab Screen Definitions (Lines 62-107) - 46 lines
```tsx
<Tabs.Screen
  name="dashboard"
  options={{
    title: "Dashboard",
    tabBarIcon: ({ color, size }) => (
      <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
    ),
  }}
/>
<Tabs.Screen
  name="scan-customer"
  options={{
    title: "Scan QR",
    headerShown: false,
    tabBarIcon: ({ color, size }) => (
      <MaterialCommunityIcons name="qrcode-scan" size={size} color={color} />
    ),
  }}
/>
// ... more screens
```

**Refactoring Strategy:**
Move to constant array with icon mappings

```tsx
const TABS_CONFIG = [
  {
    name: "dashboard",
    title: "Dashboard",
    icon: "view-dashboard",
    headerShown: true,
  },
  {
    name: "scan-customer",
    title: "Scan QR",
    icon: "qrcode-scan",
    headerShown: false,
  },
  {
    name: "ai-insights",
    title: "Insights",
    icon: "chart-line",
    headerShown: true,
  },
];

// Then render:
{TABS_CONFIG.map(tab => (
  <Tabs.Screen
    key={tab.name}
    name={tab.name}
    options={{
      title: tab.title,
      headerShown: tab.headerShown,
      tabBarIcon: ({ color, size }) => (
        <MaterialCommunityIcons name={tab.icon} size={size} color={color} />
      ),
    }}
  />
))}
```

**Reduction:** 46 lines → 15 lines (67% less!)

---

### 📊 Tabs Refactoring Summary

| Section | Current | Refactored | Reduction |
|---------|---------|------------|-----------|
| headerTitle inline | 8 lines | extracted | -8 lines |
| headerLeft inline | 8 lines | extracted | -8 lines |
| headerRight inline | 25 lines | extracted | -25 lines |
| Tab screen definitions | 46 lines | 15 lines (array map) | -31 lines |
| Total | 161 lines | **~85 lines** | **-76 lines (47%)** |

**Key Changes:**
1. ✅ Extract `HeaderTitle` component
2. ✅ Extract `HeaderMenuButton` component
3. ✅ Extract `NotificationBadge` component
4. ✅ Move tab screens to `TABS_CONFIG` constant
5. ✅ Map over constant instead of JSX repetition

---

## 🎯 Complete Refactoring Plan

### Phase 1: Drawer Layout Refactoring
**File:** `app/(drawer)/_layout.tsx`
**Approach:** Extract MenuItem, move menu items to constant array
**Expected:** 228 → 188 lines (-17.5%)
**Time:** 20 mins
**Steps:**
1. Create `DrawerMenuItem` function component
2. Create `DRAWER_MENU_ITEMS` constant array
3. Replace 9 MenuItem calls with map() loop
4. Test drawer navigation

### Phase 2: Tabs Layout Refactoring
**File:** `app/(drawer)/(tabs)/_layout.tsx`
**Approach:** Extract header components, move tabs to constant array
**Expected:** 161 → 85 lines (-47%)
**Time:** 25 mins
**Steps:**
1. Extract `HeaderTitle` component
2. Extract `HeaderMenuButton` component
3. Extract `NotificationBadge` component
4. Create `TABS_CONFIG` constant array
5. Replace Tabs.Screen JSX with map() loop
6. Test header and tabs navigation

---

## 📋 Quality Checklist

- [ ] No TypeScript errors (npx tsc --noEmit)
- [ ] All drawer menu items navigate correctly
- [ ] Notification badge displays correctly
- [ ] Header menu button opens drawer
- [ ] All tab screens accessible
- [ ] Theme colors applied correctly
- [ ] Light/dark mode works
- [ ] No missing imports

---

## 🚀 What NOT to Change

- ✅ Keep `GestureHandlerRootView` (gesture handling)
- ✅ Keep `BlurLoader` usage (logout loading state)
- ✅ Keep `useTheme()` and `useAuthStore()` hooks
- ✅ Keep notification badge logic (unreadCount)
- ✅ Keep theme color variables (backgroundColor, etc.)
- ✅ Keep Platform.OS check for iOS/Android heights
- ✅ Keep external link handling (mailto, https)

---

## 💡 Next After These

After tabs/drawer refactoring complete:
1. Profile screens (account-information, business-information, etc.)
2. List screens (redemptions, subscription-history)
3. Dashboard screens (dashboard, ai-insights)

