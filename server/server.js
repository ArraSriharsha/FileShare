import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import fileRouter from './routes/file.js';
import authRouter from './routes/auth.js';
import DBConnection from './database/db.js';

// Load environment variables
dotenv.config();

const app = express();

const allowedOrigins = [ 
    'https://www.airfetch.online',
    'https://airfetch.online',  // Production frontend
    'https://api.airfetch.online', // Production API
    'http://localhost:5173', // Development frontend
  ];
  console.log(allowedOrigins);
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl or Postman)
      if (!origin) return callback(null, true);
  
      if (allowedOrigins.indexOf(origin) !== -1) {
        // Origin is allowed
        callback(null, true);
      } else {
        // Origin is not allowed
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/Shared', express.static('Shared'));

DBConnection();

app.use("/", fileRouter);
app.use("/auth", authRouter);

app.listen(process.env.PORT || 10000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});