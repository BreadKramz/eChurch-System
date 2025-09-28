# eChurch System - Our Mother of Perpetual Help Redemptorist Church

A comprehensive church management system built with modern web technologies, featuring user authentication, dashboard management, and responsive design.

## 📁 Project Structure

```
eChurch-System-main/
├── index.html                   
├── src/                         
│   ├── pages/                  
│   │   ├── public/              
│   │   │   └── index.html       
│   │   ├── auth/                
│   │   │   ├── login.html      
│   │   │   ├── register.html  
│   │   │   └── admin-login.html
│   │   └── dashboard/           
│   │       ├── dashboard.html  
│   │       └── admin.html    
│   └── assets/                 
│       ├── js/
│       │   ├── auth.js          # Authentication logic with password hashing
│       │   ├── script.js        # General scripts and UI management
│       │   ├── public.js        # Public homepage functionality
│       │   ├── admin-dashboard.js # Admin dashboard functionality
│       │   └── user-dashboard.js # User dashboard functionality
│       ├── images/              # Image assets (logo, church photos)
│       └── css/                 # CSS files (if needed)
└── README.md                    
```

## 🚀 Getting Started

### Quick Start
1. **Open the Application**: Double-click `index.html` or open it in your browser
2. **Auto-Redirect**: The loading page automatically redirects to the main site
3. **Alternative Direct Access**: Open `src/pages/public/index.html` directly

### Development
- All source files are organized in the `src/` directory
- Static assets are in `src/assets/`
- HTML pages are categorized by access level (public/auth/dashboard)

## 🔧 Features

### ✅ **Enhanced Authentication System**
- **User Registration**: Complete profile with First Name, Last Name, Email, Contact Number, Password
- **User Login**: Simple email + password authentication
- **Admin Login**: Multi-factor with email + password + access code
- **Password Security**: Hashed storage with strength validation
- **Session Management**: Automatic logout and session handling

### ✅ **Responsive Design**
- **Mobile-First**: Optimized for all device sizes
- **Clean Navigation**: Pipe-separated menu with consistent styling
- **Modern UI**: Tailwind CSS with custom church-themed colors
- **Smooth Animations**: Entrance effects and transitions

### ✅ **Dashboard System**
- **User Dashboard**: Service requests, prayer intentions, event registration
- **Admin Dashboard**: User management, announcements, event creation
- **Real-time Updates**: Dynamic data loading and form submissions
- **Role-Based Access**: Different features for users vs administrators

### ✅ **Form Validation & UX**
- **Real-time Validation**: Instant feedback on form inputs
- **Password Strength**: Visual indicator with improvement suggestions
- **Error Handling**: Clear, user-friendly error messages
- **Loading States**: Visual feedback during form submissions

## 📝 User Registration Fields

The registration form collects comprehensive user information:

- **First Name** (required, min 2 characters)
- **Last Name** (required, min 2 characters)
- **Email Address** (required, valid email format)
- **Contact Number** (required, phone number format)
- **Password** (required, min 6 characters with strength validation)
- **Confirm Password** (must match password)

## 🔒 Security Features

- **Password Hashing**: Secure storage using hash functions
- **Input Validation**: XSS prevention and data sanitization
- **Session Security**: Automatic logout and session clearing
- **Role-Based Access**: Granular permissions for different user types
- **Backward Compatibility**: Supports existing user data migration

## 🎨 Design System

### Color Scheme
- **Primary**: `#8B4513` (Saddle Brown - Church theme)
- **Secondary**: `#2c3e50` (Dark Slate Gray)
- **Accent**: `#34495e` (Steel Blue)

### Typography
- **Display Font**: Playfair Display (serif)
- **Body Font**: Roboto (sans-serif)

### Navigation Style
- Clean pipe separators: `Home | About Us | Ministry | Events | Services | Contact Us`
- Consistent across all pages
- Mobile-responsive with clean separators

## 📱 Mobile Responsiveness

- **Collapsible Navigation**: Hamburger menu for mobile devices
- **Touch-Friendly**: Proper button sizes and spacing
- **Responsive Forms**: Grid layouts that adapt to screen size
- **Optimized Images**: Proper scaling and loading

## 🧪 Testing the System

### User Flow
1. **Visit Site**: Open `index.html` → auto-redirects to main site
2. **Explore Public Pages**: View church information and services
3. **Register**: Create account with complete profile information
4. **Login**: Access user dashboard with email and password
5. **Use Dashboard**: Submit requests, join events, manage profile

### Admin Flow
1. **Admin Login**: Use `src/pages/auth/admin-login.html`
2. **Credentials**: admin@ompchurchdumaguete.com / admin123 / admin123
3. **Manage System**: User management, announcements, events

### Test Accounts
- **Admin**: admin@ompchurchdumaguete.com / admin123 (access code: admin123)
- **User**: test@test.com / test123 (or create new accounts)

## 🔧 Technical Details

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Storage**: Browser LocalStorage with JSON data
- **Security**: Client-side password hashing
- **Responsive**: Mobile-first design approach
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

## 📞 Support & Development

This system is designed for **Our Mother of Perpetual Help Redemptorist Church** in Dumaguete City. For technical support or feature requests, please contact the development team.

---

**Built with ❤️ for the church community**
