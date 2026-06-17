<script lang="ts">
  let { value = 0, label = '' }: { value: number; label?: string } = $props()
</script>

<div class="progressRoot">
  <div class="progressTrack">
    <div class="progressFill" style="width: {value}%"></div>
  </div>
  {#if label}
    <span class="progressLabel">{label}</span>
  {/if}
</div>

<style>
  .progressRoot {
    display: flex;
    align-items: center;
    gap: 12px;

    .progressTrack {
      flex: 1;
      height: 6px;
      background: #2a2a2a;
      border-radius: 3px;
      overflow: hidden;

      .progressFill {
        height: 100%;
        background: #e0e0e0;
        border-radius: 3px;
        transition: width 0.15s ease;
      }
    }

    .progressLabel {
      font-size: 13px;
      color: #888;
      min-width: 36px;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
  }
</style>
