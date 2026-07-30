# Admin Panel Subscription Management - Implementation Summary

## ✅ Completed Features

### 1. Registration Flow (Backend)
- **File**: `backend/src/controllers/authController.js` (lines 28-32)
- New users register with `estado = 'pendiente'` and `suscripcion_activa = false`
- They cannot login until approved by admin

### 2. Login Protection (Backend)
- **File**: `backend/src/controllers/authController.js` (lines 103-109)
- Login checks:
  - Email must be verified (`email_verificado = true`)
  - Subscription must be active (`suscripcion_activa = true`)
  - Status cannot be 'pendiente'
- Returns appropriate error messages

### 3. Subscription Access Control (New Middleware)
- **File**: `backend/src/middleware/subscriptionMiddleware.js` (NEW)
- Checks:
  - `suscripcion_activa = true`
  - `estado != 'pendiente'`
  - `suscripcion_expira_en` hasn't passed
- Applied to:
  - Menu endpoints: `menuRoutes.js`
  - Restaurant endpoints: `restaurantRoutes.js`

### 4. Public Menu Access Control (Existing)
- **File**: `backend/src/controllers/menuController.js` (lines 269-271)
- Blocks menu access if `suscripcion_activa = false`
- Returns error: "Restaurante no disponible temporalmente"

### 5. Admin Panel - Approve Restaurant
- **File**: `admin/src/App.tsx` (lines 184-205)
- **Backend**: `backend/src/controllers/adminController.js` (lines 30-67)
- Allows admin to:
  - Set subscription days (dias_licencia)
  - Calculate expiration: `CURRENT_TIMESTAMP + (days * INTERVAL '1 day')`
  - Set `suscripcion_activa = true` and `estado = 'aprobado'`

### 6. Admin Panel - Update Subscription Duration (PUT Endpoint)
- Same endpoint as approval: `PUT /api/admin/restaurants/:id/approve`
- Can update `dias_licencia` for already-approved restaurants
- Recalculates `suscripcion_expira_en`

### 7. Kill Switch - Suspend Restaurant
- **Route**: `PUT /api/admin/restaurants/:id/suspend`
- **Backend**: `backend/src/controllers/adminController.js` (lines 69-112)
- **Actions**:
  - ✅ Sets `estado = 'suspendido'` and `suscripcion_activa = false`
  - ✅ Deletes ALL refresh tokens from database (forces logout)
  - ✅ Deactivates all dishes: `UPDATE platillos SET activo = false`
  - ✅ Clears Redis cache
  - ✅ Uses database transaction for consistency

### 8. Frontend Consistency
- **File**: `admin/src/App.tsx`
- Fixed field names to match backend (`dias_licencia` not `dias_acceso_permitidos`)
- Fixed field names to match backend (`suscripcion_expira_en` not `fecha_vencimiento`)
- UI shows:
  - Pending restaurants tab
  - Days input field for all users
  - Approve button (or "Guardar Tiempo" for approved, "Reactivar" for suspended)
  - Kill Switch button for approved restaurants only

## 🔄 Complete User Flow

### New User Registration
1. User fills registration form at `/registro`
2. Backend creates user with `estado = 'pendiente'`, `suscripcion_activa = false`
3. User receives OTP email for verification
4. User verifies email → `email_verificado = true`
5. User cannot login (subscription check fails)
6. Admin sees user in admin panel's "Pendientes" tab

### Admin Approval
1. Admin navigates to `/admin` (localhost:3001)
2. Logs in with SUPER_ADMIN credentials
3. Sees "Pendientes" tab with pending restaurants
4. Enters number of days (default 30)
5. Clicks "Aprobar"
6. Backend sets:
   - `estado = 'aprobado'`
   - `suscripcion_activa = true`
   - `dias_licencia = [input]`
   - `suscripcion_expira_en = NOW + [input] days`

### User Dashboard Access
1. User logs in
2. Backend checks:
   - Email verified ✓
   - Subscription active ✓
   - Not pending ✓
   - Not expired ✓
3. User gets JWT token, accesses dashboard
4. All API calls check subscription via middleware
5. Public menu works via QR code

### Update Duration (After Approval)
1. Admin navigates to approved restaurant
2. Enters new number of days
3. Clicks "Guardar Tiempo"
4. Same approval endpoint recalculates expiration

### Kill Switch (Suspension)
1. Admin clicks "Cancelar Acceso" on approved restaurant
2. Confirmation modal appears with consequences
3. Admin confirms
4. Backend executes atomically:
   - Suspends restaurant
   - Revokes all refresh tokens
   - Deactivates all dishes
   - Clears cache
5. If user is logged in:
   - Next API call fails (no valid refresh token)
   - Frontend detects 401, clears auth, redirects to login
6. Public menu returns 403 error

## 🔐 Security Implementation

### Subscription State Machine
```
PENDING → APROBADO → SUSPENDIDO
         ↑         ↓
         └─────────┘ (reactivate)
```

### Token Invalidation
- Refresh tokens are stored hashed in database
- Kill Switch deletes all tokens for that restaurant
- User cannot obtain new access token
- Session ends immediately

### Database Consistency
- Suspended state uses transaction:
  - All operations atomic
  - No partial state possible
  - Rollback on error

### Subscription Checks
- Login: Verified + Active + Not Pending
- API Routes: Active + Not Pending + Not Expired
- Public Menu: Active flag checked

## 📋 Database Schema Requirements

Required columns (already exist):
- `restaurantes.estado` - 'pendiente' | 'aprobado' | 'suspendido'
- `restaurantes.suscripcion_activa` - boolean
- `restaurantes.suscripcion_expira_en` - timestamp
- `restaurantes.dias_licencia` - integer
- `restaurantes.email_verificado` - boolean
- `platillos.activo` - boolean
- `refresh_tokens` - table with restaurante_id, token, expires_at

## 🧪 Testing Checklist

- [ ] New user registration sets estado='pendiente'
- [ ] Pending user cannot login
- [ ] Admin can see pending restaurants
- [ ] Admin can approve with days input
- [ ] Approved user can login
- [ ] Approved user can access dashboard
- [ ] Approved user's public menu works
- [ ] Admin can update subscription days
- [ ] Suspension deletes refresh tokens
- [ ] Suspended user gets logged out
- [ ] Suspended user cannot login
- [ ] Suspended user's public menu returns 403
- [ ] Suspended user's dishes are inactive (if fetched)

## 📁 Files Modified

1. ✅ `backend/src/controllers/adminController.js` - Enhanced kill switch
2. ✅ `backend/src/routes/adminRoutes.js` - Added /suspend alias
3. ✅ `backend/src/middleware/subscriptionMiddleware.js` - NEW
4. ✅ `backend/src/routes/menuRoutes.js` - Added subscription check
5. ✅ `backend/src/routes/restaurantRoutes.js` - Added subscription check
6. ✅ `admin/src/App.tsx` - Fixed field names (dias_licencia, suscripcion_expira_en)

## 🚀 Deployment Status

All containers rebuilt and running:
- ✅ Backend: Updated with subscription middleware
- ✅ Admin: Updated with correct field names
- ✅ Database: Schema already supports all features
