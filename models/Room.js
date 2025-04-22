const mongoose = require('mongoose');

const Score = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    score: {
        type: Number,
        required: true
    },
});

const roomShema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a room name'],
        trim: true,
        maxlength: [100, 'Room name can not be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a room description'],
        maxlength: [500, 'Room description can not be more than 500 characters']
    },
    host:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    members: {
        type: [mongoose.Schema.ObjectId],
        ref: 'User',
        required: true
    },
    scoreBoard: {
        type: [Score],
        required: true
    }
});

roomShema.virtual('reports',{
    ref: 'Report',
    localField: '_id',
    foreignField: 'room',
    count: true
})

module.exports = mongoose.model('Room', roomShema);