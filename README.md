# 🏔️ SewaAdventure — Web Sewa Alat Pendakian

Platform persewaan peralatan gunung dan pendakian modern yang dilengkapi dengan alur pemesanan lengkap, pemilihan durasi sewa, checkout transfer bank manual, dan panel verifikasi admin.

---

## 🛠️ Teknologi yang Digunakan

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database**: [Supabase](https://supabase.com/) (Auth, Database PostgreSQL, & Storage)
- **Icon**: [Lucide React](https://lucide.dev/)

---

## ✨ Fitur Utama

### 🏕️ Untuk Pelanggan (Customer)
- **Katalog & Filter Produk**: Cari alat pendakian berdasarkan nama atau kategori (Tenda, Carrier, Sepatu, dll).
- **Date Range Picker**: Pilih tanggal mulai dan selesai sewa dengan kalkulasi total harga otomatis.
- **Keranjang Belanja**: Kelola daftar alat sebelum checkout.
- **Checkout & Transfer Bank**: Pilih rekening tujuan transfer bank manual admin.
- **Dashboard Pelanggan**: Pantau status sewa dan unggah bukti transfer pembayaran.

### 🛡️ Untuk Admin
- **Dashboard Ringkasan**: Ringkasan statistik (Total sewa, pendapatan, pending verifikasi, produk disewa).
- **CRUD Produk**: Tambah, edit, hapus produk beserta upload foto alat ke Supabase Storage.
- **Verifikasi Pembayaran**: Pratinjau bukti transfer dan setujui (Approve) atau tolak (Reject) pesanan.
- **Siklus Status Sewa**: Perbarui status barang (Menunggu Bayar ➔ Menunggu Verifikasi ➔ Dikonfirmasi ➔ Disewa ➔ Dikembalikan).
- **Kelola Rekening Bank**: Tambah, hapus, atau nonaktifkan rekening bank tujuan transfer.

---

## 🔄 Alur Siklus Sewa

```text
Pelanggan Checkout ➔ Pending Payment
  └─ Pelanggan Upload Bukti Transfer ➔ Pending Verification
       ├─ Admin Approve ➔ Confirmed ➔ Disewa (Rented) ➔ Dikembalikan (Returned)
       └─ Admin Reject ➔ Pending Payment (Pelanggan upload ulang)
```

---

## 🚀 Cara Menjalankan Proyek (Getting Started)

### 1. Prasyarat
- Node.js versi 18+ dipasang di komputer Anda.
- Akun [Supabase](https://supabase.com/) aktif.

### 2. Pengaturan Variabel Lingkungan (`.env.local`)
Pastikan file `.env.local` di root proyek berisi kredensial Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vckwdxjshzlwzopgusvd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Setup Database & Storage di Supabase
1. Buka **[Supabase SQL Editor](https://supabase.com/dashboard/project/vckwdxjshzlwzopgusvd/sql/new)**.
2. Salin seluruh isi file [`schema.sql`](./schema.sql) di proyek ini, lalu klik **RUN**.
   *(Script ini otomatis membuat tabel, trigger profil, RLS policies, storage bucket `product-images` & `payment-proofs`, serta data sampel).*

### 4. Jalankan Aplikasi
Buka terminal dan jalankan perintah berikut:

```bash
# Install dependensi (jika belum)
npm install

# Jalankan server pengembangan
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## 👑 Cara Membuat Akun Admin

1. Buka `http://localhost:3000/register` dan daftarkan akun baru (misal: `admin.sewa@gmail.com`).
2. Buka **[Supabase Table Editor - Profiles](https://supabase.com/dashboard/project/vckwdxjshzlwzopgusvd/editor)**.
3. Ubah kolom `role` akun tersebut dari `'customer'` menjadi `'admin'`.
4. Login kembali di `http://localhost:3000/login`, Anda akan otomatis diarahkan ke Dashboard Admin `/admin/dashboard`.

---

## 📂 Struktur Folder Proyek

```text
sewaaaa/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Halaman Login & Register
│   │   ├── admin/           # Panel Admin (Dashboard, Products, Rentals, Bank)
│   │   ├── cart/            # Halaman Keranjang Belanja
│   │   ├── checkout/        # Halaman Checkout
│   │   ├── dashboard/       # Dashboard Pelanggan
│   │   ├── products/[id]/   # Detail Produk & Pemilih Tanggal
│   │   └── page.tsx         # Landing Page & Katalog Produk
│   ├── components/          # Komponen UI Reusable
│   ├── context/             # State Management (CartContext)
│   ├── proxy.ts             # Proteksi Rute / Middleware Next.js 16
│   └── utils/               # Client & Server Helper Supabase
├── schema.sql               # Skema Database & Storage SQL Lengkap
└── README.md                # Dokumentasi Proyek
```

## Oleh

Muhammad Dedy Khoirulliyan_101230030

## Website

sewa-alat-pendakian-azure.vercel.app
