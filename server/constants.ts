import { S3Client } from "@aws-sdk/client-s3";

export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME ?? "";
export const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION ?? "";
export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY ?? "";
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY ?? "";

export const s3 = new S3Client({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  region: AWS_BUCKET_REGION,
});
