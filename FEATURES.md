# 🎯 Sales Minimarket Frontend - Feature Documentation

Dokumentasi lengkap dari semua fitur dalam aplikasi Sales Minimarket Frontend.

## 🔐 Authentication Features

### Dynamic Odoo URL Input

- **Location**: Login page (top of form)
- **Feature**: Input field untuk mengganti Odoo URL tanpa edit env variable
- **Storage**: URL disimpan ke localStorage untuk login berikutnya
- **Validation**: Real-time validation dengan error messages
- **Formats Supported**:
  - `localhost:8069`
  - `http://localhost:8069`
  - `https://odoo.example.com`
  - `192.168.1.100:8069`
  - Dan format URL lainnya
- **Fallback**: Gunakan `VITE_API_BASE_URL` env variable jika URL kosong

### Session-Based Authentication

- **Method**: JSON-RPC dengan session cookies
- **Storage**: User data disimpan di sessionStorage/localStorage
- **Session Expiry**: Auto-redirect ke login jika session expired (401 error)
- **Security**: withCredentials: true untuk session management

## 📱 Dashboard Features

### Quick Action Cards

- **Buat Order Baru**: Navigate ke order creation page
- **Lihat Daftar Order**: View list of submitted orders
- **View Reports**: Access analytics and reports

### User Information Display

- Company name
- User greeting
- Business category info
- Quick logout button

## 📋 Order Management

Bagian ini adalah dokumentasi versi fungsional (untuk user bisnis/QA) berdasarkan perilaku aplikasi saat ini.

### Order Creation Features

#### Customer Search & Selection

- **Search**: Real-time search untuk minimarket customers
- **Autocomplete**: Dropdown suggestions saat typing
- **Selection**: Pilih customer dari dropdown
- **Validation**: Customer wajib dipilih sebelum submit

#### Order Details

- **Commitment Date**: Tanggal & jam pengiriman yang diinginkan
- **Payment Terms**: Pilih syarat pembayaran
- **Store**: Pilih toko pengirim
- **Vehicle**: Pilih kendaraan pengirim
- **Notes**: Tambah catatan untuk order (opsional)

Aturan validasi utama:

- Customer wajib dipilih
- Commitment date wajib diisi
- Payment term wajib dipilih
- Store wajib dipilih
- Vehicle wajib dipilih
- Minimal 1 produk memiliki quantity > 0

#### Product Grid Features

- **Search**: Cari produk berdasarkan nama atau barcode
- **Pagination**: Navigate melalui product pages
- **Quantity Input**: Input quantity untuk setiap produk
- **Real-time Calculation**: Total harga dihitung otomatis
- **Summary Row**: Total items dan total amount selalu visible
- **Debounced Search**: Search dengan 300ms debounce untuk performance

### Order Submission

- **Validation**: Pastikan minimal 1 produk dengan qty > 0
- **Confirmation**: Submit button menampilkan loading state
- **Success**: Auto-redirect ke orders list setelah sukses
- **Error Handling**: Toast notifications untuk errors

Catatan kompatibilitas backend:

- Nilai tanggal kirim dikirim sebagai `commitment_date` dengan format `YYYY-MM-DD HH:mm`
- Sistem otomatis menormalisasi nilai dari input browser (`YYYY-MM-DDTHH:mm`) sebelum submit

## 📊 Report & Analytics

### Filters

- **Date Range**: Filter dari-sampai tanggal (default: last 30 days)
- **Store Filter**: Pilih specific store (optional)
- **Vehicle Filter**: Pilih specific vehicle (optional)
- **Dynamic Loading**: Load report berdasarkan filter

### Statistics Cards

- **Total Orders**: Jumlah total orders dalam filter
- **Total Quantity**: Total qty seluruh items
- **Total Amount**: Total nilai order
- **Average**: Rata-rata per order

### Data Table

- **Columns**: Order #, Date, Customer, Store, Qty, Amount, Status
- **Sorting**: Sortable columns (date, amount)
- **Pagination**: Data dipaginasi untuk performance
- **Formatting**: Currency, date, qty formatting

### Export Features

- **CSV Export**: Download report data ke CSV file
- **Filename**: Generated dengan timestamp
- **Format**: Readable CSV dengan proper formatting

## 🎨 UI/UX Features

### Responsive Design

- **Mobile** (< 640px):
  - Single column layout
  - Hamburger menu navigation
  - Full-width inputs
  - Stack components vertically

- **Tablet** (640px - 1024px):
  - 2-column layout
  - Expanded navigation
  - More breathing room

- **Desktop** (> 1024px):
  - 3-column layout
  - Full sidebar navigation
  - Side-by-side product grid

### Navigation

- **Sidebar** (Desktop): Full sidebar dengan menu items
- **Hamburger Menu** (Mobile): Collapsible menu
- **Top Header**: User info, logout button
- **Route Guards**: Protected routes dengan auth checks

### Components

#### Header

- Company/app name
- User greeting (shows user.name)
- Mobile hamburger toggle
- Logout button

#### Layout

- Responsive sidebar/header
- Main content area
- Router-view for pages
- Toast container

#### Toast Notifications

- **Types**: success, error, warning, info
- **Auto-dismiss**: 5 seconds default
- **Animations**: Slide-in/out effects
- **Stacking**: Multiple toasts can stack
- **Actions**: Manual dismiss button

#### Product Grid

- Search field dengan debounce
- Product table/grid view
- Quantity input fields
- Pagination controls
- Summary row dengan totals

## 🔄 State Management (Pinia)

### Auth Store

- **State**: user, isLoading, error
- **Actions**: initializeAuth(), login(), logout(), clearError()
- **Computed**: isAuthenticated

### Order Store

- **State**: draft (OrderDraft), items (Map), isSubmitting, submitError
- **Actions**:
  - setCustomer()
  - setOrderMetadata()
  - setProductQuantity()
  - removeProduct()
  - resetDraft()
  - submitOrder()
- **Computed**: totalItems, totalAmount, orderItems

## 🔌 API Integration

### Authentication Endpoints

- `POST /api/sales/authenticate` - Login to Odoo

### Product Endpoints

- `POST /api/sales/susu-olahan/products` - Get Susu Olahan products
- `POST /api/sales/minimarket/grid-products` - Get minimarket grid products
- `POST /api/sales/susu-olahan/shipping-products` - Get shipping products

### Customer Endpoints

- `POST /api/sales/susu-olahan/customers` - Get/search customers

### Order Endpoints

- `POST /api/sales/susu-olahan/draft-order` - Create draft order with automatic fleet booking
- `POST /api/sales/minimarket/draft-order` - Create minimarket order

### Report Endpoints

- `POST /api/sales/susu-olahan/delivery-report` - Get delivery report

## 🛡️ Security Features

- **Session-Based Auth**: Secure session management dengan Odoo
- **CORS Support**: Proper CORS configuration untuk cross-origin requests
- **Protected Routes**: Navigation guards untuk authentication
- **Session Expiry**: Auto-logout pada 401 errors
- **XSS Protection**: Vue templating prevents XSS
- **Input Validation**: All inputs validated before submission
- **Error Messages**: Generic error messages untuk security

## ⚙️ Configuration Features

### Environment Variables

- `VITE_API_BASE_URL`: Base URL untuk API (dapat di-override dari login)
- Development value: `http://localhost:8069`
- Production value: Sesuaikan dengan domain Anda

### Dynamic Configuration

- Odoo URL dari login page
- Automatic httpClient base URL update
- localStorage persistence
- Fallback ke env variable

### Mock API (Development)

- Optional mock API untuk testing tanpa backend
- Toggle di `src/services/mockAPI.ts` (ENABLE_MOCK_API flag)
- Mock data untuk semua endpoints
- Useful untuk UI/UX testing

## 🎨 Styling Features

### Tailwind CSS v4

- **Colors**: Blue primary, purple/green accents, gray background
- **Responsive**: Mobile-first utilities
- **Components**: Pre-built component classes
- **Animations**: Smooth transitions dan hover effects
- **Spacing**: Consistent padding/margin system

### Custom Styling

- Global CSS di `src/assets/css/style.css`
- Tailwind imports
- Custom animations
- Responsive breakpoints

## 📞 User Support Features

### Error Handling

- Toast notifications untuk all errors
- Helpful error messages
- Input validation feedback
- Loading states untuk async operations

### User Guidance

- Helper text under form fields
- Placeholder text dengan examples
- Info boxes dengan tips
- Clear button labels

### Performance Features

- Debounced search (300ms)
- Pagination untuk large datasets
- Optimized re-renders
- Lazy loading routes
- Code splitting dengan Vite

## 📚 Documentation

All features documented in:

- `SETUP.md` - Setup dan usage guide
- `README_ID.md` - Indonesian user guide
- `PROJECT_COMPLETE.md` - Project overview
- `URL_FEATURE.md` - Dynamic URL feature details
- `CHANGELOG.md` - Version history
- This file (`FEATURES.md`) - Feature documentation

---

**Version**: 1.1.1  
**Last Updated**: April 29, 2026  
**Status**: ✅ Production Ready
