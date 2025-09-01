import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import mime from 'mime-types';
import chalk from 'chalk';

dotenv.config();

let client = new S3Client({
  endpoint: `https://${process.env.S3_DOMAIN}`,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  region: 'eu-central-003',
});

export async function uploadBuffer(bucketName, filename, buffer) {
  await client.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: filename,
    Body: buffer,
    ACL: 'public-read',
    ContentType: mime.lookup(filename),
  }));

  console.log('Upload complete:', chalk.blue(`https://${bucketName}.${process.env.S3_DOMAIN}/${filename}`));
}

export async function listObjects(bucketName, NextContinuationToken = null) {
  let objects = [];
  const response = await client.send(new ListObjectsV2Command({
    Bucket: bucketName,
    ContinuationToken: NextContinuationToken,
  }));

  if (!response.Contents) {
    return new Set();
  }

  if (response.NextContinuationToken) {
    let nextObjects = await listObjects(bucketName, response.NextContinuationToken);
    objects = objects.concat(nextObjects);
  }

  return objects;
}

export function getTrackURL(uuid) {
  return `https://${process.env.S3_TRACKS_BUCKET_NAME}.${process.env.S3_DOMAIN}/${uuid}.mp3`;
}
