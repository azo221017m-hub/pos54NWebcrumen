# Manual Testing Guide for Image Storage Fix

## Overview
This guide provides step-by-step instructions to manually verify that the image storage fix for user updates is working correctly.

## Prerequisites
- Backend server running (`npm run dev` in backend directory)
- Frontend server running (`npm run dev` in root directory)
- Database with at least one test user account
- Access to user management interface

## Test Scenarios

### Scenario 1: Create New User with Images (Verify INSERT Still Works)
**Expected**: This should already work, but verify it still does.

1. Navigate to "Gestión de Usuarios" or user management page
2. Click "Nuevo Usuario" button
3. Fill in required fields:
   - Nombre: "Usuario Test"
   - Alias: "test_usuario"
   - Password: (any password)
   - Select a Negocio
   - Select a Rol
4. Upload images:
   - Click on "INE / Identificación" and upload a test image
   - Click on "Foto Personal" and upload a test image
   - Click on "Avatar" and upload a test image
5. Click "Crear Usuario"
6. **Verify**: User is created successfully
7. Navigate back to user list and edit the newly created user
8. **Verify**: All three images are displayed correctly

**Result**: ✅ PASS / ❌ FAIL
**Notes**: _________________________

---

### Scenario 2: Edit User WITHOUT Changing Images (Main Fix)
**Expected**: Images should remain in database after update.

1. Navigate to user list
2. Find a user that already has images (use the one created in Scenario 1)
3. Click "Editar" on that user
4. **Verify**: All images are displayed correctly in the edit form
5. Change ONLY text fields (e.g., change "Teléfono" or "Frase Personal")
6. Do NOT touch any image fields
7. Click "Actualizar"
8. **Verify**: User is updated successfully
9. Navigate back and edit the same user again
10. **Verify**: All three images are still present and display correctly

**Result**: ✅ PASS / ❌ FAIL
**Notes**: _________________________

---

### Scenario 3: Edit User and CHANGE One Image
**Expected**: New image is saved, other images remain unchanged.

1. Navigate to user list
2. Edit the test user
3. **Verify**: All images are displayed
4. Change ONLY "Foto Personal":
   - Click the X button to remove the current image
   - Upload a new different image
5. Leave "INE" and "Avatar" unchanged
6. Click "Actualizar"
7. **Verify**: User is updated successfully
8. Edit the same user again
9. **Verify**:
   - "Foto Personal" shows the NEW image
   - "INE" and "Avatar" remain UNCHANGED

**Result**: ✅ PASS / ❌ FAIL
**Notes**: _________________________

---

### Scenario 4: Edit User and REMOVE One Image
**Expected**: Removed image is deleted, other images remain.

1. Navigate to user list
2. Edit the test user
3. Remove ONLY "Avatar":
   - Click the X button on Avatar
4. Leave "INE" and "Foto Personal" unchanged
5. Click "Actualizar"
6. **Verify**: User is updated successfully
7. Edit the same user again
8. **Verify**:
   - "Avatar" is empty (no image)
   - "INE" and "Foto Personal" remain present

**Result**: ✅ PASS / ❌ FAIL
**Notes**: _________________________

---

### Scenario 5: Edit User and CHANGE Multiple Images
**Expected**: All new images are saved correctly.

1. Navigate to user list
2. Edit the test user
3. Change ALL three images:
   - Upload new "INE"
   - Upload new "Foto Personal"
   - Upload new "Avatar"
4. Click "Actualizar"
5. **Verify**: User is updated successfully
6. Edit the same user again
7. **Verify**: All three images show the NEW images

**Result**: ✅ PASS / ❌ FAIL
**Notes**: _________________________

---

### Scenario 6: Verify Images in User List
**Expected**: Avatar images display correctly in the user list.

1. Navigate to user list
2. **Verify**: Users with avatar images show their avatars in the list
3. **Verify**: Avatar images are visible and not broken

**Result**: ✅ PASS / ❌ FAIL
**Notes**: _________________________

---

## Browser Console Verification

During testing, open the browser console (F12) and check for:

1. **No errors** related to image loading
2. **Network tab**: Check that:
   - GET requests to `/usuarios` return users with base64 image data
   - GET requests to `/usuarios/:id` return user with base64 image data
   - PUT requests to `/usuarios/:id` send base64 image data
3. **Console logs**: Look for:
   - `✅ Usuario actualizado` messages
   - No `Buffer` object errors
   - No base64 conversion errors

## Database Verification (Optional)

If you have direct database access, you can verify:

```sql
-- Check that images are stored correctly
SELECT 
  idUsuario, 
  nombre, 
  LENGTH(fotoine) as fotoine_size,
  LENGTH(fotopersona) as fotopersona_size,
  LENGTH(fotoavatar) as fotoavatar_size
FROM tblposcrumenwebusuarios
WHERE idUsuario = <test_user_id>;
```

**Expected**: Length fields should show non-zero values for images that should be present.

## Rollback Procedure

If any test fails:

1. Note the specific scenario that failed
2. Check browser console for errors
3. Check backend logs for errors
4. Document the issue
5. Revert the changes if necessary:
   ```bash
   git revert HEAD~<number_of_commits>
   ```

## Test Results Summary

| Scenario | Result | Notes |
|----------|--------|-------|
| 1. Create with images | ⬜ | |
| 2. Edit without changing images | ⬜ | |
| 3. Edit and change one image | ⬜ | |
| 4. Edit and remove one image | ⬜ | |
| 5. Edit and change all images | ⬜ | |
| 6. Verify images in list | ⬜ | |

**Overall Result**: ⬜ PASS / ⬜ FAIL

**Tester**: _________________________
**Date**: _________________________
**Environment**: _________________________
