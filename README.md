# QR Attendance System

A simple React + Supabase attendance system using encrypted QR codes.

## Features

- 🔐 Encrypted QR codes for security
- 📱 Mobile-responsive design
- 📷 Camera-based QR scanning
- 📊 Admin dashboard with filtering
- 📥 Export to CSV
- ⏰ Optional QR expiry validation

## Setup

### 1. Install dependencies:
```bash
npm install
```

### 2. Setup Supabase Database

Go to your Supabase project SQL Editor and run the SQL from `supabase-setup.sql`

This will create:
- `attendance` table - stores attendance records
- `students` table - optional student management
- Indexes for performance
- Row Level Security policies
- View for daily summaries

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Update with your credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ENCRYPTION_KEY=your-random-secret-key
VITE_ADMIN_PASSWORD=your-secure-admin-password
```

### 4. Run the app:
```bash
npm run dev
```

## Usage

### Generate QR Code
1. Click "Generate" tab
2. Enter student ID (e.g., 2024-001)
3. Click "Generate Encrypted QR"
4. Download or print the QR code

### Scan QR Code
1. Click "Scan" tab
2. Allow camera permissions
3. Point camera at QR code
4. Attendance is automatically recorded

### Admin Dashboard
1. Click "Dashboard" tab
2. Enter admin password (default: admin123)
3. View all attendance records
4. Filter by date
5. Export to CSV
6. Logout when done

## Security Features

- 🔐 AES encryption for QR codes
- ⏰ Optional QR expiry (24 hours default)
- 🛡️ Row Level Security in Supabase
- 🚫 Duplicate attendance prevention (optional)
- 🔑 Password-protected admin dashboard
- 💾 Session-based authentication

## Database Schema

### attendance table
- `id` - Primary key
- `student_id` - Student identifier
- `datetime` - Timestamp of attendance
- `status` - Attendance status (Present/Absent)
- `created_at` - Record creation time

### students table (optional)
- `id` - Primary key
- `student_id` - Unique student identifier
- `name` - Student name
- `email` - Student email
- `created_at` - Record creation time

## Production Notes

- ⚠️ Change `VITE_ENCRYPTION_KEY` to a strong random string
- ⚠️ Change `VITE_ADMIN_PASSWORD` to a secure password
- Enable duplicate prevention trigger if needed
- Adjust RLS policies based on your security requirements
- For enhanced security, consider implementing Supabase Auth
- Admin session expires when browser is closed

