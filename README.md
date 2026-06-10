# Jadwal EGS REST API

REST API untuk sistem jadwal pelajaran sekolah berbasis Node.js, Express, PostgreSQL, dan Prisma. Project ini mengacu pada referensi soal **"REST API - Sistem Jadwal Pelajaran Sekolah"** dengan kebutuhan utama:

- CRUD jadwal pelajaran
- autentikasi API key
- endpoint untuk siswa, pengajar, dan yayasan
- upload Excel `.xlsx`
- export laporan Excel `.xlsx`

## Tech Stack

- Node.js
- Express
- PostgreSQL
- Prisma
- ExcelJS
- Multer

## Struktur Data

Tabel yang digunakan: `schedules`

Kolom utama:

- `id` UUID
- `class_code` VARCHAR(10)
- `class_name` VARCHAR(10)
- `subject_code` VARCHAR(10)
- `teacher_nik` VARCHAR(20)
- `teacher_name` VARCHAR(100)
- `date` DATE
- `jam_ke` INTEGER
- `time_start` TIME
- `time_end` TIME

Skema Prisma ada di [prisma/schema.prisma](/E:/jadwal-egs/prisma/schema.prisma).

## Autentikasi

Semua endpoint dilindungi API key:

```http
x-api-key: SECRET123
```

Jika header tidak dikirim atau salah, API akan mengembalikan:

```json
{
  "error": "Unauthorized"
}
```

Middleware auth ada di [middleware/auth.js](/E:/jadwal-egs/middleware/auth.js).

## Menjalankan Project

### 1. Install dependency

```bash
npm install
```

### 2. Isi environment

Buat file `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/egs?schema=public"
```

### 3. Generate Prisma client

```bash
npx prisma generate
```

### 4. Jalankan migration

```bash
npx prisma migrate dev
```

### 5. Start server

```bash
node app.js
```

Server akan jalan di:

```text
http://localhost:3000
```

## Base URL

```text
http://localhost:3000/api/schedules
```

## Endpoint

### CRUD Jadwal

#### `GET /api/schedules`
Ambil semua jadwal.

#### `GET /api/schedules/:id`
Ambil detail jadwal berdasarkan ID.

#### `POST /api/schedules`
Tambah jadwal baru.

Contoh body:

```json
{
  "class_code": "XA01",
  "class_name": "X-A",
  "subject_code": "CHEM",
  "teacher_nik": "20222029",
  "teacher_name": "Najdin Aqmarina",
  "date": "2025-02-10",
  "jam_ke": 2,
  "time_start": "1970-01-01T08:40:00.000Z",
  "time_end": "1970-01-01T09:20:00.000Z"
}
```

Catatan:

- `date` akan dinormalisasi ke `Date`
- `time_start` dan `time_end` saat ini diharapkan dalam format datetime
- `class_name` dibatasi maksimal 10 karakter mengikuti schema

#### `PUT /api/schedules/:id`
Update jadwal berdasarkan ID.

#### `DELETE /api/schedules/:id`
Hapus jadwal berdasarkan ID.

### Endpoint Siswa

#### `GET /api/schedules/student?class_code=XA01&date=2025-02-10T00:00:00.000Z`

Menampilkan jadwal siswa berdasarkan kelas dan tanggal.

### Endpoint Pengajar

#### `GET /api/schedules/teacher?teacher_nik=20222029&start_date=2025-02-10T00:00:00.000Z&end_date=2025-02-14T23:59:59.999Z`

Menampilkan jadwal mengajar guru dalam periode tertentu.

### Endpoint Yayasan

#### `GET /api/schedules/report?start_date=2025-02-01T00:00:00.000Z&end_date=2025-02-28T23:59:59.999Z`

Menampilkan rekap jam pelajaran per pengajar.

Catatan:

- Di soal referensi, endpoint tertulis `GET /api/schedules/report/rekap-jp`
- Implementasi saat ini menggunakan `GET /api/schedules/report`

### Upload Excel

#### `POST /api/schedules/upload`

Upload file Excel `.xlsx` menggunakan `form-data`.

Field:

- `file`: file `.xlsx`

Urutan kolom yang dibaca:

1. `class_code`
2. `class_name`
3. `subject_code`
4. `teacher_nik`
5. `teacher_name`
6. `date`
7. `jam_ke`
8. `time_start`
9. `time_end`

### Export Excel

#### `GET /api/schedules/export?start_date=2025-02-01T00:00:00.000Z&end_date=2025-02-28T23:59:59.999Z`

Menghasilkan file Excel rekap jam pelajaran pengajar.

## Struktur Project

```text
controllers/
  scheduleController.js
middleware/
  auth.js
prisma/
  schema.prisma
routes/
  index.js
  scheduleRoutes.js
utils/
  validators.js
app.js
```

## File Penting

- [app.js](/E:/jadwal-egs/app.js): entry point Express
- [routes/scheduleRoutes.js](/E:/jadwal-egs/routes/scheduleRoutes.js): definisi endpoint
- [controllers/scheduleController.js](/E:/jadwal-egs/controllers/scheduleController.js): logika bisnis API
- [middleware/auth.js](/E:/jadwal-egs/middleware/auth.js): proteksi API key
- [utils/validators.js](/E:/jadwal-egs/utils/validators.js): validasi request body

## Status Implementasi Saat Ini

Yang sudah berjalan:

- autentikasi `x-api-key`
- CRUD dasar
- filter jadwal siswa
- filter jadwal pengajar
- rekap laporan pengajar
- upload Excel
- export Excel

Catatan teknis:

- endpoint `report` belum mengikuti path persis seperti dokumen soal
- parsing waktu dari Excel masih sederhana
- error handling pada `update` dan beberapa endpoint masih bisa diperjelas
- belum ada deteksi bentrok jadwal
- belum ada deployment publik

## Testing Manual dengan Postman

Header wajib:

```text
x-api-key: SECRET123
Content-Type: application/json
```

Contoh request:

```http
GET http://localhost:3000/api/schedules
POST http://localhost:3000/api/schedules
GET http://localhost:3000/api/schedules/student?class_code=XA01&date=2025-02-10T00:00:00.000Z
GET http://localhost:3000/api/schedules/teacher?teacher_nik=20222029&start_date=2025-02-10T00:00:00.000Z&end_date=2025-02-14T23:59:59.999Z
GET http://localhost:3000/api/schedules/report?start_date=2025-02-01T00:00:00.000Z&end_date=2025-02-28T23:59:59.999Z
```

## Referensi

Dokumen soal referensi:

- [Soal FUllstack EGS.pdf](C:/Users/Administrator/Downloads/Soal%20FUllstack%20EGS.pdf)
