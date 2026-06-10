const requiredFields = [
    'class_code',
    'class_name',
    'subject_code',
    'teacher_nik',
    'teacher_name',
    'date',
    'jam_ke',
    'time_start',
    'time_end'
];

const validateSchedule = (req, res, next) => {
    const missingFields = requiredFields.filter((field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === '');

    if (missingFields.length > 0) {
        return res.status(400).json({
            error: `Field wajib belum diisi: ${missingFields.join(', ')}`
        });
    }

    next();
};

module.exports = {
    validateSchedule
};
