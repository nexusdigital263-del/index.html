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
const WA_TPL_VERSION = 6; // bump → migra modelos padrão preservando os personalizados
const WA_OLD_DEFAULT_IDS = [
  "tpl-generico", "tpl-odonto", "tpl-concess", "tpl-delivery", "tpl-natural", "tpl-followup",
  // v3 default ids (substituídos na v4)
  "meta-odonto", "meta-varejo-delivery", "meta-varejo-natural", "meta-empresas", "meta-saude", "meta-medicos", "meta-followup",
];

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
    id: "meta-veiculos", name: "1º contato — Concessionária / Veículos", segmento: "Concessionária", primeiro: true,
    metaName: "veiculos_contato_inicial_", metaLang: "pt_BR", vars: ["contato"],
    body: "Olá, {{contato}}. Tudo bem? Trabalho ajudando concessionárias e revendas a venderem mais sem depender só do movimento de loja: estruturamos a geração de leads qualificados e o acompanhamento de quem pede test-drive, avaliação ou financiamento, para que menos oportunidades esfriem no caminho. Identifiquei alguns pontos no mercado local que costumam aumentar as vendas. Posso compartilhar com você?",
  },
  {
    id: "meta-delivery", name: "1º contato — Delivery / Restaurantes", segmento: "Delivery", primeiro: true,
    metaName: "delivery_contato_inicial_", metaLang: "pt_BR", vars: ["contato"],
    body: "Olá, {{contato}}. Tudo bem? Trabalho ajudando negócios de delivery e food service a venderem mais sem depender só dos aplicativos, organizando a recompra dos clientes que já pediram e a captação de novos pedidos diretos. Levantei algumas observações sobre o mercado local que costumam aumentar o faturamento e reduzir a dependência de comissões. Posso compartilhar com você?",
  },
  {
    id: "meta-natural", name: "1º contato — Loja Natural (Varejo)", segmento: "Loja Natural", primeiro: true,
    metaName: "varejo_contato_inicial", metaLang: "pt_BR", vars: ["contato"],
    body: "Olá, {{contato}}.\n\nTudo bem?\n\nTrabalho com projetos voltados para crescimento comercial e fortalecimento da presença digital de empresas do varejo.\n\nAnalisando o mercado local, identificamos algumas oportunidades que costumam impactar diretamente a geração de vendas e o aproveitamento dos clientes que já demonstram interesse.\n\nGostaria de compartilhar algumas observações que podem agregar valor ao negócio.\n\nPosso enviar?",
  },
  {
    id: "meta-empresas", name: "1º contato — Empresas (Genérico / Outros)", segmento: "Outros", primeiro: true,
    metaName: "empresas_contato_inicial_", metaLang: "pt_BR", vars: ["contato"],
    body: "Olá, {{contato}}.\n\nTudo bem?\n\nTrabalho com projetos focados em geração de oportunidades comerciais, posicionamento digital e melhoria de processos de vendas.\n\nNos últimos meses, identificamos alguns padrões que aparecem com frequência em empresas que buscam crescer de forma mais previsível.\n\nGostaria de compartilhar algumas observações que podem ser úteis para a operação de vocês.\n\nPosso enviar?",
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
  // migra uma lista de modelos para a versão atual: troca os modelos PADRÃO
  // (antigos ou atuais) pelos do código e PRESERVA os personalizados do usuário.
  // Roda também quando algum modelo padrão novo está faltando (config compartilhada antiga).
  migrateTemplates(saved, ver) {
    if (!Array.isArray(saved) || !saved.length) return WA_DEFAULT_TEMPLATES.slice();
    const defIds = WA_DEFAULT_TEMPLATES.map((t) => t.id);
    // remove SEMPRE os modelos padrão antigos (ex: médicos/saúde descontinuados),
    // mesmo se a versão já estiver atual — eles nunca devem reaparecer.
    const hasOld = saved.some((t) => WA_OLD_DEFAULT_IDS.indexOf(t.id) >= 0 && defIds.indexOf(t.id) < 0);
    const hasAllDefaults = defIds.every((id) => saved.some((t) => t.id === id));
    if (Number(ver) >= WA_TPL_VERSION && hasAllDefaults && !hasOld) return saved;
    const customs = saved.filter((t) => WA_OLD_DEFAULT_IDS.indexOf(t.id) < 0 && defIds.indexOf(t.id) < 0);
    return WA_DEFAULT_TEMPLATES.concat(customs);
  },
  getTemplates() {
    try {
      const saved = JSON.parse(localStorage.getItem(WA_LS.tpl) || "null");
      if (!Array.isArray(saved) || !saved.length) return WA_DEFAULT_TEMPLATES;
      const ver = Number(localStorage.getItem("nexus_wa_tpl_ver") || "0");
      const defIds = WA_DEFAULT_TEMPLATES.map((t) => t.id);
      const hasAllDefaults = defIds.every((id) => saved.some((t) => t.id === id));
      const hasOld = saved.some((t) => WA_OLD_DEFAULT_IDS.indexOf(t.id) >= 0 && defIds.indexOf(t.id) < 0);
      if (ver < WA_TPL_VERSION || !hasAllDefaults || hasOld) {
        const merged = WA.migrateTemplates(saved, ver);
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

  // ---- opt-out (descadastro) ----
  // palavras que indicam que o lead quer parar de receber mensagens
  isOptOut(text) {
    return /\b(sair|parar|pare|para de|para com|descadastr|me remov|remover|n[aã]o quero|n quero|stop|cancelar|nunca mais|desinscrever|me tira|tira meu)\b/i.test(text || "");
  },
  // remove da fila todos os itens de um lead (respondeu / opt-out)
  removeFromQueue(leadId) {
    const q = WA.getQueue();
    const next = q.filter((it) => String(it.leadId) !== String(leadId));
    if (next.length !== q.length) WA.setQueue(next);
    return q.length - next.length;
  },

  // ---- follow-up automático (cadência) ----
  // auto.followups = { enabled, steps:[{afterDays, templateId|'auto'}] }
  defaultFollowups() {
    return { enabled: false, steps: [{ afterDays: 2, templateId: "auto" }, { afterDays: 4, templateId: "auto" }] };
  },
  getFollowupCfg() { const a = WA.getAuto(); return a.followups || WA.defaultFollowups(); },
  // agendamentos pendentes: [{fid, leadId, dueAt, step}]
  getSchedule() { try { return JSON.parse(localStorage.getItem("nexus_wa_followups") || "[]") || []; } catch (e) { return []; } },
  setSchedule(s) { localStorage.setItem("nexus_wa_followups", JSON.stringify(s)); },
  cancelSchedule(leadId) {
    const s = WA.getSchedule();
    const next = s.filter((x) => String(x.leadId) !== String(leadId));
    if (next.length !== s.length) WA.setSchedule(next);
    return s.length - next.length;
  },
  // remove o job atual do lead e agenda o PRÓXIMO passo (se existir)
  scheduleNext(leadId, step) {
    const s = WA.getSchedule().filter((x) => String(x.leadId) !== String(leadId));
    const cfg = WA.getFollowupCfg();
    if (cfg.enabled && cfg.steps && step < cfg.steps.length) {
      const st = cfg.steps[step];
      const dueAt = Date.now() + Math.max(0, Number(st.afterDays) || 0) * 86400000;
      s.push({ fid: "f" + Date.now() + "-" + leadId + "-" + step, leadId, dueAt, step });
    }
    WA.setSchedule(s);
  },
  dueSchedule(now) { return WA.getSchedule().filter((x) => (x.dueAt || 0) <= (now || Date.now())); },

  // ---- limite diário de envios (proteção/aquecimento do número) ----
  getDailyLimit() { const c = WA.getCfg(); return c.dailyLimit != null ? c.dailyLimit : 0; }, // 0 = sem limite
  _today() { return new Date().toISOString().slice(0, 10); },
  getDailyCount() {
    try { const d = JSON.parse(localStorage.getItem("nexus_wa_daily") || "null"); if (d && d.date === WA._today()) return d.count || 0; } catch (e) {}
    return 0;
  },
  incDaily(n) {
    const count = WA.getDailyCount() + (n || 1);
    localStorage.setItem("nexus_wa_daily", JSON.stringify({ date: WA._today(), count }));
    return count;
  },
  remainingToday() { const lim = WA.getDailyLimit(); if (!lim) return Infinity; return Math.max(0, lim - WA.getDailyCount()); },
  canSendMore() { return WA.remainingToday() > 0; },

  // ---- log de erros de envio (recusas da Meta) ----
  getErrors() { try { return JSON.parse(localStorage.getItem("nexus_wa_errors") || "[]") || []; } catch (e) { return []; } },
  logError(leadId, empresa, error) {
    const list = WA.getErrors();
    list.unshift({ id: "e" + Date.now() + "-" + Math.random().toString(16).slice(2, 6), ts: Date.now(), leadId, empresa: empresa || "", error: String(error || "").slice(0, 300) });
    localStorage.setItem("nexus_wa_errors", JSON.stringify(list.slice(0, 100)));
  },
  clearErrors() { localStorage.removeItem("nexus_wa_errors"); },

  // ---- pausa/retomada da fila ----
  isPaused() { return localStorage.getItem("nexus_wa_paused") === "1"; },
  setPaused(v) { if (v) localStorage.setItem("nexus_wa_paused", "1"); else localStorage.removeItem("nexus_wa_paused"); },

  // ---- respostas rápidas (Conversas) ----
  QUICK_DEFAULTS: [
    "Perfeito! Consigo te mostrar em 5 minutos como funciona. Qual o melhor horário para você?",
    "Posso te enviar uma proposta personalizada. Ótimo, qual o melhor e-mail para envio?",
    "Que ótimo! Vamos agendar uma conversa rápida? Tenho horários hoje e amanhã.",
    "Obrigado pelo retorno! Fico à disposição para qualquer dúvida.",
    "Sem problema! Posso te procurar mais para frente. Quando seria um bom momento?",
  ],
  getQuickReplies() { try { const s = JSON.parse(localStorage.getItem("nexus_wa_quick") || "null"); return Array.isArray(s) && s.length ? s : WA.QUICK_DEFAULTS; } catch (e) { return WA.QUICK_DEFAULTS; } },
  setQuickReplies(a) { localStorage.setItem("nexus_wa_quick", JSON.stringify(a)); },

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
      // aplica a migração também na config compartilhada: garante que os modelos
      // novos (veículos, delivery, médicos…) apareçam mesmo vindos de uma config antiga.
      const merged = WA.migrateTemplates(s.templates, s.tplVer || 0);
      localStorage.setItem(WA_LS.tpl, JSON.stringify(merged));
      localStorage.setItem("nexus_wa_tpl_ver", String(WA_TPL_VERSION));
    }
  },

  // pick the best template for a lead's segment (primeiro contato)
  templateForLead(lead, templates) {
    const list = templates || WA.getTemplates();
    return list.find((t) => t.primeiro && t.segmento === lead.segmento)
        || list.find((t) => t.primeiro && t.segmento === "Todos")
        || list[0];
  },

  // 1º contato SEMPRE com template APROVADO pela Meta (metaName presente).
  // Usado pela automação de importação/criação — texto livre é recusado no 1º contato.
  approvedForLead(lead, templates) {
    const list = templates || WA.getTemplates();
    return list.find((t) => t.primeiro && t.metaName && t.segmento === lead.segmento)
        || list.find((t) => t.primeiro && t.metaName && t.segmento === "Todos")
        || list.find((t) => t.metaName) || null;
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
    const validPhone = !!to && to.length >= 12 && to.length <= 13;
    if (cfg.live && window.SB && SB.isConfigured()) {
      if (!validPhone) return { ok: false, simulated: false, error: "Número de WhatsApp inválido — use DDD + número (ex.: 34 99999-8888)" };
      try {
        const client = await SB.ensureClient();
        const headers = await WA.authHeaders();
        if (!headers) return { ok: false, simulated: false, error: "Sessão expirada — saia e entre novamente." };
        const payload = { to, text, leadId: lead.id };
        if (meta && meta.metaName) {
          payload.template = { name: meta.metaName, language: meta.metaLang || "pt_BR" };
          if (meta.components && meta.components.length) payload.template.components = meta.components;
        }
        const { data, error } = await client.functions.invoke(WA.fnName(), { body: payload, headers });
        if (error) throw new Error(await WA.readFnError(error));
        if (data && data.error) throw new Error(data.error);
        return { ok: true, simulated: false, data, wamid: (data && data.id) || null };
      } catch (e) {
        return { ok: false, simulated: false, error: (e && e.message) ? e.message : String(e) };
      }
    }
    // simulated send
    await new Promise((r) => setTimeout(r, 120));
    return { ok: true, simulated: true, noPhone: !to };
  },

  // envia um arquivo (imagem ou documento) pela conversa.
  // media = { base64, mime, filename, kind: "image"|"document", caption }
  async sendMedia(lead, media) {
    const cfg = WA.getCfg();
    const to = WA.normalizePhone(lead.whatsapp);
    const validPhone = !!to && to.length >= 12 && to.length <= 13;
    if (cfg.live && window.SB && SB.isConfigured()) {
      if (!validPhone) return { ok: false, simulated: false, error: "Número de WhatsApp inválido." };
      try {
        const client = await SB.ensureClient();
        const headers = await WA.authHeaders();
        if (!headers) return { ok: false, simulated: false, error: "Sessão expirada — saia e entre novamente." };
        const { data, error } = await client.functions.invoke(WA.fnName(), { body: { to, leadId: lead.id, media }, headers });
        if (error) throw new Error(await WA.readFnError(error));
        if (data && data.error) throw new Error(data.error);
        return { ok: true, simulated: false, data, wamid: (data && data.id) || null };
      } catch (e) {
        return { ok: false, simulated: false, error: (e && e.message) ? e.message : String(e) };
      }
    }
    await new Promise((r) => setTimeout(r, 150));
    return { ok: true, simulated: true, noPhone: !to };
  },

  // pega um token de sessão FRESCO (renova se expirado) e monta o header
  async authHeaders() {
    try {
      const client = await SB.ensureClient();
      if (!client) return null;
      let session = null;
      try { const { data } = await client.auth.getSession(); session = data && data.session; } catch (_) {}
      // renova se faltar sessão ou se o token expira em menos de 2 min
      const exp = session && session.expires_at ? session.expires_at * 1000 : 0;
      if (!session || (exp && exp - Date.now() < 120000)) {
        try {
          const r = await client.auth.refreshSession();
          if (r && r.data && r.data.session) session = r.data.session;
        } catch (_) {}
      }
      const token = session && session.access_token;
      return token ? { Authorization: "Bearer " + token } : null;
    } catch (_) { return null; }
  },

  // extrai a mensagem real de erro retornada pela Edge Function (status não-2xx)
  async readFnError(error) {
    try {
      if (error && error.context && typeof error.context.json === "function") {
        const b = await error.context.json();
        if (b && b.error) return b.error;
        if (b && b.message) return b.message;
      }
    } catch (_) {}
    try {
      if (error && error.context && typeof error.context.text === "function") {
        const t = await error.context.text();
        if (t) return t.slice(0, 200);
      }
    } catch (_) {}
    return (error && error.message) ? error.message : String(error);
  },

  async sendTest(numero, tpl) {
    const cfg = WA.getCfg();
    if (!cfg.live || !window.SB || !SB.isConfigured()) return { ok: false, error: "Envio real não está ativo." };
    try {
      const client = await SB.ensureClient();
      const headers = await WA.authHeaders();
      if (!headers) return { ok: false, error: "Sessão expirada — saia e entre novamente." };
      // lead sintético para preencher as variáveis do template no teste
      const sample = { empresa: "sua empresa", responsavel: "Victor", cidade: "Uberlândia", segmento: "Todos", cargo: "", dono: "CM", whatsapp: numero };
      let body;
      if (tpl && tpl.metaName) {
        const meta = WA.buildMeta(tpl, sample);
        body = { to: WA.normalizePhone(numero), text: WA.render(tpl.body, sample) };
        if (meta) {
          body.template = { name: meta.metaName, language: meta.metaLang || "pt_BR" };
          if (meta.components && meta.components.length) body.template.components = meta.components;
        }
      } else if (tpl) {
        body = { to: WA.normalizePhone(numero), text: WA.render(tpl.body, sample) };
      } else {
        body = { to: WA.normalizePhone(numero), text: "✅ Teste de conexão do NexusCRM. Se você recebeu, o WhatsApp está ativo!" };
      }
      const { data, error } = await client.functions.invoke(WA.fnName(), { body, headers });
      if (error) throw new Error(await WA.readFnError(error));
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
  // escolhe o melhor modelo inicial: se for 1 lead, o template aprovado do segmento dele;
  // se forem vários do mesmo segmento, idem; senão, o primeiro da lista.
  const initialTpl = () => {
    if (leads && leads.length) {
      const segs = Array.from(new Set(leads.map((l) => l.segmento)));
      if (segs.length === 1) {
        const bySeg = WA.approvedForLead(leads[0], tpls) || WA.templateForLead(leads[0], tpls);
        if (bySeg) return bySeg;
      }
    }
    return tpls[0] || null;
  };
  const first0 = initialTpl();
  const [tplId, setTplId] = wState(first0 ? first0.id : "");
  const [body, setBody] = wState(first0 ? first0.body : "");
  const [sending, setSending] = wState(false);

  wEffect(() => {
    if (open) {
      const first = initialTpl();
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
function WhatsAppQueueBar({ info, onCancel, onPause, onResume, onSendNow }) {
  const [, force] = wState(0);
  wEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const paused = info.paused === "limite" ? "limite" : (WA.isPaused() ? "manual" : false);
  const msLeft = Math.max(0, (info.nextAt || 0) - Date.now());
  const mm = Math.floor(msLeft / 60000);
  const ss = Math.floor((msLeft % 60000) / 1000);
  const eta = info.nextAt ? (mm > 0 ? `${mm}min ${ss}s` : `${ss}s`) : "agora";
  return (
    <div className={"wa-queue-bar" + (paused ? " wa-queue-paused" : "")}>
      <span className="wa-queue-icon"><Icon name={paused ? "clock" : "message-circle"} size={16} /></span>
      <div className="wa-queue-text">
        <div className="wa-queue-title">{info.len} {info.len !== 1 ? "mensagens" : "mensagem"} na fila</div>
        <div className="wa-queue-eta">{paused === "limite" ? "limite diário atingido — retoma amanhã" : paused === "manual" ? "fila pausada" : `próxima em ${eta}`}</div>
      </div>
      <div className="wa-queue-actions">
        {paused === "manual"
          ? <button className="wa-queue-btn" onClick={onResume} title="Retomar fila"><Icon name="message-circle" size={14} /> Retomar</button>
          : paused !== "limite" && <React.Fragment>
              <button className="wa-queue-btn" onClick={onSendNow} title="Enviar a próxima agora"><Icon name="arrow-up-right" size={14} /> Agora</button>
              <button className="wa-queue-btn" onClick={onPause} title="Pausar fila"><Icon name="clock" size={14} /> Pausar</button>
            </React.Fragment>}
        <button className="wa-queue-cancel" onClick={onCancel} title="Cancelar fila"><Icon name="x" size={15} /></button>
      </div>
    </div>
  );
}

// ---- Settings panel: connection + automation + templates -------------------
function WhatsAppSettings({ onChanged }) {
  const [cfg, setCfgState] = wState(WA.getCfg());
  const [auto, setAutoState] = wState(WA.getAuto());
  const [templates, setTemplates] = wState(WA.getTemplates());
  const [editing, setEditing] = wState(null); // template being edited
  const [uiTick, setUiTick] = wState(0); // força refresh de contadores/erros
  const refreshUi = () => setUiTick((n) => n + 1);
  const [testNum, setTestNum] = wState("");
  const [testTplId, setTestTplId] = wState("");
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
    const tpl = testTplId ? templates.find((t) => t.id === testTplId) : null;
    const r = await WA.sendTest(testNum.trim(), tpl);
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
          <div className="wa-test-tpl">
            <div className="select-wrap">
              <select className="select" value={testTplId} onChange={(e) => { setTestTplId(e.target.value); setTestMsg(null); }}>
                <option value="">Mensagem de teste padrão</option>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}{t.metaName ? " ✓" : " (texto livre)"}</option>)}
              </select>
              <Icon name="chevron-down" size={15} className="select-chevron" />
            </div>
            <span className="field-hint">{testTplId
              ? (templates.find((t) => t.id === testTplId) && templates.find((t) => t.id === testTplId).metaName
                  ? "Envia o template aprovado pela Meta (variáveis preenchidas com dados de exemplo)."
                  : "Texto livre — só chega se o número já te respondeu nas últimas 24h.")
              : "Mensagem fixa de verificação de conexão."}</span>
          </div>
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

        <FollowupConfig auto={auto} primeiroTpls={primeiroTpls} onSave={saveAuto} />

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

      <Panel title="Proteção do número" subtitle="Limite diário e aquecimento — evita bloqueios da Meta">
        <NumberProtection cfg={cfg} onSaveCfg={saveCfg} tick={uiTick} onRefresh={refreshUi} />
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

// ---- Number protection: daily limit + warmup + error log ------------------
function NumberProtection({ cfg, onSaveCfg, tick, onRefresh }) {
  const tradErr = (s) => (window.traduzWaErro ? window.traduzWaErro(s) : s);
  const limit = cfg.dailyLimit != null ? cfg.dailyLimit : 0;
  const count = WA.getDailyCount();
  const errors = WA.getErrors();
  const remaining = limit ? Math.max(0, limit - count) : null;
  const pct = limit ? Math.min(100, Math.round((count / limit) * 100)) : 0;
  const WARMUP = [
    { d: "Semana 1", v: 20 }, { d: "Semana 2", v: 40 }, { d: "Semana 3", v: 80 },
    { d: "Semana 4", v: 250 }, { d: "Depois", v: 1000 },
  ];

  return (
    <div className="wa-protect">
      <div className="wa-interval-head">
        <span className="settings-icon" style={{ background: COLORS.green + "1A", color: COLORS.green }}><Icon name="shield" size={17} /></span>
        <div className="settings-text">
          <div className="settings-title">Limite diário de envios</div>
          <div className="settings-desc">Número novo tem reputação frágil. Comece devagar e aumente conforme a qualidade sobe.</div>
        </div>
      </div>

      <div className="wa-interval-opts">
        {[0, 20, 50, 100, 250, 500, 1000].map((m) => (
          <button key={m} className={"wa-int-opt" + (limit === m ? " active" : "")}
            onClick={() => onSaveCfg({ ...cfg, dailyLimit: m })}>
            {m === 0 ? "Sem limite" : m}
          </button>
        ))}
      </div>

      {limit > 0 ? (
        <div className="wa-daily">
          <div className="wa-daily-bar"><div className="wa-daily-fill" style={{ width: pct + "%", background: pct >= 100 ? COLORS.red : pct >= 80 ? COLORS.amber : COLORS.green }}></div></div>
          <div className="wa-daily-info">
            <span className="mono">{count}</span> enviados hoje · <span className="mono">{remaining}</span> restantes
            {remaining === 0 && <strong className="wa-daily-full"> — limite atingido, a fila retoma amanhã</strong>}
            <button className="bulk-link" onClick={onRefresh} style={{ marginLeft: 8 }}>atualizar</button>
          </div>
        </div>
      ) : (
        <p className="accent-note">Sem limite — recomendado apenas com o número já aquecido. <span className="mono">{count}</span> enviados hoje.</p>
      )}

      <div className="wa-warmup">
        <div className="wa-warmup-title">Aquecimento sugerido (envios/dia)</div>
        <div className="wa-warmup-steps">
          {WARMUP.map((w) => (
            <div className="wa-warmup-step" key={w.d}>
              <span className="wa-warmup-d">{w.d}</span>
              <span className="wa-warmup-v mono">{w.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="wa-errors">
        <div className="wa-errors-head">
          <div className="settings-title">Erros de envio recentes {errors.length > 0 && <span className="wa-err-count">{errors.length}</span>}</div>
          <div className="wa-errors-actions">
            <button className="bulk-link" onClick={onRefresh}>atualizar</button>
            {errors.length > 0 && <button className="bulk-link wa-err-clear" onClick={() => { if (window.confirm("Limpar o log de erros?")) { WA.clearErrors(); onRefresh(); } }}>limpar</button>}
          </div>
        </div>
        {errors.length === 0 ? (
          <p className="accent-note">Nenhum erro de envio registrado. Quando a Meta recusar uma mensagem, ela aparece aqui com o motivo.</p>
        ) : (
          <div className="wa-err-list">
            {errors.slice(0, 12).map((e) => (
              <div className="wa-err-row" key={e.id}>
                <Icon name="x" size={14} className="wa-err-icon" />
                <div className="wa-err-main">
                  <div className="wa-err-empresa">{e.empresa || "Lead"}</div>
                  <div className="wa-err-msg">{tradErr(e.error)}</div>
                </div>
                <span className="wa-err-time mono">{new Date(e.ts).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Follow-up cadence config (cadência automática) ------------------------
function FollowupConfig({ auto, primeiroTpls, onSave }) {
  const cfg = auto.followups || WA.defaultFollowups();
  const setCfg = (next) => onSave({ ...auto, followups: next });
  const setStep = (i, patch) => {
    const steps = cfg.steps.map((s, j) => j === i ? { ...s, ...patch } : s);
    setCfg({ ...cfg, steps });
  };
  const addStep = () => {
    const last = cfg.steps[cfg.steps.length - 1];
    const afterDays = last ? Number(last.afterDays) + 3 : 2;
    setCfg({ ...cfg, steps: [...cfg.steps, { afterDays, templateId: "auto" }] });
  };
  const removeStep = (i) => setCfg({ ...cfg, steps: cfg.steps.filter((_, j) => j !== i) });

  return (
    <div className="wa-followup">
      <SettingsRow icon="activity" accent={COLORS.purple}
        title="Sequência de follow-up automática"
        desc="Se o lead não responder, reenvia automaticamente nos prazos abaixo. Para assim que ele responde."
        control={<Toggle on={!!cfg.enabled} onChange={(v) => setCfg({ ...cfg, enabled: v })} />} />
      {cfg.enabled && (
        <div className="wa-followup-steps">
          {cfg.steps.map((s, i) => (
            <div className="wa-fu-step" key={i}>
              <span className="wa-fu-num mono">{i + 2}º</span>
              <div className="wa-fu-when">
                <span className="field-hint">após</span>
                <input className="input mono wa-fu-days" type="number" min="1" value={s.afterDays}
                  onChange={(e) => setStep(i, { afterDays: Math.max(1, Number(e.target.value) || 1) })} />
                <span className="field-hint">dias</span>
              </div>
              <div className="select-wrap wa-fu-tpl">
                <select className="select" value={s.templateId || "auto"} onChange={(e) => setStep(i, { templateId: e.target.value })}>
                  <option value="auto">Automático por segmento</option>
                  {primeiroTpls.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <Icon name="chevron-down" size={15} className="select-chevron" />
              </div>
              <button className="row-trash" title="Remover passo" onClick={() => removeStep(i)}><Icon name="trash" size={14} /></button>
            </div>
          ))}
          {cfg.steps.length < 4 && (
            <button className="btn btn-ghost btn-sm" onClick={addStep}><Icon name="plus" size={14} /> Adicionar passo</button>
          )}
          <p className="accent-note">A cadência avança com o CRM aberto e respeita o intervalo anti-bloqueio. Cada passo usa um template aprovado pela Meta.</p>
        </div>
      )}
    </div>
  );
}

function WhatsAppTemplateModal({ tpl, open, onClose, onSave }) {
  const [form, setForm] = wState(tpl || {});
  wEffect(() => { if (open) setForm(tpl || {}); }, [open, tpl]);
  if (!open) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = (form.name || "").trim() && (form.body || "").trim();
  const isMeta = !!(form.metaName || "").trim();
  const varList = (form.vars && form.vars.length)
    ? (Array.isArray(form.vars) ? form.vars.join(", ") : form.vars)
    : "";

  return (
    <Modal open={open} onClose={onClose} title={form._new ? "Novo modelo" : "Editar modelo"} width={560}>
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

        <div className="wa-meta-box">
          <div className="wa-meta-head">
            <span className="settings-icon" style={{ background: COLORS.green + "1A", color: COLORS.green }}><Icon name="check" size={16} /></span>
            <div className="settings-text">
              <div className="settings-title">Template aprovado pela Meta</div>
              <div className="settings-desc">Preencha para liberar este modelo no <strong>1º contato frio</strong>. Deixe em branco para texto livre (só dentro da janela de 24h).</div>
            </div>
          </div>
          <div className="field-row">
            <label className="field">
              <span className="field-label">Nome do template na Meta</span>
              <input className="input mono" value={form.metaName || ""} placeholder="ex: veiculos_contato_inicial"
                onChange={(e) => set("metaName", e.target.value.trim())} />
            </label>
            <label className="field" style={{ maxWidth: 150 }}>
              <span className="field-label">Idioma</span>
              <div className="select-wrap">
                <select className="select" value={form.metaLang || "pt_BR"} onChange={(e) => set("metaLang", e.target.value)}>
                  <option value="pt_BR">Português (BR)</option>
                  <option value="pt_PT">Português (PT)</option>
                  <option value="en_US">Inglês (US)</option>
                  <option value="en">Inglês</option>
                  <option value="es">Espanhol</option>
                </select>
                <Icon name="chevron-down" size={15} className="select-chevron" />
              </div>
            </label>
          </div>
          {isMeta && (
            <label className="field">
              <span className="field-label">Variáveis na ordem ({"{{1}}, {{2}}, {{3}}"}) <span className="wa-vars">separadas por vírgula</span></span>
              <input className="input mono" value={varList} placeholder="ex: contato   ou   responsavel, cidade, empresa"
                onChange={(e) => set("vars", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
              <span className="field-hint">Campos do lead que preenchem cada variável do template, na ordem. Disponíveis: contato, empresa, cidade, cargo, segmento, responsavel.</span>
            </label>
          )}
        </div>
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
