
// ====================================
// MINI POS - KASIR DIGITAL
// ====================================

// DATA PRODUK AWAL
const gambarFallback =
"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600";

const produkAwal = [
    {
        id: 1,
        nama: "Jus Alpukat",
        kategori: "Minuman",
        harga: 12000,
        stok: 20,
        gambar: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600"
    },
    {
        id: 2,
        nama: "Burger",
        kategori: "Makanan",
        harga: 15000,
        stok: 15,
        gambar: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600"
    },
    {
        id: 3,
        nama: "Kentang Goreng",
        kategori: "Makanan",
        harga: 10000,
        stok: 25,
        gambar: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600"
    },
    {
        id: 4,
        nama: "Donat",
        kategori: "Makanan",
        harga: 8000,
        stok: 10,
        gambar: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600"
    }
];

// ====================================
// PENYIMPANAN DATA
// ====================================

let produk = JSON.parse(localStorage.getItem("miniPOS_produk")) || produkAwal;
let transaksi = JSON.parse(localStorage.getItem("miniPOS_transaksi")) || [];
let keranjang = [];

function simpan() {
    localStorage.setItem("miniPOS_produk", JSON.stringify(produk));
    localStorage.setItem("miniPOS_transaksi", JSON.stringify(transaksi));
}

// ====================================
// FORMAT RUPIAH
// ====================================

function rupiah(nilai) {
    return "Rp" + Number(nilai || 0).toLocaleString("id-ID");
}

// MENGAMANKAN TEKS
function aman(teks) {
    return String(teks ?? "").replace(/[&<>"']/g, karakter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[karakter]);
}

// ====================================
// NAVIGASI MENU
// ====================================

document.querySelectorAll(".sidebar a[href^='#']").forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();

        const id = this.getAttribute("href").slice(1);

        document.querySelectorAll(".sidebar a").forEach(a => {
            a.classList.remove("active");
        });

        this.classList.add("active");

        const judul = {
            dashboard: "Dashboard Kasir",
            produk: "Data Produk",
            kasir: "Kasir",
            riwayat: "Riwayat Transaksi"
        };

        document.querySelector(".page-title").textContent = judul[id];

        document.querySelectorAll("main section").forEach(section => {
            section.style.display =
                section.id === id ? "block" : "none";
        });

        if (id === "kasir") tampilkanKeranjang();
        if (id === "riwayat") tampilkanRiwayat();

        window.location.hash = id;
    });
});

// ====================================
// TAMBAH PRODUK
// ====================================

function tambahProduk() {
    const nama = prompt("Masukkan nama produk:");
    if (nama === null) return;

    if (!nama.trim()) {
        alert("Nama produk tidak boleh kosong!");
        return;
    }

    const kategori = prompt(
        "Kategori produk (Makanan/Minuman):",
        "Makanan"
    ) || "Makanan";

    const harga = Number(prompt("Masukkan harga produk:", "10000"));
    const stok = Number(prompt("Masukkan jumlah stok:", "10"));

    const gambar = prompt(
        "Masukkan URL gambar produk:",
        ""
    ) || gambarFallback;

    if (!Number.isFinite(harga) || harga <= 0 ||
        !Number.isInteger(stok) || stok < 0) {
        alert("Harga atau stok tidak valid!");
        return;
    }

    produk.push({
        id: Date.now(),
        nama: nama.trim(),
        kategori: kategori.trim(),
        harga: harga,
        stok: stok,
        gambar: gambar
    });

    simpan();
    tampilkanSemua();

    alert("Produk berhasil ditambahkan!");
}

// ====================================
// HAPUS PRODUK
// ====================================

function hapusProduk(id) {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;

    produk = produk.filter(p => p.id !== id);
    keranjang = keranjang.filter(p => p.id !== id);

    simpan();
    tampilkanSemua();
}

// ====================================
// MENAMPILKAN PRODUK
// ====================================

function tampilkanProduk() {
    const wadah = document.getElementById("daftarProduk");

    const cari = (
        document.getElementById("searchProduk")?.value || ""
    ).toLowerCase();

    const kategori =
        document.getElementById("filterKategori")?.value || "Semua";

    const daftar = produk.filter(p =>
        p.nama.toLowerCase().includes(cari) &&
        (kategori === "Semua" || p.kategori === kategori)
    );

    if (daftar.length === 0) {
        wadah.innerHTML =
            '<div class="col-12"><p>Produk tidak ditemukan.</p></div>';
        return;
    }

    wadah.innerHTML = daftar.map(p => {
        let status = "";

        if (p.stok === 0) {
            status = '<span class="badge bg-danger">Habis</span>';
        } else if (p.stok < 5) {
            status = '<span class="badge bg-warning text-dark">Stok menipis</span>';
        } else {
            status = '<span class="badge bg-success">Stok aman</span>';
        }

        return `
        <div class="col-md-4 col-sm-6">
            <div class="product-card">
                <img class="product-img"
                    src="${aman(p.gambar)}"
                    alt="${aman(p.nama)}"
                    onerror="this.onerror=null;this.src='${gambarFallback}'">

                <div class="card-body">
                    <div class="d-flex justify-content-between gap-2">
                        <h6 class="fw-bold">${aman(p.nama)}</h6>
                        ${status}
                    </div>

                    <small class="text-muted">
                        ${aman(p.kategori)}
                    </small>

                    <div class="fw-bold mt-2">
                        ${rupiah(p.harga)}
                    </div>

                    <div class="small text-muted mb-3">
                        Stok: ${p.stok}
                    </div>

                    <div class="d-flex gap-2">
                        <button class="btn btn-primary btn-sm flex-fill"
                            onclick="tambahKeranjang(${p.id})"
                            ${p.stok <= 0 ? "disabled" : ""}>
                            <i class="bi bi-cart-plus"></i> Ke Kasir
                        </button>

                        <button class="btn btn-outline-danger btn-sm"
                            onclick="hapusProduk(${p.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    }).join("");
}

// ====================================
// KERANJANG BELANJA
// ====================================

function tambahKeranjang(id) {
    const p = produk.find(item => item.id === id);

    if (!p || p.stok <= 0) {
        alert("Stok produk habis!");
        return;
    }

    const ada = keranjang.find(item => item.id === id);

    if (ada) {
        if (ada.jumlah >= p.stok) {
            alert("Jumlah melebihi stok tersedia!");
            return;
        }

        ada.jumlah++;
    } else {
        keranjang.push({
            id: p.id,
            nama: p.nama,
            harga: p.harga,
            jumlah: 1
        });
    }

    tampilkanKeranjang();
}

// MENGUBAH JUMLAH PRODUK
function ubahJumlah(id, perubahan) {
    const item = keranjang.find(p => p.id === id);
    const produkAsli = produk.find(p => p.id === id);

    if (!item || !produkAsli) return;

    const jumlahBaru = item.jumlah + perubahan;

    if (jumlahBaru <= 0) {
        keranjang = keranjang.filter(p => p.id !== id);
    } else if (jumlahBaru > produkAsli.stok) {
        alert("Jumlah melebihi stok tersedia!");
        return;
    } else {
        item.jumlah = jumlahBaru;
    }

    tampilkanKeranjang();
}

// MENGHAPUS PRODUK DARI KERANJANG
function hapusDariKeranjang(id) {
    keranjang = keranjang.filter(p => p.id !== id);
    tampilkanKeranjang();
}

// MENGHITUNG TOTAL BELANJA
function totalBelanja() {
    return keranjang.reduce(
        (total, p) => total + p.harga * p.jumlah,
        0
    );
}

// MENAMPILKAN KERANJANG
function tampilkanKeranjang() {
    const wadah = document.getElementById("keranjang");

    if (!keranjang.length) {
        wadah.innerHTML =
            '<p class="text-muted py-3">Keranjang masih kosong.</p>';
    } else {
        wadah.innerHTML = keranjang.map(p => `
            <div class="cart-item d-flex justify-content-between align-items-center gap-2">
                <div>
                    <strong>${aman(p.nama)}</strong>
                    <div class="small text-muted">
                        ${rupiah(p.harga)} x ${p.jumlah}
                    </div>
                </div>

                <div class="d-flex align-items-center gap-1">
                    <button class="btn btn-sm btn-outline-primary"
                        onclick="ubahJumlah(${p.id},-1)">−</button>

                    <span>${p.jumlah}</span>

                    <button class="btn btn-sm btn-outline-primary"
                        onclick="ubahJumlah(${p.id},1)">+</button>

                    <button class="btn btn-sm btn-outline-danger"
                        onclick="hapusDariKeranjang(${p.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join("");
    }

    document.getElementById("totalBelanja").textContent =
        rupiah(totalBelanja());

    hitungKembalian();
}

// ====================================
// PEMBAYARAN DAN KEMBALIAN
// ====================================

function hitungKembalian() {
    const metode = document.getElementById("metode").value;
    const bagianTunai = document.getElementById("bagianTunai");
    const status = document.getElementById("statusPembayaran");
    const input = document.getElementById("uangBayar");

    const total = totalBelanja();

    if (metode === "Tunai") {
        bagianTunai.style.display = "block";

        status.textContent =
            "Masukkan uang yang diterima dari pelanggan.";

        const uang = Number(input.value || 0);

        document.getElementById("kembalian").textContent =
            rupiah(Math.max(0, uang - total));
    } else {
        bagianTunai.style.display = "none";

        status.textContent =
            "Pembayaran " + metode + " dicatat sebagai simulasi/lunas.";
    }
}

// ====================================
// PROSES TRANSAKSI
// ====================================

function prosesTransaksi() {
    if (!keranjang.length) {
        alert("Keranjang masih kosong!");
        return;
    }

    // Periksa stok sebelum transaksi
    for (const item of keranjang) {
        const p = produk.find(x => x.id === item.id);

        if (!p || p.stok < item.jumlah) {
            alert("Stok " + item.nama + " tidak mencukupi!");
            return;
        }
    }

    const metode = document.getElementById("metode").value;
    const total = totalBelanja();

    const uang = metode === "Tunai"
        ? Number(document.getElementById("uangBayar").value || 0)
        : total;

    if (metode === "Tunai" && uang < total) {
        alert("Uang pembayaran masih kurang!");
        return;
    }

    const kembali = metode === "Tunai"
        ? uang - total
        : 0;

    // Kurangi stok produk
    keranjang.forEach(item => {
        const p = produk.find(x => x.id === item.id);
        p.stok -= item.jumlah;
    });

    // Simpan transaksi
    const data = {
        id: "TRX-" + Date.now(),
        tanggal: new Date().toLocaleString("id-ID"),
        waktu: Date.now(),
        items: keranjang.map(item => ({ ...item })),
        total: total,
        metode: metode,
        uang: uang,
        kembali: kembali
    };

    transaksi.push(data);
    simpan();

    // Tampilkan nota secara langsung
    tampilkanNota(data);

    // Kosongkan keranjang
    keranjang = [];

    document.getElementById("uangBayar").value = "";
    document.getElementById("metode").value = "Tunai";

    tampilkanKeranjang();
    tampilkanSemua();

    const nota = document.getElementById("receipt");
    nota.style.display = "block";

    nota.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    alert("Transaksi berhasil! Nota langsung ditampilkan.");
}

// ====================================
// NOTA PEMBAYARAN
// ====================================

function tampilkanNota(data) {
    const wadah = document.getElementById("receipt");

    const daftarItem = data.items.map(item => `
        <div class="receipt-line d-flex justify-content-between gap-3">
            <span>${aman(item.nama)} x ${item.jumlah}</span>
            <span>${rupiah(item.harga * item.jumlah)}</span>
        </div>
    `).join("");

    wadah.innerHTML = `
        <div class="text-center">
            <h5 class="fw-bold">MINI POS</h5>
            <div>BUKTI PEMBAYARAN</div>
            <small>Terima kasih telah berbelanja</small>
        </div>

        <hr>

        <div class="small">
            No. Transaksi: ${aman(data.id)}
        </div>

        <div class="small">
            Tanggal: ${aman(data.tanggal)}
        </div>

        <hr>

        ${daftarItem}

        <hr>

        <div class="d-flex justify-content-between">
            <strong>Total</strong>
            <strong>${rupiah(data.total)}</strong>
        </div>

        <div class="d-flex justify-content-between">
            <span>Metode</span>
            <span>${aman(data.metode)}</span>
        </div>

        <div class="d-flex justify-content-between">
            <span>Bayar</span>
            <span>${rupiah(data.uang)}</span>
        </div>

        <div class="d-flex justify-content-between">
            <span>Kembalian</span>
            <span>${rupiah(data.kembali)}</span>
        </div>

        <hr>

        <div class="text-center fw-bold">
            Simpan nota ini sebagai bukti transaksi.
        </div>
    `;
}

// ====================================
// RIWAYAT TRANSAKSI
// ====================================

function tampilkanRiwayat() {
    const tbody = document.getElementById("daftarRiwayat");

    if (!transaksi.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    Belum ada transaksi.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = [...transaksi].reverse().map((t, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${aman(t.tanggal)}</td>
            <td>${rupiah(t.total)}</td>
            <td>${aman(t.metode)}</td>
        </tr>
    `).join("");
}

// ====================================
// DASHBOARD
// ====================================

function tampilkanDashboard() {
    const hariIni = new Date().toLocaleDateString("id-ID");

    const transaksiHariIni = transaksi.filter(t =>
        new Date(t.waktu).toLocaleDateString("id-ID") === hariIni
    );

    const omzet = transaksiHariIni.reduce(
        (sum, t) => sum + t.total,
        0
    );

    document.getElementById("omzet").textContent =
        rupiah(omzet);

    document.getElementById("totalStok").textContent =
        produk.reduce((sum, p) => sum + p.stok, 0);

    document.getElementById("jumlahTransaksi").textContent =
        transaksiHariIni.length;
}

// ====================================
// TAMPILKAN SEMUA DATA
// ====================================

function tampilkanSemua() {
    tampilkanProduk();
    tampilkanDashboard();
    tampilkanRiwayat();
}

// ====================================
// SAAT WEBSITE DIBUKA
// ====================================

document.querySelectorAll("main section").forEach(section => {
    section.style.display =
        section.id === "dashboard" ? "block" : "none";
});

tampilkanSemua();
tampilkanKeranjang();
