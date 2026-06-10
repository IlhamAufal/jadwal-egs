const express = require('express');
const multer = require('multer');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const authMiddleware = require('../middleware/auth');
const { validateSchedule } = require('../utils/validators');

const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

router.get('/', scheduleController.getSchedules);
router.post('/', validateSchedule, scheduleController.createSchedule);
router.get('/student', scheduleController.getStudentSchedule);
router.get('/teacher', scheduleController.getTeacherSchedule);
router.get('/report', scheduleController.getReport);
router.get('/export', scheduleController.exportExcelReport);
router.post('/upload', upload.single('file'), scheduleController.uploadExcel);
router.get('/:id', scheduleController.getScheduleById);
router.put('/:id', validateSchedule, scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;
