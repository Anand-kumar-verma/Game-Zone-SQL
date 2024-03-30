const express = require("express");
const router = express.Router();
const { aviatortest, promotionCount, topw11winningInformation } = require("../controller/Aviator/aviator");
const { loginFun, dashboardCounter, getAllAttendanceList, deleteAttendanceById, updateAttendanceById, getAllPlayer, updatePlayerRecord, updatePlayerStatus, addPlayer, getUserByRedId, getUserDataById, changePassword } = require("../controller/Aviator/login");



// aviator game api's
router.get('/promotiondata',promotionCount)
router.get('/topw11winningInformation',topw11winningInformation)
router.post('/login',loginFun)
router.get('/dashboard-counter',dashboardCounter)
router.get('/getAllAttendanceList',getAllAttendanceList)
router.delete('/deleteAttendanceById',deleteAttendanceById)
router.put('/updateAttendanceById',updateAttendanceById)
router.get('/getAllPlayer',getAllPlayer)
router.put('/updatePlayerRecord',updatePlayerRecord)
router.put('/updatePlayerStatus',updatePlayerStatus)
router.post('/addPlayer',addPlayer)
router.get('/getUsernameBy_refId',getUserByRedId)
router.get('/getPlayerDataById',getUserDataById)
router.put('/changePassword',changePassword)


module.exports = router;
