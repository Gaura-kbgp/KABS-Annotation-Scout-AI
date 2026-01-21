# 🔐 KABS FIXED ADMIN CREDENTIALS

## ⚠️ IMPORTANT: FIXED ADMIN ACCOUNT

The admin account has **FIXED, PERMANENT** credentials that cannot be changed:

```
📧 Email:    admin@kabs.com
🔑 Password: KabsAdmin@2026
```

### Key Points:
- ✅ **Login ONLY** - No signup option for this email
- ✅ **No Confirmation** - No email confirmation required
- ✅ **Fixed Password** - Cannot be reset or changed
- ✅ **Direct Access** - Just login with these exact credentials

---

## 🚫 What's NOT Allowed

### ❌ Cannot Signup with Admin Email
If you try to signup with `admin@kabs.com`, you'll see:
> "Admin account cannot be created through signup. Please use login with the fixed admin credentials."

### ❌ Cannot Reset Admin Password
If you try to reset password for `admin@kabs.com`, you'll see:
> "Admin password is fixed and cannot be reset. Use: admin@kabs.com / KabsAdmin@2026"

### ❌ Cannot Change Admin Credentials
The admin credentials are hardcoded and permanent. They cannot be modified through the application.

---

## ✅ How to Use Admin Account

### Step 1: Create Admin User in Supabase (ONE TIME ONLY)

**In Supabase Dashboard:**
1. Go to **Authentication** → **Users**
2. Click **"Add User"**
3. Enter EXACTLY:
   - **Email**: `admin@kabs.com`
   - **Password**: `KabsAdmin@2026`
   - **✓ Check "Auto Confirm User"** (IMPORTANT!)
4. Click **"Create User"**

### Step 2: Grant Admin Permissions (ONE TIME ONLY)

Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO admin_users (user_id, role, permissions)
SELECT 
  id, 'super_admin',
  '{"manage_rules": true, "manage_documents": true}'::jsonb
FROM auth.users
WHERE email = 'admin@kabs.com'
ON CONFLICT (user_id) DO NOTHING;
```

### Step 3: Login as Admin (ANYTIME)

1. Click **🔐 ADMIN LOGIN** button on landing page
2. Enter:
   - Email: `admin@kabs.com`
   - Password: `KabsAdmin@2026`
3. Click **"Sign In"**
4. You're in! No confirmation needed.

---

## 🎯 Admin Access Flow

```
Landing Page
    ↓
Click "🔐 ADMIN LOGIN" button
    ↓
Enter: admin@kabs.com
Enter: KabsAdmin@2026
    ↓
Click "Sign In"
    ↓
Dashboard
    ↓
Drawing Suggestion AI
    ↓
Click "Admin Panel"
    ↓
Manage NKBA Rules & Documents
```

---

## 🔒 Security Notes

### Why Fixed Credentials?

1. **Simplicity** - No password management needed
2. **Reliability** - Always works, no reset issues
3. **Control** - Only authorized users get these credentials
4. **No Confusion** - Clear, documented access method

### Best Practices

- ✅ Keep credentials secure
- ✅ Only share with authorized admins
- ✅ Monitor admin activity
- ✅ Use Supabase logs to track access
- ✅ Revoke access by deleting user in Supabase if needed

### If Credentials Are Compromised

If you need to change the admin credentials:

1. **Delete the old admin user** in Supabase Dashboard
2. **Create a new user** with different email/password
3. **Update the code** to use new credentials
4. **Redeploy** the application

---

## 📋 Verification Checklist

After setup, verify everything works:

- [ ] Admin user exists in Supabase (Authentication → Users)
- [ ] User is confirmed (email_confirmed_at is set)
- [ ] Admin permissions exist in `admin_users` table
- [ ] Can login with admin@kabs.com / KabsAdmin@2026
- [ ] "Admin Panel" button is visible in Drawing Suggestion AI
- [ ] Can access admin panel successfully
- [ ] Can add/edit/delete NKBA rules
- [ ] Can upload documents

---

## 🛠️ Troubleshooting

### Problem: Cannot Login

**Solution:**
1. Verify user exists in Supabase Dashboard → Authentication → Users
2. Check email is exactly `admin@kabs.com` (case-sensitive)
3. Check password is exactly `KabsAdmin@2026` (case-sensitive)
4. Verify "Auto Confirm User" was checked when creating

### Problem: Admin Panel Not Visible

**Solution:**
1. Check `admin_users` table has entry for this user:
   ```sql
   SELECT * FROM admin_users 
   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@kabs.com');
   ```
2. If no entry, run the grant permissions SQL again
3. Log out and log back in

### Problem: "Invalid credentials" error

**Solution:**
- Double-check you're using EXACT credentials:
  - Email: `admin@kabs.com` (lowercase)
  - Password: `KabsAdmin@2026` (exact case)
- Verify user exists in Supabase
- Check user is confirmed

---

## 📊 Admin Capabilities

Once logged in as admin, you can:

### NKBA Rules Management
- ✅ Add new rules (e.g., NKBA-31, NKBA-32)
- ✅ Edit existing rules
- ✅ Delete rules
- ✅ Set severity (Critical/Warning/Suggestion)
- ✅ Define min/max values and units
- ✅ Categorize rules (clearances, work triangle, etc.)

### Document Management
- ✅ Upload NKBA reference PDFs
- ✅ View document library
- ✅ Delete old documents
- ✅ Track file sizes

### Reference Images
- ✅ Upload reference images
- ✅ Link to specific rules
- ✅ Add captions
- ✅ Organize visually

---

## 🔑 Quick Reference

| Item | Value |
|------|-------|
| **Email** | admin@kabs.com |
| **Password** | KabsAdmin@2026 |
| **Can Signup?** | ❌ NO |
| **Can Reset Password?** | ❌ NO |
| **Needs Confirmation?** | ❌ NO |
| **Login Method** | Direct login only |
| **Access Level** | Super Admin (full access) |

---

## 📞 Support

For admin access issues:
1. Verify user in Supabase Dashboard
2. Check `admin_users` table
3. Review browser console for errors
4. Check Supabase auth logs

**Remember**: Admin credentials are FIXED and cannot be changed through the app!
