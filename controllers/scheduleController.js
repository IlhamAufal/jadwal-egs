const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ExcelJS = require('exceljs');


const getSchedules = async (req, res) => {
    const data = await prisma.schedule.findMany();
    res.json(data);
};

const getScheduleById = async (req, res) => {
    try {
        const data = await prisma.schedule.findUnique({
            where: { id: req.params.id }
        });

        if (!data) {
            return res.status(404).json({ error: "Jadwal tidak ditemukan" });
        }

        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const createSchedule = async (req, res) => {
    try {
        const data = await prisma.schedule.create({ data: req.body });
        res.status(201).json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateSchedule = async (req, res) => {
    try {
        const data = await prisma.schedule.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: "Update gagal, ID tidak ditemukan" });
    }
};

const deleteSchedule = async (req, res) => {
    try {
        await prisma.schedule.delete({ where: { id: req.params.id } });
        res.json({ message: "Jadwal berhasil dihapus" });
    } catch (error) {
        res.status(400).json({ error: "Gagal menghapus" });
    }
};

const getStudentSchedule = async (req, res) => {
    const { class_code, date } = req.query;
    const data = await prisma.schedule.findMany({
        where: { class_code, date: new Date(date) }
    });
    res.json({ classname: class_code, date, jadwal: data });
};

const getTeacherSchedule = async (req, res) => {
    const { teacher_nik, start_date, end_date } = req.query;
    const data = await prisma.schedule.findMany({
        where: {
            teacher_nik,
            date: { gte: new Date(start_date), lte: new Date(end_date) }
        }
    });
    res.json({ teacher_nik, jadwal: data });
};

const getReport = async (req, res) => {
    const report = await prisma.schedule.groupBy({
        by: ['teacher_nik', 'teacher_name'],
        _sum: { jam_ke: true },
        where: {
            date: { gte: new Date(req.query.start_date), lte: new Date(req.query.end_date) }
        }
    });
    res.json({ message: "Laporan berhasil dibuat", data: report });
};


const uploadExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Silakan unggah file Excel (.xlsx)" });
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer); 

        const worksheet = workbook.getWorksheet(1); 
        const schedulesToInsert = [];

        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return; 

            const scheduleData = {
                class_code: row.getCell(1).value?.toString(),
                class_name: row.getCell(2).value?.toString(),
                subject_code: row.getCell(3).value?.toString(),
                teacher_nik: row.getCell(4).value?.toString(),
                teacher_name: row.getCell(5).value?.toString(),
                date: new Date(row.getCell(6).value), 
                jam_ke: parseInt(row.getCell(7).value),
                time_start: new Date(`1970-01-01T${row.getCell(8).value}`),
                time_end: new Date(`1970-01-01T${row.getCell(9).value}`),
            };

            schedulesToInsert.push(scheduleData);
        });

        const result = await prisma.schedule.createMany({
            data: schedulesToInsert
        });

        res.json({
            message: `Upload sukses, ${result.count} baris data ditambahkan.`
        });

    } catch (error) {
        res.status(500).json({ error: "Gagal memproses file Excel: " + error.message });
    }
};

// GET /api/schedule/export?start_date=...&end_date=...
const exportExcelReport = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({ error: "Parameter start_date dan end_date wajib diisi" });
        }

        // 1. Ambil data mentah dari database berdasarkan rentang waktu
        const schedules = await prisma.schedule.findMany({
            where: {
                date: {
                    gte: new Date(start_date),
                    lte: new Date(end_date)
                }
            },
            orderBy: { date: 'asc' }
        });

        // 2. Logika Agregasi Data di Level Aplikasi (Mengelompokkan berdasarkan Guru)
        const rekapGuru = {};

        schedules.forEach(item => {
            const nik = item.teacher_nik;
            if (!rekapGuru[nik]) {
                rekapGuru[nik] = {
                    nik: nik,
                    nama: item.teacher_name,
                    kelas: new Set(),
                    pekan: [0, 0, 0, 0, 0],
                    totalJp: 0
                };
            }

            // Tambahkan kelas unik
            rekapGuru[nik].kelas.add(item.class_name);

            // Tentukan data ini masuk ke pekan berapa (Logika sederhana berdasarkan tanggal)
            const dayOfMonth = new Date(item.date).getDate();
            const indexPekan = Math.min(Math.floor((dayOfMonth - 1) / 7), 4);
            
            // Asumsi: 1 record jadwal dihitung sebagai jumlah JP berdasarkan field jam_ke atau bernilai 1 JP per baris
            // Di sini kita akumulasikan 1 sesi per pertemuan, sesuaikan dengan definisi JP sekolah Anda
            rekapGuru[nik].pekan[indexPekan] += 1; 
            rekapGuru[nik].totalJp += 1;
        });

        // 3. Membuat Dokumen Excel Baru menggunakan ExcelJS
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Rekap JP Pengajar');

        // Susun Header Tabel sesuai Gambar Soal [cite: 59]
        worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'NIK', key: 'nik', width: 15 },
            { header: 'Nama Pengajar', key: 'nama', width: 25 },
            { header: 'Kelas yg Diajar', key: 'kelas', width: 20 },
            { header: 'Pekan 1', key: 'p1', width: 10 },
            { header: 'Pekan 2', key: 'p2', width: 10 },
            { header: 'Pekan 3', key: 'p3', width: 10 },
            { header: 'Pekan 4', key: 'p4', width: 10 },
            { header: 'Pekan 5', key: 'p5', width: 10 },
            { header: 'Total JP', key: 'total', width: 12 },
        ];

        // Masukkan data baris ke dalam Excel
        let no = 1;
        Object.values(rekapGuru).forEach(guru => {
            worksheet.addRow({
                no: no++,
                nik: guru.nik,
                nama: guru.nama,
                kelas: Array.from(guru.kelas).join(', '),
                p1: guru.pekan[0],
                p2: guru.pekan[1],
                p3: guru.pekan[2],
                p4: guru.pekan[3],
                p5: guru.pekan[4],
                total: guru.totalJp
            });
        });

        // Set Header HTTP agar Klien mendownloadnya langsung sebagai file .xlsx
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + `rekap_jp_${start_date}_to_${end_date}.xlsx`
        );

        // Alirkan data Excel langsung ke respons HTTP
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        res.status(500).json({ error: "Gagal membuat laporan Excel: " + error.message });
    }
};

module.exports = {
    getSchedules,
    getScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getStudentSchedule,
    getTeacherSchedule,
    getReport,
    uploadExcel,
    exportExcelReport
};
