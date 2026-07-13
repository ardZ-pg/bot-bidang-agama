# Menggunakan server Node.js resmi yang sudah dilengkapi browser Chrome dari Google
FROM ghcr.io/puppeteer/puppeteer:22.0.0

# Mengatur folder kerja di dalam server
WORKDIR /app

# Menyalin berkas dependensi saja terlebih dahulu
COPY package.json ./

# UBAH BARIS INI: Menggunakan npm install konvensional agar tidak error lockfile
RUN npm install

# Menyalin seluruh kode robot Anda sisanya
COPY . .

# Perintah untuk menyalakan robot
CMD ["node", "bot.js"]
