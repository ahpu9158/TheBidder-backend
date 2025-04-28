const Room = require('../models/Room');
const Report = require('../models/Report');

//@desc     get all rooms
//@route    POST /api/v1/rooms
//@access   Public
exports.getRooms = async (req, res, next) => {
    try {
        const rooms = await Room.find().populate('host', 'name username');
        res.status(200).json({ success: true, data: rooms });
    } catch (err) {
        res.status(400).json({ success: false });
        console.log(err.stack);
    }
}

//@desc     get single room
//@route    GET /api/v1/rooms/:id
//@access   Public
exports.getRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id)
            .populate({
                path: 'reports',
                populate: [
                    { path: 'reporter', select: 'name username' },
                    { path: 'theBidder', select: 'name username' }
                ],
                select: 'title reporter theBidder reason type createdAt'
            })    
            .populate('host', 'name username')
            .populate('members', 'name username')
            .populate('scoreBoard.user', 'name username')
        
        if (!room) {
            return res.status(404).json({ success: false, error: 'Room not found' });
        }

        let reports = await Report.find({ room: req.params.id })
            .populate('reporter', 'name username')
            .populate('theBidder', 'name username')
            .populate('voted', 'name username')
            .select('title reporter theBidder reason type createdAt voted');

        reports = reports.sort((a, b) => {
            
            return new Date(b.createdAt) - new Date(a.createdAt);
            
        });

        
        if (!reports) {
            reports = [];
        }

        res.status(200).json({ success: true, data: room, reports });
    } catch (err) {
        res.status(400).json({ success: false });
        console.log(err.stack);
    }
}


//@desc     create room
//@route    POST /api/v1/rooms
//@access   Private
exports.createRoom = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const host = req.user._id;
        const members = [host];
        const scoreBoard = [{user: host, score: 0}];

        //Create room
        const room = await Room.create({
            name,
            description,
            host,
            members,
            scoreBoard
        });

        res.status(201).json({ success: true, data: room });
    } catch (err) {
        res.status(400).json({ success: false });
        console.log(err.stack);
    }
}

//@desc     update room
//@route    PUT /api/v1/rooms/:id
//@access   Private
exports.updateRoom = async (req, res, next) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!room) {
            return res.status(404).json({ success: false, error: 'Room not found' });
        }
        res.status(200).json({ success: true, data: room });
    } catch (err) {
        res.status(400).json({ success: false });
        console.log(err.stack);
    }
}

//@desc     delete room
//@route    DELETE /api/v1/rooms/:id
//@access   Private
exports.deleteRoom = async (req, res, next) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) {
            return res.status(404).json({ success: false, error: 'Room not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false });
        console.log(err.stack);
    }
}

//@desc     join room
//@route    POST /api/v1/rooms/:id/join
//@access   Private
exports.joinRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ success: false, error: 'Room not found' });
        }
        if (room.members.includes(req.user._id)) {
            return res.status(400).json({ success: false, error: 'You are already a member of this room' });
        }
        room.members.push(req.user._id);
        room.scoreBoard.push({ user: req.user._id, score: 0 });
        await room.save();
        res.status(200).json({ success: true, data: room });
    } catch (err) {
        res.status(400).json({ success: false });
        console.log(err.stack);
    }
}
