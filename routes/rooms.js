const express= require('express');
const {getRooms, getRoom, createRoom, updateRoom, deleteRoom, joinRoom}=require('../controllers/rooms');

const router=express.Router();

const {protect}=require('../middleware/auth');

router.get('/', protect, getRooms);
router.get('/:id', protect, getRoom);
router.post('/', protect, createRoom);
router.put('/:id', protect, updateRoom);
router.delete('/:id', protect, deleteRoom);
router.post('/:id/join', protect, joinRoom);

module.exports=router;


