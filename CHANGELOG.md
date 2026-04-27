# CHANGELOG

All notable changes to the Sales Minimarket Frontend project will be documented in this file.

## [1.1.0] - April 26, 2026

### ✨ New Features

- **Dynamic Odoo URL Input** - Add input field for Odoo URL on login page
  - Users can now change Odoo URL directly from login page without editing environment variables
  - URL is automatically saved to browser localStorage for future logins
  - Supports various URL formats: `localhost:8069`, `https://odoo.example.com`, IP addresses, etc.
  - Includes URL validation with helpful error messages
  - Fallback to `VITE_API_BASE_URL` environment variable if no URL is provided

### 🔧 Technical Changes

- **New File**: `src/utils/apiUrl.ts` - Utility functions for managing dynamic API base URL
  - `getApiBaseUrl()` - Get current API base URL from localStorage or env
  - `setApiBaseUrl(url)` - Set and save URL to localStorage
  - `clearApiBaseUrl()` - Reset to default from env
  - `validateApiUrl(url)` - Validate URL format with error messages

- **Updated Files**:
  - `src/views/LoginView.vue` - Added Odoo URL input field, URL validation, saved URL loading
  - `src/stores/authStore.ts` - Updated login function to accept optional apiUrl parameter
  - `src/services/httpClient.ts` - Import dynamic URL, add updateHttpClientBaseUrl function
  - `src/services/authService.ts` - Update httpClient base URL before login
  - `src/utils/apiUrl.ts` - New utility module for URL management
  - `.env.example` - Updated with notes about dynamic URL feature

### 🐛 Bug Fixes

- Fixed TypeScript error in `src/stores/orderStore.ts` - Convert null to undefined for store_id and vehicle_id
- Fixed TypeScript error in `src/views/ReportsView.vue` - Ensure getDateString() always returns string

### 📚 Documentation Updates

- Updated `SETUP.md` with new Dynamic URL feature documentation
- Updated `README_ID.md` with URL feature information
- Updated `PROJECT_COMPLETE.md` to list new utils and updated features
- Updated `.env.example` with clarifications about dynamic URL
- Created `URL_FEATURE.md` - Detailed documentation of the dynamic URL feature

### ✅ Build Status

- Build Status: ✅ SUCCESS
- TypeScript: ✅ No errors
- Production Ready: ✅ Yes

---

## [1.0.0] - April 25, 2026

### 🎉 Initial Release

- Complete Vue 3 + TypeScript frontend for Sales Minimarket
- 5 main pages (Login, Dashboard, Order Create, Orders List, Reports)
- 5 reusable components (Header, Layout, ProductGrid, Toast, Auth Guards)
- Full Odoo API integration with session-based authentication
- Responsive design (mobile-first)
- Modern UI with Tailwind CSS v4
- Pinia state management for auth and order draft
- Complete service layer with error handling
- Mock API for development testing
- Comprehensive documentation (SETUP.md, README_ID.md)

### 📊 Features

✅ Odoo session-based authentication  
✅ Product grid with search and pagination  
✅ Customer search and selection  
✅ Order creation and submission  
✅ Report viewing with filters and export  
✅ Responsive design for all screen sizes  
✅ Toast notification system  
✅ Protected routes with navigation guards  
✅ State persistence with Pinia  
✅ Type-safe with TypeScript

---

## What's Next?

- [ ] Mobile app version (React Native / Flutter)
- [ ] Advanced filtering for reports
- [ ] PDF export for orders
- [ ] Delivery tracking visualization
- [ ] Real-time order status updates via WebSocket
- [ ] Multi-language support (i18n)
- [ ] PWA capability (offline support)
- [ ] Dark mode theme
