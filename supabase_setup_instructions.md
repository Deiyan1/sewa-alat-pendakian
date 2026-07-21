# Petunjuk Konfigurasi Supabase (Supabase Setup Instructions)

Ikuti langkah-langkah di bawah ini untuk mengonfigurasi proyek Supabase Anda agar kompatibel dengan aplikasi sewa alat pendakian.

---

### Langkah 1: Jalankan SQL Schema
1. Buka **[Supabase Dashboard](https://supabase.com/dashboard)** dan masuk ke proyek Anda (`vckwdxjshzlwzopgusvd`).
2. Di sidebar sebelah kiri, klik menu **SQL Editor** (ikon terminal dengan tulisan SQL).
3. Klik tombol **New Query** -> **Blank Query**.
4. Buka file [schema.sql](file:///e:/sewaaaa/schema.sql) di editor Anda, salin semua isinya (Ctrl+A kemudian Ctrl+C).
5. Tempelkan (Paste) skrip SQL tersebut ke dalam editor SQL Supabase.
6. Klik tombol **Run** di kanan bawah editor.
7. Pastikan pesan sukses muncul: *"Success. No rows returned."*

---

### Langkah 2: Konfigurasi Storage Buckets
Aplikasi ini memerlukan dua bucket penyimpanan di Supabase Storage untuk menyimpan gambar produk dan gambar bukti transfer.

1. Di sidebar sebelah kiri Supabase Dashboard, klik menu **Storage** (ikon kotak/penyimpanan).
2. Klik tombol **New Bucket**.
3. Buat bucket pertama:
   - **Bucket Name**: `product-images`
   - **Public Bucket**: **Aktifkan (ON)** (agar siapa saja bisa melihat gambar produk di katalog).
   - Klik **Save**.
4. Klik **New Bucket** lagi untuk membuat bucket kedua:
   - **Bucket Name**: `payment-proofs`
   - **Public Bucket**: **Nonaktifkan (OFF) / Private** (bukti transfer bersifat sensitif dan hanya boleh dilihat oleh admin & pemilik pesanan).
   - Klik **Save**.

---

### Langkah 3: Konfigurasi RLS untuk Storage (Opsional tapi Direkomendasikan)
Agar lebih aman, buat kebijakan (policies) untuk kedua bucket tersebut:
- Untuk `product-images`:
  - Izinkan semua orang membaca (`SELECT`).
  - Izinkan hanya Admin (`authenticated` dengan peran `admin` via data profile) untuk menyisipkan (`INSERT`), memperbarui (`UPDATE`), dan menghapus (`DELETE`).
- Untuk `payment-proofs`:
  - Izinkan pengguna yang terautentikasi (`authenticated`) untuk mengunggah (`INSERT`) file mereka sendiri.
  - Izinkan pemilik file dan Admin untuk mengunduh/membaca (`SELECT`).

*(Kebijakan Storage default Supabase biasanya memperbolehkan unggahan dari user terautentikasi, namun Anda bisa menyempurnakannya di tab **Policies** di halaman Storage).*
