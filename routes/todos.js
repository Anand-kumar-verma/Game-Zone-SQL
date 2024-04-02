const express = require("express");
const router = express.Router();
const { aviatortest, promotionCount, topw11winningInformation } = require("../controller/Aviator/aviator");
const { loginFun, dashboardCounter, getAllAttendanceList, deleteAttendanceById, updateAttendanceById, getAllPlayer, updatePlayerRecord, updatePlayerStatus, addPlayer, getUserByRedId, getUserDataById, changePassword, withdrawlRequestFun, withdrawlApprovedFun, withdrawlRejectFun, withdrlApprovedFilterFun, withdrlRejectFilterFun, addSubAdmin, getSubAdminList, getAllAssignedMenu, shwoMenu, viewAllAsignedMenu, getSubMenu, addAttendance, addFund } = require("../controller/Aviator/login");



// aviator game api's
router.get('/promotiondata',promotionCount)
router.get('/topw11winningInformation',topw11winningInformation)
router.post('/login',loginFun)
router.get('/dashboard-counter',dashboardCounter)
router.get('/getAllAttendanceList',getAllAttendanceList)
router.delete('/deleteAttendanceById',deleteAttendanceById)
router.put('/updateAttendanceById',updateAttendanceById)
router.post('/addAttendance',addAttendance)
router.get('/getAllPlayer',getAllPlayer)
router.put('/updatePlayerRecord',updatePlayerRecord)
router.put('/updatePlayerStatus',updatePlayerStatus)
router.post('/addPlayer',addPlayer)
router.get('/getUsernameBy_refId',getUserByRedId)
router.get('/getPlayerDataById',getUserDataById)
router.put('/changePassword',changePassword)
router.post('/withdrawlRequest',withdrawlRequestFun)
router.put('/withdrawlApproved',withdrawlApprovedFun)
router.put('/withdrawlReject',withdrawlRejectFun)
router.post('/withdrawlApprovedFilter',withdrlApprovedFilterFun)
router.post('/withdrlRejectFilter',withdrlRejectFilterFun)
router.post('/addSubAdmin',addSubAdmin)
router.get('/getSubAdmin',getSubAdminList)
router.get('/getAssignSubMenu',getAllAssignedMenu)
router.get('/show-menu',shwoMenu)
router.get('/show-submenu',getSubMenu)
router.post('/add-fund',addFund)


module.exports = router;
