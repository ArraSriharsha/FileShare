import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
    path:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    downloadCount:{
        type:Number,
        required:true,
        default:0
    }
})

const File = mongoose.model('file',FileSchema); // 'file' is the name of collection in MongoDB also it is made plural in the database

export default File;