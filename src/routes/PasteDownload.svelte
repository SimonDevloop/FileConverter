<script lang="ts">
  import { handlePasteEvent, readClipboard, type PastedItem } from '../utils/clipboardHandler'

  let history = $state<PastedItem[]>([])
  let listening = $state(true)
  let clipboardSupported = $state(true)
  let lastError = $state('')

  function onPaste(e: ClipboardEvent) {
    if (!listening) return
    e.preventDefault()
    handlePasteEvent(e).then((item) => {
      if (item) {
        history = [item, ...history]
      }
    })
  }

  async function tryReadClipboard() {
    try {
      const item = await readClipboard()
      if (item) {
        history = [item, ...history]
      }
    } catch {
      clipboardSupported = false
    }
  }

  $effect(() => {
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  })
</script>

<div class="page">
  <h1>Paste & Download</h1>
  <p class="desc">Paste an image or video from your clipboard (Ctrl+V / Cmd+V) and it will download automatically.</p>

  {#if !clipboardSupported}
    <p class="note">Clipboard API not available in this browser. Try pasting directly with Ctrl+V.</p>
  {:else}
    <button class="readBtn" onclick={tryReadClipboard}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 3h12v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3z" stroke="currentColor" stroke-width="1.3"/>
        <path d="M5 1h6v2H5V1z" stroke="currentColor" stroke-width="1.3"/>
      </svg>
      Read clipboard
    </button>
  {/if}

  {#if history.length > 0}
    <div class="section">
      <h2>Downloads</h2>
      <div class="history">
        {#each history as item}
          <div class="historyItem">
            <div class="itemInfo">
              <span class="itemName">{item.name}</span>
              <span class="itemMeta">{(item.size / 1024).toFixed(1)} KB &middot; {item.type}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="emptyState">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="5" y="8" width="30" height="24" rx="3" stroke="#444" stroke-width="1.5"/>
        <path d="M20 15v10m-5-5h10" stroke="#444" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <p>Press <kbd>Ctrl+V</kbd> or click "Read clipboard" above</p>
    </div>
  {/if}

  {#if lastError}
    <p class="error">{lastError}</p>
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

    .readBtn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
    }

    .section {
      margin-top: 24px;

      h2 {
        font-size: 14px;
        font-weight: 500;
        color: var(--textMuted);
        margin-bottom: 8px;
      }

      .history {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .historyItem {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: #222;
          border-radius: 4px;

          .itemInfo {
            display: flex;
            flex-direction: column;
            gap: 2px;

            .itemName {
              font-size: 13px;
              color: var(--text);
            }

            .itemMeta {
              font-size: 12px;
              color: var(--textDim);
            }
          }
        }
      }
    }

    .emptyState {
      margin-top: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: var(--textDim);
      font-size: 14px;

      kbd {
        padding: 2px 6px;
        background: #222;
        border: 1px solid var(--border);
        border-radius: 3px;
        font-family: inherit;
        font-size: 13px;
      }
    }

    .note {
      margin-top: 12px;
      font-size: 13px;
      color: #fbbf24;
    }

    .error {
      margin-top: 12px;
      font-size: 13px;
      color: #f87171;
    }
  }
</style>
