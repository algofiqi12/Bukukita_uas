/**
 * script.js - Logika antarmuka dan interaktivitas BukuKita
 * Mahasiswa  : Muhammad Alghofiqi
 * Mata Kuliah: Pemrograman Web 1 (UTS)
 * Deskripsi  : Autentikasi, manipulasi DOM dinamis, kalkulasi checkout,
 *              tracking pengiriman, modal dialog, dan notifikasi toast.
 */

// Format nominal mata uang Rupiah
function formatRupiah(angka) {
  const num = Number(angka) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

// Sanitasi teks HTML
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function tampilkanToast(pesan, jenis = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${jenis}`;

  let iconSvg = '';
  if (jenis === 'success') {
    iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (jenis === 'error') {
    iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else {
    iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-message">${escapeHtml(pesan)}</div>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('is-show'));

  setTimeout(() => {
    toast.classList.remove('is-show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }, 3000);
}

function inisialisasiModal() {

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) tutupModal(modal.id);
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) tutupModal(overlay.id);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-overlay.is-active');
      if (activeModal) tutupModal(activeModal.id);
    }
  });
}

function bukaModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('is-active');
  document.body.style.overflow = 'hidden';

  const firstInput = modal.querySelector('input:not([type="hidden"]), button:not(.modal-close)');
  if (firstInput) setTimeout(() => firstInput.focus(), 100);
}

function tutupModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('is-active');
  document.body.style.overflow = '';
}

const SESSION_KEY = 'bukukita_user_session';
const PENGGUNA_BARU_KEY = 'bukukita_pengguna_tambahan';

// Cek sesi login aktif
function cekSesi(redirectJikaBelum = true) {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) {
    if (redirectJikaBelum) window.location.href = 'index.html';
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    if (redirectJikaBelum) window.location.href = 'index.html';
    return null;
  }
}

// Data pengguna gabungan data.js dan registrasi
function ambilDaftarPengguna() {
  const akunTambahan = JSON.parse(localStorage.getItem(PENGGUNA_BARU_KEY) || '[]');
  const akunBawaan = (typeof dataPengguna !== 'undefined') ? dataPengguna : [];
  return [...akunBawaan, ...akunTambahan];
}

// Autentikasi login pengguna
function prosesLogin(e) {
  e.preventDefault();

  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const errorEl = document.getElementById('loginError');

  if (!emailInput || !passwordInput) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (errorEl) errorEl.textContent = '';
  emailInput.classList.remove('is-invalid');
  passwordInput.classList.remove('is-invalid');

  if (!email) {
    if (errorEl) errorEl.textContent = 'Email wajib diisi';
    emailInput.classList.add('is-invalid');
    emailInput.focus();
    return;
  }

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(email)) {
    if (errorEl) errorEl.textContent = 'Format email tidak valid';
    emailInput.classList.add('is-invalid');
    emailInput.focus();
    return;
  }

  if (!password) {
    if (errorEl) errorEl.textContent = 'Kata sandi wajib diisi';
    passwordInput.classList.add('is-invalid');
    passwordInput.focus();
    return;
  }

  const semuaPengguna = ambilDaftarPengguna();
  const user = semuaPengguna.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      nama: user.nama,
      email: user.email,
      loginTime: new Date().toISOString()
    }));
    window.location.href = 'dashboard.html';
  } else {

    alert('Email/password yang Anda masukkan salah');
    if (errorEl) errorEl.textContent = 'Email/password yang Anda masukkan salah';
    passwordInput.classList.add('is-invalid');
    passwordInput.value = '';
    passwordInput.focus();
  }
}

// Registrasi akun pelanggan baru
function prosesDaftar(e) {
  e.preventDefault();

  const namaInput = document.getElementById('daftarNama');
  const emailInput = document.getElementById('daftarEmail');
  const passwordInput = document.getElementById('daftarPassword');
  const konfirmasiInput = document.getElementById('daftarKonfirmasi');
  const errorEl = document.getElementById('daftarError');

  const nama = namaInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const konfirmasi = konfirmasiInput.value;

  if (errorEl) errorEl.textContent = '';

  if (!nama) {
    if (errorEl) errorEl.textContent = 'Nama lengkap wajib diisi';
    namaInput.focus();
    return;
  }

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !regexEmail.test(email)) {
    if (errorEl) errorEl.textContent = 'Format email tidak valid';
    emailInput.focus();
    return;
  }

  const semuaPengguna = ambilDaftarPengguna();
  if (semuaPengguna.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    if (errorEl) errorEl.textContent = 'Email sudah terdaftar. Silakan gunakan email lain atau login.';
    emailInput.focus();
    return;
  }

  if (password.length < 6) {
    if (errorEl) errorEl.textContent = 'Kata sandi minimal 6 karakter';
    passwordInput.focus();
    return;
  }

  if (password !== konfirmasi) {
    if (errorEl) errorEl.textContent = 'Konfirmasi kata sandi tidak cocok';
    konfirmasiInput.focus();
    return;
  }

  const akunTambahan = JSON.parse(localStorage.getItem(PENGGUNA_BARU_KEY) || '[]');
  akunTambahan.push({ nama, email, password });
  localStorage.setItem(PENGGUNA_BARU_KEY, JSON.stringify(akunTambahan));

  tutupModal('modalDaftar');
  tampilkanToast('Pendaftaran berhasil! Silakan login dengan akun baru Anda.', 'success');

  const loginEmail = document.getElementById('loginEmail');
  if (loginEmail) {
    loginEmail.value = email;
    const loginPw = document.getElementById('loginPassword');
    if (loginPw) loginPw.focus();
  }
}

// Simulasi reset kata sandi
function prosesLupaPassword(e) {
  e.preventDefault();
  const emailInput = document.getElementById('lupaEmail');
  const errorEl = document.getElementById('lupaError');
  const email = emailInput.value.trim();

  if (errorEl) errorEl.textContent = '';

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !regexEmail.test(email)) {
    if (errorEl) errorEl.textContent = 'Format email tidak valid';
    emailInput.focus();
    return;
  }

  tutupModal('modalLupaPassword');
  alert(`Instruksi pengaturan ulang kata sandi telah dikirimkan ke ${email} (Simulasi).`);
  tampilkanToast(`Email simulasi telah dikirim ke ${email}`, 'info');
}

// Proses keluar sesi
function prosesLogout() {
  if (confirm('Apakah Anda yakin ingin keluar dari akun BukuKita?')) {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
  }
}

const KERANJANG_KEY = 'bukukita_keranjang';
const KATALOG_LOCAL_KEY = 'bukukita_katalog_data';
const RIWAYAT_KEY = 'bukukita_riwayat_pesanan';
const PENGIRIMAN_KEY = 'bukukita_pengiriman_data';

function ambilKatalogBuku() {
  const lokal = localStorage.getItem(KATALOG_LOCAL_KEY);
  if (lokal) {
    try {
      return JSON.parse(lokal);
    } catch (e) {
      console.error('Gagal membaca katalog lokal', e);
    }
  }
  const awal = (typeof dataKatalogBuku !== 'undefined') ? [...dataKatalogBuku] : [];
  localStorage.setItem(KATALOG_LOCAL_KEY, JSON.stringify(awal));
  return awal;
}

function simpanKatalogBuku(data) {
  localStorage.setItem(KATALOG_LOCAL_KEY, JSON.stringify(data));
}

function ambilKeranjang() {
  try {
    return JSON.parse(localStorage.getItem(KERANJANG_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function simpanKeranjang(keranjang) {
  localStorage.setItem(KERANJANG_KEY, JSON.stringify(keranjang));
  perbaruiBadgeKeranjang();
}

function perbaruiBadgeKeranjang() {
  const badge = document.getElementById('navCartBadge');
  if (!badge) return;
  const items = ambilKeranjang();
  const totalQty = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  badge.textContent = totalQty;
  badge.style.display = totalQty > 0 ? 'inline-flex' : 'none';
}

function tambahKeKeranjang(kodeBuku, qty = 1) {
  const katalog = ambilKatalogBuku();
  const buku = katalog.find(b => b.kode === kodeBuku);
  if (!buku) {
    tampilkanToast('Buku tidak ditemukan', 'error');
    return;
  }

  if (buku.stok <= 0) {
    tampilkanToast(`Maaf, stok buku "${buku.judul}" saat ini habis.`, 'error');
    return;
  }

  let keranjang = ambilKeranjang();
  const itemIndex = keranjang.findIndex(i => i.kode === kodeBuku);

  if (itemIndex > -1) {
    const totalBaru = keranjang[itemIndex].qty + qty;
    if (totalBaru > buku.stok) {
      tampilkanToast(`Stok tidak mencukupi (tersedia: ${buku.stok})`, 'error');
      return;
    }
    keranjang[itemIndex].qty = totalBaru;
  } else {
    keranjang.push({
      kode: buku.kode,
      judul: buku.judul,
      harga: buku.harga,
      gambar: buku.gambar,
      qty: qty
    });
  }

  simpanKeranjang(keranjang);
  tampilkanToast(`"${buku.judul}" berhasil dimasukkan ke keranjang!`, 'success');
}

function ambilSemuaPesanan() {
  const pesananBawaan = (typeof dataPesanan !== 'undefined') ? [...dataPesanan] : [];
  const pesananLokal = JSON.parse(localStorage.getItem(RIWAYAT_KEY) || '[]');
  return [...pesananLokal, ...pesananBawaan];
}

function tampilkanGreeting(namaUser) {
  const greetingEl = document.getElementById('dashboardGreeting');
  const tanggalEl = document.getElementById('dashboardDate');
  if (!greetingEl) return;

  const sekarang = new Date();
  const jam = sekarang.getHours();
  let waktu = 'Malam';

  if (jam >= 5 && jam < 11) waktu = 'Pagi';
  else if (jam >= 11 && jam < 15) waktu = 'Siang';
  else if (jam >= 15 && jam < 18) waktu = 'Sore';

  const nama = namaUser || 'Pelanggan';
  greetingEl.textContent = `Selamat ${waktu}, ${nama}!`;

  if (tanggalEl) {
    const opsiTanggal = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    tanggalEl.textContent = sekarang.toLocaleDateString('id-ID', opsiTanggal);
  }
}

function muatStatistikDashboard() {
  const katalog = ambilKatalogBuku();
  const totalBuku = katalog.length;
  const totalStok = katalog.reduce((acc, b) => acc + (Number(b.stok) || 0), 0);
  const pesanan = ambilSemuaPesanan();
  const totalPesanan = pesanan.length;

  const elTotalBuku = document.getElementById('statTotalBuku');
  const elTotalStok = document.getElementById('statTotalStok');
  const elTotalPesanan = document.getElementById('statTotalPesanan');

  if (elTotalBuku) elTotalBuku.textContent = totalBuku;
  if (elTotalStok) elTotalStok.textContent = totalStok;
  if (elTotalPesanan) elTotalPesanan.textContent = totalPesanan;
}

function renderRekomendasiBukuHome() {
  const container = document.getElementById('gridRekomendasiHome');
  if (!container) return;

  const katalog = ambilKatalogBuku();
  const pilihan = katalog.slice(0, 4);
  container.innerHTML = '';

  pilihan.forEach(buku => {
    const card = document.createElement('article');
    card.className = 'book-card-item';

    const stokTersedia = Number(buku.stok) > 0;
    const btnLabel = stokTersedia ? 'Pesan' : 'Habis';
    const btnDisabled = !stokTersedia ? 'disabled' : '';

    card.innerHTML = `
      <div>
        <div class="book-card-cover-wrapper">
          <img 
            src="${escapeHtml(buku.gambar || 'img/placeholder.svg')}" 
            alt="Sampul ${escapeHtml(buku.judul)}" 
            class="book-card-cover" 
            loading="lazy" 
            onerror="this.onerror=null; this.src='img/placeholder.svg'">
        </div>
        <div class="book-card-category">${escapeHtml(buku.kategori)}</div>
        <h3 class="book-card-title">${escapeHtml(buku.judul)}</h3>
        <div class="book-card-author">${escapeHtml(buku.penulis)}</div>
      </div>
      <div class="book-card-price-row">
        <span class="book-card-price">${formatRupiah(buku.harga)}</span>
        <button 
          type="button" 
          class="btn btn-accent btn-sm btn-pesan-home" 
          data-kode="${escapeHtml(buku.kode)}" 
          ${btnDisabled}>
          ${btnLabel}
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  container.querySelectorAll('.btn-pesan-home').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const kode = e.currentTarget.getAttribute('data-kode');
      tambahKeKeranjang(kode, 1);
    });
  });
}

function renderTabelLaporanPemesanan() {
  const tbody = document.getElementById('tbodyLaporanPemesanan');
  if (!tbody) return;

  const pesananList = ambilSemuaPesanan();
  tbody.innerHTML = '';

  if (pesananList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding: 24px;">Belum ada data pemesanan.</td></tr>`;
    return;
  }

  pesananList.forEach((pesanan, idx) => {
    const tr = document.createElement('tr');
    const ringkasanItem = (pesanan.item || []).map(i => `${i.kode} (${i.qty}x)`).join(', ') || '-';

    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td class="text-mono"><strong>${escapeHtml(pesanan.noDO)}</strong></td>
      <td>${escapeHtml(pesanan.pemesan)}</td>
      <td><small class="text-muted">${escapeHtml(ringkasanItem)}</small></td>
      <td class="td-num"><strong>${formatRupiah(pesanan.total)}</strong></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderTabelHistoryTransaksi() {
  const tbody = document.getElementById('tbodyHistoryTransaksi');
  if (!tbody) return;

  const pesananList = ambilSemuaPesanan();
  tbody.innerHTML = '';

  if (pesananList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding: 24px;">Belum ada riwayat transaksi.</td></tr>`;
    return;
  }

  pesananList.forEach(pesanan => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="text-mono"><strong>${escapeHtml(pesanan.noDO)}</strong></td>
      <td>${escapeHtml(pesanan.tanggal || '-')}</td>
      <td>${escapeHtml(pesanan.pemesan)}</td>
      <td><span class="badge badge-diproses">${escapeHtml(pesanan.metode || 'Transfer')}</span></td>
      <td class="td-num"><strong>${formatRupiah(pesanan.total)}</strong></td>
      <td>
        <a href="tracking.html?do=${encodeURIComponent(pesanan.noDO)}" class="btn btn-secondary btn-sm">
          Lacak
        </a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderKatalogBuku(bukuList) {
  const tbody = document.getElementById('tbodyKatalogBuku');
  const emptyState = document.getElementById('emptyKatalog');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!bukuList || bukuList.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  if (emptyState) emptyState.style.display = 'none';

  bukuList.forEach((buku, index) => {
    const row = document.createElement('tr');
    row.id = `row-buku-${buku.kode}`;

    let badgeStok = '';
    const stokNum = Number(buku.stok) || 0;
    if (stokNum <= 0) {
      badgeStok = `<span class="badge badge-stok-habis">Habis</span>`;
    } else if (stokNum < 10) {
      badgeStok = `<span class="badge badge-stok-menipis">Sisa ${stokNum}</span>`;
    } else {
      badgeStok = `<span class="badge badge-stok-aman">${stokNum} unit</span>`;
    }

    const disabledAttr = stokNum <= 0 ? 'disabled' : '';

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>
        <img 
          src="${escapeHtml(buku.gambar || 'img/placeholder.svg')}" 
          alt="${escapeHtml(buku.judul)}" 
          class="table-thumb" 
          loading="lazy" 
          onerror="this.onerror=null; this.src='img/placeholder.svg'">
      </td>
      <td class="text-mono"><strong>${escapeHtml(buku.kode)}</strong></td>
      <td><strong>${escapeHtml(buku.judul)}</strong></td>
      <td><span class="badge badge-dikemas">${escapeHtml(buku.kategori)}</span></td>
      <td>${escapeHtml(buku.penulis)}</td>
      <td class="td-num"><strong>${formatRupiah(buku.harga)}</strong></td>
      <td>${badgeStok}</td>
      <td>
        <div style="display: flex; gap: 6px; align-items: center;">
          <button 
            type="button" 
            class="btn btn-accent btn-sm btn-pesan" 
            data-kode="${escapeHtml(buku.kode)}" 
            ${disabledAttr}>
            Pesan
          </button>
          <button 
            type="button" 
            class="btn btn-danger btn-sm btn-hapus" 
            data-kode="${escapeHtml(buku.kode)}" 
            data-judul="${escapeHtml(buku.judul)}"
            title="Hapus Dari Katalog">
            &times;
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(row);
  });

  tbody.querySelectorAll('.btn-pesan').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const kode = e.currentTarget.getAttribute('data-kode');
      tambahKeKeranjang(kode, 1);
    });
  });

  tbody.querySelectorAll('.btn-hapus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const kode = e.currentTarget.getAttribute('data-kode');
      const judul = e.currentTarget.getAttribute('data-judul');
      hapusBukuDariKatalog(kode, judul);
    });
  });
}

function saringKatalog() {
  const keyword = (document.getElementById('inputCariJudul')?.value || '').toLowerCase().trim();
  const kategoriDipilih = (document.getElementById('selectFilterKategori')?.value || 'semua');

  const katalog = ambilKatalogBuku();
  const hasil = katalog.filter(buku => {
    const cocokJudul = buku.judul.toLowerCase().includes(keyword) ||
                       buku.penulis.toLowerCase().includes(keyword) ||
                       buku.kode.toLowerCase().includes(keyword);
    const cocokKategori = (kategoriDipilih === 'semua') || (buku.kategori === kategoriDipilih);
    return cocokJudul && cocokKategori;
  });

  renderKatalogBuku(hasil);
}

function hapusBukuDariKatalog(kode, judul) {
  if (confirm(`Apakah Anda yakin ingin menghapus buku "${judul}" (${kode}) dari katalog?`)) {
    let katalog = ambilKatalogBuku();
    katalog = katalog.filter(b => b.kode !== kode);
    simpanKatalogBuku(katalog);
    saringKatalog();
    tampilkanToast(`Buku "${judul}" berhasil dihapus`, 'info');
  }
}

function prosesTambahStok(e) {
  e.preventDefault();

  const judulInput = document.getElementById('tambahJudul');
  const kategoriInput = document.getElementById('tambahKategori');
  const penulisInput = document.getElementById('tambahPenulis');
  const hargaInput = document.getElementById('tambahHarga');
  const stokInput = document.getElementById('tambahStok');
  const gambarInput = document.getElementById('tambahGambar');
  const errorEl = document.getElementById('tambahStokError');

  const judul = judulInput.value.trim();
  const kategori = kategoriInput.value;
  const penulis = penulisInput.value.trim();
  const harga = Number(hargaInput.value);
  const stok = Number(stokInput.value);
  const gambar = gambarInput.value.trim() || 'img/placeholder.svg';

  if (errorEl) errorEl.textContent = '';

  if (!judul) {
    if (errorEl) errorEl.textContent = 'Judul buku wajib diisi';
    judulInput.focus();
    return;
  }
  if (!kategori) {
    if (errorEl) errorEl.textContent = 'Pilih kategori buku';
    kategoriInput.focus();
    return;
  }
  if (!penulis) {
    if (errorEl) errorEl.textContent = 'Nama penulis wajib diisi';
    penulisInput.focus();
    return;
  }
  if (isNaN(harga) || harga < 0) {
    if (errorEl) errorEl.textContent = 'Harga harus berupa angka valid (>= 0)';
    hargaInput.focus();
    return;
  }
  if (isNaN(stok) || stok < 0) {
    if (errorEl) errorEl.textContent = 'Jumlah stok harus berupa angka valid (>= 0)';
    stokInput.focus();
    return;
  }

  const katalog = ambilKatalogBuku();
  const maxKodeNum = katalog.reduce((max, b) => {
    const num = parseInt(b.kode.replace(/\D/g, ''), 10) || 0;
    return num > max ? num : max;
  }, 0);
  const kodeBaru = 'BK' + String(maxKodeNum + 1).padStart(3, '0');

  katalog.unshift({
    kode: kodeBaru,
    judul: judul,
    kategori: kategori,
    penulis: penulis,
    harga: harga,
    stok: stok,
    gambar: gambar
  });

  simpanKatalogBuku(katalog);
  document.getElementById('formTambahStok').reset();
  tutupModal('modalTambahStok');
  saringKatalog();
  tampilkanToast(`"${judul}" (${kodeBaru}) berhasil ditambahkan ke katalog!`, 'success');
}

function dapatkanOngkir(jenisPaket) {
  return jenisPaket === 'Express' ? 25000 : 12000;
}

function hitungTotal() {
  const keranjang = ambilKeranjang();
  const subtotal = keranjang.reduce((sum, item) => {
    return sum + ((Number(item.harga) || 0) * (Number(item.qty) || 0));
  }, 0);

  const selectPaket = document.getElementById('checkoutJenisPaket');
  const jenisPaket = selectPaket ? selectPaket.value : 'Reguler';
  const ongkir = keranjang.length > 0 ? dapatkanOngkir(jenisPaket) : 0;
  const totalAkhir = subtotal + ongkir;

  const elSubtotal = document.getElementById('checkoutSubtotal');
  const elOngkir = document.getElementById('checkoutOngkir');
  const elTotal = document.getElementById('checkoutTotalAkhir');

  if (elSubtotal) elSubtotal.textContent = formatRupiah(subtotal);
  if (elOngkir) elOngkir.textContent = formatRupiah(ongkir);
  if (elTotal) elTotal.textContent = formatRupiah(totalAkhir);

  return { subtotal, ongkir, totalAkhir };
}

function renderTabelCheckout() {
  const tbody = document.getElementById('tbodyKeranjang');
  const wrapperTabel = document.getElementById('wrapperTabelKeranjang');
  const emptyKeranjang = document.getElementById('emptyKeranjang');
  const btnSubmit = document.getElementById('btnSubmitPesanan');
  if (!tbody) return;

  const keranjang = ambilKeranjang();
  tbody.innerHTML = '';

  if (keranjang.length === 0) {
    if (wrapperTabel) wrapperTabel.style.display = 'none';
    if (emptyKeranjang) emptyKeranjang.style.display = 'block';
    if (btnSubmit) btnSubmit.disabled = true;
    hitungTotal();
    return;
  }

  if (wrapperTabel) wrapperTabel.style.display = 'block';
  if (emptyKeranjang) emptyKeranjang.style.display = 'none';
  if (btnSubmit) btnSubmit.disabled = false;

  const katalog = ambilKatalogBuku();

  keranjang.forEach((item, index) => {
    const tr = document.createElement('tr');
    const buku = katalog.find(b => b.kode === item.kode);
    const maxStok = buku ? buku.stok : 99;
    const subtotalItem = (Number(item.harga) || 0) * (Number(item.qty) || 0);

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          <img 
            src="${escapeHtml(item.gambar || 'img/placeholder.svg')}" 
            alt="${escapeHtml(item.judul)}" 
            class="table-thumb" 
            onerror="this.onerror=null; this.src='img/placeholder.svg'">
          <div>
            <strong>${escapeHtml(item.judul)}</strong><br>
            <span class="text-xs text-mono text-muted">${escapeHtml(item.kode)}</span>
          </div>
        </div>
      </td>
      <td class="td-num">${formatRupiah(item.harga)}</td>
      <td style="width: 80px;">
        <input 
          type="number" 
          class="form-control input-qty text-center" 
          value="${item.qty}" 
          min="1" 
          max="${maxStok}" 
          data-kode="${escapeHtml(item.kode)}" 
          style="padding: 4px 6px;">
      </td>
      <td class="td-num"><strong>${formatRupiah(subtotalItem)}</strong></td>
      <td>
        <button 
          type="button" 
          class="btn btn-danger btn-sm btn-hapus-item" 
          data-kode="${escapeHtml(item.kode)}" 
          title="Hapus">
          &times;
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.input-qty').forEach(input => {
    input.addEventListener('change', (e) => {
      const kode = e.target.getAttribute('data-kode');
      let val = parseInt(e.target.value, 10);
      const buku = katalog.find(b => b.kode === kode);
      const maxStok = buku ? buku.stok : 99;

      if (isNaN(val) || val < 1) val = 1;
      if (val > maxStok) {
        val = maxStok;
        tampilkanToast(`Stok maksimal tersedia: ${maxStok}`, 'error');
      }
      e.target.value = val;

      let keranjangAktif = ambilKeranjang();
      const target = keranjangAktif.find(i => i.kode === kode);
      if (target) {
        target.qty = val;
        simpanKeranjang(keranjangAktif);
        renderTabelCheckout();
      }
    });
  });

  tbody.querySelectorAll('.btn-hapus-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const kode = e.currentTarget.getAttribute('data-kode');
      let keranjangAktif = ambilKeranjang();
      keranjangAktif = keranjangAktif.filter(i => i.kode !== kode);
      simpanKeranjang(keranjangAktif);
      renderTabelCheckout();
      tampilkanToast('Buku dihapus dari keranjang', 'info');
    });
  });

  hitungTotal();
}

function muatDropdownTambahBukuCheckout() {
  const select = document.getElementById('selectTambahItemCepat');
  if (!select) return;

  const katalog = ambilKatalogBuku();
  select.innerHTML = '<option value="">-- Tambah Buku dari Katalog --</option>';

  katalog.forEach(b => {
    const disabled = b.stok <= 0 ? 'disabled' : '';
    const labelStok = b.stok <= 0 ? '(Habis)' : `(Stok: ${b.stok}) - ${formatRupiah(b.harga)}`;
    select.innerHTML += `<option value="${escapeHtml(b.kode)}" ${disabled}>${escapeHtml(b.judul)} ${labelStok}</option>`;
  });
}

function konfirmasiCheckout(e) {
  e.preventDefault();

  const keranjang = ambilKeranjang();
  if (keranjang.length === 0) {
    alert('Keranjang masih kosong. Pilih buku di halaman Katalog.');
    return;
  }

  const nama = (document.getElementById('checkoutNama')?.value || '').trim();
  const email = (document.getElementById('checkoutEmail')?.value || '').trim();
  const hp = (document.getElementById('checkoutHp')?.value || '').trim();
  const alamat = (document.getElementById('checkoutAlamat')?.value || '').trim();
  const metode = document.getElementById('checkoutMetode')?.value;
  const ekspedisi = document.getElementById('checkoutEkspedisi')?.value;
  const jenisPaket = document.getElementById('checkoutJenisPaket')?.value;

  const errEl = document.getElementById('checkoutError');
  if (errEl) errEl.textContent = '';

  if (!nama) {
    if (errEl) errEl.textContent = 'Nama pemesan wajib diisi';
    document.getElementById('checkoutNama').focus();
    return;
  }

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !regexEmail.test(email)) {
    if (errEl) errEl.textContent = 'Format email tidak valid';
    document.getElementById('checkoutEmail').focus();
    return;
  }

  const regexHp = /^[0-9+-\s]{9,15}$/;
  if (!hp || !regexHp.test(hp)) {
    if (errEl) errEl.textContent = 'Nomor HP tidak valid (minimal 9-15 digit angka)';
    document.getElementById('checkoutHp').focus();
    return;
  }

  if (!alamat || alamat.length < 10) {
    if (errEl) errEl.textContent = 'Alamat pengiriman wajib diisi dengan lengkap';
    document.getElementById('checkoutAlamat').focus();
    return;
  }

  if (!metode || !ekspedisi || !jenisPaket) {
    if (errEl) errEl.textContent = 'Pilih metode pembayaran dan pengiriman';
    return;
  }

  const totalInfo = hitungTotal();
  const ringkasanEl = document.getElementById('konfirmasiRingkasanPesanan');
  if (ringkasanEl) {
    ringkasanEl.innerHTML = `
      <div style="background: var(--bg-subtle); padding: 14px; border-radius: var(--radius-xs); font-size: 0.88rem; line-height: 1.6;">
        <p><strong>Penerima:</strong> ${escapeHtml(nama)} (${escapeHtml(hp)})</p>
        <p><strong>Alamat:</strong> ${escapeHtml(alamat)}</p>
        <p><strong>Kurir:</strong> ${escapeHtml(ekspedisi)} &bull; Paket ${escapeHtml(jenisPaket)}</p>
        <p><strong>Pembayaran:</strong> ${escapeHtml(metode)}</p>
        <hr style="border: none; border-top: 1px dashed var(--border); margin: 8px 0;">
        <p><strong>Total Tagihan (${keranjang.length} judul):</strong> <span style="color: var(--accent); font-weight: 700; font-family: var(--font-mono); font-size: 1.05rem;">${formatRupiah(totalInfo.totalAkhir)}</span></p>
      </div>
    `;
  }

  bukaModal('modalKonfirmasiPesanan');
}

function selesaikanPesanan() {
  const keranjang = ambilKeranjang();
  if (keranjang.length === 0) return;

  const nama = document.getElementById('checkoutNama').value.trim();
  const email = document.getElementById('checkoutEmail').value.trim();
  const hp = document.getElementById('checkoutHp').value.trim();
  const alamat = document.getElementById('checkoutAlamat').value.trim();
  const metode = document.getElementById('checkoutMetode').value;
  const ekspedisi = document.getElementById('checkoutEkspedisi').value;
  const jenisPaket = document.getElementById('checkoutJenisPaket').value;
  const totalInfo = hitungTotal();

  const semuaPesanan = ambilSemuaPesanan();
  const nextNum = semuaPesanan.length + 1;
  const noDO = `DO-2026-${String(nextNum).padStart(4, '0')}`;
  const tanggalSekarang = new Date().toISOString().split('T')[0];

  const pesananBaru = {
    noDO: noDO,
    tanggal: tanggalSekarang,
    pemesan: nama,
    email: email,
    hp: hp,
    alamat: alamat,
    item: keranjang.map(i => ({ kode: i.kode, judul: i.judul, qty: i.qty, harga: i.harga })),
    metode: metode,
    ekspedisi: ekspedisi,
    jenisPaket: jenisPaket,
    ongkir: totalInfo.ongkir,
    total: totalInfo.totalAkhir
  };

  const riwayatLokal = JSON.parse(localStorage.getItem(RIWAYAT_KEY) || '[]');
  riwayatLokal.unshift(pesananBaru);
  localStorage.setItem(RIWAYAT_KEY, JSON.stringify(riwayatLokal));

  const pengirimanBaru = {
    noDO: noDO,
    nama: nama,
    status: 'Diproses',
    progress: 20,
    ekspedisi: ekspedisi,
    tanggalKirim: tanggalSekarang,
    jenisPaket: jenisPaket,
    total: totalInfo.totalAkhir
  };
  const listPengirimanLokal = JSON.parse(localStorage.getItem(PENGIRIMAN_KEY) || '[]');
  listPengirimanLokal.unshift(pengirimanBaru);
  localStorage.setItem(PENGIRIMAN_KEY, JSON.stringify(listPengirimanLokal));

  let katalog = ambilKatalogBuku();
  keranjang.forEach(item => {
    const buku = katalog.find(b => b.kode === item.kode);
    if (buku) buku.stok = Math.max(0, (Number(buku.stok) || 0) - item.qty);
  });
  simpanKatalogBuku(katalog);

  localStorage.removeItem(KERANJANG_KEY);
  perbaruiBadgeKeranjang();

  tutupModal('modalKonfirmasiPesanan');

  alert(`Pesanan berhasil! Nomor Delivery Order (DO) Anda: ${noDO}\n\nSilakan simpan nomor ini untuk melacak status perjalanan buku Anda.`);
  window.location.href = `tracking.html?do=${encodeURIComponent(noDO)}`;
}

function ambilSemuaPengiriman() {
  const bawaan = (typeof dataPengiriman !== 'undefined') ? [...dataPengiriman] : [];
  const lokal = JSON.parse(localStorage.getItem(PENGIRIMAN_KEY) || '[]');
  return [...lokal, ...bawaan];
}

const TAHAP_PENGIRIMAN = [
  { nama: 'Diproses', progress: 20, deskripsi: 'Pesanan telah diterima dan sedang diverifikasi oleh toko.' },
  { nama: 'Dikemas', progress: 40, deskripsi: 'Buku sedang dikemas rapi dengan pelindung kardus & bubble wrap.' },
  { nama: 'Dikirim', progress: 60, deskripsi: 'Paket telah diserahkan kepada pihak kurir ekspedisi.' },
  { nama: 'Dalam Perjalanan', progress: 80, deskripsi: 'Paket sedang dalam perjalanan menuju alamat tujuan Anda.' },
  { nama: 'Terkirim', progress: 100, deskripsi: 'Paket telah berhasil diterima di alamat tujuan.' }
];

function lacakPengiriman(noDOCari) {
  const errorEl = document.getElementById('trackingError');
  const hasilEl = document.getElementById('trackingResult');
  const notFoundEl = document.getElementById('trackingNotFound');

  if (errorEl) errorEl.textContent = '';
  if (notFoundEl) notFoundEl.style.display = 'none';
  if (hasilEl) hasilEl.style.display = 'none';

  const query = (noDOCari || '').trim().toUpperCase();

  if (!query) {
    if (errorEl) errorEl.textContent = 'Nomor Delivery Order wajib diisi';
    const inputDO = document.getElementById('inputNomorDO');
    if (inputDO) inputDO.focus();
    return;
  }

  const listPengiriman = ambilSemuaPengiriman();
  const data = listPengiriman.find(item => item.noDO.toUpperCase() === query);

  if (!data) {
    if (notFoundEl) notFoundEl.style.display = 'block';
    return;
  }

  const elDO = document.getElementById('resDO');
  const elNama = document.getElementById('resNama');
  const elStatus = document.getElementById('resStatus');
  const elEkspedisi = document.getElementById('resEkspedisi');
  const elTanggal = document.getElementById('resTanggal');
  const elPaket = document.getElementById('resPaket');
  const elTotal = document.getElementById('resTotal');
  const progressBarFill = document.getElementById('resProgressBarFill');
  const timelineContainer = document.getElementById('resTimelineContainer');

  if (elDO) elDO.textContent = data.noDO;
  if (elNama) elNama.textContent = data.nama;
  if (elEkspedisi) elEkspedisi.textContent = data.ekspedisi;
  if (elTanggal) elTanggal.textContent = data.tanggalKirim || '-';
  if (elPaket) elPaket.textContent = data.jenisPaket || 'Reguler';
  if (elTotal) elTotal.textContent = formatRupiah(data.total);

  let badgeClass = 'badge-diproses';
  let fillClass = 'fill-warning';
  const st = (data.status || '').toLowerCase();

  if (st.includes('kemas')) {
    badgeClass = 'badge-dikemas';
    fillClass = 'fill-info';
  } else if (st.includes('kirim') && !st.includes('ter')) {
    badgeClass = 'badge-dikirim';
    fillClass = 'fill-accent';
  } else if (st.includes('jalan')) {
    badgeClass = 'badge-dalam-perjalanan';
    fillClass = 'fill-accent';
  } else if (st.includes('terkirim')) {
    badgeClass = 'badge-terkirim';
    fillClass = 'fill-success';
  }

  if (elStatus) {
    elStatus.className = `badge ${badgeClass}`;
    elStatus.textContent = data.status;
  }

  const progressPercent = data.progress || 20;
  if (progressBarFill) {
    progressBarFill.className = `progress-bar-fill ${fillClass}`;
    progressBarFill.style.width = '0%';
    setTimeout(() => {
      progressBarFill.style.width = `${progressPercent}%`;
    }, 50);
  }

  if (timelineContainer) {
    timelineContainer.innerHTML = '';
    let activeIndex = TAHAP_PENGIRIMAN.findIndex(t => t.nama.toLowerCase() === data.status.toLowerCase());
    if (activeIndex === -1) {
      if (progressPercent >= 100) activeIndex = 4;
      else if (progressPercent >= 80) activeIndex = 3;
      else if (progressPercent >= 60) activeIndex = 2;
      else if (progressPercent >= 40) activeIndex = 1;
      else activeIndex = 0;
    }

    TAHAP_PENGIRIMAN.forEach((tahap, idx) => {
      const stepEl = document.createElement('div');
      let stepClass = 'timeline-step';
      let nodeContent = idx + 1;

      if (idx < activeIndex) {
        stepClass += ' completed';
        nodeContent = `&#10003;`;
      } else if (idx === activeIndex) {
        stepClass += ' active';
        nodeContent = `&bull;`;
      }

      stepEl.className = stepClass;
      stepEl.innerHTML = `
        <div class="timeline-node">${nodeContent}</div>
        <div class="timeline-content">
          <div class="timeline-title">${escapeHtml(tahap.nama)}</div>
          <div class="timeline-desc">${escapeHtml(tahap.deskripsi)}</div>
        </div>
      `;
      timelineContainer.appendChild(stepEl);
    });
  }

  if (hasilEl) {
    hasilEl.style.display = 'block';
    hasilEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function inisialisasiMobileMenu() {
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('is-open');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  inisialisasiModal();
  inisialisasiMobileMenu();
  perbaruiBadgeKeranjang();
});
