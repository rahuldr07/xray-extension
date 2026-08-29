import React from 'react';
import { IconArrowsMaximize, IconDeviceLaptop, IconDownload, IconLayoutSidebarLeftExpand, IconLayoutSidebarRightExpand, IconPictureInPicture, IconSettings, IconTerminal2, IconX } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { DEFAULT_PANEL_SETTINGS, PANEL_FONT_VALUES, PANEL_WIDTH_MAX, PANEL_WIDTH_MIN, resolveAccentValue } from '../../models/panelSettings';
import { buildSessionSummary } from '../../models/sessionSummary';
import { buildCustomThemeVars } from '../../models/customTheme';
import { formatBytes } from '../../utils';
import { XRAY_BUILD, XRAY_VERSION } from '../../version';
import { panelTabs } from './panelTabs';
import { ThemeSwitcher } from './ThemeSwitcher';
import { devtoolsHint, openWindowSurface, toggleHudSurface } from '../../runtime/surfaces';
import type { ActiveTab, XrayAppMode } from '../../types';

const modeIconProps = { size: 16, stroke: 1.8 } as const;

// Keyboard nudge and the largest a drag/nudge may reach (also capped at 96vw so
// the panel can never fully cover a small page).
const RESIZE_KEY_STEP = 24;
function maxPanelWidth(): number {
  const vwCap = typeof window !== 'undefined' ? Math.round(window.innerWidth * 0.96) : PANEL_WIDTH_MAX;
  return Math.min(PANEL_WIDTH_MAX, vwCap);
}
function clampPanelWidth(width: number): number {
  return Math.max(PANEL_WIDTH_MIN, Math.min(maxPanelWidth(), Math.round(width)));
}

export function PanelShell({ children, mode }: { children: React.ReactNode; mode: XrayAppMode }): React.ReactElement {
  const open = usePanelStore((state) => state.open);
  const devtoolsMode = usePanelStore((state) => state.devtoolsMode);
  const activeTab = usePanelStore((state) => state.activeTab);
  const setActiveTab = usePanelStore((state) => state.setActiveTab);
  const entries = usePanelStore((state) => state.entries);
  const settings = usePanelStore((state) => state.settings);
  const updateSettings = usePanelStore((state) => state.updateSettings);
  const setExportOpen = usePanelStore((state) => state.setExportOpen);
  const setSettingsOpen = usePanelStore((state) => state.setSettingsOpen);
  const showToast = usePanelStore((state) => state.showToast);
  const toastMessage = usePanelStore((state) => state.toastMessage);
  const clearToast = usePanelStore((state) => state.clearToast);
  const setOpen = usePanelStore((state) => state.setOpen);
  const { apiCount, logCount, errorCount, totalBytes } = buildSessionSummary(entries);

  // The docked side panel (mode 'hud', not the fullscreen devtools/window views)
  // is the only surface that resizes and docks. In the floating HUD these controls
  // are hidden by hud.css, which only loads there.
  const dockable = mode === 'hud';
  const dockSide = settings.dockSide;
  // Live width during a resize drag overrides the persisted width; committed on release.
  const [dragWidth, setDragWidth] = React.useState<number | null>(null);
  // `startWidth` stays fixed for the whole drag — the width is always
  // startWidth + total pointer delta, never accumulated move-to-move (which
  // made the panel grow several times faster than the cursor). `latest` holds
  // the most recent computed width so release can commit it.
  const resize = React.useRef<{ startX: number; startWidth: number; latest: number } | null>(null);
  const resizeRaf = React.useRef(0);
  const appliedWidth = dragWidth ?? settings.panelWidth;

  React.useEffect(() => () => { if (resizeRaf.current) cancelAnimationFrame(resizeRaf.current); }, []);

  function onResizePointerDown(event: React.PointerEvent<HTMLDivElement>): void {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    resize.current = { startX: event.clientX, startWidth: settings.panelWidth, latest: settings.panelWidth };
    setDragWidth(settings.panelWidth);
  }
  function onResizePointerMove(event: React.PointerEvent<HTMLDivElement>): void {
    const state = resize.current;
    if (!state) return;
    // Total delta from the drag start; the sign flips with the dock side
    // (dragging toward the page shrinks a right-docked panel).
    const delta = dockSide === 'right' ? state.startX - event.clientX : event.clientX - state.startX;
    state.latest = clampPanelWidth(state.startWidth + delta);
    // Coalesce to one width update per frame so the drag stays smooth.
    if (resizeRaf.current) return;
    resizeRaf.current = requestAnimationFrame(() => {
      resizeRaf.current = 0;
      if (resize.current) setDragWidth(resize.current.latest);
    });
  }
  function commitResize(event: React.PointerEvent<HTMLDivElement>): void {
    const state = resize.current;
    if (!state) return;
    resize.current = null;
    if (resizeRaf.current) { cancelAnimationFrame(resizeRaf.current); resizeRaf.current = 0; }
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch {}
    setDragWidth(null);
    if (state.latest !== settings.panelWidth) updateSettings({ panelWidth: state.latest });
  }
  function onResizeKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    const grow = dockSide === 'right' ? 'ArrowLeft' : 'ArrowRight';
    const shrink = dockSide === 'right' ? 'ArrowRight' : 'ArrowLeft';
    if (event.key === grow || event.key === shrink) {
      event.preventDefault();
      const step = event.key === grow ? RESIZE_KEY_STEP : -RESIZE_KEY_STEP;
      updateSettings({ panelWidth: clampPanelWidth(settings.panelWidth + step) });
    }
  }
  function resetWidth(): void {
    updateSettings({ panelWidth: clampPanelWidth(DEFAULT_PANEL_SETTINGS.panelWidth) });
  }
  function toggleDock(): void {
    updateSettings({ dockSide: dockSide === 'right' ? 'left' : 'right' });
  }
  function closePanel(): void {
    const api = (window as unknown as { XRAY_Panel?: { hide?: () => void } }).XRAY_Panel;
    if (api?.hide) api.hide();
    else setOpen(false);
  }

  const [toastPaused, setToastPaused] = React.useState(false);
  React.useEffect(() => {
    if (!toastMessage || toastPaused) return;
    const timer = window.setTimeout(clearToast, 2800);
    return () => window.clearTimeout(timer);
  }, [toastMessage, toastPaused, clearToast]);

  // Shared with the command palette, which offers the same three surfaces so they stay
  // reachable on a panel too narrow to show this switcher.
  const surfaceIo = React.useMemo(() => ({ showToast }), [showToast]);
  const openDevtoolsHint = (): void => devtoolsHint(surfaceIo);
  const toggleHud = (): void => toggleHudSurface(surfaceIo);
  const openWindow = (): void => openWindowSurface(surfaceIo);

  // Arrow keys move between tabs, Home/End jump to the ends — the standard tablist
  // interaction. Focus follows selection, so activating is a single keypress.
  function onTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, tabId: ActiveTab): void {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const index = panelTabs.findIndex((tab) => tab.id === tabId);
    if (index < 0) return;
    const last = panelTabs.length - 1;
    const nextIndex =
      event.key === 'Home' ? 0
        : event.key === 'End' ? last
          : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
            : (index === last ? 0 : index + 1);
    const next = panelTabs[nextIndex];
    if (!next) return;
    setActiveTab(next.id);
    // The newly selected tab is the only one with tabIndex 0, so move focus onto it.
    const root = event.currentTarget.getRootNode() as Document | ShadowRoot;
    (root.getElementById?.(`xray-tab-${next.id}`) as HTMLElement | null)?.focus();
  }

  // Below a 620px container the tab strip scrolls, so the active tab can sit outside
  // the visible box after a keyboard move or a programmatic setActiveTab. Bring it
  // back into view whenever it changes; at wider widths nothing overflows and this is
  // a no-op.
  //
  // Scoped through the tablist ref rather than `document`: the panel mounts in a
  // closed shadow root, so a document-level lookup finds nothing there.
  const tablistRef = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    const list = tablistRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>(`#xray-tab-${activeTab}`);
    active?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [activeTab]);

  // A custom theme is applied purely as inline CSS variables on this element, so
  // it stays scoped to the panel and never affects the host page or the runtime.
  const customVars = settings.theme === 'custom' ? buildCustomThemeVars(settings.customTheme) : {};

  return (
    <div
      className={`xray-panel xray-mode-${mode} ${dockable ? `xray-dock-${dockSide}` : ''} xray-theme-${settings.theme} xray-density-${settings.density} xray-font-${settings.font} ${settings.glow ? 'xray-glow' : 'xray-no-glow'} ${settings.hacker ? 'xray-hacker' : ''} ${open ? 'xray-open' : ''} ${devtoolsMode ? 'xray-devtools' : ''} ${settings.compactRows ? 'xray-compact-rows' : ''}`}
      style={{ '--xray-accent': resolveAccentValue(settings), '--xray-font': PANEL_FONT_VALUES[settings.font], '--xray-radius': `${settings.radius}px`, '--xray-panel-width': `${appliedWidth}px`, ...customVars } as React.CSSProperties}
    >
      {dockable && (
        // `resize` is a ref, so mutating it never re-renders — reading it here meant the
        // dragging class only appeared when some unrelated state change happened to
        // re-render. `dragWidth` is the state counterpart, set on pointer-down and
        // cleared on commit, so it tracks the drag exactly.
        <div
          className={`xray-resize-handle ${dragWidth !== null ? 'dragging' : ''}`}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panel - drag, or use arrow keys"
          aria-valuenow={appliedWidth}
          aria-valuemin={PANEL_WIDTH_MIN}
          aria-valuemax={maxPanelWidth()}
          tabIndex={0}
          onPointerDown={onResizePointerDown}
          onPointerMove={onResizePointerMove}
          onPointerUp={commitResize}
          onPointerCancel={commitResize}
          onKeyDown={onResizeKeyDown}
          onDoubleClick={resetWidth}
          title="Drag to resize · double-click to reset"
        />
      )}
      <header className="xray-topbar">
        <div className="xray-brand xray-drag-handle">
          <span className="xray-brand-mark"><IconTerminal2 size={18} stroke={2} /></span>
          {/*
            The product's name, not the name of one of its five tabs. This said
            CONSOLE, which put the word in the header, in the tab bar and on the
            Console workspace's own sub-tab — three things a screenshot cannot tell
            apart — while the name PRODUCT.md lists as a brand commitment appeared
            nowhere in the shell.
          */}
          <span>XRAY</span>
          <span className="xray-brand-ver" title={`XRAY ${XRAY_VERSION} · built ${XRAY_BUILD}`}>v{XRAY_VERSION}</span>
          <span className={`xray-live-dot ${open ? 'on' : ''}`} />
        </div>
        {/*
          A real tablist. These were plain buttons, so the active tab was conveyed by a
          CSS class alone and a screen reader announced neither which tab was selected
          nor how many there were. Roving tabindex plus arrow keys is the expected
          pattern: the group is one tab stop, and arrows move within it.
        */}
        <nav className="xray-tabs" role="tablist" aria-label="XRAY panel tabs" ref={tablistRef}>
          {panelTabs.map((tab) => (
            <button
              key={tab.id}
              id={`xray-tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls="xray-tabpanel"
              tabIndex={activeTab === tab.id ? 0 : -1}
              // Below a 560px container the label span is hidden and the tab is its
              // icon alone, so the accessible name has to live on the button itself.
              aria-label={tab.label}
              className={`xray-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => onTabKeyDown(event, tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.id === 'api' && apiCount > 0 && <span className="xray-badge">{apiCount}</span>}
              {tab.id === 'logs' && logCount > 0 && <span className="xray-badge">{logCount}</span>}
            </button>
          ))}
        </nav>
        {/*
          No spacer element here. One used to sit between the tablist and this
          summary with `flex: 1`, which is the same growth contract the tablist has —
          so the two split the leftover space and, once the eight trailing buttons had
          taken theirs, the tablist's share was zero. The summary pushes itself right
          with `margin-left: auto` instead, which costs no flex child.
        */}
        <div className="xray-summary">{apiCount} APIs · {errorCount} {errorCount === 1 ? 'Error' : 'Errors'} · {formatBytes(totalBytes)}</div>
        <div className="xray-mode-switcher" aria-label="XRAY display mode">
          <button className={`xray-icon-btn ${mode === 'devtools' ? 'active' : ''}`} title="Open in DevTools" aria-label="Open in DevTools" onClick={openDevtoolsHint}>
            <IconDeviceLaptop {...modeIconProps} />
          </button>
          <button className={`xray-icon-btn ${mode === 'hud' ? 'active' : ''}`} title="Float over page" aria-label="Float over page" onClick={toggleHud}>
            <IconPictureInPicture {...modeIconProps} />
          </button>
          <button className={`xray-icon-btn ${mode === 'window' ? 'active' : ''}`} title="Open in separate window" aria-label="Open in separate window" onClick={openWindow}>
            <IconArrowsMaximize {...modeIconProps} />
          </button>
        </div>
        <ThemeSwitcher />
        <button className="xray-icon-btn" aria-label="Open export modal" onClick={() => setExportOpen(true)}><IconDownload size={16} stroke={1.8} /></button>
        <button className="xray-icon-btn" aria-label="Open settings" onClick={() => setSettingsOpen(true)}><IconSettings size={16} stroke={1.8} /></button>
        {dockable && (
          <div className="xray-dock-controls" aria-label="Panel position">
            <button
              className="xray-icon-btn"
              title={dockSide === 'right' ? 'Dock to left edge' : 'Dock to right edge'}
              aria-label={dockSide === 'right' ? 'Dock to left edge' : 'Dock to right edge'}
              onClick={toggleDock}
            >
              {dockSide === 'right' ? <IconLayoutSidebarLeftExpand {...modeIconProps} /> : <IconLayoutSidebarRightExpand {...modeIconProps} />}
            </button>
            <button className="xray-icon-btn xray-close-btn" title="Close panel (Esc)" aria-label="Close panel" onClick={closePanel}>
              <IconX {...modeIconProps} />
            </button>
          </div>
        )}
      </header>
      <main className="xray-body" id="xray-tabpanel" role="tabpanel" aria-labelledby={`xray-tab-${activeTab}`}>
        {children}
      </main>
      {/*
        The live region is always mounted, and only its contents change. Injecting a
        region together with its first message is unreliably announced - assistive tech
        has to be observing the region before the text lands in it.
      */}
      <div className="xray-toast-region" role="status" aria-live="polite" aria-atomic="true">
        {toastMessage && (
          <button
            className="xray-toast"
            onClick={clearToast}
            onMouseEnter={() => setToastPaused(true)}
            onMouseLeave={() => setToastPaused(false)}
            onFocus={() => setToastPaused(true)}
            onBlur={() => setToastPaused(false)}
            aria-label="Dismiss notification"
          >
            {toastMessage}
          </button>
        )}
      </div>
    </div>
  );
}
