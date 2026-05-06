import { apiDel } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'

const CLOUDINARY_CLOUD_NAME    = 'du9dfydj4'
const CLOUDINARY_UPLOAD_PRESET = 'spark_expo_dating'

function getMimeType(ext: string): string {
  switch (ext.toLowerCase()) {
    case 'png':  return 'image/png'
    case 'webp': return 'image/webp'
    case 'gif':  return 'image/gif'
    case 'heic': return 'image/heic'
    case 'heif': return 'image/heif'
    default:     return 'image/jpeg'
  }
}

export interface CloudinaryUploadResult {
  secure_url: string
  public_id:  string
}

export async function uploadToCloudinary(localUri: string): Promise<CloudinaryUploadResult> {
  const filename = localUri.split('/').pop() ?? 'photo.jpg'
  const ext      = filename.split('.').pop() ?? 'jpg'
  const mimeType = getMimeType(ext)

  const body = new FormData()
  body.append('file',          { uri: localUri, name: filename, type: mimeType } as any)
  body.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body },
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any)?.error?.message ?? `Upload failed (HTTP ${res.status})`)
  }

  const data = await res.json()
  return { secure_url: data.secure_url as string, public_id: data.public_id as string }
}

// Deletes image from Cloudinary via backend (keeps API secret server-side)
export async function deleteFromCloudinary(public_id: string): Promise<void> {
  await apiDel(ENDPOINTS.CLOUDINARY.DELETE_IMAGE, { public_id })
}
