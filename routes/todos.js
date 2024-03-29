const express = require("express");
const router = express.Router();
const { aviatortest, promotionCount } = require("../controller/Aviator/aviator");
const { loginFun, dashboardCounter, getAllAttendanceList, deleteAttendanceById, updateAttendanceById, getAllPlayer, updatePlayerRecord, updatePlayerStatus, addPlayer } = require("../controller/Aviator/login");



// aviator game api's
router.get('/promotiondata',promotionCount)
router.post('/login',loginFun)
router.get('/dashboard-counter',dashboardCounter)
router.get('/getAllAttendanceList',getAllAttendanceList)
router.delete('/deleteAttendanceById',deleteAttendanceById)
router.put('/updateAttendanceById',updateAttendanceById)
router.get('/getAllPlayer',getAllPlayer)
router.put('/updatePlayerRecord',updatePlayerRecord)
router.put('/updatePlayerStatus',updatePlayerStatus)
router.post('/addPlayer',addPlayer)


module.exports = router;
