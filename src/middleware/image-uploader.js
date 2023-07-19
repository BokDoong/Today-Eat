import { S3Client } from '@aws-sdk/client-s3'
import multer from 'multer'
import multerS3 from 'multer-s3'
import path from 'path'

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  sslEnabled: false,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
})

// 확장자 목록
const allowedExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.gif'];

export const imageUploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      // 확장자 검사
      const extension = path.extname(file.originalname).toLowerCase();
      if(!allowedExtensions.includes(extension)) {
        return cb(new Error('확장자 에러'));
      }

      cb(null, Date.now().toString());
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024 // 용량제한: 50MB
  }
})