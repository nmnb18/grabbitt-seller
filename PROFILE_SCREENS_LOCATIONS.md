# Profile Screens - Exact Locations & Refactoring Order

## 📍 All Profile Screen Locations

### 1️⃣ PRIORITY 1 - Start Here
```
File: components/profile/account-information.tsx
├─ Component: AccountInformation
├─ Current Lines: ~100-120
├─ Expected Reduction: ~40 lines (40%)
├─ Components to Use: EditableSection + FormRow + InfoRow
├─ Fields: Phone, Email, Name, Established Year
├─ Difficulty: ⭐ EASIEST - Good reference
└─ Time: ~20-30 mins
```

**What to look for:**
- Card with manual header (edit icon/button)
- Phone, email fields in text inputs
- Info display rows
- Edit/view toggle logic
- ActivityIndicator for loading

---

### 2️⃣ PRIORITY 2
```
File: components/profile/location-details.tsx
├─ Component: LocationDetails
├─ Current Lines: ~150-170
├─ Expected Reduction: ~60 lines (40%)
├─ Components to Use: EditableSection + FormRow (grid layout)
├─ Fields: City, State, Country, Latitude, Longitude
├─ Difficulty: ⭐⭐ EASY - Grid form pattern
└─ Time: ~25-35 mins
```

**What to look for:**
- EditableSection pattern similar to account-information
- Multiple coordinate/location fields
- Grid-based form layout (2 columns)
- Similar edit/view toggle

---

### 3️⃣ PRIORITY 3
```
File: components/profile/business-information.tsx
├─ Component: BusinessInformation
├─ Current Lines: ~200-220
├─ Expected Reduction: ~80 lines (40%)
├─ Components to Use: EditableSection + CardSection + FormRow
├─ Fields: Name, Type, Categories, Cuisine Type
├─ Difficulty: ⭐⭐⭐ MEDIUM - Multiple sections
└─ Time: ~30-45 mins
```

**What to look for:**
- Business name and description
- Business type selector
- Multiple categories/cuisine chips
- Nested card sections
- More complex form structure

---

### 4️⃣ PRIORITY 4
```
File: components/profile/verification-details.tsx
├─ Component: VerificationDetails
├─ Current Lines: ~120-140
├─ Expected Reduction: ~42 lines (35%)
├─ Components to Use: EditableSection + InfoRow + CardSection
├─ Fields: Document type, Document number, Status
├─ Difficulty: ⭐⭐⭐ MEDIUM - Status logic
└─ Time: ~25-35 mins
```

**What to look for:**
- Document verification cards
- Status badges (verified/pending/rejected)
- Document upload/display logic
- Different styling for status states
- Info display with status colors

---

### 5️⃣ PRIORITY 5
```
File: components/profile/media-information.tsx
├─ Component: MediaInformation
├─ Current Lines: ~110-130
├─ Expected Reduction: ~35 lines (32%)
├─ Components to Use: CardSection + EditableSection
├─ Fields: Image, Logo, Banner
├─ Difficulty: ⭐⭐⭐ MEDIUM - Image handling
└─ Time: ~25-35 mins
```

**What to look for:**
- Image picker integration
- Image display/preview
- Multiple image fields (logo, banner, etc)
- Image upload UI
- MediaPicker component calls

---

### 6️⃣ PRIORITY 6 - Largest, Do Last
```
File: components/profile/reward-settings.tsx
├─ Component: RewardSettings
├─ Current Lines: ~350-380 ⚠️ LARGEST
├─ Expected Reduction: ~150 lines (43%)
├─ Components to Use: EditableSection + FormRow + CardSection + ButtonRow
├─ Fields: Multiple reward configurations
├─ Difficulty: ⭐⭐⭐⭐ COMPLEX - Largest file
└─ Time: ~45-60 mins
```

**What to look for:**
- Multiple reward tier configurations
- Form fields for rewards
- Button rows for actions
- Complex save/cancel logic
- Multiple nested sections
- Potentially multiple edit modes

---

### 7️⃣ PRIORITY 7 (Optional)
```
File: components/profile/notification-settings.tsx
├─ Component: NotificationSettings
├─ Current Lines: ~80-100
├─ Expected Reduction: ~28 lines (35%)
├─ Components to Use: EditableSection + InfoRow
├─ Fields: Notification preferences, Toggle switches
├─ Difficulty: ⭐⭐ EASY - Toggle patterns
└─ Time: ~15-20 mins
```

**What to look for:**
- Toggle switches for preferences
- Notification type settings
- Simple on/off logic
- Minimal form fields

---

## 🔄 Refactoring Pattern for All

Every profile screen follows this pattern:

```tsx
// CURRENT PATTERN (Manual)
import { Card } from "react-native-paper";

export function AccountInformation() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <Card>
      <Card.Content>
        <View style={styles.header}>
          <Text>Account Information</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Ionicons name={isEditing ? "checkmark" : "pencil"} />
          </TouchableOpacity>
        </View>
        
        {!isEditing ? (
          <View style={styles.infoContainer}>
            <View><Text>Phone</Text><Text>{phone}</Text></View>
            <View><Text>Email</Text><Text>{email}</Text></View>
          </View>
        ) : (
          <View style={styles.formContainer}>
            {isLoading && <ActivityIndicator />}
            <TextInput value={phone} onChangeText={setPhone} />
            <TextInput value={email} onChangeText={setEmail} />
            <TouchableOpacity onPress={save}><Text>Save</Text></TouchableOpacity>
            <TouchableOpacity onPress={cancel}><Text>Cancel</Text></TouchableOpacity>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}
```

```tsx
// REFACTORED PATTERN (Cleaner)
import { EditableSection, InfoRow, FormRow, ButtonRow } from "@/components/common";
import { FormTextInput } from "@/components/form/form-text-input";

export function AccountInformation() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <EditableSection
      title="Account Information"
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(!isEditing)}
      isDirty={isDirty}
      isLoading={isLoading}
      onSave={save}
      onCancel={cancel}
    >
      {!isEditing ? (
        <>
          <InfoRow label="Phone" value={phone} />
          <InfoRow label="Email" value={email} />
        </>
      ) : (
        <>
          <FormRow>
            <FormTextInput value={phone} onChangeText={setPhone} label="Phone" />
          </FormRow>
          <FormRow>
            <FormTextInput value={email} onChangeText={setEmail} label="Email" />
          </FormRow>
        </>
      )}
    </EditableSection>
  );
}
```

**Key differences:**
- EditableSection replaces manual Card + header
- InfoRow replaces manual info display
- FormRow wraps input fields
- isLoading handled automatically
- No manual ActivityIndicator
- No manual save/cancel buttons

---

## ✅ Checklist for Each Screen

For each profile screen you refactor, run through:

### Analysis Phase
- [ ] Opened file and understand current structure
- [ ] Identified all edit/view mode sections
- [ ] Listed all form fields
- [ ] Noted any special UI (badges, chips, images)
- [ ] Confirmed it follows edit/view toggle pattern

### Implementation Phase
- [ ] Imported EditableSection, InfoRow, FormRow, CardSection
- [ ] Wrapped main content in EditableSection
- [ ] Replaced info displays with InfoRow
- [ ] Replaced form fields with FormRow + FormTextInput
- [ ] Removed manual edit button logic
- [ ] Removed manual ActivityIndicator
- [ ] Removed manual save/cancel buttons
- [ ] Updated state management if needed

### Testing Phase
- [ ] Opened file in editor (verify TypeScript)
- [ ] Ran `npx tsc --noEmit` (0 errors)
- [ ] Visually verified styling matches
- [ ] Tested edit toggle works
- [ ] Tested save functionality
- [ ] Tested cancel functionality
- [ ] Verified theme colors apply
- [ ] Checked light/dark mode

### Verification Phase
- [ ] No missing imports
- [ ] No TypeScript errors
- [ ] Component renders without crashes
- [ ] All functionality preserved
- [ ] Code is cleaner than before

---

## 📊 Expected Results After All 7 Screens

```
Profile Screens Refactoring Results
├─ account-information.tsx: 120 → 80 lines (-40 lines)
├─ location-details.tsx: 170 → 110 lines (-60 lines)
├─ business-information.tsx: 220 → 140 lines (-80 lines)
├─ verification-details.tsx: 140 → 98 lines (-42 lines)
├─ media-information.tsx: 130 → 95 lines (-35 lines)
├─ reward-settings.tsx: 380 → 230 lines (-150 lines) ⭐
└─ notification-settings.tsx: 100 → 72 lines (-28 lines)

═══════════════════════════════════════════════════════
TOTAL: 1,260 → 825 lines = 435 LINES SAVED (34.5%)
═══════════════════════════════════════════════════════
```

---

## 🚀 Ready to Begin?

When you're ready to start refactoring the profile screens, let me know! I recommend:

1. **Start with account-information.tsx** - Easiest, sets pattern
2. **Then location-details.tsx** - Reinforces pattern
3. **Build from there** - Each gets progressively easier as you master the pattern

The refactoring pattern is consistent across all 7 screens, so once you do the first one, the rest will be much faster!

Let me know when you want to start! 🎯

