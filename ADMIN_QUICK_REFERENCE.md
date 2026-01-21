# 🚀 KABS Admin - Quick Reference Card

## 🔐 Login Credentials

```
Email:    admin@kabs.com
Password: KabsAdmin@2026
```

## 📍 How to Access

1. Click **🔐 ADMIN LOGIN** button (purple, top-right)
2. Enter credentials above
3. Go to **Dashboard** → **Drawing Suggestion AI**
4. Click **Admin Panel** button

## ⚡ Quick Setup (3 Steps)

### 1️⃣ Create User in Supabase
- Dashboard → Authentication → Users → Add User
- Email: `admin@kabs.com`
- Password: `KabsAdmin@2026`
- ✅ Auto Confirm User

### 2️⃣ Grant Permissions
```sql
INSERT INTO admin_users (user_id, role, permissions)
SELECT id, 'super_admin',
  '{"manage_rules": true, "manage_documents": true}'::jsonb
FROM auth.users WHERE email = 'admin@kabs.com';
```

### 3️⃣ Login & Test
- Login with credentials
- Access Admin Panel
- Add a test NKBA rule

## 🎯 Admin Panel Features

| Feature | What You Can Do |
|---------|----------------|
| **NKBA Rules** | Add, edit, delete rules with codes |
| **Documents** | Upload NKBA reference PDFs |
| **Images** | Upload reference images |

## 📋 Example NKBA Rule

```
Code:        NKBA-31
Title:       Work Aisle Width
Category:    clearances
Min Value:   42
Unit:        inches
Severity:    warning
Description: Work aisle should be at least 42 inches wide
```

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Admin Panel not visible | Check `admin_users` table, logout/login |
| Can't upload files | Verify storage buckets exist |
| Login fails | Check user in Supabase Dashboard |

## 📚 Documentation Files

- `ADMIN_CREDENTIALS.md` - Full credentials guide
- `ADMIN_SETUP_COMPLETE.md` - Complete setup guide
- `DRAWING_AI_README.md` - Feature documentation
- `migration-scripts/create-admin-user.sql` - SQL script

## ⚠️ Security Reminder

**CHANGE PASSWORD AFTER FIRST LOGIN!**

---

**Need Help?** Check the documentation files above or review browser console for errors.
