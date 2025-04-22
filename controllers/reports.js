const Room = require('../models/Room');
const Report = require('../models/Report');
const mongoose = require('mongoose');
const User = require('../models/User');
const { converseScoreUtil } = require('../utils/converseScoreUtil');


//desc    get all reports
//route   GET /api/v1/reports
//access  Public
exports.getReports = async (req, res, next) => {
    try {
        const reports = await Report.find();
        res.status(200).json({ success: true, data: reports });
    } catch (err) {
        res.status(400).json({ success: false });
        console.log(err.stack);
    }
}

//desc create report
//route POST /api/v1/reports
//access Private
exports.createReport = async (req, res, next) => {
    try {
        const {title, room, theBidder, reason, type} = req.body;
        const reporter = req.user._id;
        const report = await Report.create({
            title,
            room,
            reporter,
            theBidder,
            room,
            reason,
            type
        });
        res.status(201).json({ success: true, data: report });
    } catch (err) {
        res.status(400).json({ success: false });
        console.log(err.stack);
    }
}

exports.deleteReport = async (req, res, next) => {

    try {
        const report = await Report.findById(req.params.id);
        if(req.user._id !== report.reporter || req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized to delete this report' });
        }
        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }
        await report.remove();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false });
        console.log(err.stack);
    }
}

exports.voteReport = async (req, res, next) => {
    try {
        const report = await Report.findById(req.params.id);
        const room = await Room.findById(report.room);

        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }
        if (report.voted.includes(req.user._id)) {
            return res.status(400).json({ success: false, error: 'You have already voted for this report' });
        }


        if (report.voted.length >= room.members.length / 2) {
            report.status = 'closed';
            const scoreToAdd = converseScoreUtil(report.type);
        
            const scoreEntry = room.scoreBoard.find(
                (entry) => entry.user.toString() === report.theBidder.toString()
            );
        
            if (scoreEntry) {
                scoreEntry.score += scoreToAdd;
            } else {
                room.scoreBoard.push({
                    user: report.theBidder,
                    score: scoreToAdd
                });
            }
        
            await room.save();
            await report.save();
        }

        report.voted.push(req.user._id);
        await report.save();
        res.status(200).json({ success: true, data: report });
    } catch (err) {
        res.status(400).json({ success: false });
        console.log(err.stack);
    }
}