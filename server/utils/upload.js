import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

// Configure Cloudflare R2 S3 Client
const s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT, // e.g. 'https://<accountid>.r2.cloudflarestorage.com'
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

// Upload a file buffer to R2, placing it in a folder named after the userId
async function uploadToR2(fileBuffer, fileName, mimetype, userId) {
    const key = `${userId}/${Date.now()}-${fileName}`;
    await s3.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype,
        ACL: 'public-read',
    }));
    // Use CDN_BASE_URL for public file URL
    const cdnBaseUrl = process.env.CDN_BASE_URL || `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}`;
    const url = `${cdnBaseUrl}/${key}`;
    return { key, url };
}

export { s3, uploadToR2 }; 