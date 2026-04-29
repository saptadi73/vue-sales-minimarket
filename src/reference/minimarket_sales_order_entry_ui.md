# Minimarket Sales Order Entry UI

Dokumentasi ini disiapkan untuk frontend Vue.js terpisah yang dipakai Sales saat menerima permintaan susu kemasan dari waralaba minimarket.

Tujuan UI:

- mempercepat input Sales Order tanpa membuka form Sales Order Odoo
- menampilkan produk dalam bentuk grid/sheet
- Sales cukup mengisi quantity pada baris produk
- backend tetap membuat draft `sale.order` dan `sale.order.line` standar Odoo
- hasil draft tetap masuk alur business category, metadata pengiriman internal (store/vehicle), commission, dan approval yang sudah ada

## Endpoint Baru

| Endpoint | Method | Auth | Tujuan |
| --- | --- | --- | --- |
| `/api/sales/susu-olahan/customers` | `POST` | user | mengambil master customer global untuk frontend SUSU OLAHAN |
| `/api/sales/susu-olahan/customer-search` | `POST` | user | autocomplete customer global untuk pencarian saat mengetik di HP |
| `/api/sales/susu-olahan/products` | `POST` | user | mengambil produk saleable Business Category SUSU OLAHAN |
| `/api/sales/susu-olahan/shipping-products` | `POST` | user | endpoint referensi legacy produk ongkir SUSU OLAHAN (tidak dipakai flow draft-order minimarket saat ini) |
| `/api/sales/susu-olahan/stores` | `POST` | user | mengambil daftar toko/cabang untuk dropdown toko pengirim |
| `/api/sales/susu-olahan/vehicles` | `POST` | user | mengambil daftar kendaraan untuk dropdown mobil pengirim |
| `/api/sales/susu-olahan/delivery-report` | `POST` | user | laporan pengiriman produk per periode/toko/kendaraan |
| `/api/sales/minimarket/grid-products` | `POST` | user | mengambil produk siap ditampilkan sebagai grid entry |
| `/api/sales/minimarket/draft-order` | `POST` | user | membuat draft Sales Order dari quantity grid (wajib store + vehicle) |
| `/api/sales/susu-olahan/draft-order` | `POST` | user | membuat draft Sales Order SUSU OLAHAN dari quantity grid tanpa menambah item ongkir |

Semua endpoint di atas memakai session Odoo. Login tetap memakai endpoint existing:

```text
POST /api/sales/authenticate
```

Frontend Vue harus mengirim request berikutnya dengan cookie session yang sama, misalnya `credentials: "include"`.

## Login dan Session

Frontend memakai session authentication bawaan Odoo. Endpoint login bersifat public, sedangkan endpoint data minimarket memakai `auth="user"`.

Flow login:

1. Frontend memanggil `POST /api/sales/authenticate`.
2. Backend Odoo membuat session dan mengembalikan `session_id`.
3. Browser menyimpan cookie session.
4. Semua request endpoint minimarket berikutnya dikirim dengan cookie session yang sama.

Request login:

```json
{
  "params": {
    "login": "user@example.com",
    "password": "secret",
    "db": "database_name"
  }
}
```

Response sukses:

```json
{
  "status": "success",
  "message": "Authentication successful",
  "data": {
    "uid": 12,
    "session_id": "2d2c7d9f....",
    "db": "database_name",
    "login": "user@example.com",
    "name": "Demo User",
    "partner_id": 45,
    "company_id": 1,
    "company_name": "PT Example"
  }
}
```

Response error:

```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```

Format request endpoint setelah login tetap memakai JSON-RPC sederhana:

```json
{
  "params": {
    "key": "value"
  }
}
```

Contoh helper Vue:

```js
export async function postJsonRpc(url, params) {
  const response = await fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    credentials: "include",
    body: JSON.stringify({params}),
  });
  return response.json();
}

export async function loginSalesFrontend(baseUrl, form) {
  return postJsonRpc(`${baseUrl}/api/sales/authenticate`, {
    login: form.login,
    password: form.password,
    db: form.db,
  });
}
```

## Setup Business Category SUSU OLAHAN

Buat satu master Business Category untuk area sales susu olahan.

Nama yang disarankan:

```text
SUSU OLAHAN
```

Nama `susu olahan` tetap bisa ditemukan oleh endpoint karena lookup dilakukan case-insensitive, tetapi untuk menghindari duplikasi master gunakan satu bentuk resmi saja: `SUSU OLAHAN`.

Langkah setup:

1. Buka Odoo Sales.
2. Masuk ke menu `Business Categories`.
3. Buat category baru.
4. Isi `Name` dengan `SUSU OLAHAN`.
5. Isi `Code` dengan `SUSU_OLAHAN` atau kode internal yang dipakai perusahaan.
6. Pilih `Company`.
7. Isi `Analytic Account` jika transaksi kategori ini harus membawa analytic khusus.
8. Untuk flow minimarket/fleet internal saat ini, pastikan order tidak bergantung pada penambahan item ongkir otomatis.
9. Aktifkan `Gunakan Tipe Sales Order` jika transaksi harus dipisah lagi dengan `reguler`, `kering`, `partus`, `silase`, atau `peralatan`.
10. Pastikan user Sales punya akses ke kategori ini melalui `Allowed Business Categories` atau melalui Team Sales yang memakai category `SUSU OLAHAN`.

Setup produk:

- Produk susu kemasan harus `Can be Sold`.
- Jika modul `grt_inventory_business_category` aktif, isi `Business Category` pada Product/Product Template dengan `SUSU OLAHAN`.
- Endpoint `/api/sales/susu-olahan/products` membutuhkan field product business category dari modul `grt_inventory_business_category`.
- Endpoint `/api/sales/susu-olahan/shipping-products` tetap tersedia untuk kebutuhan referensi legacy, namun tidak dipakai dalam proses create draft-order minimarket saat ini.

Setup customer:

- Customer minimarket perlu punya `Customer QR Ref`.
- `Wilayah Ongkir` tetap bisa dipelihara sebagai data partner legacy, namun tidak digunakan untuk menambah line ongkir di flow minimarket saat ini.
- Customer akan muncul di endpoint `/api/sales/susu-olahan/customers` dari master customer global. Business Category `SUSU OLAHAN` tidak menjadi syarat filter customer.

Setup akses user:

- User login frontend minimarket wajib memiliki `effective_business_category_ids` yang memuat `SUSU OLAHAN`.
- Endpoint minimarket/susu olahan menentukan category dari konteks akun user (active/default business category), bukan dari payload request.
- Jika user tidak memiliki akses kategori tersebut, endpoint minimarket/susu olahan akan menolak request meskipun endpoint dipanggil dengan payload category yang benar.

## Master Data SUSU OLAHAN

### `POST /api/sales/susu-olahan/products`

Mengambil produk saleable dengan `Business Category = SUSU OLAHAN`.
Endpoint ini **wajib** menerima customer terpilih (`customer_id`/`partner_id` atau `customer_qr_ref`) karena harga produk mengikuti pricelist customer tersebut.

Request:

```json
{
  "params": {
    "customer_id": 45,
    "search": "uht",
    "limit": 100,
    "offset": 0
  }
}
```

Response:

```json
{
  "status": "success",
  "data": {
    "business_category_id": 2,
    "business_category_name": "SUSU OLAHAN",
    "customer_id": 45,
    "customer_name": "Minimarket Cabang A",
    "pricelist_id": 3,
    "pricelist_name": "Pricelist Minimarket",
    "items": [
      {
        "product_id": 101,
        "default_code": "SUSU-UHT-200",
        "barcode": "899000000001",
        "name": "Susu UHT 200ml",
        "category_name": "Susu Kemasan",
        "list_price": 4300.0,
        "uom_name": "Pcs",
        "quantity": 0.0,
        "business_category_id": 2,
        "business_category_name": "SUSU OLAHAN"
      }
    ],
    "count": 1
  }
}
```

### `POST /api/sales/susu-olahan/shipping-products`

Mengambil produk ongkos kirim untuk referensi legacy. Backend memfilter produk dengan:

- Product Category path `All / Saleable / Ongkos Kirim`
- Business Category produk `SUSU OLAHAN`
- `Can be Sold = true`

Endpoint ini tidak dipakai oleh flow draft-order minimarket saat ini. Gunakan hanya jika tim masih butuh maintenance data legacy terkait ongkir.

Request:

```json
{
  "params": {
    "search": "ongkir",
    "limit": 100,
    "offset": 0
  }
}
```

Jika nama path kategori di database berbeda kapital/spasi, frontend tetap bisa mengirim override:

```json
{
  "params": {
    "category_path": "all/saleable/ongkoskirim"
  }
}
```

Response:

```json
{
  "status": "success",
  "data": {
    "business_category_id": 2,
    "business_category_name": "SUSU OLAHAN",
    "category_id": 12,
    "category_name": "All / Saleable / Ongkos Kirim",
    "items": [
      {
        "product_id": 2001,
        "default_code": "ONGKIR-SO",
        "barcode": false,
        "name": "Ongkos Kirim Susu Olahan",
        "category_id": 12,
        "category_name": "All / Saleable / Ongkos Kirim",
        "list_price": 0.0,
        "uom_id": 1,
        "uom_name": "Unit",
        "currency_id": 13,
        "currency_name": "IDR",
        "business_category_id": 2,
        "business_category_name": "SUSU OLAHAN"
      }
    ],
    "count": 1
  }
}
```

### `POST /api/sales/susu-olahan/customers`

Mengambil master customer global untuk frontend `SUSU OLAHAN`.

Request:

```json
{
  "params": {
    "search": "alfamart",
    "limit": 50,
    "offset": 0
  }
}
```

Response:

```json
{
  "status": "success",
  "data": {
    "business_category_id": 2,
    "business_category_name": "SUSU OLAHAN",
    "items": [
      {
        "partner_id": 45,
        "customer_id": 45,
        "name": "Minimarket Cabang A",
        "ref": "MM-A",
        "customer_qr_ref": "CUSTQR2603-000001",
        "phone": "0341...",
        "mobile": "0812...",
        "email": "store@example.com",
        "shipping_wilayah_id": 15,
        "shipping_wilayah_name": "Kecamatan A",
        "payment_term_id": 4,
        "payment_term_name": "14 Days",
        "customer_segment_name": "Repeat",
        "last_sale_date": "2026-04-20",
        "sales_frequency": 8,
        "total_sales_amount": 12500000.0
      }
    ],
    "count": 1
  }
}
```

### `POST /api/sales/susu-olahan/customer-search`

Gunakan endpoint ini untuk field customer di HP agar frontend tidak perlu memuat dropdown customer terlalu banyak. Endpoint menerima `q`, `term`, `query`, atau `search`.

Request:

```json
{
  "params": {
    "q": "alfa",
    "limit": 20,
    "min_chars": 1
  }
}
```

Response:

```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": 45,
        "text": "Alfamart Cabang A [ALFA-A] CUSTQR2603-000001",
        "partner_id": 45,
        "customer_id": 45,
        "name": "Alfamart Cabang A",
        "ref": "ALFA-A",
        "customer_qr_ref": "CUSTQR2603-000001"
      }
    ],
    "results": [
      {
        "id": 45,
        "text": "Alfamart Cabang A [ALFA-A] CUSTQR2603-000001"
      }
    ],
    "count": 1,
    "has_more": false
  }
}
```

Alias endpoint:

- `POST /api/sales/susu-olahan/customers/search`

## Flow UI yang Disarankan

1. Sales login dari Vue.
2. Frontend mencari customer saat user mengetik melalui `/api/sales/susu-olahan/customer-search`.
3. Frontend mengambil produk susu olahan dari `/api/sales/susu-olahan/products` atau `/api/sales/minimarket/grid-products`.
4. Jika frontend masih memiliki halaman maintenance data legacy ongkir, data referensi bisa diambil dari `/api/sales/susu-olahan/shipping-products`.
5. Frontend menampilkan produk sebagai sheet/list menurun.
6. Sales memilih customer minimarket dan mengisi tanggal kirim, payment term, toko, dan kendaraan. Team sales mengikuti akun yang login, dan tipe Sales Order default `reguler`.
7. Sales mengisi quantity pada baris produk.
8. Frontend mengirim hanya produk dengan quantity lebih dari 0 ke `/api/sales/susu-olahan/draft-order`.
9. Backend membuat draft quotation Odoo.
10. Backend tidak menambahkan line ongkir otomatis; draft order hanya berisi item produk yang diinput frontend.
11. Sales Order diproses lanjut melalui approval Odoo seperti biasa.

## Grid Products

### `POST /api/sales/minimarket/grid-products`

Endpoint ini khusus flow minimarket SUSU OLAHAN. Backend otomatis memfilter produk `sale_ok` aktif dengan `business_category_id = SUSU OLAHAN`.
Endpoint ini juga **wajib** menerima customer terpilih (`customer_id`/`partner_id` atau `customer_qr_ref`) agar `list_price` dihitung berdasarkan pricelist customer.

Request:

```json
{
  "params": {
    "customer_id": 45,
    "search": "",
    "category_ids": [],
    "product_ids": [],
    "quantities": {
      "101": 12,
      "102": 0
    },
    "limit": 100,
    "offset": 0
  }
}
```

Field request:

- `customer_id` atau `partner_id` atau `customer_qr_ref`: wajib. Menentukan customer untuk lookup pricelist.
- `search`: opsional, mencari berdasarkan nama produk, kode produk, atau barcode.
- `category_ids`: opsional, filter kategori produk. Mendukung child category.
- `product_ids`: opsional, membatasi hanya produk tertentu.
- `quantities`: opsional, dipakai jika frontend ingin membuka ulang grid dengan quantity draft lokal.
- `limit` dan `offset`: pagination.

Catatan:

- Untuk endpoint minimarket/susu olahan, `business_category_id` atau `business_category_name` dari payload tidak menjadi acuan utama. Backend memakai category dari akun user.
- Frontend harus memilih customer terlebih dahulu sebelum memanggil endpoint list product.

Response:

```json
{
  "status": "success",
  "data": {
    "customer_id": 45,
    "customer_name": "Minimarket Cabang A",
    "pricelist_id": 3,
    "pricelist_name": "Pricelist Minimarket",
    "items": [
      {
        "product_id": 101,
        "default_code": "SUSU-UHT-200",
        "barcode": "899000000001",
        "name": "Susu UHT 200ml",
        "category_id": 7,
        "category_name": "Susu Kemasan",
        "list_price": 4300.0,
        "uom_id": 1,
        "uom_name": "Pcs",
        "currency_id": 13,
        "currency_name": "IDR",
        "quantity": 12.0
      }
    ],
    "count": 1,
    "columns": [
      {"key": "default_code", "label": "Kode", "readonly": true},
      {"key": "name", "label": "Produk", "readonly": true},
      {"key": "uom_name", "label": "UoM", "readonly": true},
      {"key": "list_price", "label": "Harga", "readonly": true},
      {"key": "quantity", "label": "Qty", "readonly": false, "input_type": "number"}
    ]
  }
}
```

Catatan frontend:

- Kolom `quantity` adalah satu-satunya kolom input utama.
- `columns` boleh dipakai untuk membangun grid dinamis, tetapi frontend juga boleh hardcode layout.
- Produk dengan `quantity = 0` tidak perlu dikirim saat create order.

## Create Draft Sales Order dari Grid

Untuk troubleshooting di HP/browser, kirim `debug: true` saat create draft order. Jika terjadi error, response menyertakan field `debug` yang bisa ditampilkan dengan `console.log`.

### `POST /api/sales/minimarket/draft-order`

Endpoint ini menerima dua bentuk payload quantity.

### Opsi A: `grid_lines`

```json
{
  "params": {
    "partner_id": 45,
    "customer_qr_ref": "CUSTQR2603-000001",
    "commitment_date": "2026-04-30 10:00:00",
    "payment_term_id": 4,
    "note": "PO minimarket cabang A",
    "grid_lines": [
      {"product_id": 101, "quantity": 24},
      {"product_id": 102, "quantity": 12},
      {"product_id": 103, "quantity": 0}
    ]
  }
}
```

### Opsi B: `quantities`

```json
{
  "params": {
    "partner_id": 45,
    "commitment_date": "2026-04-30 10:00:00",
    "payment_term_id": 4,
    "quantities": {
      "101": 24,
      "102": 12,
      "103": 0
    }
  }
}
```

Backend hanya akan membuat order line untuk quantity yang lebih besar dari 0.

Field utama:

- `partner_id` atau `customer_qr_ref`: wajib salah satu.
- `commitment_date`: wajib.
- `payment_term_id`: wajib.
- `store_id` atau `toko_id`: **wajib** untuk endpoint minimarket.
- `delivery_vehicle_id` atau `vehicle_id` atau `mobil_id`: **wajib** untuk endpoint minimarket.
- `fleet_driver_id` atau `grt_driver_id` atau `sopir_id`: opsional jika kendaraan sudah punya Driver Default Fleet; kirim field ini jika frontend menyediakan pilihan sopir.
- `departure_datetime` atau `delivery_datetime` atau `booking_datetime`: opsional; jika kosong, booking fleet memakai `commitment_date`.
- `departure_region_id` dan `destination_region_id`: opsional; jika kosong, backend mengambil region dari toko/customer atau membuat region otomatis.
- `team_id`: opsional. Jika tidak dikirim, backend otomatis memakai Team Sales dari user yang login.
- `business_category_id`: opsional. Jika tidak dikirim, backend otomatis mengambil Business Category dari Team Sales user.
- `sale_order_type`: tidak perlu dikirim dari frontend minimarket/susu olahan. Backend otomatis memakai `reguler`.
- `grid_lines`: daftar produk dari sheet.
- `quantities`: map `product_id -> quantity`, cocok untuk state object Vue.

Setelah draft Sales Order berhasil dibuat, backend langsung membuat `grt.fleet.booking` dengan tanggal/jam, mobil, dan sopir yang dipilih. Booking dibuat dalam status `confirmed` secara default. Jika frontend perlu membuat booking tetap draft, kirim `fleet_booking_state: "draft"`.

### `POST /api/sales/susu-olahan/draft-order`

Endpoint ini adalah varian khusus untuk flow susu olahan. Payload-nya sama dengan `/api/sales/minimarket/draft-order`, tetapi backend otomatis memastikan `business_category_id` memakai Business Category `SUSU OLAHAN`.

Untuk implementasi saat ini, endpoint ini tidak menambahkan item ongkir ke Sales Order. Armada/fleet dipakai sebagai metadata pengiriman internal, bukan item penjualan tambahan.

Contoh request:

```json
{
  "params": {
    "partner_id": 45,
    "commitment_date": "2026-04-30 10:00:00",
    "payment_term_id": 4,
    "store_id": 1,
    "delivery_vehicle_id": 5,
    "fleet_driver_id": 7,
    "departure_datetime": "2026-04-30 10:00:00",
    "departure_region_id": 11,
    "destination_region_id": 12,
    "debug": true,
    "note": "PO susu olahan cabang A",
    "quantities": {
      "101": 24,
      "102": 12,
      "103": 0
    }
  }
}
```

Jika frontend tetap mengirim `business_category_id`, nilainya harus mengarah ke category `SUSU OLAHAN`.
Produk yang dikirim juga harus sudah diset ke Business Category `SUSU OLAHAN`.
Jika muncul error Business Category, cek `debug.payload_business_category_id`, `debug.resolved_business_category_*`, `debug.products`, dan `debug.user_effective_business_categories` di response.

Response sukses mengikuti response endpoint draft order existing:

```json
{
  "status": "success",
  "message": "Draft sales order created",
  "data": {
    "sale_order_id": 5001,
    "name": "S00051",
    "state": "draft",
    "amount_total": 156000.0,
    "line_count": 3,
    "terms_and_conditions": "sales order minimarket\n\nPO minimarket cabang A",
    "is_frontend_order": true,
    "skip_frontend_shipping": true,
    "sale_order_type": "reguler",
    "sale_order_type_label": "Reguler",
    "store_id": 1,
    "store_name": "Cabang Malang Utara",
    "delivery_vehicle_id": 5,
    "frontend_vehicle_id": 5,
    "vehicle_id": 5,
    "mobil_id": 5,
    "vehicle_name": "Toyota Hilux / B 1234 XYZ",
    "fleet_booking_id": 9001,
    "fleet_booking_name": "BOOK/2026/0001",
    "fleet_booking_state": "confirmed",
    "fleet_driver_id": 7,
    "fleet_driver_name": "Budi",
    "departure_datetime": "2026-04-30 10:00:00",
    "departure_region_id": 11,
    "departure_region_name": "Gudang Toko A",
    "destination_region_id": 12,
    "destination_region_name": "Minimarket Cabang A",
    "wilayah_id": false,
    "wilayah_name": false,
    "shipping_product_id": false,
    "shipping_product_name": false,
    "shipping_price_per_kg": false
  }
}
```

## Catatan Business Logic

- Draft order dibuat sebagai `is_frontend_order = True`.
- Default Terms and Conditions endpoint ini adalah `sales order minimarket`.
- Draft order minimarket dan susu olahan otomatis membuat booking fleet.
- `business_category_id` Sales Order tetap mengikuti Business Category sales/minimarket, sedangkan Business Category Jasa booking mengikuti Business Category armada pada kendaraan bila tersedia.

## List Sales Order untuk Frontend

Gunakan endpoint berikut untuk membuka daftar Sales Order di frontend minimarket:

- `POST /api/sales/minimarket/orders`
- `POST /api/sales/susu-olahan/orders`
- alternatif umum: `POST /api/sales/orders`

Contoh request:

```json
{
  "params": {
    "business_category_id": 2,
    "frontend_only": true,
    "date_from": "2026-04-01",
    "date_to": "2026-04-30",
    "include_lines": true,
    "include_accounting": true,
    "limit": 50,
    "offset": 0
  }
}
```

Response item memuat:

- identitas SO, customer, state, approval state, payment status
- `business_category_id`, `business_category_name`, `analytic_account_id`, `analytic_account_name`
- toko, mobil, booking fleet, sopir
- `lines` jika `include_lines = true`
- `accounting` jika `include_accounting = true`; angka receivable/payable difilter ke Business Category SO

## Master Fleet untuk Dropdown

Endpoint yang dipakai:

- toko: `POST /api/sales/susu-olahan/stores`
- mobil dan default sopir: `POST /api/sales/susu-olahan/vehicles`
- region/rute: `POST /api/sales/susu-olahan/fleet-regions`

Pada dropdown mobil, gunakan `fleet_driver_id` atau `grt_driver_id` dari response sebagai default sopir. Jika frontend menyediakan pilihan sopir manual, kirim nilai itu di payload draft order.
- Default Terms and Conditions endpoint susu olahan adalah `sales order susu olahan`.
- Jika frontend mengirim `note`, backend menggabungkan default note dan note frontend.
- Frontend minimarket/susu olahan tidak perlu menampilkan pilihan tipe Sales Order.
- Jika `sale_order_type` kosong, backend memakai `reguler`.
- Endpoint susu olahan menolak produk yang Business Category produknya bukan `SUSU OLAHAN`.
- Endpoint ini memakai mekanisme order line, price, tax, dan approval yang sama dengan endpoint draft order existing.
- Tidak ada penambahan line ongkir otomatis di flow minimarket/susu olahan saat ini.
- Fleet/vehicle dicatat sebagai metadata pengiriman internal (`frontend_vehicle_id`), bukan item penjualan.

## Contoh Service Vue

```js
export async function postJsonRpc(url, params) {
  const response = await fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    credentials: "include",
    body: JSON.stringify({params}),
  });
  return response.json();
}

export async function fetchMinimarketGridProducts(baseUrl, filters = {}) {
  return postJsonRpc(`${baseUrl}/api/sales/minimarket/grid-products`, {
    customer_id: filters.customerId,
    customer_qr_ref: filters.customerQrRef,
    search: filters.search || "",
    category_ids: filters.categoryIds || [],
    quantities: filters.quantities || {},
    limit: filters.limit || 100,
    offset: filters.offset || 0,
  });
}

export async function fetchSusuOlahanShippingProducts(baseUrl, filters = {}) {
  return postJsonRpc(`${baseUrl}/api/sales/susu-olahan/shipping-products`, {
    search: filters.search || "",
    category_path: filters.categoryPath || "All / Saleable / Ongkos Kirim",
    limit: filters.limit || 100,
    offset: filters.offset || 0,
  });
}

export async function createMinimarketDraftOrder(baseUrl, form, quantities) {
  return postJsonRpc(`${baseUrl}/api/sales/minimarket/draft-order`, {
    partner_id: form.partnerId,
    customer_qr_ref: form.customerQrRef,
    commitment_date: form.commitmentDate,
    payment_term_id: form.paymentTermId,
    store_id: form.storeId,
    delivery_vehicle_id: form.vehicleId,
    note: form.note,
    quantities,
  });
}

export async function createSusuOlahanDraftOrder(baseUrl, form, quantities) {
  return postJsonRpc(`${baseUrl}/api/sales/susu-olahan/draft-order`, {
    partner_id: form.partnerId,
    customer_qr_ref: form.customerQrRef,
    commitment_date: form.commitmentDate,
    payment_term_id: form.paymentTermId,
    store_id: form.storeId,
    delivery_vehicle_id: form.vehicleId,
    note: form.note,
    quantities,
  });
}
```

## Struktur State Vue yang Cocok

```js
const quantities = reactive({
  101: 24,
  102: 12,
  103: 0,
});
```

Dengan struktur ini, frontend tidak perlu membentuk `sale.order.line` Odoo. Backend akan mengubah quantity menjadi line Sales Order.

## Master Data Toko dan Kendaraan

### `POST /api/sales/susu-olahan/stores`

Mengambil daftar toko/cabang (`grt.fleet.store`) untuk dropdown pilihan toko pengirim.

Request:

```json
{
  "params": {
    "search": "cabang",
    "limit": 100,
    "offset": 0
  }
}
```

Field request:

- `search`: opsional, mencari berdasarkan `name`, `code`, `phone`, atau `street`.
- `include_inactive`: opsional, default `false`. Set `true` untuk menampilkan toko non-aktif.
- `limit` dan `offset`: pagination.

Response:

```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "store_id": 1,
        "toko_id": 1,
        "name": "Cabang Malang Utara",
        "code": "MLG-UTR",
        "display_name": "Cabang Malang Utara",
        "partner_id": 12,
        "partner_name": "PT Contoh",
        "phone": "0341-000000",
        "street": "Jl. Contoh No. 1",
        "outlet_count": 3
      }
    ],
    "count": 1
  }
}
```

Catatan:

- `store_id` dan `toko_id` bernilai sama, keduanya bisa dipakai sebagai key payload di `draft-order`.
- Toko aktif ditampilkan secara default. Untuk mengelola toko, buka menu `Fleet Management > Master Data > Toko Fleet` dan `Outlet Fleet` di Odoo.
- Nilai toko yang dipilih frontend tetap disimpan di field Sales Order `frontend_store_id` (field Toko pada form Sales Order tidak dihilangkan).

### `POST /api/sales/susu-olahan/vehicles`

Mengambil daftar kendaraan (`fleet.vehicle`) untuk dropdown pilihan mobil pengirim.

Request:

```json
{
  "params": {
    "search": "B 1234",
    "limit": 100,
    "offset": 0
  }
}
```

Field request:

- `search`: opsional, mencari berdasarkan `name`, `license_plate`, atau `driver_id.name`.
- `include_inactive`: opsional, default `false`.
- `limit` dan `offset`: pagination.

Response:

```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "delivery_vehicle_id": 5,
        "frontend_vehicle_id": 5,
        "vehicle_id": 5,
        "mobil_id": 5,
        "name": "Toyota Hilux / B 1234 XYZ",
        "license_plate": "B 1234 XYZ",
        "model_id": 3,
        "model_name": "Toyota Hilux",
        "driver_id": 45,
        "driver_name": "Budi Santoso"
      }
    ],
    "count": 1
  }
}
```

Catatan:

- `delivery_vehicle_id`, `vehicle_id`, dan `mobil_id` bernilai sama. Frontend baru disarankan memakai `delivery_vehicle_id`, sementara alias lama tetap didukung.
- Data kendaraan dikelola di modul Fleet Odoo (`fleet.vehicle`).

## Laporan Pengiriman

### `POST /api/sales/susu-olahan/delivery-report`

Mengambil laporan pengiriman produk untuk frontend order kategori `SUSU OLAHAN`. Cocok untuk halaman rekap pengiriman harian maupun per periode.

Request:

```json
{
  "params": {
    "date_from": "2026-04-01",
    "date_to": "2026-04-30",
    "store_ids": [1, 2],
    "delivery_vehicle_ids": [5],
    "customer_ids": [45],
    "product_ids": [],
    "limit": 100,
    "offset": 0
  }
}
```

Field request:

| Field | Tipe | Keterangan |
| --- | --- | --- |
| `date_from` | `string` `YYYY-MM-DD` | Filter tanggal kirim mulai (commitment_date). Opsional. |
| `date_to` | `string` `YYYY-MM-DD` | Filter tanggal kirim akhir (commitment_date). Opsional. |
| `store_ids` | `int[]` | Filter satu atau lebih toko. Opsional. Alias: `toko_ids`. |
| `delivery_vehicle_ids` | `int[]` | Filter satu atau lebih kendaraan. Opsional. Alias: `vehicle_ids`, `mobil_ids`. |
| `customer_ids` | `int[]` | Filter satu atau lebih customer (partner). Opsional. |
| `product_ids` | `int[]` | Filter produk tertentu. Opsional. |
| `limit` / `offset` | `int` | Pagination baris. |

Semua filter bersifat opsional. Jika tidak ada filter, endpoint mengembalikan semua baris pengiriman kategori SUSU OLAHAN.

Response:

```json
{
  "status": "success",
  "data": {
    "business_category_id": 2,
    "business_category_name": "SUSU OLAHAN",
    "items": [
      {
        "sale_order_id": 5001,
        "sale_order_name": "S00051",
        "date_order": "2026-04-25 08:00:00",
        "delivery_date": "2026-04-26 00:00:00",
        "customer_id": 45,
        "customer_name": "Minimarket Cabang A",
        "store_id": 1,
        "store_name": "Cabang Malang Utara",
        "delivery_vehicle_id": 5,
        "frontend_vehicle_id": 5,
        "vehicle_id": 5,
        "mobil_id": 5,
        "vehicle_name": "Toyota Hilux / B 1234 XYZ",
        "product_id": 101,
        "product_name": "Susu UHT 200ml",
        "quantity": 24.0,
        "uom_id": 1,
        "uom_name": "Pcs",
        "price_unit": 4500.0,
        "tax_ids": [3],
        "tax_amount": 0.0,
        "price_subtotal": 108000.0,
        "price_total": 108000.0,
        "state": "draft"
      }
    ],
    "count": 1,
    "summary": {
      "quantity": 24.0,
      "amount_untaxed": 108000.0,
      "tax_amount": 0.0,
      "amount_total": 108000.0,
      "line_count": 1
    }
  }
}
```

Catatan:

- Hanya baris produk yang dikembalikan; flow minimarket saat ini tidak menambah baris ongkir otomatis.
- Field `summary` adalah agregat seluruh data yang cocok dengan filter (bukan hanya halaman saat ini).
- `state` mengikuti state `sale.order`: `draft`, `sale`, `done`, `cancel`.
- Filter `store_ids` alias `toko_ids` dan `delivery_vehicle_ids` alias `vehicle_ids`/`mobil_ids` bisa dipakai bergantian.

### Helper Vue untuk Laporan Pengiriman

```js
export async function fetchDeliveryReport(baseUrl, filter) {
  return postJsonRpc(`${baseUrl}/api/sales/susu-olahan/delivery-report`, {
    date_from: filter.dateFrom,
    date_to: filter.dateTo,
    store_ids: filter.storeIds,
    delivery_vehicle_ids: filter.vehicleIds,
    customer_ids: filter.customerIds,
    limit: filter.limit || 100,
    offset: filter.offset || 0,
  });
}
```

### Helper Vue untuk Stores dan Vehicles

```js
export async function fetchStores(baseUrl, search = "") {
  return postJsonRpc(`${baseUrl}/api/sales/susu-olahan/stores`, { search, limit: 200 });
}

export async function fetchVehicles(baseUrl, search = "") {
  return postJsonRpc(`${baseUrl}/api/sales/susu-olahan/vehicles`, { search, limit: 200 });
}
```
