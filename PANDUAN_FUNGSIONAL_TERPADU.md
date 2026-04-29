# Panduan Fungsional Terpadu Minimarket, Transport, Fleet, dan Frontend

Dokumen ini menyatukan panduan proses bisnis lintas fungsi dengan detail perilaku frontend.
Dokumen ini dapat dipakai sebagai versi kerja sebelum diperbarui ke file DOCX resmi.

## Tujuan Dokumen

- Menjelaskan alur end-to-end dari order minimarket sampai pengiriman
- Menegaskan batas tanggung jawab tiap tim
- Menambahkan aturan frontend yang penting untuk mencegah error operasional

## Gambaran Besar Proses

Dalam sistem ini ada tiga area kerja utama ditambah satu area frontend:

- Sales Minimarket: mencatat pesanan customer/toko
- Transport Management: mengelola shipment dari Sales Order
- Fleet Management: mengelola armada, driver, maintenance, serta booking armada (otomatis dari draft order frontend dan manual bila diperlukan)
- Frontend Sales: antarmuka untuk entry draft Sales Order

Alur normal:

1. Sales membuat pesanan dari frontend minimarket.
2. Sistem membuat Sales Order draft.
3. Sistem langsung membuat booking fleet berdasarkan tanggal/jam, mobil, dan sopir yang dipilih.
4. Admin/back office memeriksa order dan booking bila diperlukan.
5. Sales Order dikonfirmasi.
6. Transport membuat shipment dari Sales Order (jika proses transport dipakai).
7. Pengiriman diproses sampai selesai.
8. User melihat summary penjualan, booking fleet, dan pengiriman.

Catatan:

- Mulai update 2026-04-29, draft order frontend minimarket/susu olahan otomatis membuat booking fleet.
- Action `Create Shipping` di Sales Order tetap dipakai untuk proses shipment/transport manual oleh back office.

## Istilah Penting

- Business Category: kategori bisnis transaksi (contoh: SUSU OLAHAN, Angkutan)
- Sales Order: dokumen pesanan penjualan
- Shipment: dokumen pengiriman di Transport Management
- Delivery Order: dokumen pengiriman barang terkait picking/stock
- Fleet Booking: catatan pemakaian armada di Fleet Management

## Pembagian Tugas User

### Checklist Sales Frontend

Tugas:

- memilih customer
- memilih toko
- memilih mobil pengirim
- memilih produk
- mengisi quantity
- membuat draft Sales Order

Hasil:

- Sales Order draft terbentuk di backend
- Booking fleet otomatis terbentuk dari metadata pengiriman frontend

### Sales Admin/Supervisor

Tugas:

- memeriksa Sales Order
- memastikan customer, produk, quantity, harga, dan kendaraan benar
- menjalankan approval jika dibutuhkan
- mengonfirmasi Sales Order

Hasil:

- Sales Order siap diproses pengiriman

### Tim Transport

Tugas:

- membuat shipment dari Sales Order
- mengisi rute, transporter, kendaraan, dan driver
- memproses status shipment sampai selesai

Hasil:

- Shipment dan Delivery Order tercatat

### Tim Fleet

Tugas:

- mengelola master armada dan driver
- mencatat maintenance
- membuat booking armada jika perlu
- membuat SO jasa angkutan dari booking bila perlu ditagihkan

Hasil:

- pemakaian armada dan biaya armada tercatat

## Persiapan Sebelum Dipakai

1. Business Category tersedia: minimal SUSU OLAHAN dan Angkutan.
2. Produk susu olahan aktif, bisa dijual, punya harga, punya satuan, dan masuk kategori SUSU OLAHAN.
3. Customer lengkap: nama, alamat, payment term, data ref/QR bila dipakai frontend.
4. Data toko tersedia untuk pemilihan asal pengiriman.
5. Data mobil/kendaraan tersedia di master armada.
6. Data transport tersedia: asal, tujuan, rute, transporter, kendaraan, driver.

## Alur 1: Membuat Pesanan dari Frontend Minimarket

Langkah user:

1. Login ke frontend sales.
2. Pilih customer.
3. Pilih toko.
4. Pilih mobil pengirim.
5. Pilih produk susu olahan.
6. Isi quantity.
7. Periksa total.
8. Buat draft order.

Hasil di sistem:

- Sales Order draft terbentuk berisi customer, toko, kendaraan, produk, quantity, harga, pajak, total, dan business category.

## Tambahan Khusus Frontend (Penting)

### Mapping Field Form ke Payload

- Customer: `partner_id` dan/atau `customer_qr_ref`
- Tanggal pengiriman: `commitment_date`
- Syarat pembayaran: `payment_term_id`
- Toko pengirim: `store_id` (juga dipetakan sebagai `toko_id`)
- Kendaraan pengirim: `delivery_vehicle_id` (juga dipetakan sebagai `vehicle_id` dan `mobil_id`)
- Catatan: `note`
- Item produk: `grid_lines` dan/atau `quantities`

### Validasi Frontend Saat Submit

Submit ditolak jika salah satu kondisi ini terjadi:

- customer belum dipilih
- tanggal pengiriman kosong
- payment term belum dipilih
- toko belum dipilih
- kendaraan belum dipilih
- tidak ada item dengan quantity lebih dari 0

### Aturan Format Tanggal

Input HTML `datetime-local` menghasilkan format:

- `YYYY-MM-DDTHH:mm`

Backend membutuhkan format:

- `YYYY-MM-DD HH:mm`

Frontend harus menormalisasi format tanggal sebelum submit.
Jika tidak, backend dapat mengembalikan error:

- `timedata does not match format '%Y-%m-%d %H:%M'`

### Endpoint Frontend yang Umum Dipakai

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

## Alur 2: Review dan Konfirmasi Sales Order

Langkah backend:

1. Buka menu Sales.
2. Cari Sales Order dari frontend.
3. Periksa customer, toko, kendaraan, produk, quantity, dan total.
4. Jalankan approval jika diwajibkan.
5. Confirm Sales Order.

Hasil:

- Sales Order siap dikirim.

## Alur 3: Membuat Pengiriman di Transport Management

1. Buka Sales Order yang siap dikirim.
2. Klik action Create Shipping.
3. Isi rute, transporter, pickup date, ETA, kendaraan, dan driver.
4. Buat shipment.

Hasil:

- Sistem membuat Shipment dan Delivery Order.
- Relasi antara Sales Order dan Shipment tercatat.

## Alur 4: Memproses Pengiriman

1. Buka menu Transport dan cari shipment.
2. Ubah status ke In Progress saat mulai kirim.
3. Ubah status ke Done saat selesai.

Hasil:

- Status pengiriman dan progres delivery tercatat.

## Alur 5: Melihat Summary Penjualan dan Pengiriman

Dari frontend:

- total quantity
- total nilai order
- filter per customer, toko, kendaraan, periode

Dari backend sales:

- daftar SO, status approval, status invoice, customer, toko, kendaraan

Dari transport:

- jumlah shipment per status
- kendaraan dan driver yang dipakai

## Kapan Harus Pakai Fleet Booking

Gunakan fleet booking jika:

- booking otomatis dari draft order frontend perlu dipantau/diubah status operasionalnya
- pemakaian armada perlu dijadwalkan formal
- biaya sopir/BBM perlu direkap
- perlu dibuat tagihan jasa angkutan
- histori operasional armada perlu dipantau

Jika hanya kirim barang dari SO minimarket, cukup pakai Transport Management.

## Alur 6: Membuat Fleet Booking

1. Buka menu Booking Armada.
2. Buat booking baru.
3. Isi customer fleet, kendaraan, sopir, tanggal, wilayah, KM, tarif.
4. Isi business category jasa dan pemesan sesuai kebutuhan.

Hasil:

- Booking tersimpan dan subtotal tarif dihitung.

## Alur 7: Menyelesaikan Fleet Booking

1. Ubah status dari Draft ke Terkonfirmasi.
2. Saat mulai jalan, ubah ke Berjalan.
3. Saat selesai, ubah ke Selesai.

Catatan:

- hanya booking status Selesai yang masuk summary tagihan armada.

## Alur 8: Membuat SO Jasa Angkutan dari Fleet

1. Buka menu Generate SO Summary.
2. Isi periode dan filter customer bila perlu.
3. Pilih business category jasa dan produk jasa angkutan.
4. Review daftar booking.
5. Klik Buat Sale Order.

Hasil:

- SO jasa angkutan terbentuk dari booking selesai.
- booking yang sudah diproses tidak dibuat ulang.

## Perbedaan Transport vs Fleet

Transport dipakai untuk:

- pengiriman barang dari Sales Order
- shipment dan delivery order
- monitoring status pengiriman

Fleet dipakai untuk:

- master armada dan driver
- maintenance
- jadwal operasional armada
- rekap biaya armada
- pembentukan SO jasa angkutan dari booking

## Checklist Harian

### Sales Frontend

- customer sudah dipilih
- toko sudah dipilih
- kendaraan sudah dipilih
- produk dan quantity benar
- draft order berhasil dibuat

### Sales Admin

- order sudah dicek
- approval selesai (jika perlu)
- order sudah confirmed

### Transport

- shipment sudah dibuat
- rute, kendaraan, driver benar
- shipment diproses sampai selesai

### Fleet

- booking otomatis terbentuk dari draft order frontend; pembuatan manual dipakai untuk kebutuhan khusus
- booking selesai sebelum generate SO summary
- produk jasa angkutan dipilih saat generate

## Masalah yang Sering Terjadi

### Produk tidak muncul di frontend

Kemungkinan:

- produk belum aktif
- produk belum bisa dijual
- produk belum masuk business category yang benar
- user tidak punya akses kategori

### Sales Order tidak bisa dibuat

Kemungkinan:

- field wajib belum lengkap
- quantity belum diisi
- format tanggal tidak sesuai backend

### Shipment tidak bisa dibuat

Kemungkinan:

- master data transport belum siap
- Sales Order berasal dari kategori yang tidak sesuai

### Fleet summary kosong

Kemungkinan:

- booking belum status selesai
- periode filter salah
- booking sudah pernah dibuatkan SO

## Rekomendasi Praktik

- Gunakan frontend untuk entry pesanan produk.
- Gunakan Transport untuk eksekusi pengiriman.
- Gunakan Fleet untuk pencatatan operasional armada dan jasa angkutan.
- Gunakan business category secara konsisten untuk menghindari data bercampur.
- Pastikan payload frontend mengikuti kontrak API, terutama format tanggal.

## Referensi

- `PANDUAN_FUNGSIONAL_MINIMARKET_FLEET_TRANSPORT.docx`
- `PANDUAN_FUNGSIONAL_FRONTEND.md`
- `FEATURES.md`
- `SETUP.md`
- `CHANGELOG.md`
