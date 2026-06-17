# FileConverter

A browser-based file conversion tool that runs entirely on your device. No uploads, no servers, no data leaves your machine.

Built with Svelte 5, Vite, and client-side libraries (ffmpeg.wasm for video, Canvas API for images).

## Features

- **Video Converter** -- convert between mp4, webm, avi, mov, and mkv formats. Supports optional size-based compression.
- **Video Compressor** -- target a specific file size in MB. Automatically calculates the optimal video and audio bitrate based on duration.
- **Image Converter** -- convert between png, jpeg, webp, and avif with a configurable quality slider.
- **Paste & Download** -- paste an image or video from your clipboard and save it to disk.

## Usage

```bash
pnpm install
pnpm run dev
```

Open the URL shown in the terminal (default `http://localhost:5173`). Select a tool from the sidebar and follow the on-screen instructions.

### Production build

```bash
pnpm run build
pnpm run preview
```

The production build outputs to `dist/` and can be served by any static file server.

## Requirements

- Node.js 18+
- pnpm

## License

MIT
