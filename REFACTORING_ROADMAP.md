# Component Refactoring Priority List

## 🎯 Profile Screens - Phase 1 (HIGHEST PRIORITY)

### Component Pattern: EditableSection + InfoRow/FormRow

```
EditableSection
├── View Mode: InfoRow display
└── Edit Mode: FormRow with inputs
```

---

### 1️⃣ account-information.tsx
**Current:** 100+ lines with Card + Edit button + manual info display
**Will Use:** EditableSection + FormRow + InfoRow
**Reduction:** ~40 lines (40% less)
**Save Time:** 30 mins → 10 mins implementation

```tsx
// BEFORE (80+ lines)
<Card>
  <View>Name: {user.name}</View>
  <Button onPress={() => setEditing(true)}>Edit</Button>
  {isEditing && <FormTextInput />}
</Card>

// AFTER (20 lines)
<EditableSection
  title="Account Info"
  isEditing={isEditing}
  onEditToggle={toggleEdit}
  isDirty={dirty}
  isLoading={saving}
  onSave={save}
  onCancel={cancel}
>
  {isEditing ? <FormRow>...inputs...</FormRow> : <InfoRow label="Name" value={name} />}
</EditableSection>
```

---

### 2️⃣ location-details.tsx  
**Current:** 150+ lines with grid form layout
**Will Use:** EditableSection + FormRow (for grid columns)
**Reduction:** ~60 lines (40% less)
**Save Time:** 45 mins → 15 mins implementation

---

### 3️⃣ business-information.tsx
**Current:** 200+ lines with categories, chips, overlay
**Will Use:** EditableSection + CardSection + FormRow
**Reduction:** ~80 lines (40% less)
**Save Time:** 60 mins → 20 mins implementation

---

### 4️⃣ verification-details.tsx
**Current:** 120+ lines with status badge + document inputs
**Will Use:** EditableSection + InfoRow + CardSection
**Reduction:** ~42 lines (35% less)
**Save Time:** 35 mins → 12 mins implementation

---

### 5️⃣ media-information.tsx
**Current:** 110+ lines with image picker
**Will Use:** CardSection + EditableSection
**Reduction:** ~35 lines (32% less)
**Save Time:** 30 mins → 10 mins implementation

---

### 6️⃣ reward-settings.tsx
**Current:** 350+ lines (largest component!)
**Will Use:** EditableSection + FormRow + CardSection + ButtonRow
**Reduction:** ~150 lines (43% less)
**Save Time:** 120 mins → 40 mins implementation

---

### 7️⃣ notification-settings.tsx (if separate)
**Current:** ~80 lines
**Will Use:** EditableSection + InfoRow
**Reduction:** ~28 lines (35% less)

---

## 📊 List/History Screens - Phase 2

### Component Pattern: LoadingOverlay + EmptyState

---

### 8️⃣ subscription-history.tsx
**Current:** 150+ lines with manual loading and empty state
**Will Use:** LoadingOverlay + EmptyState + CardSection
**Reduction:** ~30 lines (20% less)

```tsx
// BEFORE
{isLoading && <View><ActivityIndicator /></View>}
{items.length === 0 && <Card><Text>No data</Text></Card>}
{items.map(...)}

// AFTER
{isLoading && <LoadingOverlay isVisible message="Loading..." />}
{items.length === 0 && <EmptyState title="No History" />}
{items.map(...)}
```

---

### 9️⃣ redemptions.tsx
**Current:** 120+ lines with manual empty state
**Will Use:** LoadingOverlay + EmptyState + StatCard (for stats)
**Reduction:** ~25 lines (20% less)

---

## 📈 Dashboard - Phase 3

### Component Pattern: StatCard

---

### 🔟 dashboard.tsx
**Current:** 80+ lines with custom metric cards
**Will Use:** StatCard
**Reduction:** ~20 lines (25% less)

```tsx
// BEFORE
<Card>
  <Text>Total Users</Text>
  <Text>1234</Text>
  <MaterialCommunityIcons name="people" />
</Card>

// AFTER
<StatCard
  title="Total Users"
  value={1234}
  icon="people"
  subtitle="↑ 12%"
/>
```

---

## 🔧 Checkout/Modals - Phase 4 (Optional)

### 1️⃣1️⃣ checkout.tsx
**Current:** 500+ lines
**Will Use:** LoadingOverlay (for payment processing)
**Reduction:** ~10 lines

---

## 📈 Overall Impact

```
PHASE 1: Profile Screens
├─ 7 screens × 40% avg reduction
├─ Total lines saved: ~1,200
└─ Time saved: ~200 mins → ~70 mins

PHASE 2: List Screens  
├─ 3 screens × 20% avg reduction
├─ Total lines saved: ~200
└─ Time saved: ~45 mins → ~20 mins

PHASE 3: Dashboard
├─ 2 screens × 25% avg reduction
├─ Total lines saved: ~50
└─ Time saved: ~30 mins → ~15 mins

PHASE 4: Checkout/Modals (Optional)
├─ 2 screens × 10% avg reduction
├─ Total lines saved: ~50
└─ Time saved: ~20 mins → ~18 mins

════════════════════════════════════
GRAND TOTAL
════════════════════════════════════
✨ 15-17 MORE SCREENS
✨ ~1,600 MORE LINES SAVED
✨ 45% FASTER REFACTORING TIME
✨ 100% MORE CONSISTENT UI
```

---

## 🚀 Implementation Checklist

### For Each Screen:
- [ ] Identify Edit/View mode pattern
- [ ] Replace `<Card>` with `<EditableSection>` or `<CardSection>`
- [ ] Replace info display with `<InfoRow>`
- [ ] Replace form inputs with `<FormRow>`
- [ ] Remove manual `<ActivityIndicator>` usage → use `<LoadingOverlay>`
- [ ] Remove empty state cards → use `<EmptyState>`
- [ ] Remove StyleSheet padding/border definitions (20-30 lines)
- [ ] Test with `npx tsc --noEmit`
- [ ] Verify all functionality works
- [ ] Commit changes

---

## ⏱️ Estimated Timeline

| Phase | Screens | Time Estimate | Code Saved |
|-------|---------|--------------|-----------|
| Phase 1 | 7 profile | 3-4 hours | 1,200 lines |
| Phase 2 | 3 list | 1-2 hours | 200 lines |
| Phase 3 | 2 dashboard | 45 mins | 50 lines |
| Phase 4 | 2-3 other | 1 hour | 50 lines |
| **TOTAL** | **15-17** | **5-6 hours** | **~1,600 lines** |

---

## 💡 Pro Tips

1. **Start with account-information.tsx** - Simplest profile screen
2. **Copy pattern from login.tsx** - Similar FormRow structure
3. **Use existing SuccessMessage pattern** - Already familiar
4. **Test after each screen** - Catch errors early
5. **Keep commit messages clear** - "Refactor: Use EditableSection in account-information"

---

## 📚 Documentation References

- COMPONENT_USAGE.md - Detailed component APIs
- COMMON_COMPONENTS_GUIDE.md - Full examples
- INTEGRATION_COMPLETE.md - Before/after patterns

Ready to start Phase 1? 🚀
