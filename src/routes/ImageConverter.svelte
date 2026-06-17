<script lang="ts">
  import ProgressBar from '../lib/ProgressBar.svelte'
  import { convertImage, getReadableFileSize, type ImageFormat } from '../utils/imageProcessor'

  let file = $state<File | null>(null)
  let format = $state<ImageFormat>('jpeg')
  let quality = $state(92)
  let status = $state<'idle' | 'converting' | 'done' | 'error'>('idle')
  let progress = $state(0)
  let resultBlob = $state<Blob | null>(null)
  let originalSize = $state(0)
  let originalUrl = $state('')
  let errorMsg = $state('')

  const formats: ImageFormat[] = ['png', 'jpeg', 'webp', 'avif']

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement
    const f = input.files?.[0]
    if (f && f.type.startsWith('image/')) {
      file = f
      originalSize = f.size
      originalUrl = URL.createObjectURL(f)
      status = 'idle'
      resultBlob = null
    }
  }

  async function handleConvert() {
    if (!file) return
    status = 'converting'
    progress = 0
    errorMsg = ''
    resultBlob = null

    try {
      const blob = await convertImage(file, format, quality / 100)
      resultBlob = blob
      progress = 100
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
  <h1>Image Converter</h1>
  <p class="desc">Convert images between formats using your browser's built-in Canvas API.</p>

  <div class="section">
    <label class="uploadArea" for="image-input" class:hasFile={!!file}>
      {#if file}
        <span class="fileName">{file.name}</span>
        <span class="fileSize">({getReadableFileSize(originalSize)})</span>
      {:else}
        <span>Choose an image file</span>
      {/if}
      <input id="image-input" type="file" accept="image/*" onchange={handleFileSelect} />
    </label>
  </div>

  {#if file}
    <div class="section">
      <div class="row">
        <div class="field">
          <label for="img-format">Target format</label>
          <select id="img-format" bind:value={format}>
            {#each formats as f}
              <option value={f}>{f.toUpperCase()}</option>
            {/each}
          </select>
        </div>
        {#if format === 'jpeg' || format === 'webp' || format === 'avif'}
          <div class="field">
            <label for="quality">Quality ({quality}%)</label>
            <input id="quality" type="range" min="1" max="100" bind:value={quality} />
          </div>
        {/if}
      </div>
    </div>

    {#if originalUrl}
      <div class="section">
        <div class="preview">
          <img src={originalUrl} alt="Preview" />
        </div>
      </div>
    {/if}

    <div class="actions">
      {#if status === 'converting'}
        <button disabled>Converting…</button>
      {:else if status === 'done'}
        <button onclick={download}>Download</button>
        <button onclick={() => { file = null; status = 'idle'; resultBlob = null; URL.revokeObjectURL(originalUrl); }}>Convert another</button>
      {:else}
        <button onclick={handleConvert}>Convert</button>
      {/if}
    </div>

    {#if status === 'converting' || status === 'done'}
      <div class="section">
        <ProgressBar value={progress} label="{progress}%" />
        {#if status === 'done'}
          <div class="resultInfo">
            <span>{getReadableFileSize(originalSize)} &rarr; {getReadableFileSize(resultBlob?.size ?? 0)}</span>
            {#if resultBlob && resultBlob.size < originalSize}
              <span class="saved">({((1 - resultBlob.size / originalSize) * 100).toFixed(0)}% smaller)</span>
            {/if}
          </div>
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
        align-items: flex-end;

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

      .preview {
        max-width: 300px;
        border-radius: 4px;
        overflow: hidden;
        border: 1px solid var(--border);

        img {
          display: block;
          width: 100%;
          height: auto;
        }
      }

      .resultInfo {
        margin-top: 8px;
        font-size: 13px;
        color: var(--textMuted);
        display: flex;
        gap: 6px;

        .saved {
          color: #6ee7b7;
        }
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

  input[type="range"] {
    width: 100%;
    padding: 0;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: var(--bgInput);
    border: 1px solid var(--border);
    border-radius: 3px;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #e0e0e0;
      border: none;
      cursor: pointer;
    }
  }
</style>
