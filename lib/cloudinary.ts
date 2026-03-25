import { v2 as cloudinary } from 'cloudinary'

export function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  })
  return cloudinary
}

export async function uploadImageFromUrl(
  imageUrl: string,
  ideaId: string
): Promise<string> {
  const cld = configureCloudinary()

  const result = await cld.uploader.upload(imageUrl, {
    folder: 'ideaspace/covers',
    public_id: `cover-${ideaId}`,
    overwrite: true,
    resource_type: 'image',
    format: 'webp',
    transformation: [{ width: 1792, height: 1024, crop: 'fill', quality: 'auto' }],
  })

  return result.secure_url
}
