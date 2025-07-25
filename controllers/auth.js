const User = require('../models/User');
const jwt = require('jsonwebtoken');

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   Public

exports.register = async (req, res, next) => {
    try {
        const { name, username, password, role} = req.body;

        //Create user
        const user = await User.create({
            name,
            username,
            password,
            role
        });
        sendTokenResponse(user, 200, res);

    } catch (err) {
        res.status(400).json({success: false});
        console.log(err.stack);
    }
};

//@desc     Login user
//@route    POST /api/v1/auth/login
//@access   Public
exports.login = async (req, res, next) => {
    try{
        const { username, password } = req.body;

        //Validate username & password
        if (!username || !password) {
            return res.status(400).json({success: false, error: 'Please provide username and password'});
        }
    
        //Check for user
        const user = await User.findOne({ username }).select('+password');
    
        if (!user) {
            return res.status(401).json({success: false, error: 'Invalid credentials'});
        }
    
        //Check if password matches
        const isMatch = await user.matchPassword(password);
    
        if (!isMatch) {
            return res.status(401).json({success: false, error: 'Invalid credentials'});
        }
        sendTokenResponse(user, 200, res);
    }catch(error){
        res.status(401).json({success: false, msg: 'Cannot convert username or password to string'});
    }
};

const sendTokenResponse = (user, statusCode, res) => {
    //create token
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }
    res.status(statusCode).cookie('token', token, options).json({ success: true, token });
}


//@desc     Get current logged in user
//@route    GET /api/v1/auth/me
//@access   Private
exports.getMe = async (req, res) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true, 
        data: user
    });
};

//@desc     Log user out / clear cookie
//@route    GET /api/v1/auth/logout
//@access   Private
exports.logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
};