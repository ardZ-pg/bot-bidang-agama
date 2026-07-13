const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const axios = require('axios');

// ====== PENGATURAN DATA ======
// Link ekspor CSV Google Sheets Anda sudah saya rapikan di sini:
const LINK_GOOGLE_SHEETS_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQrElAn5ltBRFHpWX3L2hUeYB7-4vvUh6oJ4lIKaoC4u-2caW1SjbMzL34E_ds2MvDXsF3126U9SCh7/pub?output=csv'; 

// Ganti teks di dalam tanda petik dengan ID Grup WhatsApp Anda (Berakhiran @g.us)
const ID_GRUP_WA = 'MASUKKAN_ID_GRUP_WA_ANDA@g.us'; 
// =============================

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions'] 
    } // Wajib untuk server gratis seperti Render
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('👉 SCAN QR INI DENGAN IPHONE ANDA:');
});

client.on('ready', () => {
    console.log('🤖 Bot Bidang Agama Sudah Aktif dan Standby di Server!');
        // === KODE SEMENTARA UNTUK MENCARI ID GRUP ===
    client.getChats().then(chats => {
        const groups = chats.filter(chat => chat.isGroup);
        console.log('=== DAFTAR ID GRUP ANDA ===');
        groups.forEach(group => {
            console.log(`Nama Grup: ${group.name} | ID Grup: ${group.id._serialized}`);
        });
        console.log('============================');
    });
    // ==========================================

    // Menjalankan jadwal otomatis setiap hari Senin - Kamis pukul 07:00 Pagi
    // Format Cron: Menit Jam * * Hari(1=Senin, 4=Kamis)
    cron.schedule('0 7 * * 1-4', async () => {
        try {
            console.log('Memulai pengecekan jadwal piket hari ini...');
            
            // 1. Ambil data dari Google Sheets (Format CSV agar gratis tanpa API Key)
            const response = await axios.get(LINK_GOOGLE_SHEETS_CSV);
            const barisData = response.data.split('\n').map(row => row.split(','));
            
            // 2. Hitung otomatis hari ini Minggu ke berapa dalam bulan ini
            const tanggalHariIni = new Date().getDate();
            const mingguKe = Math.ceil(tanggalHariIni / 7);
            
            // 3. Cari nama hari ini dalam bahasa Inggris (Monday, Tuesday, etc.)
            const daftarHari = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const namaHariIni = daftarHari[new Date().getDay()];
            
            let muadzinHariIni = '';
            let dzikirHariIni = '';
            
            // 4. Lakukan cocok data di tabel Google Sheets
            // Loop dimulai dari indeks 1 (melewati baris judul/header)
            for (let i = 1; i < barisData.length; i++) {
                const kolomMinggu = barisData[i][0]?.trim();
                const kolomHari = barisData[i][1]?.trim();
                
                if (kolomMinggu == mingguKe && kolomHari === namaHariIni) {
                    muadzinHariIni = barisData[i][2]?.trim();
                    dzikirHariIni = barisData[i][3]?.trim();
                    break;
                }
            }
            
            // 5. Jika data petugas ditemukan, kirim pesan ke grup WhatsApp
            if (muadzinHariIni && dzikirHariIni) {
                const pesan = `Assalamualaikum! 📢\n\n` +
                              `Pengingat petugas *Bot Bidang Agama* di *Minggu ke-${mingguKe}* hari *${namaHariIni}* ini:\n\n` +
                              `Subuh/Dzuhur/Ashar:\n` +
                              `室 *Muadzin:* ${muadzinHariIni}\n` +
                              `📿 *Dzikir:* ${dzikirHariIni}\n\n` +
                              `Mohon mempersiapkan diri ya teman-teman. Terima kasih!`;
                
                await client.sendMessage(ID_GRUP_WA, pesan);
                console.log('✅ Pesan jadwal piket sukses terkirim ke grup!');
            } else {
                console.log('⚠️ Jadwal untuk hari ini tidak ditemukan di tabel.');
            }
            
        } catch (error) {
            console.error('❌ Terjadi kesalahan sistem:', error.message);
        }
    });
});

client.initialize();
