/* ============================================================
   VitalHub — Brand design system (forest green + sage cream)
   Dual theme: dark (default) + light, via :root[data-theme]
   Brand: forest #29422C · sage cream #E0E2C4 · accent #3E8E5A
   ============================================================ */
:root, :root[data-theme="dark"] {
  --bg:        #0E130D;
  --surface-1: #151B13;
  --surface-2: #1E261B;
  --surface-3: #283021;
  --border:    rgba(224,226,196,0.10);
  --border-2:  rgba(224,226,196,0.17);
  --text:      #E9EBD8;
  --text-2:    #AAB39C;
  --text-3:    #717B67;
  --shadow:    0 4px 24px rgba(0,0,0,0.42);
  --shadow-lg: 0 16px 48px rgba(0,0,0,0.58);
  --scrim:     rgba(6,9,5,0.6);
  --overlay:   rgba(224,226,196,0.05);   /* subtle light-on-dark wash */
  --overlay-2: rgba(224,226,196,0.09);
  --logo-ink:  #E6E8CC;                   /* logo tint on dark */
}
:root[data-theme="light"] {
  --bg:        #F1F2E7;
  --surface-1: #FBFBF4;
  --surface-2: #EAEDDD;
  --surface-3: #DFE2CF;
  --border:    rgba(41,66,44,0.13);
  --border-2:  rgba(41,66,44,0.22);
  --text:      #1B2719;
  --text-2:    #4C5847;
  --text-3:    #7C866F;
  --shadow:    0 4px 20px rgba(41,66,44,0.10);
  --shadow-lg: 0 16px 44px rgba(41,66,44,0.18);
  --scrim:     rgba(41,66,44,0.32);
  --overlay:   rgba(41,66,44,0.05);
  --overlay-2: rgba(41,66,44,0.09);
  --logo-ink:  #243A26;                   /* logo tint on light */
}
:root {
  /* brand + semantic colors (shared across themes) */
  --brand:     #29422C;   /* deep forest (logo bg) */
  --sage:      #E0E2C4;   /* cream/sage (logo wordmark) */
  --blue:      #3E8E5A;   /* ACCENT — forest green (brand-primary) */
  --blue-hover:#347C4D;
  --accent:    #3E8E5A;
  --accent-hover: #347C4D;
  --status-novo: #3B82F6; /* keep a real blue ONLY for status "Novo" */
  --lime:      #C2D92E;   /* spark accent (tennis-ball lime) */
  --lime-deep: #A9C022;
  --lime-soft: rgba(194,217,46,0.16);
  --green:     #10B981;
  --red:       #EF4444;
  --amber:     #F59E0B;
  --purple:    #8B5CF6;
  --cyan:      #06B6D4;
  --wa:        #25D366;
  --r:         14px;
  --r-sm:      9px;
  --sidebar-w: 248px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  transition: background 0.3s ease, color 0.3s ease;
}
#root { height: 100%; }
.mono { font-family: 'Space Mono', monospace; font-feature-settings: "tnum"; }
.brand-serif { font-family: 'DM Serif Display', Georgia, 'Times New Roman', serif; font-weight: 400; }
::selection { background: color-mix(in srgb, var(--accent) 30%, transparent); }

/* scrollbars */
*::-webkit-scrollbar { width: 10px; height: 10px; }
*::-webkit-scrollbar-thumb { background: var(--overlay-2); border-radius: 8px; border: 2px solid transparent; background-clip: padding-box; }
*::-webkit-scrollbar-thumb:hover { background: var(--border-2); background-clip: padding-box; }

/* ============================================================ Layout */
.app-shell { display: flex; height: 100vh; overflow: hidden; }
.main-area { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.main-scroll { flex: 1; overflow-y: auto; overflow-x: hidden; }
.screen-pad { padding: 28px 32px 48px; max-width: 1500px; }
.fade-in { animation: fadeIn 0.32s ease both; }
@keyframes fadeIn { from { transform: translateY(7px); } to { transform: none; } }

/* ============================================================ Sidebar */
.sidebar {
  width: var(--sidebar-w); flex-shrink: 0; background: var(--surface-1);
  border-right: 1px solid var(--border); display: flex; flex-direction: column;
  transition: width 0.24s ease;
}
.sidebar-collapsed { width: 72px; }
.sidebar-brand { display: flex; align-items: center; gap: 11px; padding: 22px 22px; height: 76px; }
.brand-mark {
  width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
  background: var(--brand);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(41,66,44,0.4);
}
.brand-mark-logo {
  width: 22px; height: 24px; display: block; background-color: var(--sage);
  -webkit-mask: url(assets/vitalhub-mark.png) no-repeat center / contain;
  mask: url(assets/vitalhub-mark.png) no-repeat center / contain;
}
.brand-lockup {
  height: 30px; width: 158px; background-color: var(--logo-ink);
  -webkit-mask: url(assets/vitalhub-logo.png) no-repeat left center / contain;
  mask: url(assets/vitalhub-logo.png) no-repeat left center / contain;
}

.sidebar-nav { flex: 1; padding: 14px 12px; display: flex; flex-direction: column; gap: 3px; }
.nav-item {
  position: relative; display: flex; align-items: center; gap: 12px; width: 100%;
  padding: 11px 13px; border: none; background: none; color: var(--text-3);
  border-radius: var(--r-sm); cursor: pointer; font-size: 14px; font-weight: 500;
  font-family: inherit; transition: all 0.18s ease; text-align: left;
}
.nav-item:hover { background: var(--surface-2); color: var(--text-2); }
.nav-item-active { background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--blue); }
.nav-item-active:hover { background: color-mix(in srgb, var(--accent) 18%, transparent); color: var(--blue); }
.nav-indicator { position: absolute; left: -12px; top: 50%; transform: translateY(-50%); width: 3px; height: 20px; background: var(--blue); border-radius: 0 3px 3px 0; }
.sidebar-collapsed .nav-item { justify-content: center; }

.sidebar-footer { padding: 12px; border-top: 1px solid var(--border); }
.user-chip { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: var(--r-sm); }
.user-chip:hover { background: var(--surface-2); }
.user-chip-info { flex: 1; min-width: 0; }
.user-chip-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-chip-role { font-size: 11.5px; color: var(--text-3); }
.sidebar-collapsed .user-chip { justify-content: center; }

/* ============================================================ Page header */
.page-header {
  height: 72px; flex-shrink: 0; padding: 0 32px; display: flex; align-items: center;
  justify-content: space-between; border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg) 80%, transparent); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 20;
}
.page-header-left { display: flex; align-items: center; gap: 14px; }
.page-title { font-size: 23px; font-weight: 400; letter-spacing: -0.01em; font-family: 'DM Serif Display', Georgia, serif; }
.page-subtitle { font-size: 12.5px; color: var(--text-3); margin-top: 1px; }
.page-header-actions { display: flex; align-items: center; gap: 10px; }
.sidebar-toggle { display: none; }
.header-bell { position: relative; }
.bell-dot { position: absolute; top: 7px; right: 8px; width: 7px; height: 7px; background: var(--red); border-radius: 50%; border: 2px solid var(--surface-1); }

/* ============================================================ Buttons */
.icon-btn {
  display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px;
  border-radius: var(--r-sm); border: 1px solid var(--border); background: var(--surface-1);
  color: var(--text-2); cursor: pointer; transition: all 0.18s ease;
}
.icon-btn:hover { background: var(--surface-2); color: var(--text); border-color: var(--border-2); }
.btn {
  display: inline-flex; align-items: center; gap: 7px; padding: 9px 15px; border-radius: var(--r-sm);
  font-family: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer; border: 1px solid transparent;
  transition: all 0.18s ease; white-space: nowrap;
}
.btn-sm { padding: 6px 12px; font-size: 12.5px; }
.btn-block { width: 100%; justify-content: center; }
.btn-primary { background: var(--blue); color: #fff; box-shadow: 0 4px 12px color-mix(in srgb, var(--accent) 28%, transparent); }
.btn-primary:hover { background: var(--blue-hover); }
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
.btn-ghost { background: var(--surface-2); color: var(--text-2); border-color: var(--border); }
.btn-ghost:hover { background: var(--surface-3); color: var(--text); border-color: var(--border-2); }
.btn-danger { background: rgba(239,68,68,0.12); color: var(--red); border-color: rgba(239,68,68,0.28); }
.btn-danger:hover { background: var(--red); color: #fff; border-color: var(--red); }

/* ============================================================ Badges */
.badge {
  display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px;
  font-size: 12px; font-weight: 600; line-height: 1; white-space: nowrap;
}
.badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.badge-pulse .badge-dot { animation: pulse 1.6s ease-in-out infinite; }
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 var(--badge-color); opacity: 1; }
  50% { box-shadow: 0 0 0 4px transparent; opacity: 0.7; }
}

.seg-tag { display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; color: var(--text-2); font-weight: 500; white-space: nowrap; }
.seg-dot { width: 7px; height: 7px; border-radius: 2px; flex-shrink: 0; }

/* ============================================================ Panels */
.panel { background: var(--surface-1); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--shadow); overflow: hidden; }
.panel-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 18px 20px; border-bottom: 1px solid var(--border); }
.panel-title { font-size: 16px; font-weight: 400; letter-spacing: -0.005em; font-family: 'DM Serif Display', Georgia, serif; }
.panel-subtitle { font-size: 12.5px; color: var(--text-3); margin-top: 2px; }
.panel-body { padding: 20px; }

/* ============================================================ KPIs */
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 22px; }
.kpi-card { position: relative; background: var(--surface-1); border: 1px solid var(--border); border-radius: var(--r); padding: 20px; box-shadow: var(--shadow); transition: border-color 0.2s ease, transform 0.2s ease; overflow: hidden; }
.kpi-card::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--lime); opacity: 0; transition: opacity 0.2s ease; }
.kpi-card:hover { border-color: var(--border-2); transform: translateY(-2px); }
.kpi-card:hover::before { opacity: 1; }
.kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.kpi-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.kpi-delta { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 700; font-family: 'Space Mono', monospace; padding: 3px 7px; border-radius: 6px; }
.kpi-delta.up { color: var(--green); background: rgba(16,185,129,0.12); }
.kpi-delta.down { color: var(--red); background: rgba(239,68,68,0.12); }
.kpi-value { font-size: 36px; font-weight: 400; font-family: 'DM Serif Display', Georgia, serif; letter-spacing: -0.01em; line-height: 1; }
.kpi-suffix { font-size: 20px; color: var(--text-3); margin-left: 1px; font-family: 'DM Serif Display', Georgia, serif; }
.kpi-label { font-size: 13px; color: var(--text-3); margin-top: 7px; }

/* ============================================================ Dashboard grid */
.dash-grid { display: grid; grid-template-columns: 1.05fr 1fr; gap: 18px; align-items: start; }

.activity-list { display: flex; flex-direction: column; }
.activity-row { display: flex; align-items: flex-start; gap: 12px; padding: 13px 20px; border: none; background: none; cursor: pointer; text-align: left; width: 100%; border-bottom: 1px solid var(--border); transition: background 0.16s ease; }
.activity-row:last-child { border-bottom: none; }
.activity-row:hover { background: var(--surface-2); }
.activity-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
.activity-main { flex: 1; min-width: 0; }
.activity-line1 { display: flex; align-items: center; gap: 8px; }
.activity-empresa { font-size: 13.5px; font-weight: 600; color: var(--text); }
.activity-type { font-size: 11.5px; font-weight: 600; }
.activity-note { font-size: 12.5px; color: var(--text-3); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.activity-date { font-size: 11.5px; color: var(--text-3); font-family: 'Space Mono', monospace; flex-shrink: 0; margin-top: 2px; }

/* ============================================================ Chart tooltip */
.chart-tip { background: var(--surface-3); border: 1px solid var(--border-2); border-radius: 8px; padding: 9px 11px; box-shadow: var(--shadow-lg); }
.chart-tip-label { font-size: 12px; font-weight: 700; margin-bottom: 5px; }
.chart-tip-row { display: flex; align-items: center; gap: 7px; font-size: 12px; padding: 1px 0; }
.chart-tip-dot { width: 8px; height: 8px; border-radius: 50%; }
.chart-tip-name { color: var(--text-2); }
.chart-tip-val { margin-left: auto; font-weight: 700; font-family: 'Space Mono', monospace; }

/* ============================================================ Filter bar */
.filter-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
.search-input { position: relative; flex: 1; min-width: 240px; max-width: 360px; }
.search-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--text-3); pointer-events: none; }
.search-input input { width: 100%; padding: 10px 14px 10px 38px; background: var(--surface-1); border: 1px solid var(--border); border-radius: var(--r-sm); color: var(--text); font-family: inherit; font-size: 13.5px; transition: border-color 0.18s ease; }
.search-input input:focus { outline: none; border-color: var(--blue); }
.search-input input::placeholder { color: var(--text-3); }
.filter-count { margin-left: auto; font-size: 12.5px; color: var(--text-3); font-family: 'Space Mono', monospace; }
.export-btn { white-space: nowrap; }
.export-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.import-icon-flip { transform: rotate(180deg); }

/* ============================================================ Import modal */
.import-drop { display: flex; align-items: center; gap: 14px; padding: 18px; border: 1.5px dashed var(--border-2); border-radius: var(--r); background: var(--surface-2); cursor: pointer; transition: all 0.18s ease; }
.import-drop:hover { border-color: var(--blue); background: var(--surface-3); }
.import-drop-icon { width: 42px; height: 42px; flex-shrink: 0; border-radius: 11px; background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--blue); display: flex; align-items: center; justify-content: center; }
.import-drop-icon svg { transform: rotate(180deg); }
.import-drop-text { display: flex; flex-direction: column; gap: 2px; }
.import-drop-text strong { font-size: 14px; font-weight: 600; }
.import-drop-text span { font-size: 12.5px; color: var(--text-3); }
.import-help { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 12.5px; color: var(--text-3); line-height: 1.5; flex-wrap: wrap; }
.import-help strong { color: var(--text-2); font-weight: 600; }
.import-summary { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.import-stat { font-size: 13.5px; color: var(--text-2); }
.import-stat strong { font-size: 16px; color: var(--text); }
.import-stat.muted { font-size: 12.5px; color: var(--text-3); }
.import-preview { border: 1px solid var(--border); border-radius: var(--r-sm); overflow: hidden; }
.import-preview .data-table thead th { padding: 9px 12px; }
.import-preview .data-table tbody td { padding: 9px 12px; font-size: 12.5px; }
.import-more { padding: 9px 12px; font-size: 12px; color: var(--text-3); background: var(--surface-2); border-top: 1px solid var(--border); }

.select-wrap { position: relative; }
.select { appearance: none; padding: 10px 34px 10px 13px; background: var(--surface-1); border: 1px solid var(--border); border-radius: var(--r-sm); color: var(--text); font-family: inherit; font-size: 13px; cursor: pointer; transition: border-color 0.18s ease; }
.select:focus { outline: none; border-color: var(--blue); }
.select-chevron { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); color: var(--text-3); pointer-events: none; }
.select option { background: var(--surface-2); color: var(--text); }

/* ============================================================ Table */
.table-wrap { background: var(--surface-1); border: 1px solid var(--border); border-radius: var(--r); overflow: hidden; box-shadow: var(--shadow); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table thead th { text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-3); padding: 13px 16px; border-bottom: 1px solid var(--border); background: var(--surface-1); white-space: nowrap; }
.data-table thead th.num, .data-table td.num { text-align: right; }
.data-table tbody td { padding: 13px 16px; border-bottom: 1px solid var(--border); font-size: 13.5px; vertical-align: middle; }
.data-table tbody tr:last-child td { border-bottom: none; }
.data-row { cursor: pointer; transition: background 0.14s ease; }
.data-row:hover { background: var(--surface-2); }
.col-num { width: 44px; color: var(--text-3); font-size: 12.5px; }
.col-check { width: 40px; text-align: center; padding-left: 16px !important; padding-right: 0 !important; }
.lead-check { width: 19px; height: 19px; border-radius: 5px; border: 1.5px solid var(--border-2); background: var(--surface-2); cursor: pointer; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; color: #fff; transition: all 0.14s ease; vertical-align: middle; }
.lead-check:hover { border-color: var(--blue); }
.lead-check.checked, .lead-check.indet { background: var(--blue); border-color: var(--blue); }
.check-dash { width: 9px; height: 2px; background: #fff; border-radius: 1px; }
.data-table thead th.col-check { vertical-align: middle; }
.row-selected { background: color-mix(in srgb, var(--accent) 9%, transparent); }
.row-selected:hover { background: color-mix(in srgb, var(--accent) 13%, transparent); }
.cell-empresa { display: flex; flex-direction: column; gap: 2px; }
.cell-empresa-name { font-weight: 600; color: var(--text); display: inline-flex; align-items: center; gap: 8px; }
.reply-badge { display: inline-flex; align-items: center; gap: 3px; font-size: 10.5px; font-weight: 700; font-family: 'Space Mono', monospace; color: #052e16; background: #25D366; padding: 1px 7px 1px 5px; border-radius: 999px; line-height: 1.5; }
.cell-empresa-cnpj { font-size: 11px; color: var(--text-3); }
.cell-resp { display: flex; align-items: center; gap: 9px; color: var(--text-2); white-space: nowrap; }
.cell-muted { color: var(--text-3); }
.cell-action-text { color: var(--text-2); font-size: 12.5px; max-width: 200px; }
.col-actions { width: 1%; text-align: right; }
.row-actions { display: flex; align-items: center; gap: 6px; justify-content: flex-end; }
.row-detail-btn { padding: 6px 12px; border-radius: 7px; border: 1px solid var(--border-2); background: var(--surface-2); color: var(--text-2); font-family: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.16s ease; opacity: 0; }
.data-row:hover .row-detail-btn { opacity: 1; }
.row-detail-btn:hover { background: var(--blue); color: #fff; border-color: var(--blue); }
.row-trash { width: 30px; height: 30px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 7px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text-3); cursor: pointer; opacity: 0; transition: all 0.16s ease; }
.data-row:hover .row-trash { opacity: 1; }
.row-trash:hover { background: rgba(239,68,68,0.14); color: var(--red); border-color: rgba(239,68,68,0.3); }
.empty-row { text-align: center; color: var(--text-3); padding: 40px !important; }

/* ============================================================ Pagination */
.pagination { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; }
.pagination-info { font-size: 12.5px; color: var(--text-3); }
.pagination-controls { display: flex; align-items: center; gap: 6px; }
.page-btn { min-width: 34px; height: 34px; padding: 0 8px; border-radius: var(--r-sm); border: 1px solid var(--border); background: var(--surface-1); color: var(--text-2); font-family: 'Space Mono', monospace; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.16s ease; }
.page-btn:hover:not(:disabled) { background: var(--surface-2); color: var(--text); }
.page-btn-active { background: var(--blue); color: #fff; border-color: var(--blue); }
.page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* ============================================================ Drawer */
.drawer-root { position: fixed; inset: 0; z-index: 100; pointer-events: none; }
.drawer-root.open { pointer-events: auto; }
.drawer-scrim { position: absolute; inset: 0; background: var(--scrim); opacity: 0; transition: opacity 0.28s ease; backdrop-filter: blur(2px); }
.drawer-root.open .drawer-scrim { opacity: 1; }
.drawer-panel { position: absolute; top: 0; right: 0; height: 100%; background: var(--surface-1); border-left: 1px solid var(--border); box-shadow: var(--shadow-lg); transform: translateX(100%); transition: transform 0.32s cubic-bezier(0.4,0,0.2,1); display: flex; flex-direction: column; max-width: 92vw; }
.drawer-root.open .drawer-panel { transform: translateX(0); }

.lead-detail { display: flex; flex-direction: column; height: 100%; }
.drawer-head { padding: 22px 24px 18px; border-bottom: 1px solid var(--border); }
.drawer-head-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.drawer-empresa { font-size: 23px; font-weight: 400; letter-spacing: -0.01em; font-family: 'DM Serif Display', Georgia, serif; }
.drawer-status-row { display: flex; align-items: center; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
.drawer-valor { margin-left: auto; font-size: 15px; font-weight: 700; color: var(--green); }
.drawer-valor small { color: var(--text-3); font-weight: 400; font-size: 11px; }
.drawer-body { flex: 1; overflow-y: auto; padding: 22px 24px; }
.drawer-foot { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: space-between; align-items: center; }
.drawer-foot-right { display: flex; gap: 10px; }

.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: var(--r-sm); overflow: hidden; margin-bottom: 22px; }
.detail-item { background: var(--surface-1); padding: 12px 14px; display: flex; flex-direction: column; gap: 5px; }
.detail-k { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }
.detail-v { font-size: 13.5px; color: var(--text); font-weight: 500; }
.detail-rep { display: flex; align-items: center; gap: 8px; }

.detail-section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-3); margin: 4px 0 12px; }
.add-interaction { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-sm); padding: 14px; margin-bottom: 24px; }
.add-int-types { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 11px; }
.int-type { display: inline-flex; align-items: center; gap: 5px; padding: 6px 11px; border-radius: 7px; border: 1px solid var(--border); background: var(--surface-1); color: var(--text-3); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.16s ease; }
.int-type:hover { color: var(--text-2); border-color: var(--border-2); }

.textarea, .input { width: 100%; padding: 10px 13px; background: var(--surface-1); border: 1px solid var(--border); border-radius: var(--r-sm); color: var(--text); font-family: inherit; font-size: 13.5px; resize: vertical; transition: border-color 0.18s ease; }
.textarea:focus, .input:focus { outline: none; border-color: var(--blue); }
.textarea { margin-bottom: 11px; }
.textarea::placeholder, .input::placeholder { color: var(--text-3); }
input[type="date"].input, input[type="time"].input { color-scheme: dark; }

/* Timeline */
.timeline { position: relative; padding-left: 6px; }
.timeline::before { content: ""; position: absolute; left: 19px; top: 8px; bottom: 8px; width: 1px; background: var(--border); }
.tl-item { display: flex; gap: 14px; padding-bottom: 18px; position: relative; }
.tl-item:last-child { padding-bottom: 0; }
.tl-marker { width: 28px; height: 28px; border-radius: 50%; border: 1px solid; display: flex; align-items: center; justify-content: center; flex-shrink: 0; z-index: 1; background: var(--surface-1); }
.tl-content { flex: 1; padding-top: 2px; }
.tl-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.tl-type { font-size: 12.5px; font-weight: 700; }
.tl-date { font-size: 11px; color: var(--text-3); }
.tl-note { font-size: 13px; color: var(--text-2); margin-top: 4px; line-height: 1.5; }
.tl-note-in { background: linear-gradient(135deg, #128C7E, #075E54); color: #fff; padding: 9px 12px; border-radius: 4px 12px 12px 12px; display: inline-block; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }

/* quick reply box (chat) */
.wa-reply { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
.wa-reply-input { margin-bottom: 0; }
.wa-reply-row { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 10px; }
.wa-reply-send { flex-shrink: 0; }

/* ============================================================ Modal */
.modal-root { position: fixed; inset: 0; z-index: 200; background: var(--scrim); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; padding: 24px; animation: fadeIn 0.2s ease; }
.modal-panel { background: var(--surface-1); border: 1px solid var(--border-2); border-radius: 16px; box-shadow: var(--shadow-lg); max-width: 94vw; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; animation: modalIn 0.24s cubic-bezier(0.34,1.3,0.64,1); }
@keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: none; } }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border); }
.modal-header h3 { font-size: 18px; font-weight: 400; font-family: 'DM Serif Display', Georgia, serif; }
.modal-body { padding: 22px; overflow-y: auto; }
.modal-foot { display: flex; gap: 10px; justify-content: flex-end; margin-top: 22px; }

.form-grid { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 7px; flex: 1; }
.field-row { display: flex; gap: 14px; }
.field-label { font-size: 12px; font-weight: 600; color: var(--text-2); }
.field .select-wrap, .field .select { width: 100%; }

/* ============================================================ Kanban */
.kanban-screen { max-width: none; padding-right: 24px; }
.kanban-board { display: flex; gap: 16px; align-items: flex-start; overflow-x: auto; padding-bottom: 12px; }
.kanban-col { flex: 1; min-width: 256px; background: var(--surface-1); border: 1px solid var(--border); border-radius: var(--r); display: flex; flex-direction: column; transition: border-color 0.2s ease, background 0.2s ease; }
.kanban-col.col-over { border-color: var(--blue); background: color-mix(in srgb, var(--accent) 5%, transparent); }
.kanban-col-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 14px 12px; border-bottom: 1px solid var(--border); }
.kch-left { display: flex; align-items: center; gap: 8px; }
.kch-dot { width: 8px; height: 8px; border-radius: 50%; }
.kch-label { font-size: 13px; font-weight: 700; }
.kch-count { font-size: 11.5px; font-family: 'Space Mono', monospace; font-weight: 700; color: var(--text-3); background: var(--surface-2); padding: 1px 7px; border-radius: 999px; }
.kch-total { font-size: 11.5px; color: var(--text-3); }
.kanban-col-body { padding: 12px; display: flex; flex-direction: column; gap: 10px; min-height: 80px; }

.kanban-card { background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 13px; cursor: grab; transition: border-color 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease; }
.kanban-card:hover { border-color: var(--border-2); transform: translateY(-2px); box-shadow: var(--shadow); }
.kanban-card:active { cursor: grabbing; }
.kanban-card.dragging { opacity: 0.4; }
.kc-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 9px; }
.kc-empresa { font-size: 13.5px; font-weight: 700; line-height: 1.3; }
.kc-seg { margin-bottom: 11px; }
.kc-valor { font-size: 16px; font-weight: 700; color: var(--green); margin-bottom: 11px; }
.kc-valor small { font-size: 11px; color: var(--text-3); font-weight: 400; }
.kc-foot { display: flex; align-items: center; justify-content: space-between; padding-top: 11px; border-top: 1px solid var(--border); }
.kc-days { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--text-3); }
.kanban-drop-hint { border: 1.5px dashed var(--blue); border-radius: 10px; padding: 16px; text-align: center; font-size: 12.5px; color: var(--blue); font-weight: 600; background: color-mix(in srgb, var(--accent) 6%, transparent); }

/* ============================================================ Agenda */
.agenda-grid { display: grid; grid-template-columns: 380px 1fr; gap: 18px; align-items: start; }
.calendar { padding: 18px; }
.cal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.cal-title { font-size: 16px; font-weight: 700; }
.cal-nav { display: flex; gap: 6px; }
.cal-nav .icon-btn { width: 32px; height: 32px; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-weekdays { margin-bottom: 6px; }
.cal-weekday { text-align: center; font-size: 11px; font-weight: 700; color: var(--text-3); text-transform: uppercase; padding: 4px 0; }
.cal-cell { aspect-ratio: 1; border: 1px solid transparent; background: none; border-radius: 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; color: var(--text-2); font-family: 'Space Mono', monospace; font-size: 13px; transition: all 0.14s ease; }
.cal-cell:hover { background: var(--surface-2); }
.cal-empty { cursor: default; }
.cal-today { color: var(--blue); font-weight: 700; }
.cal-selected { background: var(--blue) !important; color: #fff !important; }
.cal-selected .cal-dot { background: #fff !important; }
.cal-dots { display: flex; gap: 2px; height: 4px; }
.cal-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--amber); }

.task-list { display: flex; flex-direction: column; }
.task-row { display: flex; align-items: center; gap: 12px; padding: 13px 20px; border-bottom: 1px solid var(--border); transition: background 0.14s ease; }
.task-row:last-child { border-bottom: none; }
.task-row:hover { background: var(--surface-2); }
.task-done { opacity: 0.55; }
.task-done .task-obs, .task-done .task-lead { text-decoration: line-through; }
.task-check { width: 22px; height: 22px; border-radius: 6px; border: 1.5px solid var(--border-2); background: var(--surface-2); cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #fff; transition: all 0.16s ease; }
.task-check:hover { border-color: var(--green); }
.task-check.checked { background: var(--green); border-color: var(--green); }
.task-hora { font-size: 13px; font-weight: 700; color: var(--text-2); width: 44px; flex-shrink: 0; }
.task-type-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.task-main { flex: 1; min-width: 0; }
.task-line1 { display: flex; align-items: baseline; gap: 6px; }
.task-type { font-size: 13px; font-weight: 700; }
.task-lead { font-size: 12.5px; color: var(--text-2); }
.task-obs { font-size: 12px; color: var(--text-3); margin-top: 2px; }
.task-status { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 999px; flex-shrink: 0; }
.task-status.pending { color: var(--amber); background: rgba(245,158,11,0.12); }
.task-status.done { color: var(--green); background: rgba(16,185,129,0.12); }
.task-trash { width: 30px; height: 30px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 7px; border: 1px solid transparent; background: none; color: var(--text-3); cursor: pointer; opacity: 0; transition: all 0.16s ease; }
.task-row:hover .task-trash { opacity: 1; }
.task-trash:hover { background: rgba(239,68,68,0.14); color: var(--red); border-color: rgba(239,68,68,0.3); }
.empty-state { padding: 60px 20px; text-align: center; color: var(--text-3); display: flex; flex-direction: column; align-items: center; gap: 12px; }

/* ============================================================ Reports */
.reports-top { display: grid; grid-template-columns: 1fr 1.2fr; gap: 18px; margin-bottom: 18px; }
.panel + .panel { margin-top: 18px; }
.reports-top .panel + .panel { margin-top: 0; }
.seg-report { display: flex; align-items: center; gap: 20px; }
.pie-wrap { position: relative; flex-shrink: 0; width: 210px; }
.pie-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
.pie-center-val { font-size: 32px; font-weight: 400; letter-spacing: -0.01em; font-family: 'DM Serif Display', Georgia, serif; }
.pie-center-lbl { font-size: 11.5px; color: var(--text-3); }
.pie-legend { flex: 1; display: flex; flex-direction: column; gap: 11px; }
.legend-row { display: flex; align-items: center; gap: 9px; font-size: 13px; }
.legend-dot { width: 9px; height: 9px; border-radius: 3px; flex-shrink: 0; }
.legend-name { color: var(--text-2); }
.legend-val { margin-left: auto; font-weight: 700; }
.legend-pct { color: var(--text-3); width: 34px; text-align: right; }
.summary-table tbody td { font-size: 13px; }
.summary-total td { font-weight: 700; border-top: 1px solid var(--border-2) !important; background: var(--surface-2); }
.summary-total td:first-child { color: var(--text); }

/* ============================================================ Settings */
.settings-cols { display: grid; grid-template-columns: 1fr 320px; gap: 18px; align-items: start; }
.settings-main { display: flex; flex-direction: column; gap: 18px; }
.settings-side { display: flex; flex-direction: column; gap: 18px; }
.profile-card { display: flex; align-items: center; gap: 18px; }
.profile-info { flex: 1; }
.profile-name { font-size: 20px; font-weight: 400; font-family: 'DM Serif Display', Georgia, serif; }
.profile-role { font-size: 13px; color: var(--text-2); margin-top: 2px; }
.profile-meta { font-size: 12px; color: var(--text-3); margin-top: 5px; }
.settings-list { display: flex; flex-direction: column; }
.settings-row { display: flex; align-items: center; gap: 14px; padding: 16px 20px; border-bottom: 1px solid var(--border); }
.settings-row:last-child { border-bottom: none; }
.settings-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.settings-text { flex: 1; }
.settings-title { font-size: 14px; font-weight: 600; }
.settings-desc { font-size: 12.5px; color: var(--text-3); margin-top: 2px; }
.toggle { width: 44px; height: 25px; border-radius: 999px; border: none; background: var(--surface-3); cursor: pointer; padding: 3px; transition: background 0.2s ease; }
.toggle.on { background: var(--blue); }
.toggle-knob { display: block; width: 19px; height: 19px; border-radius: 50%; background: #fff; transition: transform 0.2s ease; }
.toggle.on .toggle-knob { transform: translateX(19px); }
.conn-badge { font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 999px; }
.conn-badge.on { color: var(--green); background: rgba(16,185,129,0.12); }
.accent-picker { display: flex; gap: 10px; }
.accent-row { display: flex; align-items: center; gap: 14px; }
.accent-current { font-size: 13px; font-weight: 600; color: var(--text-2); }
.accent-swatch { width: 38px; height: 38px; border-radius: 10px; border: 2px solid transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #fff; transition: transform 0.16s ease; }
.accent-swatch:hover { transform: scale(1.08); }
.accent-swatch.active { border-color: var(--text); }
.accent-note { font-size: 11.5px; color: var(--text-3); margin-top: 14px; }
.plan-card { text-align: center; }
.plan-badge { display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; color: var(--blue); background: color-mix(in srgb, var(--accent) 14%, transparent); padding: 5px 14px; border-radius: 999px; }
.plan-price { font-size: 32px; font-weight: 700; margin: 14px 0; }
.plan-price small { font-size: 14px; color: var(--text-3); font-weight: 400; }
.plan-features { list-style: none; text-align: left; display: flex; flex-direction: column; gap: 9px; margin-bottom: 18px; }
.plan-features li { display: flex; align-items: center; gap: 9px; font-size: 13px; color: var(--text-2); }
.plan-features li svg { color: var(--green); flex-shrink: 0; }

/* ============================================================ Responsive */
@media (max-width: 1180px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .dash-grid, .reports-top, .settings-cols { grid-template-columns: 1fr; }
  .agenda-grid { grid-template-columns: 1fr; }
}
@media (max-width: 880px) {
  .sidebar { position: fixed; z-index: 90; height: 100%; transform: translateX(-100%); transition: transform 0.26s ease; width: var(--sidebar-w); }
  .app-shell.collapsed .sidebar { transform: translateX(0); }
  .sidebar-collapsed { width: var(--sidebar-w); }
  .sidebar-collapsed .brand-name, .sidebar-collapsed .nav-item span, .sidebar-collapsed .user-chip-info { display: initial; }
  .sidebar-collapsed .nav-item { justify-content: flex-start; }
  .sidebar-toggle { display: inline-flex; }
  .screen-pad { padding: 20px 18px 40px; }
  .page-header { padding: 0 18px; }
  .kpi-grid { grid-template-columns: 1fr; }
}

/* ============================================================ Bulk select bar */
.bulk-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; padding: 11px 16px; background: color-mix(in srgb, var(--accent) 10%, transparent); border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent); border-radius: var(--r); animation: fadeIn 0.2s ease both; }
.bulk-info { display: flex; align-items: center; gap: 11px; }
.bulk-count { font-size: 13.5px; font-weight: 700; color: var(--blue); }
.bulk-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.bulk-link { background: none; border: none; color: var(--text-2); font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; padding: 0; transition: color 0.16s ease; }
.bulk-link:hover { color: var(--text); text-decoration: underline; }

/* ============================================================ Toasts */
.toast-host { position: fixed; bottom: 24px; right: 24px; z-index: 400; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
.toast { pointer-events: auto; display: flex; align-items: center; gap: 11px; min-width: 240px; max-width: 360px; padding: 12px 14px; background: var(--surface-2); border: 1px solid var(--border-2); border-left: 3px solid var(--tc); border-radius: 10px; box-shadow: var(--shadow-lg); animation: toastIn 0.26s cubic-bezier(0.34,1.3,0.64,1); }
@keyframes toastIn { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: none; } }
.toast-icon { width: 24px; height: 24px; border-radius: 7px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--tc); color: #fff; }
.toast-msg { flex: 1; font-size: 13px; font-weight: 500; color: var(--text); }
.toast-close { background: none; border: none; color: var(--text-3); cursor: pointer; padding: 2px; display: flex; flex-shrink: 0; transition: color 0.16s ease; }
.toast-close:hover { color: var(--text); }

/* ============================================================ Notifications bell */
.bell-wrap { position: relative; }
.bell-count { position: absolute; top: -5px; right: -5px; min-width: 17px; height: 17px; padding: 0 4px; border-radius: 999px; background: var(--red); color: #fff; font-size: 10.5px; font-weight: 700; font-family: 'Space Mono', monospace; display: flex; align-items: center; justify-content: center; border: 2px solid var(--bg); }
.notif-panel { position: absolute; top: calc(100% + 10px); right: 0; width: 340px; background: var(--surface-1); border: 1px solid var(--border-2); border-radius: 14px; box-shadow: var(--shadow-lg); z-index: 300; overflow: hidden; animation: notifIn 0.2s ease; }
@keyframes notifIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
.notif-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--border); }
.notif-title { font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.notif-badge { font-size: 11px; font-family: 'Space Mono', monospace; font-weight: 700; color: var(--blue); background: color-mix(in srgb, var(--accent) 16%, transparent); padding: 1px 7px; border-radius: 999px; }
.notif-mark { background: none; border: none; color: var(--blue); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.notif-mark:hover { text-decoration: underline; }
.notif-list { max-height: 380px; overflow-y: auto; }
.notif-empty { padding: 36px 20px; text-align: center; color: var(--text-3); font-size: 13px; }
.notif-item { display: flex; align-items: flex-start; gap: 11px; padding: 12px 16px; border-bottom: 1px solid var(--border); position: relative; transition: background 0.16s ease; }
.notif-item:last-child { border-bottom: none; }
.notif-item:hover { background: var(--surface-2); }
.notif-item.read { opacity: 0.5; }
.notif-icon { width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.notif-main { flex: 1; min-width: 0; }
.notif-item-title { font-size: 13px; font-weight: 600; }
.notif-item-text { font-size: 12px; color: var(--text-3); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.notif-unread-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--blue); flex-shrink: 0; margin-top: 5px; }

/* ============================================================ Login screen */
.login-screen { height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 50% 28%, color-mix(in srgb, var(--accent) 13%, transparent), transparent 60%); }nt 60%), var(--bg); padding: 24px; overflow-y: auto; }
.login-card { width: 360px; max-width: 92vw; background: var(--surface-1); border: 1px solid var(--border); border-radius: 18px; box-shadow: var(--shadow-lg); padding: 36px 32px; text-align: center; }
.login-wide { width: 460px; }
.login-logo { width: 210px; height: 40px; margin: 4px auto 18px; background-color: var(--logo-ink);
  -webkit-mask: url(assets/vitalhub-logo.png) no-repeat center / contain;
  mask: url(assets/vitalhub-logo.png) no-repeat center / contain; }
.login-sub { font-size: 13.5px; color: var(--text-3); margin: 8px 0 26px; }
.login-btn { padding: 12px; font-size: 14px; }
.login-foot { font-size: 11.5px; color: var(--text-3); margin-top: 20px; }
.login-users { display: flex; flex-direction: column; gap: 10px; text-align: left; }
.login-user { display: flex; align-items: center; gap: 13px; padding: 12px 14px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; cursor: pointer; transition: all 0.16s ease; font-family: inherit; }
.login-user:hover { border-color: var(--blue); background: var(--surface-3); transform: translateY(-1px); }
.login-user-info { flex: 1; min-width: 0; }
.login-user-name { font-size: 14px; font-weight: 600; color: var(--text); }
.login-user-email { font-size: 11.5px; color: var(--text-3); margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.role-badge { text-transform: none; }

/* ============================================================ Users screen */
.users-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; flex-wrap: wrap; row-gap: 12px; }
.users-summary { display: flex; gap: 18px; flex-wrap: nowrap; white-space: nowrap; }
.role-stat { display: flex; align-items: center; gap: 8px; }
.role-stat-dot { width: 9px; height: 9px; border-radius: 50%; }
.role-stat-count { font-size: 18px; font-weight: 700; letter-spacing: -0.02em; }
.role-stat-label { font-size: 13px; color: var(--text-3); }
.user-cell-name { font-weight: 600; color: var(--text); display: flex; align-items: center; gap: 8px; }
.me-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--blue); background: color-mix(in srgb, var(--accent) 16%, transparent); padding: 2px 7px; border-radius: 999px; }
.row-trash:disabled { opacity: 0.25; cursor: not-allowed; }
.row-trash:disabled:hover { background: var(--surface-2); color: var(--text-3); border-color: var(--border); }
.role-hint { display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: var(--text-3); padding: 11px 13px; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-sm); }

/* form required asterisk */
.req { color: var(--red); }

/* ============================================================ Supabase / auth additions */
/* boot splash */
.boot-splash { display: flex; flex-direction: column; align-items: center; gap: 18px; }
.boot-spinner { width: 30px; height: 30px; border-radius: 50%; border: 3px solid var(--border-2); border-top-color: var(--blue); animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.boot-label { font-size: 13px; color: var(--text-3); }

/* auth form (remote login) */
.auth-form { display: flex; flex-direction: column; gap: 14px; text-align: left; margin-top: 8px; }
.auth-form .field-label { font-size: 12px; }
.auth-msg { font-size: 12.5px; font-weight: 600; padding: 9px 12px; border-radius: var(--r-sm); }
.auth-msg.err { color: var(--red); background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25); }
.auth-msg.ok { color: var(--green); background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); }
.auth-switch { background: none; border: none; color: var(--blue); font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; margin-top: 16px; }
.auth-switch:hover { text-decoration: underline; }

/* info banner */
.info-banner { display: flex; align-items: flex-start; gap: 10px; padding: 12px 15px; margin-bottom: 16px; background: color-mix(in srgb, var(--accent) 10%, transparent); border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent); border-radius: var(--r); font-size: 13px; color: var(--text-2); line-height: 1.5; }
.info-banner svg { color: var(--blue); flex-shrink: 0; margin-top: 2px; }
.info-banner strong { color: var(--text); font-weight: 600; }

/* profile extras */
.profile-role-row { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
.profile-mode { font-size: 11.5px; color: var(--text-3); }

/* sync status */
.sync-status { display: flex; align-items: flex-start; gap: 12px; }
.sync-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--green); flex-shrink: 0; margin-top: 5px; box-shadow: 0 0 0 0 var(--green); animation: pulse 1.8s ease-in-out infinite; }
.sync-title { font-size: 13.5px; font-weight: 600; color: var(--text); margin-bottom: 3px; }

/* supabase connect panel */
.sb-steps { display: flex; flex-direction: column; gap: 9px; }
.sb-step { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--text-2); }
.sb-step-n { width: 21px; height: 21px; flex-shrink: 0; border-radius: 50%; background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--blue); font-size: 11.5px; font-weight: 700; font-family: 'Space Mono', monospace; display: flex; align-items: center; justify-content: center; }
.sb-step strong { color: var(--text); font-weight: 600; }
.sb-actions { display: flex; gap: 10px; justify-content: flex-end; }
.sb-url { font-size: 12px; color: var(--text-2); padding: 9px 12px; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-sm); word-break: break-all; }
.input.mono { font-size: 12.5px; }
.field-hint { font-size: 11.5px; color: var(--text-3); margin-top: 5px; }
.field-hint.err { color: var(--amber); }
.field-hint strong { color: var(--text-2); font-weight: 600; }

/* ============================================================ WhatsApp */
:root { --wa: #25D366; --wa-dark: #1da851; }
.btn-wa { background: var(--wa); color: #052e16; border-color: var(--wa); font-weight: 700; }
.btn-wa:hover { background: var(--wa-dark); color: #fff; }
.drawer-wa-btn { margin-top: 14px; justify-content: center; }
.conn-badge.off { color: var(--amber); background: rgba(245,158,11,0.12); }

.wa-mode { display: flex; align-items: flex-start; gap: 9px; padding: 11px 13px; border-radius: var(--r-sm); font-size: 12.5px; line-height: 1.5; }
.wa-mode svg { flex-shrink: 0; margin-top: 1px; }
.wa-mode.sim { background: rgba(245,158,11,0.10); border: 1px solid rgba(245,158,11,0.25); color: var(--text-2); }
.wa-mode.sim svg { color: var(--amber); }
.wa-mode.live { background: rgba(37,211,102,0.10); border: 1px solid rgba(37,211,102,0.3); color: var(--text-2); }
.wa-mode.live svg { color: var(--wa); }
.wa-mode strong { color: var(--text); font-weight: 600; }

.wa-vars { font-family: 'Space Mono', monospace; font-size: 10.5px; color: var(--text-3); font-weight: 400; margin-left: 6px; }
.wa-preview { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-sm); padding: 13px; }
.wa-preview-label { font-size: 11.5px; color: var(--text-3); margin-bottom: 8px; }
.wa-preview-label strong { color: var(--text-2); }
.wa-bubble { background: #075E54; background: linear-gradient(135deg, #128C7E, #075E54); color: #fff; padding: 10px 13px; border-radius: 4px 12px 12px 12px; font-size: 13px; line-height: 1.45; white-space: pre-wrap; box-shadow: 0 2px 8px rgba(0,0,0,0.25); }

.wa-auto-tpl { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px; }
.wa-auto-tpl .field-label { margin-bottom: 2px; }
.wa-check-row { display: flex; align-items: center; gap: 11px; font-size: 13px; color: var(--text-2); line-height: 1.4; }
.wa-check-row strong { color: var(--text); }

.wa-tpl-list { display: flex; flex-direction: column; gap: 10px; }
.wa-tpl { display: flex; gap: 12px; align-items: flex-start; padding: 13px; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-sm); }
.wa-tpl-main { flex: 1; min-width: 0; }
.wa-tpl-head { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; margin-bottom: 6px; }
.wa-tpl-name { font-size: 13.5px; font-weight: 700; }
.wa-tpl-body { font-size: 12.5px; color: var(--text-3); line-height: 1.5; }
.wa-tpl-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.wa-chip { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--wa); background: rgba(37,211,102,0.14); padding: 2px 7px; border-radius: 999px; }
.wa-chip-meta { display: inline-flex; align-items: center; gap: 3px; color: var(--wa); background: rgba(37,211,102,0.16); }
.wa-chip-free { color: var(--amber); background: rgba(245,158,11,0.14); text-transform: none; letter-spacing: 0; }
.wa-share { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
.wa-share-text { display: flex; flex-direction: column; gap: 2px; }
.wa-share-text strong { font-size: 13px; font-weight: 700; }
.wa-share-text span { font-size: 12px; color: var(--text-3); line-height: 1.4; }
.wa-test { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
.wa-test-row { display: flex; gap: 10px; margin-top: 7px; }
.wa-test-row .input { flex: 1; }

/* interval selector */
.wa-interval { padding-bottom: 16px; margin-bottom: 4px; border-bottom: 1px solid var(--border); }
.wa-interval-head { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
.wa-interval-opts { display: flex; flex-wrap: wrap; gap: 8px; }
.wa-int-opt { padding: 7px 13px; border-radius: var(--r-sm); border: 1px solid var(--border); background: var(--surface-2); color: var(--text-2); font-family: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all 0.16s ease; }
.wa-int-opt:hover { border-color: var(--border-2); color: var(--text); }
.wa-int-opt.active { background: var(--amber); border-color: var(--amber); color: #1a1206; }

/* floating queue bar */
.wa-queue-bar { position: fixed; left: 24px; bottom: 24px; z-index: 350; display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: var(--surface-2); border: 1px solid var(--border-2); border-left: 3px solid var(--wa); border-radius: 12px; box-shadow: var(--shadow-lg); min-width: 230px; animation: toastIn 0.26s cubic-bezier(0.34,1.3,0.64,1); }
.wa-queue-icon { width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: rgba(37,211,102,0.16); color: var(--wa); }
.wa-queue-text { flex: 1; }
.wa-queue-title { font-size: 13px; font-weight: 700; }
.wa-queue-eta { font-size: 11.5px; color: var(--text-3); font-family: 'Space Mono', monospace; margin-top: 1px; }
.wa-queue-cancel { width: 28px; height: 28px; flex-shrink: 0; border-radius: 7px; border: 1px solid var(--border); background: none; color: var(--text-3); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.16s ease; }
.wa-queue-cancel:hover { background: rgba(239,68,68,0.14); color: var(--red); border-color: rgba(239,68,68,0.3); }

/* ============================================================
   Nav badge (unread count on sidebar items)
   ============================================================ */
.nav-item { position: relative; }
.nav-badge { margin-left: auto; min-width: 19px; height: 19px; padding: 0 6px; border-radius: 999px; background: var(--wa, #25D366); color: #04210f; font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
.nav-badge-dot { position: absolute; top: 7px; right: 9px; min-width: 8px; width: 8px; height: 8px; padding: 0; margin: 0; }

/* ============================================================
   Template editor — Meta connection box
   ============================================================ */
.wa-meta-box { border: 1px solid var(--border); border-radius: var(--r-sm); padding: 16px; background: var(--surface-2); display: flex; flex-direction: column; gap: 14px; }
.wa-meta-head { display: flex; align-items: flex-start; gap: 12px; }
.wa-test-tpl { margin-top: 7px; margin-bottom: 10px; }
.wa-test-tpl .select-wrap, .wa-test-tpl .select { width: 100%; }
.wa-test-tpl .field-hint { margin-top: 6px; }

/* ============================================================
   Conversas — inbox / mini-CRM
   ============================================================ */
.inbox-screen { display: grid; grid-template-columns: 340px minmax(0, 1fr); height: 100%; min-height: 0; }
.inbox-list { border-right: 1px solid var(--border); display: flex; flex-direction: column; min-height: 0; background: var(--surface-1); }
.inbox-list-head { padding: 16px; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 12px; flex-shrink: 0; }
.inbox-search { max-width: none; min-width: 0; width: 100%; }
.inbox-search input { width: 100%; }
.inbox-filters { display: flex; gap: 6px; }
.inbox-filter { flex: 1; padding: 7px 8px; border-radius: var(--r-sm); border: 1px solid var(--border); background: var(--surface-2); color: var(--text-3); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.16s ease; white-space: nowrap; }
.inbox-filter:hover { color: var(--text-2); border-color: var(--border-2); }
.inbox-filter.active { background: var(--blue); border-color: var(--blue); color: #fff; }

.inbox-convos { flex: 1; overflow-y: auto; min-height: 0; }
.inbox-convo { width: 100%; display: flex; gap: 12px; padding: 14px 16px; border: none; border-bottom: 1px solid var(--border); background: none; cursor: pointer; text-align: left; transition: background 0.14s ease; align-items: flex-start; position: relative; }
.inbox-convo-del { position: absolute; top: 10px; right: 12px; width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; color: var(--text-3); background: var(--surface-1); border: 1px solid var(--border); opacity: 0; transition: all 0.16s ease; }
.inbox-convo:hover .inbox-convo-del { opacity: 1; }
.inbox-convo-del:hover { background: rgba(239,68,68,0.14); color: var(--red); border-color: rgba(239,68,68,0.3); }
.inbox-thread-del:hover { background: rgba(239,68,68,0.14); color: var(--red); border-color: rgba(239,68,68,0.3); }

/* ============================================================
   Opt-out (descadastro)
   ============================================================ */
.inbox-optout-btn:hover { color: var(--amber); border-color: rgba(245,158,11,0.4); }
.inbox-optout-banner { flex-shrink: 0; display: flex; align-items: center; gap: 8px; padding: 9px 22px; font-size: 12.5px; font-weight: 600; color: var(--amber); background: rgba(245,158,11,0.1); border-bottom: 1px solid var(--border); }

/* ============================================================
   Follow-up cadence config
   ============================================================ */
.wa-followup { border-top: 1px solid var(--border); margin-top: 4px; padding-top: 4px; }
.wa-followup-steps { padding: 4px 0 8px; display: flex; flex-direction: column; gap: 10px; }
.wa-fu-step { display: flex; align-items: center; gap: 10px; }
.wa-fu-num { width: 30px; height: 30px; flex-shrink: 0; border-radius: 8px; background: rgba(139,92,246,0.14); color: var(--purple); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
.wa-fu-when { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.wa-fu-days { width: 56px; text-align: center; padding: 8px 6px; }
.wa-fu-tpl { flex: 1; }
.wa-fu-tpl .select { width: 100%; }
.wa-fu-step .row-trash { flex-shrink: 0; }

/* ============================================================
   Reports — Desempenho da Prospecção
   ============================================================ */
.prosp-empty, .prosp-empty-sm { color: var(--text-3); font-size: 13.5px; padding: 8px 0; }
.prosp-empty-sm { font-size: 12.5px; padding: 16px; text-align: center; }
.prosp-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 22px; }
.prosp-kpi { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-sm); padding: 16px; }
.prosp-kpi-val { font-size: 30px; font-weight: 400; letter-spacing: -0.01em; line-height: 1; font-family: 'DM Serif Display', Georgia, serif; }
.prosp-kpi-val small { font-size: 14px; color: var(--text-3); }
.prosp-kpi-lbl { font-size: 12px; color: var(--text-3); margin-top: 7px; }
.prosp-tables { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: start; }
.prosp-table-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-3); margin-bottom: 10px; }
.prosp-table { font-size: 12.5px; }
.prosp-table thead th { padding: 9px 10px; font-size: 10.5px; }
.prosp-table tbody td { padding: 9px 10px; }
.prosp-table .prosp-lbl { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11.5px; }
.prosp-bar-cell { display: flex; align-items: center; gap: 8px; min-width: 110px; }
.prosp-bar-track { flex: 1; height: 7px; background: var(--surface-3); border-radius: 999px; overflow: hidden; }
.prosp-bar-fill { height: 100%; border-radius: 999px; transition: width 0.3s ease; }
.prosp-bar-val { font-size: 11.5px; font-weight: 700; width: 36px; text-align: right; }

@media (max-width: 1100px) {
  .prosp-kpis { grid-template-columns: repeat(2, 1fr); }
  .prosp-tables { grid-template-columns: 1fr; }
}

/* ============================================================
   Number protection: daily limit + warmup + error log
   ============================================================ */
.wa-protect { display: flex; flex-direction: column; gap: 16px; }
.wa-daily { display: flex; flex-direction: column; gap: 7px; }
.wa-daily-bar { height: 8px; background: var(--surface-3); border-radius: 999px; overflow: hidden; }
.wa-daily-fill { height: 100%; border-radius: 999px; transition: width 0.3s ease; }
.wa-daily-info { font-size: 12.5px; color: var(--text-2); }
.wa-daily-full { color: var(--red); }
.wa-warmup { border-top: 1px solid var(--border); padding-top: 14px; }
.wa-warmup-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-3); margin-bottom: 10px; }
.wa-warmup-steps { display: flex; gap: 8px; flex-wrap: wrap; }
.wa-warmup-step { flex: 1; min-width: 84px; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-sm); padding: 10px; text-align: center; }
.wa-warmup-d { display: block; font-size: 11px; color: var(--text-3); margin-bottom: 4px; }
.wa-warmup-v { font-size: 17px; font-weight: 700; color: var(--green); }
.wa-errors { border-top: 1px solid var(--border); padding-top: 14px; }
.wa-errors-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.wa-errors-actions { display: flex; gap: 12px; }
.wa-err-count { display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px; padding: 0 6px; border-radius: 999px; background: rgba(239,68,68,0.15); color: var(--red); font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; margin-left: 6px; }
.wa-err-clear { color: var(--red); }
.wa-err-list { display: flex; flex-direction: column; gap: 8px; }
.wa-err-row { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.18); border-radius: var(--r-sm); }
.wa-err-icon { color: var(--red); flex-shrink: 0; margin-top: 1px; }
.wa-err-main { flex: 1; min-width: 0; }
.wa-err-empresa { font-size: 13px; font-weight: 600; }
.wa-err-msg { font-size: 12px; color: var(--text-2); margin-top: 1px; }
.wa-err-time { font-size: 11px; color: var(--text-3); flex-shrink: 0; }

/* import validation breakdown */
.import-stat.warn { color: var(--amber); }
.import-checks { display: flex; flex-direction: column; gap: 6px; padding: 12px 14px; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-sm); }
.import-check { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--text-2); }
.import-check svg { color: var(--green); flex-shrink: 0; }
.import-check.warn { color: var(--amber); }
.import-check.warn svg { color: var(--amber); }

/* ============================================================
   Inbox: delivery status, quick replies, funnel selector
   ============================================================ */
.chat-time { display: flex; align-items: center; gap: 4px; justify-content: flex-end; }
.msg-status { display: inline-flex; align-items: center; }
.msg-status.sent { color: rgba(4,33,15,0.55); }
.msg-status.delivered { color: rgba(4,33,15,0.7); }
.msg-status.read { color: #2563EB; }
.msg-status.failed { color: var(--red); font-weight: 700; }

.inbox-quick { flex-shrink: 0; display: flex; gap: 7px; padding: 10px 22px 0; flex-wrap: wrap; overflow-x: auto; }
.inbox-quick-chip { flex-shrink: 0; padding: 6px 12px; border-radius: 999px; border: 1px solid var(--border-2); background: var(--surface-2); color: var(--text-2); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.16s ease; }
.inbox-quick-chip:hover { background: var(--wa, #25D366); color: #04210f; border-color: var(--wa, #25D366); }

.inbox-status-wrap { flex-shrink: 0; }
.inbox-status-select { padding: 6px 28px 6px 12px; font-size: 12.5px; font-weight: 600; border-radius: 999px; color: var(--st); border-color: color-mix(in oklab, var(--st) 40%, transparent); background: color-mix(in oklab, var(--st) 12%, var(--surface-1)); cursor: pointer; }
.inbox-status-wrap .select-chevron { color: var(--st); right: 9px; }

/* queue bar actions */
.wa-queue-actions { display: flex; align-items: center; gap: 6px; }
.wa-queue-btn { display: inline-flex; align-items: center; gap: 5px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border-2); background: var(--surface-2); color: var(--text-2); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.16s ease; }
.wa-queue-btn:hover { background: var(--surface-3); color: var(--text); }
.wa-queue-paused .wa-queue-icon { color: var(--amber); }
.inbox-convo:hover { background: var(--surface-2); }
.inbox-convo.active { background: var(--surface-2); box-shadow: inset 3px 0 0 var(--blue); }
.inbox-convo.unread .inbox-convo-name { font-weight: 700; }
.inbox-convo-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.inbox-convo-top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.inbox-convo-name { font-size: 13.5px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.inbox-convo-date { font-size: 11px; color: var(--text-3); flex-shrink: 0; }
.inbox-convo-bottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.inbox-convo-preview { font-size: 12.5px; color: var(--text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
.inbox-unread-pill { flex-shrink: 0; min-width: 18px; height: 18px; padding: 0 6px; border-radius: 999px; background: var(--wa, #25D366); color: #04210f; font-family: 'Space Mono', monospace; font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
.inbox-convo-tags { display: flex; align-items: center; gap: 8px; margin-top: 1px; }
.inbox-convo-tags .seg-tag { font-size: 11px; }
.inbox-tag-sent { font-size: 10.5px; font-weight: 600; color: var(--amber); background: rgba(245,158,11,0.12); padding: 2px 7px; border-radius: 999px; }
.inbox-empty-list { padding: 32px 16px; text-align: center; color: var(--text-3); font-size: 13px; }

.inbox-thread { display: flex; flex-direction: column; min-height: 0; min-width: 0; background: var(--bg); }
.inbox-thread-head { flex-shrink: 0; padding: 14px 22px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 16px; background: var(--surface-1); }
.inbox-thread-id { display: flex; align-items: center; gap: 12px; min-width: 0; }
.inbox-thread-meta { min-width: 0; }
.inbox-thread-meta h3 { font-size: 17px; font-weight: 400; font-family: 'DM Serif Display', Georgia, serif; letter-spacing: -0.005em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.inbox-thread-sub { font-size: 12.5px; color: var(--text-3); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.inbox-thread-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.inbox-chat { flex: 1; overflow-y: auto; overflow-x: hidden; min-height: 0; padding: 24px 22px; display: flex; flex-direction: column; gap: 10px; }
.chat-row { display: flex; min-width: 0; }
.chat-row.in { justify-content: flex-start; }
.chat-row.out { justify-content: flex-end; }
.chat-bubble { max-width: 76%; padding: 10px 13px; border-radius: 14px; font-size: 13.5px; line-height: 1.5; }
.chat-row.in .chat-bubble { background: var(--surface-2); border: 1px solid var(--border); border-bottom-left-radius: 4px; color: var(--text); }
.chat-row.out .chat-bubble { background: var(--wa, #25D366); color: #04210f; border-bottom-right-radius: 4px; }
.chat-text { white-space: pre-wrap; word-break: break-word; }
.chat-time { font-size: 10px; margin-top: 4px; text-align: right; opacity: 0.7; }
.chat-row.in .chat-time { color: var(--text-3); }

.inbox-composer { flex-shrink: 0; padding: 14px 22px; border-top: 1px solid var(--border); background: var(--surface-1); display: flex; align-items: flex-end; gap: 10px; }
.inbox-composer-input { flex: 1; resize: none; max-height: 140px; min-height: 42px; margin: 0; }
.inbox-send { flex-shrink: 0; }
.inbox-sim-note { flex-shrink: 0; padding: 8px 22px 12px; font-size: 11.5px; color: var(--text-3); background: var(--surface-1); }
.inbox-noselect { flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-3); font-size: 14px; }

.inbox-empty { padding: 80px 20px; }
.inbox-empty-icon { width: 60px; height: 60px; border-radius: 16px; background: rgba(37,211,102,0.12); color: var(--wa, #25D366); display: flex; align-items: center; justify-content: center; }
.inbox-empty-sub { font-size: 13px; color: var(--text-3); max-width: 420px; text-align: center; line-height: 1.5; }

@media (max-width: 900px) {
  .inbox-screen { grid-template-columns: 1fr; }
  .inbox-thread { display: none; }
}

/* ============================================================
   Theme controls (toggle button + appearance cards)
   ============================================================ */
.theme-toggle svg { transition: transform 0.3s ease; }
.theme-toggle:hover svg { transform: rotate(20deg); }

.accent-label { font-size: 12px; font-weight: 600; color: var(--text-2); margin: 18px 0 10px; }
.theme-choice { display: flex; gap: 12px; }
.theme-card { flex: 1; display: flex; flex-direction: column; gap: 9px; padding: 12px; border-radius: var(--r); border: 1.5px solid var(--border); background: var(--surface-2); cursor: pointer; transition: all 0.18s ease; }
.theme-card:hover { border-color: var(--border-2); }
.theme-card.active { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 8%, var(--surface-2)); }
.theme-card-label { display: flex; align-items: center; justify-content: center; gap: 7px; font-size: 13px; font-weight: 600; color: var(--text); }
.theme-prev { position: relative; height: 46px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); }
.theme-prev-dark { background: #0E130D; }
.theme-prev-light { background: #F1F2E7; }
.theme-prev .tp-bar { position: absolute; left: 8px; top: 10px; width: 42%; height: 6px; border-radius: 3px; background: var(--accent); }
.theme-prev .tp-dot { position: absolute; right: 9px; bottom: 9px; width: 14px; height: 14px; border-radius: 50%; }
.theme-prev-dark .tp-dot { background: #283021; box-shadow: 0 0 0 1px rgba(224,226,196,0.18); }
.theme-prev-light .tp-dot { background: #DFE2CF; box-shadow: 0 0 0 1px rgba(41,66,44,0.18); }
