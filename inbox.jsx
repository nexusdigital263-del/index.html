// ============================================================
//  Conversas — mini-CRM / caixa de entrada do WhatsApp
//  Mostra os leads que estão em conversa (respostas recebidas e
//  mensagens enviadas) num layout de chat: lista + thread + resposta.
// ============================================================
const { useState: iState, useMemo: iMemo, useEffect: iEffect, useRef: iRef } = React;

// hora (HH:MM) a partir do timestamp real da mensagem; volta "" se não houver
function msgTime(m) {
  let t = m.ts ? Number(m.ts) : null;
  if (t == null) { const mm = /^in-(\d{10,})/.exec(m.id || ""); if (mm) t = Number(mm[1]); }
  if (t == null) return "";
  const d = new Date(t);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// status de entrega de uma mensagem enviada (✓ enviado, ✓✓ entregue, ✓✓ lido azul, ⚠ falhou)
function MsgStatus({ status }) {
  if (status === "failed") return <span className="msg-status failed" title="Falha no envio"> ⚠</span>;
  const cls = status === "read" ? "read" : (status === "delivered" ? "delivered" : "sent");
  const title = status === "read" ? "Lido" : (status === "delivered" ? "Entregue" : "Enviado");
  const double = status === "delivered" || status === "read";
  return (
    <span className={"msg-status " + cls} title={title}>
      <svg width="16" height="11" viewBox="0 0 18 11" fill="none" aria-hidden="true">
        <path d="M1 5.8 4 9l6.5-7.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        {double && <path d="M7 9l1 0.9L14.8 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </span>
  );
}

// rótulo curto para o chip de resposta rápida
function quickLabel(q) {
  const w = q.split(/\s+/).slice(0, 4).join(" ");
  return w.length < q.length ? w + "…" : w;
}

// mensagens de WhatsApp de um lead (enviadas + recebidas), em ordem cronológica.
// Ordena por timestamp real (ts). Mensagens antigas sem ts mantêm a ordem de
// inserção do array (que já é cronológica) — NÃO usa a data, que pode ser fixa.
function inResolveTs(it) {
  if (it.ts) return Number(it.ts);
  const m = /^in-(\d{10,})/.exec(it.id || "");
  if (m) return Number(m[1]); // recebidas antigas têm o tempo embutido no id
  return null;
}
function waThread(lead) {
  const arr = (lead.interacoes || []).filter((it) => it.dir === "in" || it.tipo === "WhatsApp");
  let last = 0;
  const tagged = arr.map((it, i) => {
    let t = inResolveTs(it);
    if (t == null) { t = last + 1; } // sem tempo: logo após a anterior (preserva ordem do array)
    else if (t < last) { t = last + 1; } // mantém monotônico se vier fora de ordem
    last = t;
    return { it, i, t };
  });
  tagged.sort((a, b) => a.t - b.t || a.i - b.i);
  return tagged.map((x) => x.it);
}
function lastThreadDate(msgs) {
  return msgs.length ? msgs[msgs.length - 1].data || "" : "";
}

function InboxScreen({ leads, onReply, onMarkRead, onClearConversation, onSetOptOut, onMoveLead, onSendMedia, onOpenLead }) {
  const convos = iMemo(() => {
    return leads
      .map((l) => {
        const msgs = waThread(l);
        return { lead: l, msgs, last: lastThreadDate(msgs), hasReply: msgs.some((m) => m.dir === "in") };
      })
      .filter((c) => c.msgs.length > 0)
      .sort((a, b) => {
        const ua = a.lead.unread || 0, ub = b.lead.unread || 0;
        if (ub !== ua) return ub - ua;            // não lidas primeiro
        return (b.last || "").localeCompare(a.last || ""); // depois mais recentes
      });
  }, [leads]);

  const [selId, setSelId] = iState(null);
  const [filter, setFilter] = iState("all"); // all | unread | replied
  const [search, setSearch] = iState("");
  const [reply, setReply] = iState("");
  const chatRef = iRef(null);

  const totalUnread = iMemo(() => convos.reduce((s, c) => s + (c.lead.unread || 0), 0), [convos]);

  const filtered = iMemo(() => {
    const q = search.trim().toLowerCase();
    return convos.filter((c) => {
      if (filter === "unread" && !(c.lead.unread > 0)) return false;
      if (filter === "replied" && !c.hasReply) return false;
      if (q && !(`${c.lead.empresa} ${c.lead.responsavel}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [convos, filter, search]);

  // seleção inicial / mantém uma conversa válida selecionada
  iEffect(() => {
    if (!convos.length) { if (selId != null) setSelId(null); return; }
    if (selId == null || !convos.some((c) => c.lead.id === selId)) {
      setSelId((filtered[0] || convos[0]).lead.id);
    }
  }, [convos, filtered]);

  const sel = convos.find((c) => c.lead.id === selId) || null;

  // marca como lida ao abrir
  iEffect(() => {
    if (sel && sel.lead.unread > 0) onMarkRead(sel.lead.id);
  }, [selId, sel && sel.lead.unread]);

  // rola o chat para o fim quando muda a conversa ou chegam mensagens
  iEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [selId, sel && sel.msgs.length]);

  const selectConvo = (id) => { setSelId(id); setReply(""); };
  const removeConvo = (lead) => {
    if (window.confirm(`Excluir a conversa com "${lead.empresa}"? As mensagens trocadas no WhatsApp serão removidas. O lead continua na sua base.`)) {
      onClearConversation(lead.id);
    }
  };
  const sendReply = () => {
    if (!reply.trim() || !sel) return;
    onReply(sel.lead.id, reply.trim());
    setReply("");
  };

  const connected = window.WA ? WA.isConnected() : false;

  if (!convos.length) {
    return (
      <div className="screen-pad fade-in">
        <div className="empty-state inbox-empty">
          <span className="inbox-empty-icon"><Icon name="message-circle" size={30} /></span>
          <p>Nenhuma conversa ainda.</p>
          <span className="inbox-empty-sub">Quando seus leads responderem à prospecção no WhatsApp, as conversas aparecem aqui — como num mini-CRM de atendimento.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="inbox-screen fade-in">
      {/* ---- lista de conversas ---- */}
      <aside className="inbox-list">
        <div className="inbox-list-head">
          <div className="search-input inbox-search">
            <Icon name="search" size={15} className="search-icon" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar conversa..." />
          </div>
          <div className="inbox-filters">
            {[["all", "Todas"], ["unread", "Não lidas"], ["replied", "Responderam"]].map(([k, lbl]) => (
              <button key={k} className={"inbox-filter" + (filter === k ? " active" : "")} onClick={() => setFilter(k)}>
                {lbl}{k === "unread" && totalUnread > 0 ? ` ${totalUnread}` : ""}
              </button>
            ))}
          </div>
        </div>
        <div className="inbox-convos">
          {filtered.map((c) => {
            const last = c.msgs[c.msgs.length - 1];
            const preview = last ? (last.dir === "in" ? "" : "Você: ") + (last.nota || "") : "";
            return (
              <button key={c.lead.id}
                className={"inbox-convo" + (c.lead.id === selId ? " active" : "") + (c.lead.unread > 0 ? " unread" : "")}
                onClick={() => selectConvo(c.lead.id)}>
                <Avatar initials={c.lead.dono} size={42} />
                <div className="inbox-convo-main">
                  <div className="inbox-convo-top">
                    <span className="inbox-convo-name">{c.lead.empresa}</span>
                    <span className="inbox-convo-date mono">{fmtDate(c.last)}</span>
                  </div>
                  <div className="inbox-convo-bottom">
                    <span className="inbox-convo-preview">{preview}</span>
                    {c.lead.unread > 0 && <span className="inbox-unread-pill">{c.lead.unread}</span>}
                  </div>
                  <div className="inbox-convo-tags">
                    <span className="seg-tag"><span className="seg-dot" style={{ background: SEGMENT_COLORS[c.lead.segmento] || COLORS.blue }}></span>{c.lead.segmento}</span>
                    {!c.hasReply && <span className="inbox-tag-sent">aguardando resposta</span>}
                  </div>
                </div>
                <span className="inbox-convo-del" title="Excluir conversa" role="button"
                  onClick={(e) => { e.stopPropagation(); removeConvo(c.lead); }}>
                  <Icon name="trash" size={15} />
                </span>
              </button>
            );
          })}
          {!filtered.length && <div className="inbox-empty-list">Nenhuma conversa neste filtro.</div>}
        </div>
      </aside>

      {/* ---- thread + resposta ---- */}
      <section className="inbox-thread">
        {sel ? (
          <React.Fragment>
            <header className="inbox-thread-head">
              <div className="inbox-thread-id">
                <Avatar initials={sel.lead.dono} size={40} />
                <div className="inbox-thread-meta">
                  <h3>{sel.lead.empresa}</h3>
                  <span className="inbox-thread-sub">{sel.lead.responsavel}{sel.lead.whatsapp ? " · " + sel.lead.whatsapp : ""}</span>
                </div>
              </div>
              <div className="inbox-thread-actions">
                {onMoveLead ? (
                  <div className="inbox-status-wrap select-wrap" title="Mover no funil">
                    <select className="select inbox-status-select" value={sel.lead.status}
                      style={{ "--st": (STATUS_META[sel.lead.status] || {}).color || COLORS.blue }}
                      onChange={(e) => onMoveLead(sel.lead.id, e.target.value)}>
                      {STATUS.map((s) => <option key={s} value={s}>{(STATUS_META[s] || {}).kanban || s}</option>)}
                    </select>
                    <Icon name="chevron-down" size={14} className="select-chevron" />
                  </div>
                ) : <StatusBadge status={sel.lead.status} />}
                <button className="btn btn-ghost btn-sm" onClick={() => onOpenLead(sel.lead.id)}>
                  <Icon name="external-link" size={14} /> Abrir lead
                </button>
                {onSetOptOut && (leadOptedOut(sel.lead)
                  ? <button className="btn btn-ghost btn-sm" title="Reativar envios" onClick={() => onSetOptOut(sel.lead.id, false)}><Icon name="check" size={14} /> Reativar</button>
                  : <button className="btn btn-ghost btn-sm inbox-optout-btn" title="Não enviar mais mensagens" onClick={() => { if (window.confirm(`Marcar "${sel.lead.empresa}" como opt-out? Ele não receberá mais mensagens automáticas.`)) onSetOptOut(sel.lead.id, true); }}><Icon name="shield" size={14} /> Opt-out</button>)}
                <button className="icon-btn inbox-thread-del" title="Excluir conversa" onClick={() => removeConvo(sel.lead)}>
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </header>

            {leadOptedOut(sel.lead) && (
              <div className="inbox-optout-banner"><Icon name="shield" size={14} /> Lead descadastrado (opt-out) — envios automáticos estão bloqueados para este contato.</div>
            )}

            <div className="inbox-chat" ref={chatRef}>
              {sel.msgs.map((m) => {
                const inbound = m.dir === "in";
                return (
                  <div key={m.id} className={"chat-row " + (inbound ? "in" : "out")}>
                    <div className="chat-bubble">
                      {m.media && (
                        <div className={"chat-attach" + (m.media.kind === "image" ? " img" : "")}>
                          <Icon name={m.media.kind === "image" ? "external-link" : "briefcase"} size={15} />
                          <span className="chat-attach-name">{m.media.filename || (m.media.kind === "image" ? "Imagem" : "Documento")}</span>
                        </div>
                      )}
                      <div className="chat-text">{m.nota}</div>
                      <div className="chat-time mono">
                        {fmtDate(m.data)}{msgTime(m) ? " · " + msgTime(m) : ""}
                        {!inbound && <MsgStatus status={m.status} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {sel.lead.whatsapp && (
              <div className="inbox-quick">
                {WA.getQuickReplies().map((q, i) => (
                  <button key={i} className="inbox-quick-chip" title={q} onClick={() => setReply(q)}>{quickLabel(q)}</button>
                ))}
              </div>
            )}

            <div className="inbox-composer">
              {onSendMedia && (
                <label className="inbox-attach" title="Anexar imagem ou documento" style={{ pointerEvents: sel.lead.whatsapp ? "auto" : "none", opacity: sel.lead.whatsapp ? 1 : 0.4 }}>
                  <Icon name="plus" size={18} />
                  <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} disabled={!sel.lead.whatsapp}
                    onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) { onSendMedia(sel.lead.id, f, reply.trim()); setReply(""); } e.target.value = ""; }} />
                </label>
              )}
              <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={1}
                placeholder={sel.lead.whatsapp ? "Escreva uma resposta…  (Ctrl+Enter envia)" : "Lead sem número de WhatsApp"}
                disabled={!sel.lead.whatsapp}
                className="textarea inbox-composer-input"
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendReply(); }} />
              <button className="btn btn-wa inbox-send" onClick={sendReply} disabled={!reply.trim() || !sel.lead.whatsapp}>
                <Icon name="message-circle" size={16} /> Enviar
              </button>
            </div>
            {!connected && (
              <div className="inbox-sim-note">Modo simulação — as respostas entram na timeline mas não são enviadas de verdade até conectar a API da Meta.</div>
            )}
          </React.Fragment>
        ) : (
          <div className="inbox-noselect">Selecione uma conversa à esquerda.</div>
        )}
      </section>
    </div>
  );
}

Object.assign(window, { InboxScreen });
