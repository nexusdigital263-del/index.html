// ============================================================
//  Toast notifications — global pub/sub
// ============================================================
const _toastSubs = new Set();
let _toastSeq = 0;
function toast(message, type = "success") {
  const t = { id: ++_toastSeq, message, type };
  _toastSubs.forEach((fn) => fn(t));
}

function ToastHost() {
  const [items, setItems] = React.useState([]);
  React.useEffect(() => {
    const add = (t) => {
      setItems((prev) => [...prev, t]);
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), 3400);
    };
    _toastSubs.add(add);
    return () => _toastSubs.delete(add);
  }, []);
  const remove = (id) => setItems((prev) => prev.filter((x) => x.id !== id));
  const ICONS = { success: "check", error: "x", info: "bell" };
  const C = { success: COLORS.green, error: COLORS.red, info: COLORS.blue };
  return (
    <div className="toast-host">
      {items.map((t) => (
        <div key={t.id} className="toast" style={{ "--tc": C[t.type] || COLORS.blue }}>
          <span className="toast-icon"><Icon name={ICONS[t.type] || "bell"} size={15} strokeWidth={2.5} /></span>
          <span className="toast-msg">{t.message}</span>
          <button className="toast-close" onClick={() => remove(t.id)}><Icon name="x" size={14} /></button>
        </div>
      ))}
    </div>
  );
}

// ============================================================
//  Notifications dropdown (bell)
// ============================================================
function buildNotifications(leads, tasks) {
  const today = "2026-06-07";
  const list = [];
  // New leads
  leads.filter((l) => l.status === "Novo").forEach((l) => {
    list.push({ id: "lead-" + l.id, icon: "user", color: COLORS.blue,
      title: "Novo lead", text: `${l.empresa} entrou no funil`, when: l.ultimoContato });
  });
  // Today's pending tasks
  tasks.filter((t) => t.data === today && t.status === "Pendente").forEach((t) => {
    const lead = leads.find((l) => l.id === t.leadId);
    list.push({ id: "task-" + t.id, icon: INTERACTION_META[t.tipo].icon, color: INTERACTION_META[t.tipo].color,
      title: `${t.tipo} hoje · ${t.hora}`, text: lead ? lead.empresa : "—", when: today });
  });
  // Proposals awaiting
  leads.filter((l) => l.status === "Proposta Enviada").forEach((l) => {
    list.push({ id: "prop-" + l.id, icon: "mail", color: COLORS.cyan,
      title: "Proposta pendente", text: `${l.empresa} — aguardando retorno`, when: l.ultimoContato });
  });
  return list.sort((a, b) => (b.when || "").localeCompare(a.when || ""));
}

function NotificationsBell({ leads, tasks }) {
  const [open, setOpen] = React.useState(false);
  const [readIds, setReadIds] = React.useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("nexus_read") || "[]")); } catch (e) { return new Set(); }
  });
  const ref = React.useRef(null);

  const notes = React.useMemo(() => buildNotifications(leads, tasks), [leads, tasks]);
  const unread = notes.filter((n) => !readIds.has(n.id)).length;

  React.useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const persist = (set) => { try { localStorage.setItem("nexus_read", JSON.stringify([...set])); } catch (e) {} };
  const markAll = () => { const s = new Set(notes.map((n) => n.id)); setReadIds(s); persist(s); };
  const toggleOpen = () => {
    setOpen((o) => {
      if (!o) { /* opening */ }
      return !o;
    });
  };

  return (
    <div className="bell-wrap" ref={ref}>
      <button className="icon-btn header-bell" title="Notificações" onClick={toggleOpen}>
        <Icon name="bell" size={18} />
        {unread > 0 && <span className="bell-count">{unread}</span>}
      </button>
      {open && (
        <div className="notif-panel">
          <div className="notif-head">
            <span className="notif-title">Notificações {unread > 0 && <span className="notif-badge">{unread}</span>}</span>
            <button className="notif-mark" onClick={markAll}>Marcar todas como lidas</button>
          </div>
          <div className="notif-list">
            {notes.length === 0 && <div className="notif-empty">Tudo em dia 🎉</div>}
            {notes.map((n) => (
              <div key={n.id} className={"notif-item" + (readIds.has(n.id) ? " read" : "")}>
                <span className="notif-icon" style={{ background: n.color + "1A", color: n.color }}>
                  <Icon name={n.icon} size={15} />
                </span>
                <div className="notif-main">
                  <div className="notif-item-title">{n.title}</div>
                  <div className="notif-item-text">{n.text}</div>
                </div>
                {!readIds.has(n.id) && <span className="notif-unread-dot"></span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { toast, ToastHost, NotificationsBell });
