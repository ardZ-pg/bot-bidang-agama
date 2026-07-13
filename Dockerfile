# Menggunakan server Node.js resmi yang sudah dilengkapi browser Chrome dari Google
FROM ghcr.io/puppeteer/puppeteer:22.0.0

# Mengatur folder kerja di dalam server
WORKDIR /app

# Menyalin berkas dependensi
COPY package*.json ./

# Memasang semua pustaka (library) pendukung
RUN npm ci

# Menyalin seluruh kode robot Anda
COPY . .

# Perintah untuk menyalakan robot
CMD ["node", "bot.js"]
