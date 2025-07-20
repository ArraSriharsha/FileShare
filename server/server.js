import express from 'express';
import cors from 'cors';
import router from './routes/file.js';
import DBConnection from './database/db.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/Shared', express.static('Shared'));

// Connect to MongoDB
DBConnection();

app.use("/",router);
app.listen(8000,()=>{
    console.log("Server is running on port 8000");
});