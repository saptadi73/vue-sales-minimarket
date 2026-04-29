# Panduan Fungsional Frontend Minimarket

Dokumen ini adalah pelengkap untuk panduan fungsional utama pada file DOCX.
Fokus dokumen ini adalah perilaku aplikasi frontend yang digunakan user Sales Frontend.

## Ruang Lingkup

Frontend mencakup:

- Login dan autentikasi session Odoo
- Entry draft sales order minimarket/susu olahan
- Ringkasan order pada layar pembuatan order
- Laporan pengiriman pada halaman report

Frontend tidak mencakup:

- Approval Sales Order di backend
- Pembuatan shipment di Transport Management
- Pengelolaan booking fleet langsung di modul Fleet (frontend hanya memicu create booking via endpoint draft order)
- Generate SO jasa angkutan

## Alur Frontend yang Berlaku

1. User login pada halaman login.
2. User memilih customer pada form order.
3. User mengisi metadata order: tanggal kirim, payment term, toko, kendaraan.
4. User mengisi quantity produk di grid.
5. User menekan tombol buat draft order.
6. Frontend kirim payload ke endpoint draft order.
7. Jika sukses, backend membuat draft Sales Order sekaligus booking fleet.
8. Frontend menampilkan notifikasi sukses lalu redirect ke daftar order.

## Mapping Field Form ke Payload API

Field form utama:

- Customer: `partner_id` dan/atau `customer_qr_ref`
- Tanggal pengiriman: `commitment_date`
- Syarat pembayaran: `payment_term_id`
- Toko pengirim: `store_id` (juga dipetakan ke `toko_id`)
- Kendaraan pengirim: `delivery_vehicle_id` (juga dipetakan ke `vehicle_id` dan `mobil_id`)
- Catatan: `note`
- Produk dan quantity: `grid_lines` dan `quantities`

Catatan:

- Team sales dan tipe sales order tidak diisi dari frontend.
- Backend mengelola team sales dari session user.
- Untuk flow susu olahan, backend memastikan kategori bisnis SUSU OLAHAN.

## Aturan Validasi di Frontend

Submit order hanya bisa dilakukan jika semua syarat ini terpenuhi:

- Customer terpilih
- Tanggal pengiriman terisi
- Payment term terpilih
- Toko terpilih
- Kendaraan terpilih
- Minimal satu produk memiliki quantity lebih dari 0

Jika ada syarat yang tidak terpenuhi, frontend menampilkan error dan submit dibatalkan.

## Aturan Format Tanggal (Penting)

Input browser menggunakan `datetime-local` dengan format:

- `YYYY-MM-DDTHH:mm`

Backend mengharuskan format:

- `YYYY-MM-DD HH:mm`

Karena itu frontend menormalisasi nilai tanggal sebelum submit. Jika tidak sesuai format, backend dapat mengembalikan error:

- `timedata does not match format '%Y-%m-%d %H:%M'`

## Endpoint yang Dipakai Frontend

- `POST /api/sales/authenticate`
- `POST /api/sales/susu-olahan/customer-search`
- `POST /api/sales/susu-olahan/customers`
- `POST /api/sales/minimarket/grid-products`
- `POST /api/sales/susu-olahan/stores`
- `POST /api/sales/susu-olahan/vehicles`
- `POST /api/sales/minimarket/orders`
- `POST /api/sales/susu-olahan/orders`
- `POST /api/sales/susu-olahan/draft-order`
- `POST /api/sales/minimarket/draft-order`
- `POST /api/sales/susu-olahan/delivery-report`

## Skenario Uji Fungsional Frontend

### Skenario 1 - Buat Draft Order Sukses

1. Pilih customer valid.
2. Isi tanggal kirim.
3. Pilih payment term, toko, kendaraan.
4. Isi quantity minimal satu produk.
5. Klik buat draft order.

Ekspektasi:

- Notifikasi sukses muncul.
- User diarahkan ke halaman daftar order.

### Skenario 2 - Validasi Wajib

1. Kosongkan salah satu field wajib.
2. Coba submit.

Ekspektasi:

- Frontend menolak submit.
- Pesan error tampil sesuai field yang belum valid.

### Skenario 3 - Format Tanggal

1. Isi tanggal dari input datetime.
2. Submit order.

Ekspektasi:

- Payload yang terkirim memakai `YYYY-MM-DD HH:mm`.
- Tidak ada error `timedata does not match`.

### Skenario 4 - Produk Quantity Nol

1. Set semua quantity ke 0.
2. Submit order.

Ekspektasi:

- Frontend menolak submit karena tidak ada item valid.

## Troubleshooting Frontend

### Error format tanggal

Kemungkinan penyebab:

- Format `commitment_date` belum dinormalisasi sebelum submit.

Tindakan:

- Pastikan nilai terkirim sebagai `YYYY-MM-DD HH:mm`.

### Customer tidak bisa dipilih

Kemungkinan penyebab:

- Endpoint customer search gagal.
- Session login sudah tidak valid.

Tindakan:

- Ulang login.
- Cek response endpoint customer search.

### Toko atau kendaraan kosong

Kemungkinan penyebab:

- Master data belum tersedia di backend.

Tindakan:

- Verifikasi data store dan vehicle di backend Odoo.

## Batasan Frontend Saat Ini

- Halaman daftar order masih berupa overview, bukan detail lengkap per order.
- Frontend tidak melakukan approval order.
- Frontend tidak membuat shipment.
- Frontend tidak mengelola lifecycle booking di modul Fleet, tetapi create draft order dari frontend memicu pembuatan booking fleet otomatis di backend.

## Referensi Dokumen

- `PANDUAN_FUNGSIONAL_MINIMARKET_FLEET_TRANSPORT.docx` (panduan lintas fungsi)
- `FEATURES.md` (fitur fungsional aplikasi)
- `SETUP.md` (panduan developer dan setup)
- `CHANGELOG.md` (riwayat perubahan)
