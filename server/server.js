import express from 'express';
import cors from 'cors';
import {router} from './routes/routes.js';
import DBConnection from './database/db.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
DBConnection();

app.use("/",router);
app.listen(8000,()=>{
    console.log("Server is running on port 8000");
});