const express= require('express');

const {getReports, createReport, deleteReport, voteReport}=require('../controllers/reports');


const router=express.Router();

const {protect}=require('../middleware/auth');

router.get('/', protect, getReports);
router.post('/', protect, createReport);
router.delete('/:id', protect, deleteReport);
router.post('/:id/vote', protect, voteReport);

module.exports=router;

