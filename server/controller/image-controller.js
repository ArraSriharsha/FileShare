import File from '../models/file.js';

const uploadImage = async(req,res)=>{
    //console.log(req); // logs the requested file data filename,path etc
    const fileobj = {
        path:req.file.path,
        name:req.file.originalname
    }
    try {
        const file = await File.create(fileobj)
        res.status(200).json({
            path: `http://localhost:8000/file/${file._id}`, //fileid acts like a primary key
            name:file.name
        });
    } catch (error) {
        console.error("Error in uploadImage function",error);
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}
const getImage = async(req,res)=>{
    try {                            //fileId becuase in the routes file we have used fileId as a parameter
        //const {fileId} = req.params; // destructuring equivalent to req.params.fileId
        const file = await File.findById(req.params.fileId); //can also be written as File.findOne({req.params.fileId})
        file.downloadCount++;
        await file.save();
        res.download(file.path,file.name);// express function to download the file in response
    } catch (error) {
        console.error("Error in getImage function",error); //basically handles the download error
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

export {uploadImage,getImage};