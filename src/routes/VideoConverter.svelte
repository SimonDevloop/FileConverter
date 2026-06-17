<script lang="ts">
  import ProgressBar from '../lib/ProgressBar.svelte'
  import { loadFFmpeg, convertVideo, isLoaded, type VideoFormat } from '../utils/videoProcessor'

  let file = $state<File | null>(null)
  let format = $state<VideoFormat>('mp4')
  let targetSize = $state<string>('')
  let status = $state<'idle' | 'loading' | 'ready' | 'converting' | 'done' | 'error'>('idle')
  let progress = $state(0)
  let log = $state<string[]>([])
  let resultBlob = $state<Blob | null>(null)
  let errorMsg = $state('')

  const formats: VideoFormat[] = ['mp4', 'webm', 'avi', 'mov', 'mkv']

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement
    const f = input.files?.[0]
    if (f) {
      file = f
      status = isLoaded() ? 'ready' : 'loading'
      load()
    }
  }

  async function load() {
    status = 'loading'
    errorMsg = ''
    try {
      await loadFFmpeg((msg) => {
        log = [...log.slice(-50), msg]
      })
      status = 'ready'
    } catch (err) {
      errorMsg = String(err)
      status = 'error'
    }
  }

  async function handleConvert() {
    if (!file) return
    status = 'converting'
    progress = 0
    errorMsg = ''
    resultBlob = null

    try {
      const blob = await convertVideo(
        file,
        format,
        targetSize ? parseFloat(targetSize) : undefined,
        (pct) => { progress = pct },
      )
      resultBlob = blob
      status = 'done'
    } catch (err) {
      errorMsg = String(err)
      status = 'error'
    }
  }

  function download() {
    if (!resultBlob || !file) return
    const url = URL.createObjectURL(resultBlob)
    const a = document.createElement('a')
    const baseName = file.name.replace(/\.[^/.]+$/, '')
    a.href = url
    a.download = `${baseName}.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }
</script>

<div class="page">
  <h1>Video Converter</h1>
  <p class="desc">Compress or convert videos to another format. All processing stays on your device.</p>

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
      <div class="row">
        <div class="field">
          <label for="format">Output format</label>
          <select id="format" bind:value={format}>
            {#each formats as f}
              <option value={f}>{f.toUpperCase()}</option>
            {/each}
          </select>
        </div>
        <div class="field">
          <label for="size">Max size (MB, optional)</label>
          <input id="size" type="number" min="1" bind:value={targetSize} placeholder="e.g. 25" />
        </div>
      </div>
    </div>

    <div class="actions">
      {#if status === 'loading'}
        <button disabled>Loading FFmpeg…</button>
      {:else if status === 'converting'}
        <button disabled>Converting…</button>
      {:else if status === 'ready'}
        <button onclick={handleConvert}>Convert</button>
      {:else if status === 'done'}
        <button onclick={download}>Download</button>
        <button onclick={() => { file = null; status = 'idle'; resultBlob = null; }}>Convert another</button>
      {:else if status === 'error'}
        <button onclick={load}>Retry Load</button>
      {/if}
    </div>

    {#if status === 'converting' || status === 'done'}
      <div class="section">
        <ProgressBar value={progress} label="{progress}%" />
        {#if status === 'done'}
          <p class="doneMsg">
            Done — {((resultBlob?.size ?? 0) / 1024 / 1024).toFixed(1)} MB
          </p>
        {/if}
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

      .row {
        display: flex;
        gap: 16px;

        .field {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;

          label {
            font-size: 13px;
            color: var(--textMuted);
          }
        }
      }

      .doneMsg {
        margin-top: 8px;
        font-size: 13px;
        color: var(--textMuted);
      }
    }

    .actions {
      margin-top: 20px;
      display: flex;
      gap: 8px;
    }

    .error {
      margin-top: 12px;
      font-size: 13px;
      color: #f87171;
    }
  }
</style>
