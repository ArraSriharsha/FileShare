import multer from 'multer';

const upload = multer({ dest: 'Shared/' })
export  {upload};