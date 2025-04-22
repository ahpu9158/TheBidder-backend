const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title can not be more than 100 characters']
    },
    reporter:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    theBidder:{
        type: [mongoose.Schema.ObjectId],
        ref: 'User',
        required: true
    },
    room: {
        type: mongoose.Schema.ObjectId,
        ref: 'Room',
        required: true
    },
    reason:{
        type: String,
        required: true,
    },
    type :{
        type: String,
        required: true,
        enum: ['annoying', 'disturbing', 'extreme', 'infectious'],
    },
    voted: {
        type: [mongoose.Schema.ObjectId],
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    },
});

module.exports = mongoose.model('Report', reportSchema);