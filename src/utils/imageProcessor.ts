export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'avif' | 'ico'

const formatMime: Record<Exclude<ImageFormat, 'ico'>, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif',
}

async function createIcoBlob(pngBlob: Blob, width: number, height: number): Promise<Blob> {
  const pngBuffer = await pngBlob.arrayBuffer()
  const pngSize = pngBuffer.byteLength
  const headerSize = 6
  const entrySize = 16
  const offset = headerSize + entrySize

  const buffer = new ArrayBuffer(offset + pngSize)
  const view = new DataView(buffer)

  view.setUint16(0, 0, true)
  view.setUint16(2, 1, true)
  view.setUint16(4, 1, true)

  const w = width >= 256 ? 0 : width
  const h = height >= 256 ? 0 : height
  view.setUint8(6, w)
  view.setUint8(7, h)
  view.setUint8(8, 0)
  view.setUint8(9, 0)
  view.setUint16(10, 1, true)
  view.setUint16(12, 32, true)
  view.setUint32(14, pngSize, true)
  view.setUint32(18, offset, true)

  new Uint8Array(buffer).set(new Uint8Array(pngBuffer), offset)

  return new Blob([buffer], { type: 'image/x-icon' })
}

export function convertImage(
  file: File,
  targetFormat: ImageFormat,
  quality = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to get canvas context'))
        return
      }
      ctx.drawImage(img, 0, 0)

      if (targetFormat === 'ico') {
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url)
          if (blob) {
            resolve(createIcoBlob(blob, canvas.width, canvas.height))
          } else {
            reject(new Error('Conversion failed'))
          }
        }, 'image/png')
      } else {
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url)
            if (blob) resolve(blob)
            else reject(new Error('Conversion failed'))
          },
          formatMime[targetFormat],
          quality,
        )
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

export function getReadableFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
