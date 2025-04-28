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
        reports.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
            }
            if (a.createdAt && !b.createdAt) {
            return -1; // a comes first
            }
            if (!a.createdAt && b.createdAt) {
            return 1; // b comes first
            }
            return a.title.localeCompare(b.title);
        });
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
        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        const room = await Room.findById(report.room);
        if (!room) {
            return res.status(404).json({ success: false, error: 'Room not found' });
        }

        if (report.voted.includes(req.user._id)) {
            return res.status(400).json({ success: false, error: 'You have already voted for this report' });
        }

        report.voted.push(req.user._id); // Add vote first
        console.log("report.voted.length", report.voted.length)
        if (report.voted.length >= 4 && report.status === 'open') {
            report.status = 'closed';
            const scoreToAdd = converseScoreUtil(report.type);
            console.log(report.theBidder)
            for (const bidder of report.theBidder) {
                console.log("bidder", bidder)
                const scoreEntry = room.scoreBoard.find(
                    (entry) => entry.user.toString() === bidder._id.toString()
                );
                if (scoreEntry) {
                    scoreEntry.score += scoreToAdd;
                    console.log(scoreEntry)
                } else {
                    room.scoreBoard.push({
                        user: bidder._id,
                        score: scoreToAdd
                    });
                }
            }

            await room.save();
        }

        await report.save();

        res.status(200).json({ success: true, data: report });

    } catch (err) {
        console.log(err.stack);
        res.status(400).json({ success: false, error: 'Something went wrong' });
    }
};
