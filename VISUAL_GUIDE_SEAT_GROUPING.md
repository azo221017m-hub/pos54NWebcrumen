# Visual Guide & Manual Testing - Seat-Based Product Grouping

## Overview
This guide provides visual descriptions and manual testing steps for the seat-based product grouping feature in PageVentas.

## Visual Changes

### 1. Header - Seat Selector Button

**Location**: PageVentas header, between "Ficha de Comanda" and user profile

**Appearance**:
```
┌─────────────────────────────────────────────────────────────┐
│ [← Cancelar]  [Logo]  [Mesa: Mesa 1]  [🍴 A1]  [@usuario]  │
└─────────────────────────────────────────────────────────────┘
                                          ^^^^^^
                                     Seat Selector
```

**Visual Characteristics**:
- **Color**: Purple background (#9b59b6)
- **Icon**: Utensils (fork and knife) icon
- **Label**: Current seat assignment (e.g., "A1", "A2", "A20")
- **Size**: Larger than product action buttons
- **Font**: Bold, 18px for seat label
- **Shadow**: Subtle shadow with hover effect
- **Border Radius**: Rounded corners (8px)

**States**:
1. **Normal**: Purple background, white text
2. **Hover**: Darker purple (#8e44ad), slightly raised
3. **Hidden**: Not visible when:
   - Service type is NOT "Mesa"
   - Service is not configured yet

### 2. Example UI Flow

#### Before Configuration
```
┌────────────────────────────────────────────────────────┐
│ [← Cancelar]  [Logo]  [Configurar Servicio]  [@user]  │
└────────────────────────────────────────────────────────┘
                       No seat selector visible
```

#### After MESA Configuration
```
┌──────────────────────────────────────────────────────────┐
│ [← Cancelar]  [Logo]  [Mesa: Mesa 3]  [🍴 A1]  [@user]  │
└──────────────────────────────────────────────────────────┘
                       Seat selector appears!
```

#### After LLEVAR/DOMICILIO Configuration
```
┌──────────────────────────────────────────────────────────┐
│ [← Cancelar]  [Logo]  [Llevar: Juan]       [@user]      │
└──────────────────────────────────────────────────────────┘
                  No seat selector (not MESA)
```

## User Interactions

### Seat Selector Interactions

#### Left-Click (Increment Seat)
```
Click #1: A1 → A2
Click #2: A2 → A3
Click #3: A3 → A4
...
Click #19: A19 → A20
Click #20: A20 (stays at maximum)
```

#### Right-Click (Reset)
```
Current: A15
Right-Click: A15 → A1 (resets to default)
```

### Product Addition Flow

#### Scenario 1: Same Seat, Same Product
```
Initial State:
- Current Seat: A1
- Comanda: Empty

Action 1: Add "Hamburguesa"
Result:
├─ Hamburguesa (A1) x1  [🍴 A1]

Action 2: Add "Hamburguesa" (still on A1)
Result:
├─ Hamburguesa (A1) x2  [🍴 A1]  ← Quantity increased!
```

#### Scenario 2: Different Seats, Same Product
```
Initial State:
- Current Seat: A1
- Comanda: Empty

Action 1: Add "Hamburguesa"
Result:
├─ Hamburguesa (A1) x1  [🍴 A1]

Action 2: Click seat selector → Change to A2
Action 3: Add "Hamburguesa"
Result:
├─ Hamburguesa (A1) x1  [🍴 A1]
├─ Hamburguesa (A2) x1  [🍴 A2]  ← Separate item!
```

#### Scenario 3: Multiple Products, Multiple Seats
```
Current Seat: A1
├─ Add "Hamburguesa" → Hamburguesa (A1) x1
├─ Add "Papas" → Papas (A1) x1
├─ Add "Hamburguesa" → Hamburguesa (A1) x2

Change to A2
├─ Add "Hamburguesa" → New item: Hamburguesa (A2) x1
├─ Add "Refresco" → Refresco (A2) x1
├─ Add "Refresco" → Refresco (A2) x2

Change to A3
├─ Add "Pizza" → Pizza (A3) x1

Final Comanda:
├─ Hamburguesa (A1) x2  [🍴 A1]
├─ Papas (A1) x1        [🍴 A1]
├─ Hamburguesa (A2) x1  [🍴 A2]
├─ Refresco (A2) x2     [🍴 A2]
├─ Pizza (A3) x1        [🍴 A3]
```

## Manual Testing Checklist

### Part 1: Seat Selector Visibility

```
Test 1.1: MESA Service - Configured
Expected: ✓ Seat selector visible
Steps:
1. Select "Mesa" service type
2. Configure mesa (e.g., "Mesa 5")
3. Look at header
Result: [ ] PASS  [ ] FAIL

Test 1.2: LLEVAR Service
Expected: ✗ Seat selector hidden
Steps:
1. Select "Llevar" service type
2. Configure customer info
3. Look at header
Result: [ ] PASS  [ ] FAIL

Test 1.3: MESA Service - Not Configured
Expected: ✗ Seat selector hidden
Steps:
1. Select "Mesa" service type
2. DO NOT configure yet
3. Look at header
Result: [ ] PASS  [ ] FAIL
```

### Part 2: Seat Selection

```
Test 2.1: Increment Seat (Left-Click)
Steps:
1. Configure MESA service
2. Note current seat (should be A1)
3. Left-click seat selector 5 times
Expected: A1 → A2 → A3 → A4 → A5 → A6
Result: [ ] PASS  [ ] FAIL

Test 2.2: Reset Seat (Right-Click)
Steps:
1. Left-click to A5
2. Right-click seat selector
Expected: A5 → A1
Result: [ ] PASS  [ ] FAIL

Test 2.3: Maximum Limit
Steps:
1. Left-click seat selector 20+ times
Expected: Stops at A20, doesn't go beyond
Result: [ ] PASS  [ ] FAIL
```

### Part 3: Product Grouping

```
Test 3.1: Same Product, Same Seat
Steps:
1. Current seat: A1
2. Add "Hamburguesa" twice
Expected: Single item with quantity 2
Result: [ ] PASS  [ ] FAIL

Test 3.2: Same Product, Different Seats
Steps:
1. Seat A1: Add "Hamburguesa"
2. Change to A2
3. Add "Hamburguesa"
Expected: Two separate items, each quantity 1
Result: [ ] PASS  [ ] FAIL

Test 3.3: Multiple Products, Multiple Seats
Steps:
1. A1: Add "Hamburguesa" x2
2. A1: Add "Papas" x1
3. A2: Add "Hamburguesa" x1
4. A2: Add "Refresco" x3
Expected:
- Hamburguesa (A1) x2
- Papas (A1) x1
- Hamburguesa (A2) x1
- Refresco (A2) x3
Result: [ ] PASS  [ ] FAIL
```

### Part 4: Moderadores Integration

```
Test 4.1: Same Product, Same Seat, Different Mods
Steps:
1. Seat A1
2. Add "Hamburguesa" CON TODO
3. Add "Hamburguesa" with custom mods
Expected: Two separate items (different mods)
Result: [ ] PASS  [ ] FAIL

Test 4.2: Same Product, Different Seats, Same Mods
Steps:
1. A1: Add "Hamburguesa" CON TODO
2. A2: Add "Hamburguesa" CON TODO
Expected: Two separate items (different seats)
Result: [ ] PASS  [ ] FAIL
```

### Part 5: Individual Item Seat Buttons

```
Test 5.1: Modify Item Seat After Adding
Steps:
1. A1: Add "Hamburguesa"
2. Click the item's seat button to change to A2
3. A2: Add "Hamburguesa"
Expected: Quantity of A2 item increases (grouped)
Result: [ ] PASS  [ ] FAIL

Test 5.2: ORDENADO Items Protection
Steps:
1. Add products and click PRODUCIR
2. Try to click seat button on ORDENADO items
Expected: Button disabled, no change
Result: [ ] PASS  [ ] FAIL
```

### Part 6: Data Persistence

```
Test 6.1: Save and Reload
Steps:
1. Create order with multiple seats
2. Click PRODUCIR to save
3. Go to Dashboard
4. Click on the order to reload
Expected: All seat assignments preserved
Result: [ ] PASS  [ ] FAIL

Test 6.2: ESPERAR and Resume
Steps:
1. Create order with multiple seats
2. Click ESPERAR
3. Reload from Dashboard
4. Continue adding products
Expected: Existing seat assignments preserved
Result: [ ] PASS  [ ] FAIL
```

### Part 7: Edge Cases

```
Test 7.1: Cancel and New Order
Steps:
1. Configure MESA, change seat to A5
2. Click Cancelar
3. Start new MESA order
Expected: Seat resets to A1
Result: [ ] PASS  [ ] FAIL

Test 7.2: Switch Service Types
Steps:
1. Configure MESA, seat A3
2. Cancel
3. Select LLEVAR
Expected: No seat selector visible
Result: [ ] PASS  [ ] FAIL

Test 7.3: Load Old Order Without Seats
Steps:
1. Load order created before this feature
2. Check items in comanda
Expected: Items default to A1
Result: [ ] PASS  [ ] FAIL
```

## Visual Verification Points

### CSS Styling Checks

```
Seat Selector Button:
[ ] Background: Purple (#9b59b6)
[ ] Text: White
[ ] Font Weight: Bold
[ ] Icon: Utensils (fork/knife)
[ ] Border Radius: Rounded (8px)
[ ] Shadow: Present
[ ] Hover Effect: Darkens and raises slightly
[ ] Size: Proportional to header
[ ] Position: Between Ficha and user info
```

### Layout Checks

```
Header Layout:
[ ] All elements aligned properly
[ ] No overlapping elements
[ ] Seat selector doesn't push other elements
[ ] Responsive on different screen sizes
[ ] Proper spacing between elements
```

## Screenshots to Take (for documentation)

1. **Seat Selector - Default State (A1)**
   - Show header with seat selector at A1

2. **Seat Selector - Different Seat (A5)**
   - Show header with seat selector at A5

3. **Comanda - Multiple Seats**
   - Show comanda with products on A1, A2, A3

4. **Comanda - Same Product Different Seats**
   - Show two "Hamburguesa" items with different seats

5. **Seat Selector Hover**
   - Show hover effect on seat selector

## Common Issues & Troubleshooting

### Issue: Seat selector doesn't appear
**Check**:
- Is service type "Mesa"?
- Is service configured?
- Is `isServiceConfigured` true?

### Issue: Products still grouping across seats
**Check**:
- Verify `tipoServicio === 'Mesa'`
- Check `currentSeatAssignment` state value
- Ensure grouping logic includes seat check

### Issue: Seat number goes beyond A20
**Check**:
- Verify `MAX_SEAT_NUMBER` constant is 20
- Check validation in increment logic

## Success Criteria

✅ All tests in checklist pass
✅ Visual elements match specifications
✅ No console errors
✅ Products group correctly by seat
✅ Seat assignments persist after save/reload
✅ ORDENADO items protected
✅ Maximum seat limit enforced

## Notes for Testers

- Test with real restaurant scenarios
- Try rapid clicking to test limits
- Test with different table sizes
- Verify with actual moderadores combinations
- Check performance with many items
- Test on different screen sizes

---

**Testing Date**: _____________
**Tester Name**: _____________
**Version**: 2.5.B12
**Branch**: copilot/group-products-for-table-sale
