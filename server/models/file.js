import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    fileId:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    fileLink:{
        type:String,
        required:true
    },
    fileType:{
        type:String,
        required:true
    },
    fileSize:{
        type:Number,
        required:true
    },
    uploadDate:{
        type:Date,
        default:Date.now
    },
    previewLink:{
        type:String,
        default:null
    }
})

const File = mongoose.model('file',fileSchema); // 'file' is the name of collection in MongoDB also it is made plural in the database

export default File;