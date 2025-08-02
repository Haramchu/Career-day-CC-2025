# 🔧 Troubleshooting Guide - Admin Panel Login Issues

## ❌ Problem: "Terjadi kesalahan saat login" saat login admin/guru

### ✅ **Step-by-Step Diagnostic**

#### 1. **Check Environment Variables**
```bash
# Pastikan file .env exists dan berisi:
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

**🔍 Test**: 
- Buka `http://localhost:3000/debug-admin`
- Klik "Run Database Tests"
- Lihat apakah Supabase config "Set" atau "Missing"

#### 2. **Verify Database Setup**
Jalankan script SQL di Supabase SQL Editor (berurutan):

```sql
-- 1. schema.sql (main tables)
-- 2. teacher_admin_setup.sql (teachers table & function)
-- 3. sample_data.sql (test data)
```

**🔍 Test**: 
- Di Supabase Dashboard > Database > Tables
- Pastikan ada tabel: `students`, `teachers`, `speakers`, `talks`, `enrollments`
- Di Database > Functions, pastikan ada `teacher_login`

#### 3. **Check Sample Data**
Jalankan query di Supabase SQL Editor:
```sql
-- Cek ada data guru
SELECT * FROM teachers;

-- Should return 3 sample teachers
```

#### 4. **Test Function Manually**
Di Supabase SQL Editor:
```sql
-- Test login function
SELECT teacher_login('budi.santoso@sekolah.sch.id', 'password123');

-- Should return JSON with success: true
```

#### 5. **Browser Console Check**
- Buka Developer Tools (F12)
- Go to Console tab
- Try login admin
- Look for error messages

### 🚨 **Common Error Messages & Solutions**

#### Error: "Missing REACT_APP_SUPABASE_URL"
**Solution**: 
1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials
3. Restart React app (`npm start`)

#### Error: "Function teacher_login does not exist"
**Solution**:
1. Run `teacher_admin_setup.sql` in Supabase SQL Editor
2. Verify in Supabase Dashboard > Database > Functions

#### Error: "Teacher not found"
**Solution**:
1. Run `sample_data.sql` to insert sample teachers
2. Or manually insert teacher:
```sql
INSERT INTO teachers (nip, name, email, password_hash, classes, is_admin) 
VALUES ('123456789', 'Test Teacher', 'test@school.id', 'password123', ARRAY['12 IPA 1'], true);
```

#### Error: "relation 'teachers' does not exist"
**Solution**:
1. Run `teacher_admin_setup.sql` first
2. Check table exists: `SELECT * FROM teachers LIMIT 1;`

#### Error: "Invalid password"
**Solution**:
- Use exact password: `password123` (case sensitive)
- For sample accounts, password is not hashed

### 🧪 **Debug Steps**

1. **Access Debug Tool**: `http://localhost:3000/debug-admin`

2. **Run All Tests** - should show:
   - ✅ Basic Connection: Success
   - ✅ Teachers Table: Success  
   - ✅ RPC Function: Success
   - ✅ Teacher Data: Found 3 teachers
   - ✅ Sample Login: Success

3. **If any test fails**, follow the specific error solution above

### 📋 **Sample Login Credentials**

| Email | Password | Role | Classes |
|-------|----------|------|---------|
| budi.santoso@sekolah.sch.id | password123 | Admin | 12 IPA 1, 12 IPA 2 |
| sari.wijaya@sekolah.sch.id | password123 | Teacher | 12 IPS 1, 12 IPS 2 |
| agus.rahman@sekolah.sch.id | password123 | Teacher | 12 IPA 3 |

### 🔄 **Complete Reset Steps**

If all else fails, complete reset:

1. **Delete all data**:
```sql
DROP VIEW IF EXISTS teacher_student_overview;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS talks CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS speakers CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP FUNCTION IF EXISTS teacher_login;
```

2. **Re-run setup scripts** (in order):
   - `schema.sql`
   - `teacher_admin_setup.sql` 
   - `sample_data.sql`

3. **Restart React app**:
```bash
# Stop with Ctrl+C, then:
npm start
```

### 📞 **Still Having Issues?**

1. Share screenshot of browser console errors
2. Share result from debug tool (`/debug-admin`)
3. Confirm Supabase project URL is accessible
4. Verify .env file is in root directory (next to package.json)
