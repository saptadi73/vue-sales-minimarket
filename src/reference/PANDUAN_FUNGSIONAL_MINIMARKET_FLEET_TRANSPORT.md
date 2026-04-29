# Panduan Fungsional Minimarket, Fleet, dan Transport

Dokumen ini dibuat untuk user fungsional agar mudah memahami alur kerja dari pesanan minimarket, pengiriman barang, penggunaan armada, sampai laporan ringkasnya.

## Gambaran Besar

Dalam sistem ini ada tiga area kerja utama:

- **Sales Minimarket**: dipakai untuk mencatat pesanan produk dari customer/toko.
- **Transport Management**: dipakai untuk mengatur pengiriman barang dari Sales Order.
- **Fleet Management**: dipakai untuk mengelola armada, driver, booking armada, maintenance, dan tagihan jasa angkutan bila memang diperlukan.

Alur normal untuk penjualan produk minimarket adalah:

1. Sales membuat pesanan dari frontend minimarket.
2. Sistem membuat Sales Order.
3. Sistem langsung membuat booking fleet dari tanggal/jam, mobil, dan sopir yang dipilih.
4. Admin/back office memeriksa Sales Order dan booking bila diperlukan.
5. Sales Order dikonfirmasi.
6. Transport membuat shipment/pengiriman dari Sales Order bila proses transport tetap dipakai.
7. Pengiriman diproses sampai selesai.
8. User melihat summary penjualan, akun customer, booking fleet, dan pengiriman.

Mulai update 2026-04-29, fleet booking dibuat otomatis saat draft order frontend minimarket berhasil dibuat. Tombol `Create Shipping` dari Sales Order tetap dapat dipakai untuk kebutuhan manual/back office, tetapi flow frontend minimarket tidak perlu menunggu proses tersebut untuk membuat jadwal armada.

Endpoint frontend yang relevan:

- list Sales Order: `/api/sales/minimarket/orders` atau `/api/sales/susu-olahan/orders`
- create draft SO dan booking: `/api/sales/minimarket/draft-order` atau `/api/sales/susu-olahan/draft-order`
- master mobil dan default sopir: `/api/sales/susu-olahan/vehicles`
- master region/rute: `/api/sales/susu-olahan/fleet-regions`

List Sales Order dapat mengirim `include_accounting = true` agar frontend menampilkan ringkasan piutang/hutang customer sesuai Business Category Sales Order.

## Istilah Penting

**Business Category**

Kategori bisnis transaksi. Contoh:

- `SUSU OLAHAN` untuk penjualan produk susu olahan.
- `Angkutan` untuk layanan armada/jasa angkutan.

**Sales Order**

Dokumen pesanan penjualan. Sales Order berisi customer, produk, jumlah, harga, pajak, total, toko, dan mobil pengirim.

**Shipment**

Dokumen pengiriman di Transport Management. Shipment dibuat dari Sales Order untuk mengatur rute, kendaraan, driver, dan status pengiriman.

**Delivery Order**

Dokumen pengiriman barang yang terkait dengan picking/stock. Delivery Order menunjukkan barang apa yang dikirim ke customer.

**Fleet Booking**

Jadwal atau catatan pemakaian armada di Fleet Management. Mulai update 2026-04-29, booking ini otomatis dibuat saat draft order frontend minimarket/susu olahan berhasil dibuat, dan tetap bisa dibuat manual untuk kebutuhan khusus operasional armada.

## Pembagian Tugas User

### Sales Frontend

Bertugas:

- memilih customer,
- memilih toko,
- memilih mobil pengirim,
- memilih produk,
- mengisi quantity,
- membuat draft Sales Order.

Hasil kerja:

- Sales Order draft terbentuk di backend.
- Booking fleet otomatis terbentuk dari tanggal/jam, mobil, dan sopir yang dipilih di frontend.

### Sales Admin atau Supervisor

Bertugas:

- memeriksa Sales Order,
- memastikan customer, produk, quantity, harga, dan mobil pengirim benar,
- menjalankan approval jika diperlukan,
- mengonfirmasi Sales Order.

Hasil kerja:

- Sales Order siap diproses pengiriman.

### Tim Transport

Bertugas:

- membuat shipment dari Sales Order,
- memilih rute,
- memilih transporter,
- memilih kendaraan,
- memilih driver,
- menjalankan status pengiriman sampai selesai.

Hasil kerja:

- Shipment dan Delivery Order tercatat.
- Pengiriman dapat dipantau.

### Tim Fleet

Bertugas:

- mengelola data armada,
- mengelola driver,
- mencatat maintenance,
- memantau dan menindaklanjuti booking armada otomatis dari frontend,
- membuat booking armada manual jika perlu,
- membuat Sales Order jasa angkutan dari booking bila pemakaian armada perlu ditagihkan.

Hasil kerja:

- Pemakaian armada dan biaya armada tercatat.
- Jika dibutuhkan, terbentuk Sales Order jasa angkutan.

## Persiapan Sebelum Dipakai

### 1. Pastikan Business Category Sudah Ada

Minimal siapkan:

- `SUSU OLAHAN`
- `Angkutan`

Pastikan user yang bekerja di sales susu olahan punya akses ke `SUSU OLAHAN`.

### 2. Pastikan Produk Sudah Benar

Produk susu olahan harus:

- aktif,
- bisa dijual,
- punya harga,
- punya satuan,
- masuk Business Category `SUSU OLAHAN`.

Produk jasa angkutan harus:

- bertipe jasa/service,
- bisa dijual,
- dipakai saat Fleet membuat tagihan jasa angkutan.

### 3. Pastikan Customer Sudah Lengkap

Customer harus punya:

- nama,
- alamat,
- payment term,
- data QR/ref jika dipakai oleh frontend,
- wilayah pengiriman jika dibutuhkan.

### 4. Pastikan Toko Sudah Ada

Toko dipakai untuk mencatat pesanan berasal dari toko/cabang mana.

### 5. Pastikan Mobil Pengirim Sudah Ada

Mobil harus tersedia di data armada/fleet. Mobil ini akan dipilih saat frontend membuat pesanan.

### 6. Pastikan Data Transport Sudah Siap

Sebelum membuat shipment, siapkan:

- lokasi asal,
- lokasi tujuan,
- rute,
- transporter,
- kendaraan,
- driver.

## Alur 1: Membuat Pesanan dari Frontend Minimarket

### Langkah User

1. Login ke frontend sales.
2. Pilih customer.
3. Pilih toko.
4. Pilih mobil pengirim.
5. Pilih produk susu olahan.
6. Isi quantity.
7. Periksa total.
8. Simpan atau buat draft order.

### Hasil di Sistem

Sistem membuat Sales Order draft dengan informasi:

- customer,
- toko,
- mobil pengirim,
- produk,
- quantity,
- harga,
- pajak,
- total,
- Business Category `SUSU OLAHAN`.

### Summary yang Didapat

Setelah order dibuat, frontend dapat menampilkan:

- nomor Sales Order,
- total quantity,
- total sebelum pajak,
- total pajak,
- total akhir,
- daftar produk yang dipesan.

## Alur 2: Review dan Konfirmasi Sales Order

### Langkah User Backend

1. Buka menu Sales.
2. Cari Sales Order dari frontend.
3. Periksa customer.
4. Periksa toko.
5. Periksa mobil pengirim.
6. Periksa produk dan quantity.
7. Periksa total.
8. Jalankan approval jika diwajibkan.
9. Confirm Sales Order.

### Hasil di Sistem

Sales Order berubah dari draft menjadi order yang siap dikirim.

Jika konfigurasi stock aktif, sistem juga menyiapkan dokumen pengiriman barang.

## Alur 3: Membuat Pengiriman di Transport Management

Transport Management dipakai untuk mengatur pengiriman produk dari Sales Order.

### Langkah User

1. Buka Sales Order yang sudah siap dikirim.
2. Klik action **Create Shipping**.
3. Isi rute pengiriman.
4. Pilih transporter.
5. Isi tanggal pickup.
6. Isi estimasi tanggal sampai.
7. Pilih kendaraan.
8. Pilih driver.
9. Buat shipment.

### Hasil di Sistem

Sistem membuat:

- Shipment,
- Delivery Order,
- relasi dari Sales Order ke Shipment,
- relasi dari pengiriman barang ke kendaraan.

Business Category shipment mengikuti Sales Order. Jika Sales Order adalah `SUSU OLAHAN`, shipment juga berada di `SUSU OLAHAN`.

## Alur 4: Memproses Pengiriman

### Langkah User Transport

1. Buka menu `Transport / Shipments / Shipping`.
2. Cari shipment terkait.
3. Jalankan status ke **In Progress** saat mulai dikirim.
4. Jalankan status ke **Done** saat pengiriman selesai.

### Hasil di Sistem

Status pengiriman tercatat. Delivery Order terkait ikut menunjukkan progres pengiriman.

## Alur 5: Melihat Summary Penjualan dan Pengiriman

User dapat melihat summary dari beberapa tempat.

### Dari Frontend

Frontend dapat menampilkan summary:

- total quantity,
- total sebelum pajak,
- total pajak,
- total nilai order,
- jumlah line produk,
- filter per customer,
- filter per toko,
- filter per kendaraan,
- filter per periode.

### Dari Backend Sales

User bisa melihat:

- daftar Sales Order,
- total order,
- status approval,
- status invoice,
- customer,
- toko,
- mobil pengirim.

### Dari Transport Management

User bisa melihat:

- jumlah shipment,
- shipment draft,
- shipment berjalan,
- shipment selesai,
- shipment batal,
- delivery order per shipment,
- kendaraan dan driver yang dipakai.

## Kapan Harus Pakai Fleet Booking?

Fleet booking dipakai jika pemakaian kendaraan perlu dicatat sebagai transaksi armada tersendiri.

Untuk flow frontend minimarket/susu olahan, booking sudah dibuat otomatis saat draft order berhasil.

Contoh kondisi:

- ada unit bisnis lain meminta jasa armada,
- armada perlu dijadwalkan secara formal,
- biaya sopir dan BBM perlu direkap,
- pemakaian armada perlu dibuatkan tagihan/Sales Order jasa angkutan,
- maintenance dan histori kendaraan perlu dipantau.

Jika hanya mengirim produk dari Sales Order minimarket, cukup gunakan Transport Management.

## Alur 6: Membuat Fleet Booking

### Langkah User Fleet

1. Buka `Fleet Management / Operasional / Booking Armada`.
2. Buat booking baru.
3. Isi customer fleet.
4. Pilih kendaraan.
5. Pilih sopir.
6. Isi tanggal booking.
7. Isi tanggal keberangkatan.
8. Isi wilayah asal dan tujuan.
9. Isi KM.
10. Isi tarif sopir.
11. Isi tarif BBM.
12. Isi Business Category:
    - Business Category Jasa: biasanya `Angkutan`.
    - Business Category Pemesan: misalnya `SUSU OLAHAN`.
    - Business Category Sales: kategori yang menjadi owner Sales Order jasa, biasanya mengikuti pemesan.

### Hasil di Sistem

Booking armada tersimpan. Sistem menghitung subtotal tarif:

`Subtotal Tarif = Tarif Sopir + Tarif BBM`

## Alur 7: Menyelesaikan Fleet Booking

### Langkah User

1. Ubah booking dari `Draft` ke `Terkonfirmasi`.
2. Saat kendaraan mulai jalan, ubah ke `Berjalan`.
3. Saat selesai, ubah ke `Selesai`.

Booking hanya bisa masuk ke summary tagihan armada jika statusnya sudah `Selesai`.

## Alur 8: Membuat Sales Order Jasa Angkutan dari Fleet

### Langkah User

1. Buka `Fleet Management / Laporan / Generate SO Summary`.
2. Isi periode dari dan sampai.
3. Pilih customer jika ingin membatasi.
4. Pilih Business Category Jasa, misalnya `Angkutan`.
5. Pilih produk jasa angkutan.
6. Review daftar booking tersedia.
7. Klik `Buat Sale Order`.

### Hasil di Sistem

Sistem membuat Sales Order jasa angkutan berdasarkan booking yang sudah selesai.

Booking yang sudah dibuatkan Sales Order tidak akan diproses ulang.

## Perbedaan Transport dan Fleet

**Transport Management**

Dipakai untuk:

- pengiriman barang dari Sales Order,
- membuat shipment,
- membuat delivery order,
- memantau status pengiriman.

**Fleet Management**

Dipakai untuk:

- master armada dan driver,
- jadwal pemakaian armada,
- maintenance,
- rekap biaya armada,
- membuat Sales Order jasa angkutan dari booking.

Ringkasnya:

- Kirim barang pesanan customer: pakai Transport.
- Catat pemakaian armada sebagai jasa/biaya armada: pakai Fleet.

## Checklist Harian

### Sales Frontend

- Customer sudah dipilih.
- Toko sudah dipilih.
- Mobil pengirim sudah dipilih.
- Produk dan quantity sudah benar.
- Draft Sales Order berhasil dibuat.

### Sales Admin

- Sales Order sudah dicek.
- Approval sudah selesai jika dibutuhkan.
- Sales Order sudah confirmed.

### Transport

- Shipment sudah dibuat dari Sales Order.
- Rute sudah benar.
- Kendaraan dan driver sudah benar.
- Shipment sudah diproses sampai selesai.

### Fleet

- Booking dibuat hanya jika memang perlu.
- Status booking sudah selesai sebelum dibuatkan SO summary.
- Produk jasa angkutan sudah dipilih saat generate SO summary.

## Masalah yang Sering Terjadi

### Produk Tidak Muncul di Frontend

Kemungkinan penyebab:

- produk belum aktif,
- produk belum bisa dijual,
- produk belum masuk Business Category `SUSU OLAHAN`,
- user tidak punya akses ke kategori tersebut.

### Sales Order Tidak Bisa Dibuat

Kemungkinan penyebab:

- customer belum dipilih,
- tanggal pengiriman belum diisi,
- payment term belum diisi,
- toko belum dipilih,
- mobil pengirim belum dipilih,
- quantity produk masih kosong.

### Shipment Tidak Bisa Dibuat

Kemungkinan penyebab:

- rute belum disiapkan,
- transporter belum disiapkan,
- driver belum disiapkan,
- kendaraan belum dipilih,
- Sales Order yang dipilih berasal dari Business Category berbeda.

### Fleet Summary Kosong

Kemungkinan penyebab:

- booking belum selesai,
- periode filter salah,
- booking sudah pernah dibuatkan Sales Order,
- Business Category Jasa tidak sesuai,
- customer fleet belum terhubung ke kontak/partner.

## Rekomendasi Praktik

- Gunakan frontend untuk mencatat pesanan produk.
- Gunakan Transport untuk pengiriman produk.
- Gunakan Fleet untuk kontrol armada dan jasa angkutan.
- Booking fleet dibuat otomatis saat draft order frontend minimarket berhasil dibuat. Jika booking perlu ditahan dulu, frontend dapat mengirim `fleet_booking_state = "draft"`.
- Gunakan `Create Shipping` hanya untuk proses shipment/transport manual setelah Sales Order siap dikirim.
- Pastikan Business Category dipakai konsisten agar akses, laporan, dan approval tidak bercampur.
