# AGENTS.md

## Project

Svelte 5 + Vite SPA (not SvelteKit). Client-side routing via `svelte-spa-router` v5.1.0. All processing in-browser with ffmpeg.wasm and Canvas API.

## Commands

```bash
pnpm run dev      # localhost:5173
pnpm run build    # dist/
pnpm run preview  # serve dist/ locally
pnpm run check    # svelte-check + tsc (run before commit)
```

## Routing

`svelte-spa-router` imports:
```ts
import Router from 'svelte-spa-router'
import { link, router, push, pop, replace } from 'svelte-spa-router'
import active from 'svelte-spa-router/active'
```

Routes defined in `src/App.svelte`: `/`, `/video`, `/compress`, `/image`, `/paste`.

## Architecture

```
src/
  main.ts          -- mount App
  app.css          -- global styles, camelCase custom properties (--bgBody, --textMuted, --border, etc.)
  App.svelte       -- sidebar + Router, mobile sidebar via $state
  lib/
    ProgressBar.svelte  -- props: { value: number, label?: string }
  routes/
    Home.svelte, VideoConverter.svelte, VideoCompressor.svelte, ImageConverter.svelte, PasteDownload.svelte
  utils/
    videoProcessor.ts   -- singleton FFmpeg instance (exported), loadFFmpeg(), convertVideo(), readFileAsBuffer()
    videoCompressor.ts  -- imports { ffmpeg, loadFFmpeg, readFileAsBuffer } from './videoProcessor'; compressVideo()
    imageProcessor.ts   -- Canvas API: convertImage(file, format, quality)
    clipboardHandler.ts -- handlePasteEvent() + readClipboard()
```

## Gotchas

- **COOP/COEP headers** required for SharedArrayBuffer. Already configured in `vite.config.ts` for dev. Production hosting must set `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`.
- **FFmpeg core URL** must point to the ESM variant: `dist/esm/ffmpeg-core.js`, not `dist/umd/`. The `@ffmpeg/ffmpeg` v0.12.x worker is type `module`, so `importScripts()` fails and falls back to dynamic `import()` which requires an ESM `.default` export. Current URL: `https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js`.
- **FFmpeg is a singleton** -- do not create a second `FFmpeg` instance. Reuse the exported `ffmpeg` from `videoProcessor.ts`.
- **No `fetchFile`** from `@ffmpeg/util`. Use the custom `readFileAsBuffer(file)` → `await ffmpeg.writeFile(name, buffer)` pattern.
- **Blob creation**: `data instanceof Uint8Array ? new Blob([data.buffer as ArrayBuffer]) : new Blob([data as string])`.
- **File input hidden** (`display: none`), triggered via `<label for="...">`.
- **CSS conventions**: fully nested, camelCase class names. All custom properties in `src/app.css`.
- **Progress**: parse `time=HH:MM:SS.mmm` from ffmpeg log; poll on 200ms interval.
- **Bitrate math** (converter + compressor): audio fixed at 128 kbps, video gets the remainder of total target bits.
- **optimizeDeps exclusion**: `vite.config.ts` excludes `@ffmpeg/ffmpeg` and `@ffmpeg/util`.
- **No tests** exist in the project.
