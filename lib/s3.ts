import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// AWS Academy uses temporary credentials with session tokens
const credentials: any = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
}

// Add session token if available (required for AWS Academy)
if (process.env.AWS_SESSION_TOKEN) {
  credentials.sessionToken = process.env.AWS_SESSION_TOKEN
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials,
})

export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const key = `evidence/${Date.now()}-${fileName}`

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  })

  await s3Client.send(command)

  const bucketUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`
  
  return `${bucketUrl}/${key}`
}

export { s3Client }
