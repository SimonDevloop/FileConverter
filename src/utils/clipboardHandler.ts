export interface PastedItem {
  name: string
  type: string
  size: number
  timestamp: number
}

export function handlePasteEvent(
  event: ClipboardEvent,
): Promise<PastedItem | null> {
  return new Promise((resolve) => {
    const items = event.clipboardData?.items
    if (!items) {
      resolve(null)
      return
    }

    for (const item of items) {
      const type = item.type
      if (type.startsWith('image/') || type.startsWith('video/')) {
        const blob = item.getAsFile()
        if (blob) {
          const ext = type.split('/')[1]
          const pasted: PastedItem = {
            name: `pasted-${Date.now()}.${ext}`,
            type,
            size: blob.size,
            timestamp: Date.now(),
          }

          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = pasted.name
          a.click()
          URL.revokeObjectURL(url)

          resolve(pasted)
          return
        }
      }
    }

    resolve(null)
  })
}

export async function readClipboard(): Promise<PastedItem | null> {
  try {
    const items = await navigator.clipboard.read()
    for (const item of items) {
      for (const type of item.types) {
        if (type.startsWith('image/') || type.startsWith('video/')) {
          const blob = await item.getType(type)
          const ext = type.split('/')[1]
          const pasted: PastedItem = {
            name: `pasted-${Date.now()}.${ext}`,
            type,
            size: blob.size,
            timestamp: Date.now(),
          }

          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = pasted.name
          a.click()
          URL.revokeObjectURL(url)

          return pasted
        }
      }
    }
  } catch {
    // Clipboard read not supported or denied
  }
  return null
}
