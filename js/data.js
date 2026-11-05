// ============================================================
// data.js - Data dummy BukuKita (pengganti server/database)
// ============================================================

// Katalog buku (dipakai di stok.html dan checkout.html)
const dataKatalogBuku = [
  { kode: "BK001", judul: "Laskar Pelangi", kategori: "Novel", penulis: "Andrea Hirata", harga: 85000, stok: 24, gambar: "img/buku1.png" },
  { kode: "BK002", judul: "Bumi Manusia", kategori: "Novel", penulis: "Pramoedya Ananta Toer", harga: 110000, stok: 15, gambar: "img/buku2.png" },
  { kode: "BK003", judul: "Filosofi Teras", kategori: "Pengembangan Diri", penulis: "Henry Manampiring", harga: 98000, stok: 30, gambar: "img/buku3.png" },
  { kode: "BK004", judul: "Atomic Habits (Edisi Indonesia)", kategori: "Pengembangan Diri", penulis: "James Clear", harga: 105000, stok: 8, gambar: "img/buku4.png" },
  { kode: "BK005", judul: "Dasar-Dasar Pemrograman Web", kategori: "Teknologi", penulis: "Budi Raharjo", harga: 120000, stok: 18, gambar: "img/buku5.png" },
  { kode: "BK006", judul: "Belajar JavaScript dari Nol", kategori: "Teknologi", penulis: "Rina Wijaya", harga: 135000, stok: 12, gambar: "img/buku6.png" },
  { kode: "BK007", judul: "Sapiens: Riwayat Singkat Umat Manusia", kategori: "Sejarah", penulis: "Yuval Noah Harari", harga: 150000, stok: 6, gambar: "img/buku7.png" },
  { kode: "BK008", judul: "Sejarah Indonesia Modern", kategori: "Sejarah", penulis: "M.C. Ricklefs", harga: 175000, stok: 10, gambar: "img/buku8.png" },
  { kode: "BK009", judul: "Cantik Itu Luka", kategori: "Novel", penulis: "Eka Kurniawan", harga: 95000, stok: 0, gambar: "img/buku9.png" },
  { kode: "BK010", judul: "Pengantar Basis Data", kategori: "Teknologi", penulis: "Dewi Lestari", harga: 115000, stok: 20, gambar: "img/buku10.png" },
  { kode: "BK011", judul: "Resep Masakan Nusantara", kategori: "Kuliner", penulis: "Sisca Soewitomo", harga: 90000, stok: 14, gambar: "img/buku11.png" },
  { kode: "BK012", judul: "Dongeng Anak Seribu Satu Malam", kategori: "Anak", penulis: "Tim Redaksi", harga: 65000, stok: 35, gambar: "img/buku12.png" }
];

// Akun untuk login (index.html)
const dataPengguna = [
  { nama: "Administrator", email: "admin@bukukita.com", password: "admin123" },
  { nama: "Fal", email: "fal@bukukita.com", password: "fal12345" },
  { nama: "Siti Rahma", email: "siti@bukukita.com", password: "siti12345" }
];

// Data pengiriman (tracking.html)
// status: Diproses (20) -> Dikemas (40) -> Dikirim (60) -> Dalam Perjalanan (80) -> Terkirim (100)
const dataPengiriman = [
  { noDO: "DO-2026-0001", nama: "Budi Santoso", status: "Terkirim", progress: 100, ekspedisi: "JNE", tanggalKirim: "2026-10-20", jenisPaket: "Reguler", total: 195000 },
  { noDO: "DO-2026-0002", nama: "Siti Rahma", status: "Dalam Perjalanan", progress: 80, ekspedisi: "J&T Express", tanggalKirim: "2026-11-02", jenisPaket: "Express", total: 273000 },
  { noDO: "DO-2026-0003", nama: "Andi Pratama", status: "Dikirim", progress: 60, ekspedisi: "SiCepat", tanggalKirim: "2026-11-03", jenisPaket: "Reguler", total: 140000 },
  { noDO: "DO-2026-0004", nama: "Dewi Anggraini", status: "Dikemas", progress: 40, ekspedisi: "AnterAja", tanggalKirim: "2026-11-04", jenisPaket: "Reguler", total: 335000 },
  { noDO: "DO-2026-0005", nama: "Rizky Maulana", status: "Diproses", progress: 20, ekspedisi: "JNE", tanggalKirim: "2026-11-05", jenisPaket: "Express", total: 112000 }
];

// Riwayat pesanan awal (laporan pemesanan & history transaksi di dashboard)
const dataPesanan = [
  { noDO: "DO-2026-0001", tanggal: "2026-10-18", pemesan: "Budi Santoso", item: [{ kode: "BK001", qty: 1 }, { kode: "BK010", qty: 1 }], metode: "Transfer Bank", total: 195000 },
  { noDO: "DO-2026-0002", tanggal: "2026-10-30", pemesan: "Siti Rahma", item: [{ kode: "BK007", qty: 1 }, { kode: "BK005", qty: 1 }], metode: "E-Wallet", total: 273000 },
  { noDO: "DO-2026-0003", tanggal: "2026-11-01", pemesan: "Andi Pratama", item: [{ kode: "BK006", qty: 1 }], metode: "COD", total: 140000 },
  { noDO: "DO-2026-0004", tanggal: "2026-11-02", pemesan: "Dewi Anggraini", item: [{ kode: "BK008", qty: 1 }, { kode: "BK003", qty: 2 }], metode: "Transfer Bank", total: 335000 },
  { noDO: "DO-2026-0005", tanggal: "2026-11-04", pemesan: "Rizky Maulana", item: [{ kode: "BK012", qty: 1 }, { kode: "BK011", qty: 1 }], metode: "E-Wallet", total: 112000 }
];
