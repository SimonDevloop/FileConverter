import { FFmpeg } from '@ffmpeg/ffmpeg'

export const ffmpeg = new FFmpeg()
let loaded = false

let userLogCallback: ((msg: string) => void) | null = null
let progressLogCallback: ((msg: string) => void) | null = null

ffmpeg.on('log', ({ message }) => {
  userLogCallback?.(message)
  progressLogCallback?.(message)
})

export type VideoFormat = 'mp4' | 'webm' | 'avi' | 'mov' | 'mkv'

const formatMime: Record<VideoFormat, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  avi: 'video/x-msvideo',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
}

export async function readFileAsBuffer(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result))
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = () => {
      const err = reader.error
      if (err && err.name === 'NotReadableError') {
        reject(new Error(
          'Could not read the selected file. It may have been moved, deleted, or is no longer accessible. Please select the file again.'
        ))
      } else {
        reject(err ?? new Error('Unknown FileReader error'))
      }
    }
    reader.readAsArrayBuffer(file)
  })
}

export async function loadFFmpeg(onLog?: (msg: string) => void) {
  if (loaded) return
  userLogCallback = onLog ?? null

  const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm'

  await ffmpeg.load({
    coreURL: `${baseURL}/ffmpeg-core.js`,
    wasmURL: `${baseURL}/ffmpeg-core.wasm`,
  })

  loaded = true
}

export function getProgressFromLog(log: string, duration: number): number {
  const match = log.match(/time=(\d+):(\d+):(\d+\.\d+)/)
  if (!match || !duration) return 0
  const hours = parseInt(match[1])
  const minutes = parseInt(match[2])
  const seconds = parseFloat(match[3])
  const currentTime = hours * 3600 + minutes * 60 + seconds
  return Math.min(currentTime / duration, 1)
}

export async function convertVideo(
  file: File,
  outputFormat: VideoFormat,
  targetSizeMB?: number,
  onProgress?: (pct: number) => void,
): Promise<Blob> {
  const input = await readFileAsBuffer(file)
  const ext = file.name.split('.').pop() || 'input'
  await ffmpeg.writeFile(`input.${ext}`, input)

  let duration = 0
  try {
    await ffmpeg.ffprobe([
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      `input.${ext}`,
      '-o', 'duration.txt',
    ])
    const durData = await ffmpeg.readFile('duration.txt', 'utf8')
    duration = parseFloat(durData as string) || 0
    await ffmpeg.deleteFile('duration.txt')
  } catch {
    // proceed without duration
  }

  const args = ['-i', `input.${ext}`]

  if (targetSizeMB && duration > 0) {
    const targetBits = targetSizeMB * 1024 * 1024 * 8
    const audioBitrate = 128_000
    const videoBitrate = Math.floor(targetBits / duration - audioBitrate)
    if (videoBitrate > 100_000) {
      args.push('-b:v', `${videoBitrate}`, '-b:a', `${audioBitrate}`)
    }
  }

  args.push('-y', `output.${outputFormat}`)

  let lastLog = ''
  progressLogCallback = (msg) => { lastLog = msg }

  const progressInterval = duration > 0
    ? setInterval(() => {
      const pct = getProgressFromLog(lastLog, duration)
      onProgress?.(Math.round(pct * 100))
    }, 200)
    : undefined

  await ffmpeg.exec(args)

  clearInterval(progressInterval)
  progressLogCallback = null
  onProgress?.(100)

  const data = await ffmpeg.readFile(`output.${outputFormat}`)
  const blob = data instanceof Uint8Array
    ? new Blob([data.buffer as ArrayBuffer], { type: formatMime[outputFormat] })
    : new Blob([data as string], { type: formatMime[outputFormat] })
  return blob
}

export function isLoaded() {
  return loaded
}
