import { ffmpeg, loadFFmpeg, isLoaded, readFileAsBuffer } from './videoProcessor'
import type { LogEvent } from '@ffmpeg/ffmpeg'

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export interface CompressResult {
  blob: Blob
  originalSize: number
  compressedSize: number
  originalDuration: number
  videoBitrate: number
  audioBitrate: number
  targetSizeMB: number
}

export async function compressVideo(
  file: File,
  targetSizeMB: number,
  onProgress?: (pct: number) => void,
): Promise<CompressResult> {
  await loadFFmpeg()

  const buffer = await readFileAsBuffer(file)
  const ext = file.name.split('.').pop() || 'input'
  const inputName = `cmp_in_${ext}`
  const durFile = 'cmp_dur.txt'
  const outputName = 'cmp_out.mp4'

  await ffmpeg.writeFile(inputName, buffer)

  let duration = 0
  try {
    await ffmpeg.ffprobe([
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      inputName,
      '-o', durFile,
    ])
    const durData = await ffmpeg.readFile(durFile, 'utf8')
    duration = parseFloat(durData as string) || 0
    await ffmpeg.deleteFile(durFile)
  } catch {
    await ffmpeg.deleteFile(inputName)
    throw new Error('Could not read video metadata')
  }

  if (!duration || duration <= 0) {
    await ffmpeg.deleteFile(inputName)
    throw new Error('Could not determine video duration')
  }

  const targetBits = targetSizeMB * 8 * 1024 * 1024
  const audioBitrate = 128_000
  const maxVideoBitrate = Math.floor(targetBits / duration - audioBitrate)

  if (maxVideoBitrate < 50_000) {
    const minMB = Math.ceil((50_000 + audioBitrate) * duration / (8 * 1024 * 1024))
    await ffmpeg.deleteFile(inputName)
    throw new Error(
      `Target ${targetSizeMB}MB is too small for a ${formatDuration(duration)} long video. ` +
      `Minimum suggested: ${minMB}MB`
    )
  }

  const videoBitrate = Math.min(maxVideoBitrate, 10_000_000)

  const args = [
    '-i', inputName,
    '-b:v', `${videoBitrate}`,
    '-b:a', `${audioBitrate}`,
    '-movflags', '+faststart',
    '-y', outputName,
  ]

  let lastLog = ''
  const logHandler = ({ message }: LogEvent) => { lastLog = message }
  ffmpeg.on('log', logHandler)

  const progressInterval = setInterval(() => {
    const match = lastLog.match(/time=(\d+):(\d+):(\d+\.\d+)/)
    if (match) {
      const h = parseInt(match[1]), m = parseInt(match[2]), s = parseFloat(match[3])
      const currentTime = h * 3600 + m * 60 + s
      const pct = Math.min(Math.round((currentTime / duration) * 100), 99)
      onProgress?.(pct)
    }
  }, 200)

  await ffmpeg.exec(args)

  clearInterval(progressInterval)
  ffmpeg.off('log', logHandler)
  onProgress?.(100)

  const data = await ffmpeg.readFile(outputName)
  const blob = data instanceof Uint8Array
    ? new Blob([data.buffer as ArrayBuffer], { type: 'video/mp4' })
    : new Blob([data as string], { type: 'video/mp4' })

  await ffmpeg.deleteFile(inputName)
  await ffmpeg.deleteFile(outputName)

  return {
    blob,
    originalSize: file.size,
    compressedSize: blob.size,
    originalDuration: duration,
    videoBitrate,
    audioBitrate,
    targetSizeMB,
  }
}

export { formatDuration }
