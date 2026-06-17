// ============================================================
//  Shared UI components
// ============================================================
const { useState, useMemo, useCallback, useEffect, useRef } = React;

// ---- Avatar (rep initials) -------------------------------------------------
function Avatar({ initials, size = 28, title }) {
  const info = userInfo(initials);
  const color = info.color;
  return (
    <div title={title || info.name} style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: color + "22", color: color, border: `1px solid ${color}55`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: size * 0.4,
      letterSpacing: "-0.02em",
    }}>{initials}</div>
  );
}

// ---- Role badge ------------------------------------------------------------
function RoleBadge({ role, small }) {
  const meta = ROLE_META[role] || { color: COLORS.blue };
  return (
    <span className="badge role-badge" style={{
      background: meta.color + "1A", color: meta.color, border: `1px solid ${meta.color}40`,
      fontSize: small ? 10.5 : 11.5,
    }}>
      <span className="badge-dot" style={{ background: meta.color }}></span>
      {role}
    </span>
  );
}

// ---- Status badge ----------------------------------------------------------
function StatusBadge({ status, pulse }) {
  const meta = STATUS_META[status] || { color: COLORS.blue, label: status };
  const isNew = status === "Novo" && pulse;
  return (
    <span className={"badge" + (isNew ? " badge-pulse" : "")} style={{
      "--badge-color": meta.color,
      background: meta.color + "1A", color: meta.color, border: `1px solid ${meta.color}40`,
    }}>
      <span className="badge-dot" style={{ background: meta.color }}></span>
      {meta.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const meta = PRIORITY_META[priority] || { color: COLORS.amber };
  return (
    <span className="badge" style={{
      background: meta.color + "14", color: meta.color, border: `1px solid ${meta.color}33`,
      fontSize: 11,
    }}>{priority}</span>
  );
}

// ---- Select (styled native) ------------------------------------------------
function Select({ value, onChange, options, label }) {
  return (
    <div className="select-wrap">
      <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <Icon name="chevron-down" size={15} className="select-chevron" />
    </div>
  );
}

// ---- Sidebar ---------------------------------------------------------------
const NAV = [
  { key: "dashboard", label: "Dashboard",     icon: "layout-dashboard" },
  { key: "leads",     label: "Leads",         icon: "users" },
  { key: "inbox",     label: "Conversas",     icon: "message-circle" },
  { key: "kanban",    label: "Kanban",        icon: "kanban" },
  { key: "agenda",    label: "Agenda",        icon: "calendar" },
  { key: "reports",   label: "Relatórios",    icon: "bar-chart" },
  { key: "users",     label: "Usuários",      icon: "shield" },
  { key: "settings",  label: "Configurações", icon: "settings" },
];

function Sidebar({ active, onNavigate, collapsed, onLogout, user, badges }) {
  const role = user ? user.role : "Admin";
  const nav = NAV.filter((item) => can(role, item.key));
  const b = badges || {};
  return (
    <aside className={"sidebar" + (collapsed ? " sidebar-collapsed" : "")}>
      <div className="sidebar-brand">
        {collapsed
          ? <div className="brand-mark"><span className="brand-mark-logo"></span></div>
          : <div className="brand-lockup" title="VitalHub"></div>}
      </div>

      <nav className="sidebar-nav">
        {nav.map((item) => (
          <button key={item.key}
            className={"nav-item" + (active === item.key ? " nav-item-active" : "")}
            onClick={() => onNavigate(item.key)} title={item.label}>
            <Icon name={item.icon} size={19} />
            {!collapsed && <span>{item.label}</span>}
            {b[item.key] > 0 && <span className={"nav-badge" + (collapsed ? " nav-badge-dot" : "")}>{collapsed ? "" : b[item.key]}</span>}
            {active === item.key && <span className="nav-indicator"></span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <Avatar initials={user ? user.id : "CM"} size={34} />
          {!collapsed && (
            <div className="user-chip-info">
              <div className="user-chip-name">{user ? user.name : "—"}</div>
              <div className="user-chip-role">{user ? user.role : ""}</div>
            </div>
          )}
          {!collapsed && <button className="icon-btn" title="Sair" onClick={onLogout}><Icon name="log-out" size={16} /></button>}
        </div>
      </div>
    </aside>
  );
}

// ---- Page header -----------------------------------------------------------
function PageHeader({ title, subtitle, actions, onToggleSidebar, bell, theme, onToggleTheme }) {
  return (
    <header className="page-header">
      <div className="page-header-left">
        <button className="icon-btn sidebar-toggle" onClick={onToggleSidebar} title="Menu">
          <Icon name="menu" size={18} />
        </button>
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="page-header-actions">
        {actions}
        {onToggleTheme && (
          <button className="icon-btn theme-toggle" onClick={onToggleTheme}
            title={theme === "light" ? "Tema escuro" : "Tema claro"}>
            <Icon name={theme === "light" ? "moon" : "sun"} size={18} />
          </button>
        )}
        {bell}
      </div>
    </header>
  );
}

// ---- Drawer (right slide-in) -----------------------------------------------
function Drawer({ open, onClose, children, width = 460 }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return (
    <div className={"drawer-root" + (open ? " open" : "")} aria-hidden={!open}>
      <div className="drawer-scrim" onClick={onClose}></div>
      <div className="drawer-panel" style={{ width }}>
        {open && children}
      </div>
    </div>
  );
}

// ---- Modal -----------------------------------------------------------------
function Modal({ open, onClose, title, children, width = 480 }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-root" onClick={onClose}>
      <div className="modal-panel" style={{ width }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ---- Card shell ------------------------------------------------------------
function Panel({ title, subtitle, right, children, className = "", noPad }) {
  return (
    <section className={"panel " + className}>
      {(title || right) && (
        <div className="panel-head">
          <div>
            <h2 className="panel-title">{title}</h2>
            {subtitle && <p className="panel-subtitle">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      <div className={noPad ? "" : "panel-body"}>{children}</div>
    </section>
  );
}

Object.assign(window, {
  Avatar, RoleBadge, StatusBadge, PriorityBadge, Select, Sidebar, PageHeader, Drawer, Modal, Panel, NAV,
});
