// --- BAGIAN 1: KONSTANTA & STATE ---
const BIAYA_HARIAN_MBG = 1200000000000;
const DETIK_DALAM_SEHARI = 86400;

// Variabel global untuk menyimpan data kurs dari internet
let exchangeRates = {
    "IDR": 1,
    "USD": 16000, // Angka cadangan (fallback) jika internet mati
    "EUR": 17500
};

// --- BAGIAN BARU: AMBIL DATA DARI API ---
async function fetchLiveRates() {
    try {
        // Mengambil data kurs dengan Base IDR (Rupiah)
        const response = await fetch('https://open.er-api.com/v6/latest/IDR');
        const data = await response.json();

        if (data.result === "success") {
            // Karena base-nya IDR, kita perlu membalik angkanya
            // Misal: 1 IDR = 0.000063 USD -> Kita mau tahu 1 USD berapa IDR
            exchangeRates["USD"] = 1 / data.rates.USD;
            exchangeRates["EUR"] = 1 / data.rates.EUR;

            console.log("Kurs berhasil diperbarui dari internet!");
            console.log(`1 USD = Rp ${exchangeRates["USD"].toLocaleString()}`);
        }
    } catch (error) {
        console.error("Gagal mengambil kurs real-time, menggunakan data cadangan.", error);
    }
}

// Jalankan pengambilan data saat web dibuka
fetchLiveRates();

// --- BAGIAN 2: DATA KATALOG POPULER (DATABASE LOKAL) ---
const catalogData = [
    {
        id: "item-1",
        name: "Pembangunan 1 Gedung SD Standar Nasional",
        price: 3000000000,
        currency: "IDR",
        icon: "🏫"
    },
    {
        id: "item-4",
        name: "Transfer Neymar ke PSG",
        price: 222000000,
        currency: "EUR",
        icon: "⚽"
    },
    {
        id: "item-5",
        name: "1 Unit Jet Tempur F-35A",
        price: 82500000,
        currency: "USD",
        icon: "🛩️"
    }
    // Kamu bisa tambah lagi nanti di sini...
];

console.log("Database Katalog Berhasil Dimuat!");

// --- BAGIAN 3: LOGIKA PERENDERAN (DOM MANIPULATION) ---

// Fungsi untuk menampilkan kartu katalog ke layar
function renderCatalog() {
    const container = document.getElementById('catalogContainer');

    // Kita bersihkan dulu containernya agar tidak duplikat
    container.innerHTML = "";

    // Kita looping (putar) setiap data di catalogData
    catalogData.forEach(item => {
        // Buat elemen kartu menggunakan Template Literals (tanda backtick `)
        const cardHTML = `
            <button onclick="selectCatalogItem('${item.id}')"
                class="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all text-left group">
                <span class="text-3xl mr-4">${item.icon}</span>
                <div>
                    <h3 class="font-semibold text-gray-800 group-hover:text-blue-700">${item.name}</h3>
                    <p class="text-xs text-gray-500">${item.currency} ${item.price.toLocaleString('id-ID')}</p>
                </div>
            </button>
        `;

        // Masukkan kartu ke dalam container
        container.innerHTML += cardHTML;
    });
}

// Panggil fungsi render saat file JS dimuat
renderCatalog();

// --- BAGIAN 4: LOGIKA PERHITUNGAN (THE ENGINE) ---

// 1. Fungsi untuk menangani klik pada kartu katalog
function selectCatalogItem(id) {
    const item = catalogData.find(i => i.id === id);
    if (item) {
        document.getElementById('priceInput').value = item.price;
        document.getElementById('currencyInput').value = item.currency;
        calculateMBG(); // Jalankan perhitungan otomatis
    }
}

// 2. Fungsi utama perhitungan
function calculateMBG() {
    const price = parseFloat(document.getElementById('priceInput').value);
    const currency = document.getElementById('currencyInput').value;
    const resultBox = document.getElementById('resultBox');

    if (!price || price <= 0) {
        resultBox.classList.add('hidden');
        return;
    }

    // Rumus: (Harga * Kurs) / 1,2 Triliun
    const priceInIDR = price * exchangeRates[currency];
    const mbgValue = priceInIDR / BIAYA_HARIAN_MBG;

    // Tampilkan hasil ke UI
    updateUI(mbgValue);
}

// 3. Fungsi untuk memperbarui tampilan (UI)
function updateUI(value) {
    const mbgResult = document.getElementById('mbgResult');
    const timeDescription = document.getElementById('timeDescription');
    const resultBox = document.getElementById('resultBox');

    resultBox.classList.remove('hidden');

    // Tampilkan angka MBG (jika kecil, tampilkan banyak desimal)
    const formattedMBG = value < 0.01 ? value.toFixed(6) : value.toLocaleString('id-ID', {maximumFractionDigits: 4});
    mbgResult.innerText = `${formattedMBG} MBG`;

    // Berikan penjelasan waktu
    timeDescription.innerText = formatTimeDescription(value);
}

// 4. Fungsi konversi desimal MBG ke Jam/Menit/Detik
function formatTimeDescription(mbgValue) {
    let totalSeconds = Math.round(mbgValue * DETIK_DALAM_SEHARI);

    if (totalSeconds < 1) return "Kurang dari 1 detik operasional.";

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let text = "Cukup untuk mendanai operasional nasional selama ";
    if (days > 0) text += `${days} hari `;
    if (hours > 0) text += `${hours} jam `;
    if (minutes > 0) text += `${minutes} menit `;
    if (seconds > 0 && days === 0) text += `${seconds} detik`;

    return text + ".";
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Jalankan fungsi awal
    renderCatalog();
    fetchLiveRates();

    // 2. Tampilkan info kebijakan (Rp 1,2 Triliun)
    const policyInfo = document.getElementById('policyInfo');
    if (policyInfo) {
        policyInfo.innerText = `Rp ${BIAYA_HARIAN_MBG.toLocaleString('id-ID')}`;
    }

    // 3. Pasang pendengar (listener) untuk input manual
    document.getElementById('priceInput').addEventListener('input', calculateMBG);
    document.getElementById('currencyInput').addEventListener('change', calculateMBG);
});