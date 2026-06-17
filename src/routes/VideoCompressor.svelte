<script lang="ts">
  import ProgressBar from '../lib/ProgressBar.svelte'
  import { compressVideo, formatDuration } from '../utils/videoCompressor'
  import type { CompressResult } from '../utils/videoCompressor'

  let file = $state<File | null>(null)
  let targetSize = $state('10')
  let status = $state<'idle' | 'compressing' | 'done' | 'error'>('idle')
  let progress = $state(0)
  let result = $state<CompressResult | null>(null)
  let errorMsg = $state('')

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement
    const f = input.files?.[0]
    if (f) {
      file = f
      status = 'idle'
      result = null
      errorMsg = ''
    }
  }

  async function handleCompress() {
    if (!file) return
    const mb = parseFloat(targetSize)
    if (!mb || mb <= 0) {
      errorMsg = 'Enter a valid target size in MB'
      return
    }
    status = 'compressing'
    progress = 0
    errorMsg = ''
    result = null

    try {
      const res = await compressVideo(file, mb, (pct) => { progress = pct })
      result = res
      status = 'done'
    } catch (err) {
      errorMsg = String(err)
      status = 'error'
    }
  }

  function download() {
    if (!result) return
    const url = URL.createObjectURL(result.blob)
    const a = document.createElement('a')
    const baseName = (file?.name ?? 'video').replace(/\.[^/.]+$/, '')
    a.href = url
    a.download = `${baseName}_compressed.mp4`
    a.click()
    URL.revokeObjectURL(url)
  }
</script>

<div class="page">
  <h1>Video Compressor</h1>
  <p class="desc">Reduce a video file to fit a specific size. Select a target in MB and the compressor calculates the optimal bitrate.</p>

  <div class="section">
    <label class="uploadArea" for="video-input" class:hasFile={!!file}>
      {#if file}
        <span class="fileName">{file.name}</span>
        <span class="fileSize">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
      {:else}
        <span>Choose a video file</span>
      {/if}
      <input id="video-input" type="file" accept="video/*" onchange={handleFileSelect} />
    </label>
  </div>

  {#if file}
    <div class="section">
      <div class="field">
        <label for="targetSize">Target size (MB)</label>
        <input id="targetSize" type="number" min="1" bind:value={targetSize} placeholder="e.g. 10" />
      </div>
    </div>

    <div class="actions">
      {#if status === 'compressing'}
        <button disabled>Compressing…</button>
      {:else if status === 'done'}
        <button onclick={download}>Download</button>
        <button onclick={() => { file = null; status = 'idle'; result = null; }}>Compress another</button>
      {:else}
        <button onclick={handleCompress} disabled={!targetSize || parseFloat(targetSize) <= 0}>
          Compress
        </button>
      {/if}
    </div>

    {#if status === 'compressing' || status === 'done'}
      <div class="section">
        <ProgressBar value={progress} label="{progress}%" />
      </div>
    {/if}

    {#if result}
      <div class="section resultBox">
        <div class="stat">
          <span class="statLabel">Duration</span>
          <span class="statValue">{formatDuration(result.originalDuration)}</span>
        </div>
        <div class="stat">
          <span class="statLabel">Target size</span>
          <span class="statValue">{result.targetSizeMB} MB</span>
        </div>
        <div class="stat">
          <span class="statLabel">Original</span>
          <span class="statValue">{(result.originalSize / 1024 / 1024).toFixed(1)} MB</span>
        </div>
        <div class="stat">
          <span class="statLabel">Compressed</span>
          <span class="statValue">{(result.compressedSize / 1024 / 1024).toFixed(1)} MB</span>
        </div>
        <div class="stat">
          <span class="statLabel">Video bitrate</span>
          <span class="statValue">{(result.videoBitrate / 1000).toFixed(0)} kbps</span>
        </div>
        <div class="stat">
          <span class="statLabel">Audio bitrate</span>
          <span class="statValue">{(result.audioBitrate / 1000).toFixed(0)} kbps</span>
        </div>
        <div class="stat">
          <span class="statLabel">Reduction</span>
          <span class="statValue statReduction">
            {((1 - result.compressedSize / result.originalSize) * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    {/if}

    {#if errorMsg}
      <p class="error">{errorMsg}</p>
    {/if}
  {/if}
</div>

<style>
  .page {
    max-width: 560px;

    .desc {
      font-size: 13px;
      color: var(--textMuted);
      margin-top: 6px;
    }

    .section {
      margin-top: 20px;

      .uploadArea {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px;
        border: 1px dashed var(--border);
        border-radius: 6px;
        cursor: pointer;
        transition: border-color 0.15s;
        font-size: 14px;
        color: var(--textMuted);

        &:hover {
          border-color: #555;
        }

        &.hasFile {
          border-style: solid;
          border-color: #444;
          color: var(--text);
        }

        .fileName {
          color: var(--text);
          font-weight: 500;
        }

        .fileSize {
          font-size: 12px;
          color: var(--textDim);
        }
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;

        label {
          font-size: 13px;
          color: var(--textMuted);
        }

        input {
          max-width: 200px;
        }
      }
    }

    .actions {
      margin-top: 20px;
      display: flex;
      gap: 8px;
    }

    .resultBox {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding: 16px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: #1a1a1a;

      .stat {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .statLabel {
          font-size: 11px;
          color: var(--textDim);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .statValue {
          font-size: 14px;
          color: var(--text);
          font-variant-numeric: tabular-nums;
        }

        .statReduction {
          color: #86efac;
        }
      }
    }

    .error {
      margin-top: 12px;
      font-size: 13px;
      color: #f87171;
    }
  }
</style>
