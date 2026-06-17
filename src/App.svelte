<script lang="ts">
  import Router from 'svelte-spa-router'
  import { link } from 'svelte-spa-router'
  import { router } from 'svelte-spa-router'
  import active from 'svelte-spa-router/active'
  import Home from './routes/Home.svelte'
  import VideoConverter from './routes/VideoConverter.svelte'
  import ImageConverter from './routes/ImageConverter.svelte'
  import PasteDownload from './routes/PasteDownload.svelte'
  import VideoCompressor from './routes/VideoCompressor.svelte'

  const routes = {
    '/': Home,
    '/video': VideoConverter,
    '/image': ImageConverter,
    '/paste': PasteDownload,
    '/compress': VideoCompressor,
  }

  let sidebarOpen = $state(false)

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen
  }

  function closeSidebar() {
    sidebarOpen = false
  }

  function handleOverlayKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') closeSidebar()
  }
</script>

<aside class="sidebar" class:open={sidebarOpen}>
  <div class="sidebarHeader">
    <a href="/" use:link class="logo" onclick={closeSidebar}>
      FileConverter
    </a>
  </div>

  <nav class="nav">
    <a href="/" use:link use:active onclick={closeSidebar}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1 6.5L8 1l7 5.5V14a1 1 0 01-1 1H2a1 1 0 01-1-1V6.5z" stroke="currentColor" stroke-width="1.3"/>
        <path d="M5.5 15V8.5h5V15" stroke="currentColor" stroke-width="1.3"/>
      </svg>
      Home
    </a>
    <a href="/video" use:link use:active onclick={closeSidebar}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="2.5" width="14" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
        <path d="M6.5 5.5l4 2.5-4 2.5v-5z" fill="currentColor"/>
      </svg>
      Video Converter
    </a>
    <a href="/compress" use:link use:active onclick={closeSidebar}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.3"/>
        <path d="M5 8h6M8 5v6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
      </svg>
      Video Compressor
    </a>
    <a href="/image" use:link use:active onclick={closeSidebar}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1.5" width="14" height="13" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
        <circle cx="5" cy="5.5" r="1.5" fill="currentColor"/>
        <path d="M1 12l4-4 2.5 2.5L10 8l5 4.5" stroke="currentColor" stroke-width="1.3"/>
      </svg>
      Image Converter
    </a>
    <a href="/paste" use:link use:active onclick={closeSidebar}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 13.5V3a1 1 0 011-1h8a1 1 0 011 1v10.5a1 1 0 01-1 1H4a1 1 0 01-1-1z" stroke="currentColor" stroke-width="1.3"/>
        <path d="M5.5 6.5h5M5.5 9h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
      </svg>
      Paste & Download
    </a>
  </nav>

  <div class="sidebarFooter">
    <span class="version">
      v0.1.0 - <a target="_blank" href="https://simondevloop.github.io">Simon Collie Grayson</a>
    </span>
  </div>
</aside>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
  class="overlay"
  class:visible={sidebarOpen}
  role="presentation"
  onclick={closeSidebar}
  onkeydown={handleOverlayKeydown}
></div>

<main class="main">
  <header class="mobileHeader">
    <button class="menuBtn" onclick={toggleSidebar} aria-label="Toggle menu">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
    <span class="mobileTitle">FileConverter</span>
  </header>

  <div class="content">
    <Router {routes} />
  </div>
</main>

<style>
  .sidebar {
    width: var(--sidebarW);
    min-width: var(--sidebarW);
    height: 100vh;
    position: sticky;
    top: 0;
    background: var(--bgSidebar);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow-y: auto;

    .sidebarHeader {
      padding: 20px;
      border-bottom: 1px solid var(--border);

      .logo {
        font-size: 16px;
        font-weight: 600;
        color: #fff;
        letter-spacing: -0.3px;
      }
    }

    .nav {
      flex: 1;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;

      a {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        color: var(--textMuted);
        transition: all 0.15s;

        &:hover {
          background: var(--bgHover);
          color: var(--text);
        }
      }

      :global(a.active) {
        color: #fff;
        background: #222;
      }
    }

    .sidebarFooter {
      padding: 12px 20px;
      border-top: 1px solid var(--border);

      .version {
        font-size: 12px;
        color: var(--textDim);
      }
    }

    @media (max-width: 768px) {
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      transform: translateX(-100%);
      transition: transform 0.2s ease;

      &.open {
        transform: translateX(0);
      }
    }
  }

  .overlay {
    display: none;

    @media (max-width: 768px) {
      display: block;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;

      &.visible {
        opacity: 1;
        pointer-events: auto;
      }
    }
  }

  .main {
    flex: 1;
    background: var(--bgMain);
    min-height: 100vh;

    .content {
      padding: 20px;

      @media (max-width: 768px) {
        padding: 16px;
      }
    }

    .mobileHeader {
      display: none;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      border-bottom: 1px solid var(--border);
      background: var(--bgSidebar);

      @media (max-width: 768px) {
        display: flex;
      }

      .menuBtn {
        background: none;
        padding: 4px;
        color: var(--text);

        &:hover {
          background: none;
          color: #fff;
        }
      }

      .mobileTitle {
        font-size: 15px;
        font-weight: 600;
        color: #fff;
      }
    }
  }
</style>
