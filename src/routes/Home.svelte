<script lang="ts">
  import { link } from 'svelte-spa-router'
</script>

<div class="home">
  <div class="heroText">
    <h1>FileConverter</h1>
    <p class="subtitle">Convert files directly in your browser. Nothing leaves your device.</p>
  </div>

  <div class="tools">
    <a href="/video" use:link class="tool">
      <h2>Video Converter</h2>
      <p>Compress and convert videos between formats using FFmpeg WASM.</p>
      <span class="toolMeta">mp4 &middot; webm &middot; avi &middot; mov &middot; mkv</span>
    </a>
    <a href="/compress" use:link class="tool">
      <h2>Video Compressor</h2>
      <p>Compress a video to fit a specific file size using automatic bitrate calculation.</p>
      <span class="toolMeta">mp4 &middot; target MB</span>
    </a>
    <a href="/image" use:link class="tool">
      <h2>Image Converter</h2>
      <p>Convert images between popular formats with the Canvas API.</p>
      <span class="toolMeta">png &middot; jpeg &middot; webp &middot; avif</span>
    </a>
    <a href="/paste" use:link class="tool">
      <h2>Paste & Download</h2>
      <p>Paste an image or video from your clipboard and download it instantly.</p>
      <span class="toolMeta">ctrl+v / cmd+v</span>
    </a>
  </div>
</div>

<style>
  .home {
    max-width: 640px;

    .heroText {
      margin-bottom: 32px;

      .subtitle {
        margin-top: 8px;
        color: var(--textMuted);
        font-size: 14px;
      }
    }

    .tools {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .tool {
        display: block;
        padding: 16px;
        border-radius: 6px;
        background: #222;
        transition: background 0.15s;
        border: 1px solid transparent;

        &:hover {
          background: #282828;
          border-color: #444;
        }

        p {
          margin-top: 4px;
          font-size: 13px;
          color: var(--textMuted);
        }

        .toolMeta {
          display: inline-block;
          margin-top: 10px;
          font-size: 12px;
          color: var(--textDim);
        }
      }
    }
  }
</style>
