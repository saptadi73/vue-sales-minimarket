# 📱 Sales Minimarket Frontend - Susu Olahan

Aplikasi frontend Vue.js modern untuk manajemen sales order minimarket terintegrasi dengan Odoo. Aplikasi ini dirancang khusus untuk kategori bisnis "Susu Olahan" dengan fitur entry order yang cepat, responsif, dan elegant.

## ✨ Fitur Utama

- **🔐 Autentikasi**: Login dengan session Odoo yang aman
- **🌐 Dynamic URL**: Ganti Odoo URL langsung dari login page tanpa edit env
- **📊 Entry Order Cepat**: Grid produk interaktif untuk input quantity dengan mudah
- **👥 Manajemen Customer**: Pencarian dan pemilihan customer minimarket
- **💰 Kalkulasi Otomatis**: Harga, total, dan ongkir dihitung otomatis
- **📱 Responsive Design**: Sempurna di mobile, tablet, dan desktop
- **🎨 Modern UI**: Interface yang elegant dan keren dengan Tailwind CSS
- **📈 Report & Analytics**: Laporan pengiriman dan analisis penjualan
- **⚡ Real-time**: Integrasi seamless dengan Odoo backend

## 🛠️ Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Fast build tool

## 📋 Prerequisites

- Node.js 20.19.0+ or 22.12.0+
- npm atau yarn
- Odoo instance dengan modul sales
- API endpoints sudah di-setup sesuai dokumentasi

## 🚀 Instalasi & Setup

### 1. Clone Repository

```bash
cd /path/to/project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment (Optional)

Buat file `.env.local` di root project (opsional):

```env
VITE_API_BASE_URL=http://localhost:8069
```

**Catatan**: Anda bisa mengganti URL Odoo langsung dari halaman login tanpa perlu mengubah file ini. URL akan otomatis tersimpan di browser Anda.

### 4. Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

### 5. Build untuk Production

```bash
npm run build
```

Output akan tersimpan di folder `dist/`

## 📁 Struktur Proyek

```
src/
├── assets/
│   └── css/
│       └── style.css           # Global styles & Tailwind imports
├── components/
│   ├── Header.vue              # Navigation header
│   ├── Layout.vue              # Main layout dengan sidebar
│   ├── ProductGrid.vue         # Product entry grid
│   └── Toast.vue               # Notification system
├── config/
│   └── api.ts                  # API configuration
├── router/
│   └── index.ts                # Routes & navigation guards
├── services/
│   ├── authService.ts          # Authentication
│   ├── customerService.ts      # Customer operations
│   ├── httpClient.ts           # HTTP client setup
│   ├── orderService.ts         # Order operations
│   └── productService.ts       # Product operations
├── utils/
│   └── apiUrl.ts               # Dynamic API URL management
├── stores/
│   ├── authStore.ts            # Auth state (Pinia)
│   └── orderStore.ts           # Order state (Pinia)
├── types/
│   └── index.ts                # TypeScript interfaces
├── views/
│   ├── DashboardView.vue       # Dashboard page
│   ├── LoginView.vue           # Login page
│   ├── OrderCreateView.vue     # Create order page
│   ├── OrdersListView.vue      # Orders list page
│   └── ReportsView.vue         # Reports page
├── App.vue                     # Root component
└── main.ts                     # Application entry point
```

## 📖 Panduan Penggunaan

### Login

1. Buka aplikasi di browser
2. (Optional) Masukkan URL Odoo Anda:
   - **Odoo URL**: Format: `localhost:8069` atau `https://odoo.example.com`
   - URL akan tersimpan untuk login berikutnya
   - Kosongkan jika ingin gunakan default dari `.env.local`
3. Masukkan kredensial Odoo Anda:
   - **Database**: Nama database Odoo
   - **Email/Username**: Email/username Odoo
   - **Password**: Password Odoo
4. Klik "Login" dan tunggu proses autentikasi

**Tip**: Jika Anda memiliki multiple Odoo instances, Anda bisa mengganti URL langsung dari halaman login tanpa perlu konfigurasi ulang.

### Membuat Sales Order

1. **Dari Dashboard**, klik "Buat Order Baru" atau dari menu
2. **Isi Detail Order**:
   - Cari dan pilih Customer (Minimarket)
   - Atur tanggal pengiriman
   - Pilih syarat pembayaran
   - Pilih team sales
   - (Optional) Pilih tipe order
   - (Optional) Tambah catatan

3. **Pilih Produk**:
   - Lihat grid produk di sebelah kanan
   - Cari produk yang ingin dijual
   - Input quantity untuk setiap produk
   - Total harga akan dihitung otomatis

4. **Submit Order**:
   - Pastikan minimal 1 produk dengan quantity > 0
   - Klik tombol "✓ Buat Draft Order"
   - Tunggu proses dan akan redirect ke halaman daftar order

### Fitur Responsive

Aplikasi mendukung berbagai ukuran layar:

- **Mobile** (< 640px): Single column, simplified navigation
- **Tablet** (640px - 1024px): 2 columns, expanded navigation
- **Desktop** (> 1024px): Full 3-column layout dengan sidebar

Navigasi otomatis menyesuaikan sesuai ukuran layar.

### Report & Analytics

1. Klik menu "Report" dari sidebar
2. Filter data:
   - Pilih range tanggal
   - Filter per toko (optional)
   - Filter per kendaraan (optional)
3. Klik "Tampilkan Report" untuk load data
4. Lihat ringkasan statistik
5. Export ke Excel dengan tombol "Export Excel"

## 🔌 API Endpoints

Semua endpoint mengikuti format JSON-RPC dan memerlukan session authentication.

### Authentication

- `POST /api/sales/authenticate` - Login ke Odoo

### Products

- `POST /api/sales/susu-olahan/products` - Get products Susu Olahan
- `POST /api/sales/minimarket/grid-products` - Get grid products
- `POST /api/sales/susu-olahan/shipping-products` - Get shipping products

### Customers

- `POST /api/sales/susu-olahan/customers` - Get customers

### Orders

- `POST /api/sales/susu-olahan/draft-order` - Create order (dengan ongkir otomatis)
- `POST /api/sales/minimarket/draft-order` - Create minimarket order

### Reports

- `POST /api/sales/susu-olahan/delivery-report` - Get delivery report

Lihat file `src/reference/minimarket_sales_order_entry_ui.md` untuk dokumentasi lengkap.

## 🎨 Tema & Styling

Aplikasi menggunakan **Tailwind CSS v4** untuk styling modern. Warna utama:

- **Primary**: Blue (`#2563EB`)
- **Secondary**: Purple, Green untuk accent
- **Background**: Gray-50 untuk clean look
- **Text**: Gray-900 untuk readability

Semua komponen sudah responsive dan menggunakan mobile-first approach.

## 🔒 Security

- ✅ Session-based authentication dengan Odoo
- ✅ CORS support untuk komunikasi dengan Odoo
- ✅ Protected routes dengan navigation guards
- ✅ Session expiry handling
- ✅ XSS protection melalui Vue templating

## ⚙️ Konfigurasi Lanjutan

### Mengubah Base URL API

**Opsi 1: Dari Login Page (Recommended)**

- Login page memiliki input field untuk Odoo URL
- Ketik URL Odoo Anda (contoh: `localhost:8069`)
- URL akan otomatis tersimpan dan digunakan untuk semua API calls

**Opsi 2: Via Environment Variable**

- Buka `.env.local` dan ubah `VITE_API_BASE_URL`:

```env
VITE_API_BASE_URL=https://odoo.yourdomain.com
```

- Fallback ini digunakan jika user tidak input URL di login page

### Menambah Payment Terms

Edit file `src/views/OrderCreateView.vue`, ubah opsi select:

```vue
<option value="4">30 Hari</option>
<option value="5">45 Hari</option>
```

### Menambah Team Sales

Sama seperti di atas, tambah opsi di dropdown Team Sales.

## 📱 PWA (Progressive Web App)

Aplikasi ini dapat dikonfigurasi sebagai PWA:

1. Buat file `public/manifest.json`
2. Tambah `manifest` link di `index.html`
3. Buat `public/service-worker.js` untuk caching

(Dokumentasi PWA akan ditambahkan di update berikutnya)

## 🐛 Troubleshooting

### CORS Error

**Masalah**: `Access to XMLHttpRequest blocked by CORS policy`

- **Solusi**: Pastikan Odoo sudah dikonfigurasi untuk accept CORS dari origin frontend

### Session Expired

**Masalah**: Mendapat error 401 saat fetch data

- **Solusi**: Login kembali melalui halaman login

### Produk Tidak Muncul

**Masalah**: Grid produk kosong

- **Solusi**:
  - Pastikan kategori bisnis "SUSU OLAHAN" sudah di-setup di Odoo
  - Pastikan produk sudah memiliki Business Category
  - Reload halaman atau coba search dengan keyword

### Styling Tidak Loaded

**Masalah**: Tailwind CSS tidak terlihat

- **Solusi**:
  - Run `npm run dev` ulang
  - Clear browser cache (Ctrl+Shift+Delete)
  - Check file `src/assets/css/style.css` import Tailwind

## 📚 Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Pinia State Management](https://pinia.vuejs.org/)
- [Vite Guide](https://vitejs.dev/)
- [Odoo API Documentation](https://www.odoo.com/documentation)

## 📝 License

Proprietary - For internal use only

## 👥 Support

Untuk pertanyaan atau issues, hubungi tim development.

---

**Dibuat dengan ❤️ untuk Sales Minimarket Susu Olahan**

v1.0.0 - April 2026
