// ============================================================
//  WhatsApp — prospecção automatizada (API Oficial / Cloud API)
//  Modo SIMULADO por padrão: toda a lógica real existe; o envio
//  fica fictício até você plugar os tokens da Meta + Edge Function.
// ============================================================
const { useState: wState, useEffect: wEffect, useMemo: wMemo } = React;

// ---- local UI helpers (isolated babel scope) -------------------------------
function Toggle({ on, onChange }) {
  return (
    <button className={"toggle" + (on ? " on" : "")} onClick={() => onChange(!on)}>
      <span className="toggle-knob"></span>
    </button>
  );
}
function SettingsRow({ icon, title, desc, control, accent }) {
  return (
    <div className="settings-row">
      <span className="settings-icon" style={{ background: (accent || COLORS.blue) + "1A", color: accent || COLORS.blue }}>
        <Icon name={icon} size={17} />
      </span>
      <div className="settings-text">
        <div className="settings-title">{title}</div>
        <div className="settings-desc">{desc}</div>
      </div>
      <div className="settings-control">{control}</div>
    </div>
  );
}

const WA_LS = { cfg: "nexus_wa_cfg", tpl: "nexus_wa_tpl", auto: "nexus_wa_auto" };
const WA_TPL_VERSION = 3; // bump → migra modelos padrão preservando os personalizados
const WA_OLD_DEFAULT_IDS = ["tpl-generico", "tpl-odonto", "tpl-concess", "tpl-delivery", "tpl-natural", "tpl-followup"];

// ---- default message templates ---------------------------------------------
// Conectados aos TEMPLATES APROVADOS na Meta (metaName) + ordem das variáveis (vars).
// vars define o que preenche {{1}}, {{2}}, {{3}} no template oficial, em ordem.
// O "body" espelha o texto aprovado (para prévia e registro na timeline).
const WA_DEFAULT_TEMPLATES = [
  {
    id: "meta-odonto", name: "1º contato — Clínica Odontológica", segmento: "Clínica Odontológica", primeiro: true,
    metaName: "primeiro_contato_inicial", metaLang: "pt_BR", vars: ["responsavel", "cidade", "empresa"],
    body: "Oi! Aqui é {{responsavel}}, da VitalHub. Trabalhamos com clínicas odontológicas em {{cidade}} e ajudamos a aumentar significativamente o número de agendamentos sem aumentar proporcionalmente o investimento em mídia, apenas ajustando a geração de demanda e o processo de acompanhamento dos pacientes. Posso te mostrar em 5 minutos como funcionaria na {{empresa}}? Fico no aguardo!",
  },
  {
    id: "meta-varejo-delivery", name: "1º contato — Delivery (Varejo)", segmento: "Delivery", primeiro: true,
    metaName: "varejo_contato_inicial", metaLang: "pt_BR", vars: ["contato"],
    body: "Olá, {{contato}}.\n\nTudo bem?\n\nTrabalho com projetos voltados para crescimento comercial e fortalecimento da presença digital de empresas do varejo.\n\nAnalisando o mercado local, identificamos algumas oportunidades que costumam impactar diretamente a geração de vendas e o aproveitamento dos clientes que já demonstram interesse.\n\nGostaria de compartilhar algumas observações que podem agregar valor ao negócio.\n\nPosso enviar?",
  },
  {
    id: "meta-varejo-natural", name: "1º contato — Loja Natural (Varejo)", segmento: "Loja Natural", primeiro: true,
    metaName: "varejo_contato_inicial", metaLang: "pt_BR", vars: ["contato"],
    body: "Olá, {{contato}}.\n\nTudo bem?\n\nTrabalho com projetos voltados para crescimento comercial e fortalecimento da presença digital de empresas do varejo.\n\nAnalisando o mercado local, identificamos algumas oportunidades que costumam impactar diretamente a geração de vendas e o aproveitamento dos clientes que já demonstram interesse.\n\nGostaria de compartilhar algumas observações que podem agregar valor ao negócio.\n\nPosso enviar?",
  },
  {
    id: "meta-empresas", name: "1º contato — Empresas (Genérico)", segmento: "Todos", primeiro: true,
    metaName: "empresas_contato_inicial", metaLang: "pt_BR", vars: ["contato"],
    body: "Olá, {{contato}}.\n\nTudo bem?\n\nTrabalho com projetos focados em geração de oportunidades comerciais, posicionamento digital e melhoria de processos de vendas.\n\nNos últimos meses, identificamos alguns padrões que aparecem com frequência em empresas que buscam crescer de forma mais previsível.\n\nGostaria de compartilhar algumas observações que podem ser úteis para a operação de vocês.\n\nPosso enviar?",
  },
  {
    id: "meta-saude", name: "1º contato — Saúde", segmento: "Todos", primeiro: false,
    metaName: "saude_contato_inicial", metaLang: "pt_BR", vars: ["contato"],
    body: "Olá, {{contato}}.\n\nTudo bem?\n\nTrabalho com projetos focados em geração de demanda, posicionamento digital e estruturação comercial para empresas da área da saúde.\n\nAo longo dos últimos meses, identificamos alguns padrões e oportunidades que aparecem com frequência em clínicas e consultórios da região.\n\nGostaria de compartilhar algumas observações que podem ser relevantes para a sua operação.\n\nPosso enviar?",
  },
  {
    id: "meta-followup", name: "Follow-up — Texto livre (dentro de 24h)", segmento: "Todos", primeiro: false,
    body: "Oi, {{contato}}, tudo bem? Passando para retomar nossa conversa sobre a {{empresa}}. Consigo te mostrar em poucos minutos como funciona — qual o melhor horário para você?",
  },
];

// ---- store (localStorage) --------------------------------------------------
const WA = {
  getCfg() {
    try { return JSON.parse(localStorage.getItem(WA_LS.cfg) || "null") || {}; } catch (e) { return {}; }
  },
  setCfg(c) { localStorage.setItem(WA_LS.cfg, JSON.stringify(c)); },
  // "Conectado" = envio real ativado pelo admin (a função já foi publicada e os
  // segredos da Meta estão no servidor). O token NUNCA fica no navegador.
  isConnected() { const c = WA.getCfg(); return !!c.live; },
  getTemplates() {
    try {
      const saved = JSON.parse(localStorage.getItem(WA_LS.tpl) || "null");
      if (!Array.isArray(saved) || !saved.length) return WA_DEFAULT_TEMPLATES;
      const ver = Number(localStorage.getItem("nexus_wa_tpl_ver") || "0");
      if (ver < WA_TPL_VERSION) {
        // migra: remove os modelos padrão antigos, mantém os personalizados do usuário
        const defIds = WA_DEFAULT_TEMPLATES.map((t) => t.id);
        const customs = saved.filter((t) => WA_OLD_DEFAULT_IDS.indexOf(t.id) < 0 && defIds.indexOf(t.id) < 0);
        const merged = WA_DEFAULT_TEMPLATES.concat(customs);
        localStorage.setItem(WA_LS.tpl, JSON.stringify(merged));
        localStorage.setItem("nexus_wa_tpl_ver", String(WA_TPL_VERSION));
        return merged;
      }
      return saved;
    } catch (e) { return WA_DEFAULT_TEMPLATES; }
  },
  saveTemplates(t) { localStorage.setItem(WA_LS.tpl, JSON.stringify(t)); localStorage.setItem("nexus_wa_tpl_ver", String(WA_TPL_VERSION)); },
  getAuto() {
    try { return JSON.parse(localStorage.getItem(WA_LS.auto) || "null") || { onNew: false, templateId: "" }; }
    catch (e) { return { onNew: false, templateId: "" }; }
  },
  setAuto(a) { localStorage.setItem(WA_LS.auto, JSON.stringify(a)); },

  // ---- intervalo entre envios (anti-bloqueio) ----
  intervalMin() { const c = WA.getCfg(); return c.intervalMin != null ? c.intervalMin : 5; },
  intervalMs() { return Math.max(0, WA.intervalMin()) * 60000; },

  // ---- fila de envio (espaça mensagens em massa) ----
  getQueue() { try { return JSON.parse(localStorage.getItem("nexus_wa_queue") || "[]") || []; } catch (e) { return []; } },
  setQueue(q) { localStorage.setItem("nexus_wa_queue", JSON.stringify(q)); },
  clearQueue() { localStorage.removeItem("nexus_wa_queue"); localStorage.removeItem("nexus_wa_queue_last"); },
  getLast() { try { return JSON.parse(localStorage.getItem("nexus_wa_queue_last") || "0"); } catch (e) { return 0; } },
  setLast(t) { localStorage.setItem("nexus_wa_queue_last", JSON.stringify(t)); },
  enqueue(ids, text, meta) {
    const q = WA.getQueue();
    const add = ids.map((id) => ({
      qid: "q" + Date.now() + "-" + id + "-" + Math.random().toString(16).slice(2, 6),
      leadId: id, text, meta: meta || null,
    }));
    WA.setQueue(q.concat(add));
    return add;
  },
  // enfileira itens com texto/meta próprios por lead (ex.: import com vários segmentos)
  enqueueItems(items) {
    const q = WA.getQueue();
    const add = items.map((it) => ({
      qid: "q" + Date.now() + "-" + it.leadId + "-" + Math.random().toString(16).slice(2, 6),
      leadId: it.leadId, text: it.text, meta: it.meta || null,
    }));
    WA.setQueue(q.concat(add));
    return add;
  },
  // momento previsto para o próximo envio da fila
  nextAt() { const q = WA.getQueue(); if (!q.length) return 0; return WA.getLast() + WA.intervalMs(); },

  render(body, lead) {
    if (!lead) return body;
    const firstName = (full) => {
      const parts = (full || "").trim().split(/\s+/).filter(Boolean);
      const titles = ["dr.", "dr", "dra.", "dra", "sr.", "sr", "sra.", "sra"];
      const first = parts.find((p) => !titles.includes(p.toLowerCase()));
      return first || (full || "");
    };
    const map = {
      empresa: lead.empresa || "",
      contato: firstName(lead.responsavel),
      cidade: lead.cidade || "",
      segmento: lead.segmento || "",
      cargo: lead.cargo || "",
      responsavel: (window.userInfo ? userInfo(lead.dono).name : (REPS[lead.dono] ? REPS[lead.dono].name : "")),
    };
    return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => (map[k] != null ? map[k] : "{{" + k + "}}"));
  },

  // Monta o descritor de template aprovado da Meta para um lead:
  // { metaName, metaLang, components:[{type:'body', parameters:[{type:'text', text}]}] }
  // Os valores de {{1}},{{2}},{{3}} vêm de tpl.vars (na ordem) resolvidos no lead.
  buildMeta(tplOrInfo, lead) {
    const metaName = tplOrInfo && tplOrInfo.metaName;
    if (!metaName) return null;
    const vars = tplOrInfo.vars || [];
    const params = vars.map((k) => {
      let v = WA.render("{{" + k + "}}", lead).trim();
      if (!v || v === "{{" + k + "}}") v = (k === "contato" ? (lead.empresa || "tudo bem?") : "—");
      // a Meta recusa quebras de linha/tabs e espaços duplicados em parâmetros
      v = v.replace(/[\n\t]+/g, " ").replace(/ {2,}/g, " ").trim().slice(0, 300) || "—";
      return { type: "text", text: v };
    });
    return {
      metaName, metaLang: tplOrInfo.metaLang || "pt_BR",
      components: params.length ? [{ type: "body", parameters: params }] : [],
    };
  },
  // versão leve (só dados serializáveis) para guardar na fila
  metaInfo(tpl) {
    if (!tpl || !tpl.metaName) return null;
    return { metaName: tpl.metaName, metaLang: tpl.metaLang || "pt_BR", vars: tpl.vars || [] };
  },

  // ---- config compartilhada (Supabase) ----
  // exporta a config (sem segredos — token fica no servidor) para sincronizar
  exportSettings() {
    const c = WA.getCfg();
    return {
      cfg: { live: !!c.live, intervalMin: (c.intervalMin != null ? c.intervalMin : 5), fn: c.fn || "" },
      auto: WA.getAuto(),
      templates: WA.getTemplates(),
      tplVer: WA_TPL_VERSION,
    };
  },
  // aplica a config recebida do servidor no localStorage deste navegador
  importSettings(s) {
    if (!s) return;
    if (s.cfg) {
      const cur = WA.getCfg();
      WA.setCfg({ ...cur, live: !!s.cfg.live, intervalMin: s.cfg.intervalMin != null ? s.cfg.intervalMin : 5, fn: s.cfg.fn || cur.fn || "" });
    }
    if (s.auto) WA.setAuto(s.auto);
    if (Array.isArray(s.templates) && s.templates.length) {
      localStorage.setItem(WA_LS.tpl, JSON.stringify(s.templates));
      localStorage.setItem("nexus_wa_tpl_ver", String(s.tplVer || WA_TPL_VERSION));
    }
  },

  // pick the best template for a lead's segment (primeiro contato)
  templateForLead(lead, templates) {
    const list = templates || WA.getTemplates();
    return list.find((t) => t.primeiro && t.segmento === lead.segmento)
        || list.find((t) => t.primeiro && t.segmento === "Todos")
        || list[0];
  },

  // Resolve o "slug" da função a partir do que o admin salvou. Aceita o nome
  // (ex: "whatsapp-send") OU a URL completa copiada do painel do Supabase
  // (ex: ".../functions/v1/bright-process-12"). Default: "whatsapp-send".
  fnName() {
    const cfg = WA.getCfg();
    const raw = (cfg.fn || "").trim();
    if (!raw) return "whatsapp-send";
    const m = raw.match(/\/functions\/v1\/([^/?#\s]+)/i);
    if (m) return m[1];
    return raw.replace(/^\/+|\/+$/g, "");
  },

  // normaliza telefone para o formato internacional (Brasil): só dígitos + DDI 55
  normalizePhone(raw) {
    let d = (raw || "").replace(/\D/g, "");
    if (!d) return "";
    if (d.startsWith("55") && d.length >= 12) return d; // já tem DDI
    if (d.length <= 11) return "55" + d;                // acrescenta DDI Brasil
    return d;
  },

  // Send one message. When envio real está ativo (cfg.live) e o Supabase está
  // conectado, chama a Edge Function pela sessão autenticada — o token da Meta
  // vive como SEGREDO no servidor, nunca no navegador.
  async send(lead, text, meta) {
    const cfg = WA.getCfg();
    const to = WA.normalizePhone(lead.whatsapp);
    if (cfg.live && window.SB && SB.isConfigured() && to) {
      try {
        const client = await SB.ensureClient();
        const payload = { to, text, leadId: lead.id };
        if (meta && meta.metaName) {
          payload.template = { name: meta.metaName, language: meta.metaLang || "pt_BR" };
          if (meta.components && meta.components.length) payload.template.components = meta.components;
        }
        const { data, error } = await client.functions.invoke(WA.fnName(), { body: payload });
        if (error) throw error;
        if (data && data.error) throw new Error(data.error);
        return { ok: true, simulated: false, data };
      } catch (e) {
        return { ok: false, simulated: false, error: (e && e.message) ? e.message : String(e) };
      }
    }
    // simulated send
    await new Promise((r) => setTimeout(r, 120));
    return { ok: true, simulated: true, noPhone: !to };
  },

  async sendTest(numero) {
    const cfg = WA.getCfg();
    if (!cfg.live || !window.SB || !SB.isConfigured()) return { ok: false, error: "Envio real não está ativo." };
    try {
      const client = await SB.ensureClient();
      const { data, error } = await client.functions.invoke(WA.fnName(), {
        body: { to: WA.normalizePhone(numero), text: "✅ Teste de conexão do NexusCRM. Se você recebeu, o WhatsApp está ativo!" },
      });
      if (error) throw error;
      if (data && data.error) throw new Error(data.error);
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: (e && e.message) ? e.message : String(e) };
    }
  },
};

// ---- Send modal (works for 1 or many leads) --------------------------------
function WhatsAppSendModal({ open, leads, templates, onClose, onSend }) {
  const list = WA.getTemplates();
  const tpls = templates && templates.length ? templates : list;
  const [tplId, setTplId] = wState(tpls[0] ? tpls[0].id : "");
  const [body, setBody] = wState(tpls[0] ? tpls[0].body : "");
  const [sending, setSending] = wState(false);

  wEffect(() => {
    if (open) {
      const first = tpls[0];
      setTplId(first ? first.id : "");
      setBody(first ? first.body : "");
    }
  }, [open]);

  if (!open) return null;
  const count = leads.length;
  const preview = count ? WA.render(body, leads[0]) : body;
  const connected = WA.isConnected();
  const missingPhone = leads.filter((l) => !l.whatsapp).length;

  const pickTpl = (id) => {
    setTplId(id);
    const t = tpls.find((x) => x.id === id);
    if (t) setBody(t.body);
  };

  const selTpl = tpls.find((t) => t.id === tplId) || null;
  const isMeta = !!(selTpl && selTpl.metaName);

  const doSend = async () => {
    setSending(true);
    // para template aprovado, sempre envia o corpo oficial (selTpl.body); senão, o texto editado
    const textToSend = isMeta && selTpl ? selTpl.body : body;
    await onSend(leads.map((l) => l.id), textToSend, selTpl);
    setSending(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={count > 1 ? `Enviar WhatsApp · ${count} leads` : "Enviar WhatsApp"} width={560}>
      <div className={"wa-mode " + (connected ? "live" : "sim")}>
        <Icon name={connected ? "message-circle" : "message-circle"} size={15} />
        {connected
          ? <span>Conectado à API Oficial — os envios serão reais.</span>
          : <span><strong>Modo simulação.</strong> As mensagens serão registradas na timeline de cada lead, mas <strong>não</strong> enviadas de verdade até conectar a API da Meta (Configurações → WhatsApp).</span>}
      </div>

      <div className="form-grid">
        <label className="field">
          <span className="field-label">Modelo de mensagem</span>
          <div className="select-wrap">
            <select className="select" value={tplId} onChange={(e) => pickTpl(e.target.value)}>
              {tpls.map((t) => <option key={t.id} value={t.id}>{t.name}{t.metaName ? " ✓" : ""}</option>)}
            </select>
            <Icon name="chevron-down" size={15} className="select-chevron" />
          </div>
        </label>

        {isMeta && (
          <div className="wa-mode live">
            <Icon name="check" size={15} />
            <span><strong>Template aprovado pela Meta</strong> (<span className="mono">{selTpl.metaName}</span>). Liberado para 1º contato frio. O texto é fixo — só as variáveis são preenchidas automaticamente.</span>
          </div>
        )}

        <label className="field">
          <span className="field-label">Mensagem {isMeta ? <span className="wa-vars">texto oficial — somente leitura</span> : <span className="wa-vars">variáveis: {"{{empresa}} {{contato}} {{cidade}}"}</span>}</span>
          <textarea className="textarea" rows={isMeta ? 6 : 4} value={body} readOnly={isMeta}
            style={isMeta ? { opacity: 0.85, cursor: "default" } : {}}
            onChange={(e) => setBody(e.target.value)} />
        </label>

        {count > 0 && (
          <div className="wa-preview">
            <div className="wa-preview-label">Prévia para <strong>{leads[0].empresa}</strong></div>
            <div className="wa-bubble">{preview}</div>
          </div>
        )}

        {missingPhone > 0 && (
          <div className="auth-msg err">{missingPhone} lead(s) sem número de WhatsApp — serão registrados, mas não teriam envio real.</div>
        )}

        {count > 1 && WA.intervalMin() > 0 && (
          <div className="wa-mode sim">
            <Icon name="clock" size={15} />
            <span>Para evitar bloqueios, as mensagens saem <strong>1 a cada {WA.intervalMin()} min</strong>. A 1ª vai agora e as demais entram na fila (que avança com o CRM aberto).</span>
          </div>
        )}
      </div>

      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" disabled={sending || !body.trim()} onClick={doSend}>
          <Icon name="message-circle" size={15} /> {sending ? "Enviando…" : (count > 1 ? `Enviar para ${count}` : "Enviar")}
        </button>
      </div>
    </Modal>
  );
}

// ---- Floating queue status bar ---------------------------------------------
function WhatsAppQueueBar({ info, onCancel }) {
  const [, force] = wState(0);
  wEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const msLeft = Math.max(0, (info.nextAt || 0) - Date.now());
  const mm = Math.floor(msLeft / 60000);
  const ss = Math.floor((msLeft % 60000) / 1000);
  const eta = info.nextAt ? (mm > 0 ? `${mm}min ${ss}s` : `${ss}s`) : "agora";
  return (
    <div className="wa-queue-bar">
      <span className="wa-queue-icon"><Icon name="message-circle" size={16} /></span>
      <div className="wa-queue-text">
        <div className="wa-queue-title">{info.len} {info.len !== 1 ? "mensagens" : "mensagem"} na fila</div>
        <div className="wa-queue-eta">próxima em {eta}</div>
      </div>
      <button className="wa-queue-cancel" onClick={onCancel} title="Cancelar fila"><Icon name="x" size={15} /></button>
    </div>
  );
}

// ---- Settings panel: connection + automation + templates -------------------
function WhatsAppSettings({ onChanged }) {
  const [cfg, setCfgState] = wState(WA.getCfg());
  const [auto, setAutoState] = wState(WA.getAuto());
  const [templates, setTemplates] = wState(WA.getTemplates());
  const [editing, setEditing] = wState(null); // template being edited
  const [testNum, setTestNum] = wState("");
  const [testing, setTesting] = wState(false);
  const [testMsg, setTestMsg] = wState(null);
  const connected = !!cfg.live;
  const supaOk = !!(window.SB && SB.isConfigured());

  const saveCfg = (next) => { setCfgState(next); WA.setCfg(next); if (onChanged) onChanged(); };
  const saveAuto = (next) => { setAutoState(next); WA.setAuto(next); if (onChanged) onChanged(); };
  const persistTemplates = (next) => { setTemplates(next); WA.saveTemplates(next); if (onChanged) onChanged(); };

  const primeiroTpls = templates.filter((t) => t.primeiro);

  const runTest = async () => {
    setTestMsg(null); setTesting(true);
    const r = await WA.sendTest(testNum.trim());
    setTesting(false);
    setTestMsg(r.ok ? { ok: true, msg: "Enviado! Verifique o WhatsApp do número." } : { ok: false, msg: r.error || "Falha no envio." });
  };

  return (
    <React.Fragment>
      <Panel title="WhatsApp · API Oficial" subtitle="Automatize a prospecção"
        right={<span className={"conn-badge " + (connected ? "on" : "off")}>{connected ? "Envio real" : "Simulação"}</span>}>
        {!connected ? (
          <div className="wa-mode sim" style={{ marginBottom: 16 }}>
            <Icon name="message-circle" size={15} />
            <span><strong>Modo simulação ativo.</strong> Disparos e automação já funcionam (entram na timeline). Para enviar de verdade, publique a função de envio e ative abaixo.</span>
          </div>
        ) : (
          <div className="wa-mode live" style={{ marginBottom: 16 }}>
            <Icon name="message-circle" size={15} />
            <span><strong>Envio real ativo.</strong> As mensagens são enviadas pela WhatsApp Cloud API através da sua função no Supabase.</span>
          </div>
        )}

        <div className="sb-steps" style={{ marginBottom: 16 }}>
          <div className="sb-step"><span className="sb-step-n">1</span> Na Meta: ative a <strong>WhatsApp Cloud API</strong>, pegue o <strong>Phone Number ID</strong> e gere um <strong>token permanente</strong></div>
          <div className="sb-step"><span className="sb-step-n">2</span> No Supabase: publique a função <strong>whatsapp-send</strong> e salve os segredos (token + phone id)</div>
          <div className="sb-step"><span className="sb-step-n">3</span> Volte aqui, faça um <strong>envio de teste</strong> e ative o <strong>envio real</strong></div>
        </div>
        <p className="accent-note" style={{ marginBottom: 16 }}>Passo a passo completo no arquivo <strong>WHATSAPP-REAL-SETUP.md</strong>. O token da Meta fica guardado no servidor — nunca no navegador.</p>

        {!supaOk && (
          <div className="auth-msg err" style={{ marginBottom: 14 }}>O envio real exige o Supabase conectado (a função roda lá). Conecte o Supabase primeiro.</div>
        )}

        <label className="field" style={{ marginBottom: 14 }}>
          <span className="field-label">URL da função (copie do painel Supabase → Edge Functions)</span>
          <input className="input mono" value={cfg.fn || ""}
            placeholder="https://amimshmlwzlnhluqltcf.supabase.co/functions/v1/whatsapp-send"
            onChange={(e) => saveCfg({ ...cfg, fn: e.target.value })} />
          <span className="field-hint">Cole a URL exata. O CRM usa o trecho final como nome da função (ex.: <strong>{WA.fnName()}</strong>).</span>
        </label>

        <SettingsRow icon="message-circle" accent={COLORS.green}
          title="Ativar envio real (produção)"
          desc="Liga depois de publicar a função e salvar os segredos na Meta."
          control={<Toggle on={connected} onChange={(v) => saveCfg({ ...cfg, live: v && supaOk })} />} />

        <div className="wa-test">
          <span className="field-label">Enviar mensagem de teste</span>
          <div className="wa-test-row">
            <input className="input mono" value={testNum} placeholder="5534999998888 (com DDI 55 + DDD)"
              onChange={(e) => { setTestNum(e.target.value); setTestMsg(null); }} />
            <button className="btn btn-wa" disabled={!connected || testing || testNum.trim().length < 10} onClick={runTest}>
              <Icon name="message-circle" size={15} /> {testing ? "Enviando…" : "Testar"}
            </button>
          </div>
          {testMsg && <div className={"auth-msg " + (testMsg.ok ? "ok" : "err")} style={{ marginTop: 10 }}>{testMsg.msg}</div>}
        </div>
      </Panel>

      <Panel title="Automação" subtitle="Disparo automático de prospecção">
        <div className="wa-interval">
          <div className="wa-interval-head">
            <span className="settings-icon" style={{ background: COLORS.amber + "1A", color: COLORS.amber }}><Icon name="clock" size={17} /></span>
            <div className="settings-text">
              <div className="settings-title">Intervalo entre mensagens</div>
              <div className="settings-desc">Espaça os envios em massa para evitar bloqueios no WhatsApp.</div>
            </div>
          </div>
          <div className="wa-interval-opts">
            {[0, 1, 2, 5, 10, 15].map((m) => (
              <button key={m}
                className={"wa-int-opt" + ((cfg.intervalMin != null ? cfg.intervalMin : 5) === m ? " active" : "")}
                onClick={() => saveCfg({ ...cfg, intervalMin: m })}>
                {m === 0 ? "Sem intervalo" : `${m} min`}
              </button>
            ))}
          </div>
          <p className="accent-note">Atual: {(cfg.intervalMin != null ? cfg.intervalMin : 5) === 0 ? "envio imediato (todas de uma vez)" : `1 mensagem a cada ${cfg.intervalMin != null ? cfg.intervalMin : 5} min`}. A fila avança enquanto o CRM estiver aberto.</p>
        </div>

        <SettingsRow icon="message-circle" accent={COLORS.green}
          title="Enviar 1º contato ao criar lead"
          desc='Quando um lead novo entra com status "Novo", envia automaticamente o modelo escolhido.'
          control={<Toggle on={!!auto.onNew} onChange={(v) => saveAuto({ ...auto, onNew: v })} />} />
        {auto.onNew && (
          <div className="wa-auto-tpl">
            <span className="field-label">Modelo do 1º contato automático</span>
            <div className="select-wrap">
              <select className="select" value={auto.templateId || "auto"}
                onChange={(e) => saveAuto({ ...auto, templateId: e.target.value })}>
                <option value="auto">Automático por segmento (recomendado)</option>
                {primeiroTpls.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <Icon name="chevron-down" size={15} className="select-chevron" />
            </div>
            <p className="accent-note">"Automático por segmento" escolhe o modelo certo conforme o segmento do lead.</p>
          </div>
        )}

        <div className="wa-share">
          <div className="wa-share-text">
            <strong>Configuração compartilhada</strong>
            <span>Esta config (automação, envio real, intervalo e modelos) vale para todos os usuários. Salve para sincronizar com a equipe.</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { if (onChanged) { onChanged(); if (window.toast) toast("Configuração salva para toda a equipe", "success"); } }}>
            <Icon name="check" size={14} /> Salvar para a equipe
          </button>
        </div>
      </Panel>

      <Panel title="Modelos de mensagem" subtitle="Edite os textos da prospecção"
        right={<button className="btn btn-ghost btn-sm" onClick={() => setEditing({ id: "tpl-" + Date.now(), name: "", segmento: "Todos", primeiro: true, body: "", _new: true })}><Icon name="plus" size={14} /> Novo</button>}>
        <div className="wa-tpl-list">
          {templates.map((t) => (
            <div className="wa-tpl" key={t.id}>
              <div className="wa-tpl-main">
                <div className="wa-tpl-head">
                  <span className="wa-tpl-name">{t.name || "(sem nome)"}</span>
                  <span className="seg-tag"><span className="seg-dot" style={{ background: t.segmento === "Todos" ? COLORS.blue : (SEGMENT_COLORS[t.segmento] || COLORS.blue) }}></span>{t.segmento}</span>
                  {t.primeiro && <span className="wa-chip">1º contato</span>}
                  {t.metaName ? <span className="wa-chip wa-chip-meta" title={"Template Meta: " + t.metaName}><Icon name="check" size={11} /> Meta</span>
                    : <span className="wa-chip wa-chip-free" title="Texto livre — só dentro da janela de 24h">texto livre</span>}
                </div>
                <div className="wa-tpl-body">{t.body}</div>
              </div>
              <div className="wa-tpl-actions">
                <button className="row-detail-btn" onClick={() => setEditing({ ...t })}>Editar</button>
                <button className="row-trash" title="Remover" onClick={() => {
                  if (window.confirm("Remover este modelo?")) persistTemplates(templates.filter((x) => x.id !== t.id));
                }}><Icon name="trash" size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <WhatsAppTemplateModal
        tpl={editing} open={!!editing} onClose={() => setEditing(null)}
        onSave={(t) => {
          const exists = templates.some((x) => x.id === t.id);
          const next = exists ? templates.map((x) => x.id === t.id ? t : x) : [...templates, t];
          persistTemplates(next);
          setEditing(null);
        }} />
    </React.Fragment>
  );
}

function WhatsAppTemplateModal({ tpl, open, onClose, onSave }) {
  const [form, setForm] = wState(tpl || {});
  wEffect(() => { if (open) setForm(tpl || {}); }, [open, tpl]);
  if (!open) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = (form.name || "").trim() && (form.body || "").trim();

  return (
    <Modal open={open} onClose={onClose} title={form._new ? "Novo modelo" : "Editar modelo"} width={540}>
      <div className="form-grid">
        <div className="field-row">
          <label className="field">
            <span className="field-label">Nome do modelo</span>
            <input className="input" value={form.name || ""} autoFocus placeholder="Ex: 1º contato — Clínica"
              onChange={(e) => set("name", e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">Segmento</span>
            <div className="select-wrap">
              <select className="select" value={form.segmento || "Todos"} onChange={(e) => set("segmento", e.target.value)}>
                <option value="Todos">Todos</option>
                {SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <Icon name="chevron-down" size={15} className="select-chevron" />
            </div>
          </label>
        </div>
        <label className="field">
          <span className="field-label">Mensagem <span className="wa-vars">{"{{empresa}} {{contato}} {{cidade}} {{segmento}} {{cargo}} {{responsavel}}"}</span></span>
          <textarea className="textarea" rows={5} value={form.body || ""} onChange={(e) => set("body", e.target.value)}
            placeholder="Olá, {{contato}}! ..." />
        </label>
        <label className="wa-check-row">
          <Toggle on={!!form.primeiro} onChange={(v) => set("primeiro", v)} />
          <span>Usar como modelo de <strong>1º contato</strong> (entra na automação e disparo por segmento)</span>
        </label>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" disabled={!valid} onClick={() => onSave(form)}>
          <Icon name="check" size={15} /> Salvar modelo
        </button>
      </div>
    </Modal>
  );
}

Object.assign(window, { WA, WhatsAppSendModal, WhatsAppSettings, WhatsAppQueueBar, WA_DEFAULT_TEMPLATES });
