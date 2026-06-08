// ============================================================
//  Supabase integration layer (window.SB)
//  - Lazily loads supabase-js only when the app is configured.
//  - Demo mode (no config) → everything below is inert and the
//    app uses localStorage exactly as before.
// ============================================================
(function () {
  const CFG_KEY = "nexus_sb_cfg";
  const SB_CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";
  const TODAY = "2026-06-07";

  // ---- config persistence --------------------------------------------------
  function getCfg() {
    try { return JSON.parse(localStorage.getItem(CFG_KEY) || "null"); } catch (e) { return null; }
  }
  function setCfg(cfg) { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); }
  function clearCfg() { localStorage.removeItem(CFG_KEY); }
  function isConfigured() { const c = getCfg(); return !!(c && c.url && c.anonKey); }

  // ---- client bootstrap ----------------------------------------------------
  let _client = null;
  function loadScript(src) {
    return new Promise((res, rej) => {
      if (window.supabase && window.supabase.createClient) return res();
      if (document.querySelector(`script[data-sb]`)) {
        const s = document.querySelector(`script[data-sb]`);
        s.addEventListener("load", () => res());
        s.addEventListener("error", () => rej(new Error("Falha ao carregar supabase-js")));
        return;
      }
      const s = document.createElement("script");
      s.src = src; s.async = true; s.setAttribute("data-sb", "1");
      s.onload = () => res();
      s.onerror = () => rej(new Error("Falha ao carregar supabase-js (sem internet?)"));
      document.head.appendChild(s);
    });
  }
  async function ensureClient() {
    const cfg = getCfg();
    if (!cfg || !cfg.url || !cfg.anonKey) return null;
    if (_client) return _client;
    await loadScript(SB_CDN);
    _client = window.supabase.createClient(cfg.url, cfg.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: "nexus_sb_auth" },
    });
    return _client;
  }

  // ---- column mapping (app camelCase <-> db snake_case) --------------------
  const LEAD_COLS = {
    empresa: "empresa", segmento: "segmento", cnpj: "cnpj", cidade: "cidade",
    responsavel: "responsavel", cargo: "cargo", whatsapp: "whatsapp", status: "status",
    valor: "valor", prioridade: "prioridade", dono: "dono", interacoes: "interacoes",
    diasNoFunil: "dias_no_funil", ultimoContato: "ultimo_contato", proximaAcao: "proxima_acao",
  };
  function leadToRow(l) {
    const row = {};
    for (const k in LEAD_COLS) if (l[k] !== undefined) row[LEAD_COLS[k]] = l[k];
    if (l.id !== undefined) row.id = l.id;
    return row;
  }
  function leadFromRow(r) {
    return {
      id: r.id, empresa: r.empresa, segmento: r.segmento, cnpj: r.cnpj, cidade: r.cidade,
      responsavel: r.responsavel, cargo: r.cargo, whatsapp: r.whatsapp, status: r.status,
      valor: Number(r.valor), prioridade: r.prioridade, dono: r.dono,
      diasNoFunil: r.dias_no_funil, ultimoContato: r.ultimo_contato, proximaAcao: r.proxima_acao,
      interacoes: r.interacoes || [],
    };
  }
  const taskToRow = (t) => ({
    id: t.id, data: t.data, hora: t.hora, tipo: t.tipo, lead_id: t.leadId, status: t.status, obs: t.obs,
  });
  const taskFromRow = (r) => ({
    id: r.id, data: r.data, hora: r.hora, tipo: r.tipo, leadId: r.lead_id, status: r.status, obs: r.obs,
  });
  const profileFromRow = (r) => ({
    id: r.initials, authId: r.id, initials: r.initials,
    name: r.name, email: r.email, role: r.role, color: r.color,
  });

  // ---- auth ----------------------------------------------------------------
  async function signIn(email, password) {
    const c = await ensureClient();
    if (!c) return { error: "Supabase não configurado" };
    const { error } = await c.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: traduzAuth(error.message) };
    const profile = await sessionProfile();
    if (!profile) return { error: "Conta sem perfil. Avise o administrador." };
    return { profile };
  }
  async function signUp(name, email, password) {
    const c = await ensureClient();
    if (!c) return { error: "Supabase não configurado" };
    const { error } = await c.auth.signUp({
      email: email.trim(), password,
      options: { data: { full_name: name.trim() } },
    });
    if (error) return { error: traduzAuth(error.message) };
    // If e-mail confirmation is OFF, a session exists now.
    const profile = await sessionProfile();
    return { profile: profile || null, needsConfirm: !profile };
  }
  async function signOut() {
    const c = await ensureClient();
    if (c) await c.auth.signOut();
  }
  async function sessionProfile() {
    const c = await ensureClient();
    if (!c) return null;
    const { data: { session } } = await c.auth.getSession();
    if (!session) return null;
    const { data, error } = await c.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
    if (error || !data) return null;
    if (!data.email) data.email = session.user.email;
    return profileFromRow(data);
  }

  function traduzAuth(msg) {
    if (/invalid login/i.test(msg)) return "E-mail ou senha incorretos";
    if (/already registered/i.test(msg)) return "Este e-mail já está cadastrado";
    if (/password/i.test(msg) && /6/.test(msg)) return "A senha precisa de ao menos 6 caracteres";
    if (/email/i.test(msg) && /confirm/i.test(msg)) return "Confirme seu e-mail antes de entrar";
    return msg;
  }

  // ---- data ----------------------------------------------------------------
  async function fetchAll() {
    const c = await ensureClient();
    const [lr, tr, pr] = await Promise.all([
      c.from("leads").select("*").order("id", { ascending: false }),
      c.from("tasks").select("*"),
      c.from("profiles").select("*").order("created_at", { ascending: true }),
    ]);
    if (lr.error) throw lr.error;
    if (tr.error) throw tr.error;
    if (pr.error) throw pr.error;
    return {
      leads: (lr.data || []).map(leadFromRow),
      tasks: (tr.data || []).map(taskFromRow),
      users: (pr.data || []).map(profileFromRow),
    };
  }
  async function insertLead(lead) {
    const c = await ensureClient();
    const row = leadToRow(lead); delete row.id; // identity assigns
    const { data, error } = await c.from("leads").insert(row).select().single();
    if (error) throw error;
    return leadFromRow(data);
  }
  async function patchLead(id, fields) {
    const c = await ensureClient();
    const row = {};
    for (const k in fields) if (LEAD_COLS[k]) row[LEAD_COLS[k]] = fields[k];
    const { error } = await c.from("leads").update(row).eq("id", id);
    if (error) throw error;
  }
  async function deleteLead(id) {
    const c = await ensureClient();
    await c.from("tasks").delete().eq("lead_id", id);
    const { error } = await c.from("leads").delete().eq("id", id);
    if (error) throw error;
  }
  async function deleteLeads(ids) {
    const c = await ensureClient();
    await c.from("tasks").delete().in("lead_id", ids);
    const { error } = await c.from("leads").delete().in("id", ids);
    if (error) throw error;
  }
  async function insertTask(task) {
    const c = await ensureClient();
    const row = taskToRow(task);
    const { data, error } = await c.from("tasks").insert(row).select().single();
    if (error) throw error;
    return taskFromRow(data);
  }
  async function patchTask(id, fields) {
    const c = await ensureClient();
    const row = {};
    if (fields.status !== undefined) row.status = fields.status;
    if (fields.obs !== undefined) row.obs = fields.obs;
    const { error } = await c.from("tasks").update(row).eq("id", id);
    if (error) throw error;
  }
  async function deleteTask(id) {
    const c = await ensureClient();
    const { error } = await c.from("tasks").delete().eq("id", id);
    if (error) throw error;
  }
  async function updateProfile(u) {
    const c = await ensureClient();
    const { error } = await c.from("profiles").update({ name: u.name, email: u.email, role: u.role }).eq("initials", u.id);
    if (error) throw error;
  }
  async function deleteProfile(initials) {
    const c = await ensureClient();
    const { error } = await c.from("profiles").delete().eq("initials", initials);
    if (error) throw error;
  }

  // ---- connection test -----------------------------------------------------
  async function testConnection(cfg) {
    try {
      await loadScript(SB_CDN);
      const probe = window.supabase.createClient(cfg.url, cfg.anonKey, {
        auth: { persistSession: false, autoRefreshToken: false, storageKey: "nexus_sb_probe" },
      });
      const { error } = await probe.from("leads").select("id", { head: true, count: "exact" });
      if (error) {
        if (error.code === "42P01" || /relation .* does not exist/i.test(error.message || ""))
          return { ok: false, msg: "Conectado, mas as tabelas não existem. Rode o script SQL." };
        if (/failed to fetch|networkerror|load failed/i.test(error.message || ""))
          return { ok: false, msg: "Não foi possível conectar. Verifique a URL e sua internet." };
        if (/permission denied|JWT|RLS/i.test(error.message || ""))
          return { ok: true, msg: "Conexão e tabelas OK." }; // reachable; RLS blocking anon read is expected
        return { ok: false, msg: error.message };
      }
      return { ok: true, msg: "Conexão e tabelas OK." };
    } catch (e) {
      return { ok: false, msg: "Não foi possível conectar. Verifique a URL e a chave." };
    }
  }

  window.SB = {
    isConfigured, getCfg, setCfg, clearCfg, ensureClient, testConnection,
    signIn, signUp, signOut, sessionProfile,
    fetchAll, insertLead, patchLead, deleteLead, deleteLeads,
    insertTask, patchTask, deleteTask,
    updateProfile, deleteProfile,
    leadFromRow, taskFromRow, profileFromRow, TODAY,
  };
})();
