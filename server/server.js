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
  'http://localhost:5173'
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/Shared', express.static('Shared'));

DBConnection();

app.use("/", fileRouter);
app.use("/auth", authRouter);

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});