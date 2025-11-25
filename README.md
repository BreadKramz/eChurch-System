# Our Mother of Perpetual Help Redemptorist Church - eChurch System

## Admin Login Credentials
Email: admin@ompchurchdumaguete.com
Password: admin123
Access Code: admin123

## Database Setup
If you're getting "Failed to load dashboard" errors, you need to set up the database schema:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Run the SQL script
5. The database tables and functions will be created automatically

## Troubleshooting Vercel Deployment Issues

If the admin dashboard works on localhost but fails on Vercel with "Failed to load dashboard" errors:

### 1. **Service Worker Issues**
The service worker has been updated to not cache Supabase API requests. If you're still having issues:
- Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache and service worker:
  - Open DevTools (F12)
  - Go to Application/Storage tab
  - Clear storage and unregister service worker

### 2. **CORS/Network Issues**
- Check your Supabase project settings
- Ensure your Vercel domain is added to allowed origins in Supabase
- The app includes enhanced error detection for deployment issues

### 3. **Database Connection**
- Verify your Supabase URL and anon key are correct
- Check that all required tables exist (run the schema if needed)
- Ensure Row Level Security policies are properly configured

### 4. **Debugging**
The admin dashboard now includes detailed logging. Check the browser console for specific error messages that will help identify the issue.

### 5. **Service Worker Bypass (Temporary Fix)**
If service worker issues persist, you can temporarily bypass it by adding `?bypass_sw=true` to the admin URL:
```
https://your-vercel-domain.vercel.app/src/pages/admin/index.html?bypass_sw=true
```

This will unregister the service worker for that session and may resolve connectivity issues.

## Features
- Progressive Web App (PWA) with offline support
- User authentication and role management
- Service request management (baptisms, confirmations, marriages, etc.)
- Announcements and events system
- Admin dashboard with user management
- Certificate request processing
- Mobile-responsive design

## Tech Stack
- HTML5, CSS3, JavaScript (ES6+)
- Tailwind CSS for styling
- Supabase for backend (Auth, Database, Real-time)
- Service Worker for PWA functionality