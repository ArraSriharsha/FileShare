import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileRouter from './routes/file.js';
import authRouter from './routes/auth.js';
import DBConnection from './database/db.js';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
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