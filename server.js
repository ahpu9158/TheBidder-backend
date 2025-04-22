const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const hpp = require('hpp');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const auth = require('./routes/auth');
// Load env vars
dotenv.config({path: './config/config.env'});

connectDB();

const rateLimit = require('express-rate-limit');
    
const app=express();

//Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10 mins
    max: 100000
});

//Enable CORS
app.use(cors());

// Body parser
app.use(express.json());
app.use(mongoSanitize());
app.use(xss());
app.use(limiter);
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
            styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
            imgSrc: ["'self'", 'data:', 'cdn.jsdelivr.net'],
            },
        },
    })
);

app.use(hpp());
// Cookie parser
app.use(cookieParser());

const PORT=process.env.PORT || 5000;

app.use('/api/v1/auth',auth);
app.use('/api/v1/rooms',require('./routes/rooms'));
app.use('/api/v1/reports',require('./routes/reports'));

process.on('unhandledRejection', (err,promise)=>{
    console.log(`Error: ${err.message}`); 
    //Close server & exit process 
    server.close(()=>process.exit(1));
});

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }


  

module.exports = app;