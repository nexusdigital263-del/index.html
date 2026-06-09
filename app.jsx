// ============================================================
//  Root App — global state + routing + persistence
// ============================================================
const PAGE_META = {
  dashboard: { title: "Dashboard",     subtitle: "Visão geral da sua prospecção" },
  leads:     { title: "Leads",         subtitle: "Sua carteira de prospects" },
  kanban:    { title: "Kanban",        subtitle: "Arraste os cards entre as etapas do funil" },
  agenda:    { title: "Agenda",        subtitle: "Tarefas e follow-ups" },
  reports:   { title: "Relatórios",    subtitle: "Métricas e desempenho comercial" },
  users:     { title: "Usuários",      subtitle: "Gerencie o acesso da equipe" },
  settings:  { title: "Configurações", subtitle: "Preferências da conta" },
};

const LS = {
  leads: "nexus_leads_v1",
  tasks: "nexus_tasks_v1",
  accent: "nexus_accent_v1",
  users: "nexus_users_v1",
  current: "nexus_current_v1",
};
function loadLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch (e) { return fallback; }
}
function saveLS(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

const BLANK_LEAD = () => ({
  empresa: "", segmento: "Clínica Odontológica", cnpj: "", cidade: "Uberlândia",
  responsavel: "", cargo: "", whatsapp: "", status: "Novo", valor: 1000,
  prioridade: "Média", dono: "CM", diasNoFunil: 0, ultimoContato: "2026-06-07",
  proximaAcao: "Primeiro contato", interacoes: [],
});

// ---- Lead create/edit modal ------------------------------------------------
function LeadFormModal({ lead, open, mode, onClose, onSave, owners, lockOwner }) {
  const [form, setForm] = useState(lead || BLANK_LEAD());
  useEffect(() => { if (open) setForm(lead || BLANK_LEAD()); }, [open, lead]);
  if (!open) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const isNew = mode === "create";
  const valid = form.empresa.trim() && form.responsavel.trim();
  const ownerList = owners && owners.length ? owners : USERS;

  return (
    <Modal open={open} onClose={onClose} title={isNew ? "Novo Lead" : "Editar Lead"} width={520}>
      <div className="form-grid">
        <label className="field">
          <span className="field-label">Empresa <span className="req">*</span></span>
          <input className="input" value={form.empresa} autoFocus
            placeholder="Nome da empresa" onChange={(e) => set("empresa", e.target.value)} />
        </label>
        <div className="field-row">
          <label className="field">
            <span className="field-label">Contato <span className="req">*</span></span>
            <input className="input" value={form.responsavel} placeholder="Nome do responsável"
              onChange={(e) => set("responsavel", e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">Cargo</span>
            <input className="input" value={form.cargo} placeholder="Ex: Sócio-diretor"
              onChange={(e) => set("cargo", e.target.value)} />
          </label>
        </div>
        <div className="field-row">
          <label className="field">
            <span className="field-label">WhatsApp</span>
            <input className="input" value={form.whatsapp} placeholder="(34) 9 9999-9999"
              onChange={(e) => set("whatsapp", e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">CNPJ</span>
            <input className="input" value={form.cnpj} placeholder="00.000.000/0001-00"
              onChange={(e) => set("cnpj", e.target.value)} />
          </label>
        </div>
        <div className="field-row">
          <label className="field">
            <span className="field-label">Segmento</span>
            <div className="select-wrap">
              <select className="select" value={form.segmento} onChange={(e) => set("segmento", e.target.value)}>
                {SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <Icon name="chevron-down" size={15} className="select-chevron" />
            </div>
          </label>
          <label className="field">
            <span className="field-label">Cidade</span>
            <div className="select-wrap">
              <select className="select" value={form.cidade} onChange={(e) => set("cidade", e.target.value)}>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <Icon name="chevron-down" size={15} className="select-chevron" />
            </div>
          </label>
        </div>
        <div className="field-row">
          <label className="field">
            <span className="field-label">Status</span>
            <div className="select-wrap">
              <select className="select" value={form.status} onChange={(e) => set("status", e.target.value)}>
                {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <Icon name="chevron-down" size={15} className="select-chevron" />
            </div>
          </label>
          <label className="field">
            <span className="field-label">Prioridade</span>
            <div className="select-wrap">
              <select className="select" value={form.prioridade} onChange={(e) => set("prioridade", e.target.value)}>
                {Object.keys(PRIORITY_META).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <Icon name="chevron-down" size={15} className="select-chevron" />
            </div>
          </label>
          <label className="field">
            <span className="field-label">Responsável</span>
            <div className="select-wrap">
              <select className="select" value={form.dono} disabled={lockOwner}
                onChange={(e) => set("dono", e.target.value)}>
                {ownerList.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <Icon name="chevron-down" size={15} className="select-chevron" />
            </div>
          </label>
          <label className="field">
            <span className="field-label">Valor (R$/mês)</span>
            <input className="input" type="number" value={form.valor}
              onChange={(e) => set("valor", Number(e.target.value))} />
          </label>
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" disabled={!valid}
          onClick={() => { onSave(form); onClose(); }}>
          <Icon name="check" size={15} /> {isNew ? "Criar Lead" : "Salvar Alterações"}
        </button>
      </div>
    </Modal>
  );
}

// ---- Root App --------------------------------------------------------------
const REMOTE = SB.isConfigured();
const TODAY = SB.TODAY || "2026-06-07";
const uid = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : "id-" + Date.now() + "-" + Math.random().toString(16).slice(2));

function BootSplash() {
  return (
    <div className="login-screen">
      <div className="boot-splash fade-in">
        <div className="brand-mark login-mark"><Icon name="activity" size={26} strokeWidth={2.5} /></div>
        <div className="boot-spinner"></div>
        <div className="boot-label">Conectando ao Supabase…</div>
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState("dashboard");
  const [leads, setLeads] = useState(() => REMOTE ? [] : loadLS(LS.leads, LEADS));
  const [tasks, setTasks] = useState(() => REMOTE ? [] : loadLS(LS.tasks, TASKS));
  const [accent, setAccentState] = useState(() => loadLS(LS.accent, COLORS.blue));
  const [users, setUsers] = useState(() => REMOTE ? [] : loadLS(LS.users, USERS));
  const [currentId, setCurrentId] = useState(() => REMOTE ? null : loadLS(LS.current, null));
  const [booting, setBooting] = useState(REMOTE);
  const [openLeadId, setOpenLeadId] = useState(null);
  const [editLead, setEditLead] = useState(null);
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [waModal, setWaModal] = useState({ open: false, leadIds: [] });

  // refs mirror latest state so handlers can read current values without re-binding
  const leadsRef = useRef(leads); useEffect(() => { leadsRef.current = leads; }, [leads]);
  const tasksRef = useRef(tasks); useEffect(() => { tasksRef.current = tasks; }, [tasks]);
  const usersRef = useRef(users); useEffect(() => { usersRef.current = users; }, [users]);

  // ---- persistence (demo mode only) ----
  useEffect(() => { if (!REMOTE) saveLS(LS.leads, leads); }, [leads]);
  useEffect(() => { if (!REMOTE) saveLS(LS.tasks, tasks); }, [tasks]);
  useEffect(() => { window.__users = users; if (!REMOTE) saveLS(LS.users, users); }, [users]);
  useEffect(() => { if (!REMOTE) saveLS(LS.current, currentId); }, [currentId]);

  // ---- background remote sync helper ----
  const sync = useCallback((fn, errMsg) => {
    Promise.resolve().then(fn).catch((e) => {
      console.error(e);
      toast(errMsg || "Erro ao sincronizar com o Supabase", "error");
    });
  }, []);

  const loadRemote = useCallback(async (profile) => {
    const data = await SB.fetchAll();
    window.__users = data.users;
    setUsers(data.users); setLeads(data.leads); setTasks(data.tasks);
    setCurrentId(profile.id);
  }, []);

  // ---- remote bootstrap: restore session on load ----
  useEffect(() => {
    if (!REMOTE) return;
    let alive = true;
    (async () => {
      try {
        const prof = await SB.sessionProfile();
        if (prof && alive) await loadRemote(prof);
      } catch (e) { console.error(e); }
      if (alive) setBooting(false);
    })();
    return () => { alive = false; };
  }, [loadRemote]);

  const currentUser = useMemo(() => users.find((u) => u.id === currentId) || null, [users, currentId]);
  const role = currentUser ? currentUser.role : null;
  const canViewAll = role ? can(role, "viewAll") : false;
  const canDelete = role ? can(role, "delete") : false;
  const canCreate = role ? can(role, "create") : false;

  // ---- accent theming ----
  const applyAccent = useCallback((c) => {
    const hover = ACCENT_HOVER[c] || c;
    document.documentElement.style.setProperty("--blue", c);
    document.documentElement.style.setProperty("--blue-hover", hover);
  }, []);
  useEffect(() => { applyAccent(accent); }, [accent, applyAccent]);
  const setAccent = useCallback((c) => {
    setAccentState(c); saveLS(LS.accent, c); applyAccent(c);
    toast("Cor de destaque atualizada", "info");
  }, [applyAccent]);

  const openLead = useCallback((id) => setOpenLeadId(id), []);
  const closeDrawer = useCallback(() => setOpenLeadId(null), []);

  const addInteraction = useCallback((id, { tipo, nota }) => {
    const cur = leadsRef.current.find((l) => l.id === id);
    if (!cur) return;
    const it = { id: uid(), data: TODAY, tipo, nota };
    const updated = { ...cur, interacoes: [...cur.interacoes, it], ultimoContato: TODAY };
    setLeads((prev) => prev.map((l) => l.id === id ? updated : l));
    toast("Interação registrada", "success");
    if (REMOTE) sync(() => SB.patchLead(id, { interacoes: updated.interacoes, ultimoContato: TODAY }));
  }, [sync]);

  const moveLead = useCallback((id, status) => {
    const cur = leadsRef.current.find((l) => l.id === id);
    if (!cur) return;
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
    if (cur.status !== status) {
      toast(`${cur.empresa} → ${STATUS_META[status].kanban}`, "success");
      if (REMOTE) sync(() => SB.patchLead(id, { status }));
    }
  }, [sync]);

  const saveLead = useCallback((form) => {
    setLeads((prev) => prev.map((l) => l.id === form.id ? { ...l, ...form } : l));
    toast("Lead atualizado", "success");
    if (REMOTE) sync(() => SB.patchLead(form.id, form));
  }, [sync]);

  // ---- WhatsApp send + automation (defined before createLead for ordering) ----
  const logWhatsApp = useCallback((ids, text) => {
    const cur = leadsRef.current;
    const conn = WA.isConnected();
    const byId = {};
    ids.forEach((id) => {
      const lead = cur.find((l) => l.id === id);
      if (!lead) return;
      const rendered = WA.render(text, lead);
      WA.send(lead, rendered); // simulated (or real if endpoint configured)
      const it = { id: uid(), data: TODAY, tipo: "WhatsApp", nota: rendered };
      byId[id] = [...lead.interacoes, it];
    });
    const keys = Object.keys(byId);
    if (!keys.length) return null;
    setLeads((prev) => prev.map((l) => byId[l.id] ? { ...l, interacoes: byId[l.id], ultimoContato: TODAY } : l));
    if (REMOTE) keys.forEach((id) => sync(() => SB.patchLead(Number(id), { interacoes: byId[id], ultimoContato: TODAY })));
    return { count: keys.length, conn };
  }, [sync]);

  const autoWhatsApp = useCallback((lead) => {
    const auto = WA.getAuto();
    if (!auto.onNew || lead.status !== "Novo") return;
    const tpls = WA.getTemplates();
    let tpl = (auto.templateId && auto.templateId !== "auto") ? tpls.find((t) => t.id === auto.templateId) : null;
    if (!tpl) tpl = WA.templateForLead(lead, tpls);
    if (!tpl) return;
    const r = logWhatsApp([lead.id], tpl.body);
    if (r) toast(`WhatsApp de 1º contato ${r.conn ? "enviado" : "(simulação)"} → ${lead.empresa}`, "info");
  }, [logWhatsApp]);

  const createLead = useCallback((form) => {
    const dono = (currentUser && !can(currentUser.role, "viewAll")) ? currentUser.id : form.dono;
    const base = {
      ...form, dono, ultimoContato: TODAY,
      interacoes: [{ id: uid(), data: TODAY, tipo: "Ligação", nota: "Lead criado no sistema." }],
    };
    if (REMOTE) {
      SB.insertLead(base)
        .then((row) => {
          setLeads((prev) => [row, ...prev]);
          toast(`Lead "${row.empresa}" criado`, "success");
          setTimeout(() => autoWhatsApp(row), 50);
        })
        .catch((e) => { console.error(e); toast("Erro ao criar lead no Supabase", "error"); });
    } else {
      const id = leadsRef.current.reduce((m, l) => Math.max(m, l.id), 0) + 1;
      const newLead = { ...base, id };
      setLeads((prev) => [newLead, ...prev]);
      toast(`Lead "${form.empresa}" criado`, "success");
      setTimeout(() => autoWhatsApp(newLead), 50);
    }
  }, [currentUser, autoWhatsApp]);

  const deleteLead = useCallback((id) => {
    const cur = leadsRef.current.find((l) => l.id === id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setTasks((prev) => prev.filter((t) => t.leadId !== id));
    setOpenLeadId(null);
    if (cur) toast(`Lead "${cur.empresa}" removido`, "error");
    if (REMOTE) sync(() => SB.deleteLead(id));
  }, [sync]);

  const deleteLeads = useCallback((ids) => {
    const set = new Set(ids);
    setLeads((prev) => prev.filter((l) => !set.has(l.id)));
    setTasks((prev) => prev.filter((t) => !set.has(t.leadId)));
    setOpenLeadId(null);
    toast(`${ids.length} lead${ids.length !== 1 ? "s" : ""} removido${ids.length !== 1 ? "s" : ""}`, "error");
    if (REMOTE) sync(() => SB.deleteLeads(ids));
  }, [sync]);

  const toggleTask = useCallback((id) => {
    const cur = tasksRef.current.find((t) => t.id === id);
    if (!cur) return;
    const ns = cur.status === "Concluído" ? "Pendente" : "Concluído";
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: ns } : t));
    if (REMOTE) sync(() => SB.patchTask(id, { status: ns }));
  }, [sync]);

  const addTask = useCallback((t) => {
    if (REMOTE) {
      const task = { ...t, id: uid() };
      SB.insertTask(task)
        .then((row) => { setTasks((prev) => [...prev, row]); toast("Tarefa criada", "success"); })
        .catch((e) => { console.error(e); toast("Erro ao criar tarefa no Supabase", "error"); });
    } else {
      setTasks((prev) => [...prev, { ...t, id: "t" + Date.now() }]);
      toast("Tarefa criada", "success");
    }
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast("Tarefa removida", "error");
    if (REMOTE) sync(() => SB.deleteTask(id));
  }, [sync]);

  const resetData = useCallback(() => {
    try {
      localStorage.removeItem(LS.leads);
      localStorage.removeItem(LS.tasks);
      localStorage.removeItem("nexus_read");
    } catch (e) {}
    setLeads(LEADS); setTasks(TASKS);
    toast("Dados restaurados ao padrão", "info");
  }, []);

  // ---- WhatsApp ----
  const openWhatsAppBulk = useCallback((ids) => setWaModal({ open: true, leadIds: ids }), []);
  const closeWhatsApp = useCallback(() => setWaModal({ open: false, leadIds: [] }), []);
  const sendWhatsApp = useCallback((ids, text) => {
    const r = logWhatsApp(ids, text);
    if (r) toast(`Mensagem ${r.conn ? "enviada" : "registrada (simulação)"} para ${r.count} lead${r.count !== 1 ? "s" : ""}`, r.conn ? "success" : "info");
  }, [logWhatsApp]);

  // ---- auth + users ----
  const loginDemo = useCallback((id) => { setCurrentId(id); setPage("dashboard"); setCollapsed(false); }, []);

  const loginRemote = useCallback(async (email, pw) => {
    const res = await SB.signIn(email, pw);
    if (res.error) return { error: res.error };
    await loadRemote(res.profile);
    setPage("dashboard"); setCollapsed(false);
    return {};
  }, [loadRemote]);

  const signUpRemote = useCallback(async (name, email, pw) => {
    const res = await SB.signUp(name, email, pw);
    if (res.error) return { error: res.error };
    if (res.needsConfirm || !res.profile) {
      toast("Conta criada! Confirme o e-mail (se exigido) e faça login.", "info");
      return { needsConfirm: true };
    }
    await loadRemote(res.profile);
    setPage("dashboard");
    return {};
  }, [loadRemote]);

  const logout = useCallback(() => {
    if (REMOTE) {
      SB.signOut().catch(() => {});
      setLeads([]); setTasks([]); setUsers([]);
    }
    setCurrentId(null); setOpenLeadId(null);
    toast("Sessão encerrada", "info");
  }, []);

  const addUser = useCallback((u) => {
    // Remote: novos acessos são criados pelo auto-cadastro na tela inicial.
    if (REMOTE) { toast("No modo Supabase, novos usuários se cadastram na tela de login.", "info"); return; }
    setUsers((prev) => [...prev, u]);
    toast(`Usuário "${u.name}" criado`, "success");
  }, []);
  const updateUser = useCallback((u) => {
    setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, ...u } : x));
    toast(`Usuário "${u.name}" atualizado`, "success");
    if (REMOTE) sync(() => SB.updateProfile(u));
  }, [sync]);
  const removeUser = useCallback((id) => {
    const u = usersRef.current.find((x) => x.id === id);
    setUsers((prev) => prev.filter((x) => x.id !== id));
    if (u) toast(`Usuário "${u.name}" removido`, "error");
    if (REMOTE) sync(() => SB.deleteProfile(id));
  }, [sync]);

  // ---- Supabase connect/disconnect (from Settings) ----
  const connectSupabase = useCallback((cfg) => {
    SB.setCfg(cfg);
    toast("Supabase conectado. Recarregando…", "success");
    setTimeout(() => location.reload(), 700);
  }, []);
  const disconnectSupabase = useCallback(() => {
    SB.signOut().catch(() => {});
    SB.clearCfg();
    toast("Supabase desconectado. Recarregando…", "info");
    setTimeout(() => location.reload(), 700);
  }, []);

  // ---- data scoping by role ----
  const visibleLeads = useMemo(() =>
    canViewAll ? leads : leads.filter((l) => currentUser && l.dono === currentUser.id),
    [leads, canViewAll, currentUser]);
  const visibleTasks = useMemo(() => {
    if (canViewAll) return tasks;
    const mine = new Set(visibleLeads.map((l) => l.id));
    return tasks.filter((t) => mine.has(t.leadId));
  }, [tasks, canViewAll, visibleLeads]);

  const ownerOptions = useMemo(() => users.filter((u) => u.role !== "Admin" || true), [users]);

  const openLeadObj = useMemo(() => leads.find((l) => l.id === openLeadId) || null, [leads, openLeadId]);
  const meta = PAGE_META[page] || PAGE_META.dashboard;
  const hasAccess = role ? can(role, page) : false;

  // Booting a remote session
  if (REMOTE && booting) {
    return (<React.Fragment><BootSplash /><ToastHost /></React.Fragment>);
  }

  // Not logged in → login screen (demo picker OR Supabase auth)
  if (!currentUser) {
    return (
      <React.Fragment>
        <LoginScreen remote={REMOTE} users={users}
          onLoginDemo={loginDemo} onLoginRemote={loginRemote} onSignUp={signUpRemote} />
        <ToastHost />
      </React.Fragment>
    );
  }

  return (
    <div className={"app-shell" + (collapsed ? " collapsed" : "")}>
      <Sidebar active={page} onNavigate={(p) => { setPage(p); setCollapsed(false); }}
        collapsed={collapsed} onLogout={logout} user={currentUser} />
      <main className="main-area">
        <PageHeader title={meta.title} subtitle={meta.subtitle}
          onToggleSidebar={() => setCollapsed((c) => !c)}
          bell={<NotificationsBell leads={visibleLeads} tasks={visibleTasks} />}
          actions={canCreate && (page === "leads" || page === "dashboard")
            ? <button className="btn btn-primary" onClick={() => setNewLeadOpen(true)}><Icon name="plus" size={16} /> Novo Lead</button>
            : null} />
        <div className="main-scroll">
          {!hasAccess && <NoAccess />}
          {hasAccess && page === "dashboard" && <Dashboard leads={visibleLeads} onOpenLead={openLead} />}
          {hasAccess && page === "leads" && <LeadsTable leads={visibleLeads} onOpenLead={openLead}
            canDelete={canDelete} canCreate={canCreate} onBulkWhatsApp={openWhatsAppBulk}
            onDeleteLead={deleteLead} onDeleteLeads={deleteLeads} />}
          {hasAccess && page === "kanban" && <Kanban leads={visibleLeads} onOpenLead={openLead} onMoveLead={moveLead} />}
          {hasAccess && page === "agenda" && <Agenda tasks={visibleTasks} leads={visibleLeads} onToggleTask={toggleTask} onAddTask={addTask} onDeleteTask={deleteTask} />}
          {hasAccess && page === "reports" && <Reports leads={visibleLeads} />}
          {hasAccess && page === "users" && <UsersScreen users={users} currentUser={currentUser} leads={leads}
            remote={REMOTE} onAdd={addUser} onUpdate={updateUser} onRemove={removeUser} />}
          {hasAccess && page === "settings" && <Settings accent={accent} onAccent={setAccent} onReset={resetData}
            onLogout={logout} user={currentUser} remote={REMOTE}
            onConnect={connectSupabase} onDisconnect={disconnectSupabase} />}
        </div>
      </main>

      <Drawer open={openLeadId != null} onClose={closeDrawer}>
        <LeadDetail lead={openLeadObj} onClose={closeDrawer}
          onAddInteraction={addInteraction}
          canDelete={canDelete} canCreate={canCreate}
          onWhatsApp={(id) => openWhatsAppBulk([id])}
          onDelete={deleteLead}
          onEdit={(l) => { setEditLead(l); setOpenLeadId(null); }} />
      </Drawer>

      <WhatsAppSendModal open={waModal.open}
        leads={waModal.leadIds.map((id) => leads.find((l) => l.id === id)).filter(Boolean)}
        onClose={closeWhatsApp} onSend={(ids, text) => sendWhatsApp(ids, text)} />

      <LeadFormModal lead={editLead} mode="edit" open={editLead != null}
        owners={ownerOptions}
        onClose={() => setEditLead(null)} onSave={saveLead} />
      <LeadFormModal lead={null} mode="create" open={newLeadOpen}
        owners={ownerOptions} lockOwner={!canViewAll}
        onClose={() => setNewLeadOpen(false)} onSave={createLead} />

      <ToastHost />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
