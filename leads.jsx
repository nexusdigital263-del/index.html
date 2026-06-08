// ============================================================
//  Leads screen — table, filters, search, pagination + drawer
// ============================================================
const PAGE_SIZE = 8;

function CheckBox({ checked, indeterminate, onChange, title }) {
  return (
    <button className={"lead-check" + (checked ? " checked" : "") + (indeterminate ? " indet" : "")}
      title={title} onClick={(e) => { e.stopPropagation(); onChange(); }}>
      {checked && !indeterminate && <Icon name="check" size={12} strokeWidth={3} />}
      {indeterminate && <span className="check-dash"></span>}
    </button>
  );
}

function LeadsTable({ leads, onOpenLead, onDeleteLead, onDeleteLeads, canDelete }) {
  const [search, setSearch] = useState("");
  const [segFilter, setSegFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [cityFilter, setCityFilter] = useState("Todas");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (q && !(`${l.empresa} ${l.responsavel}`.toLowerCase().includes(q))) return false;
      if (segFilter !== "Todos" && l.segmento !== segFilter) return false;
      if (statusFilter !== "Todos" && l.status !== statusFilter) return false;
      if (cityFilter !== "Todas" && l.cidade !== cityFilter) return false;
      return true;
    });
  }, [leads, search, segFilter, statusFilter, cityFilter]);

  useEffect(() => { setPage(1); }, [search, segFilter, statusFilter, cityFilter]);

  // Drop selections that no longer exist (e.g. after deletion)
  useEffect(() => {
    setSelected((prev) => {
      const ids = new Set(leads.map((l) => l.id));
      let changed = false;
      const next = new Set();
      prev.forEach((id) => { if (ids.has(id)) next.add(id); else changed = true; });
      return changed ? next : prev;
    });
  }, [leads]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = page > pageCount ? pageCount : page;
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const filteredIds = useMemo(() => filtered.map((l) => l.id), [filtered]);
  const selectedInFilter = filteredIds.filter((id) => selected.has(id)).length;
  const allSelected = filtered.length > 0 && selectedInFilter === filtered.length;
  const someSelected = selectedInFilter > 0 && !allSelected;

  const toggleOne = (id) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleAll = () => setSelected((prev) => {
    const next = new Set(prev);
    if (allSelected) filteredIds.forEach((id) => next.delete(id));
    else filteredIds.forEach((id) => next.add(id));
    return next;
  });
  const clearSelection = () => setSelected(new Set());
  const bulkDelete = () => {
    const ids = filteredIds.filter((id) => selected.has(id));
    if (!ids.length) return;
    if (window.confirm(`Remover ${ids.length} lead${ids.length !== 1 ? "s" : ""} selecionado${ids.length !== 1 ? "s" : ""}? Esta ação não pode ser desfeita.`)) {
      onDeleteLeads(ids);
      clearSelection();
    }
  };

  return (
    <div className="screen-pad fade-in">
      <div className="filter-bar">
        <div className="search-input">
          <Icon name="search" size={16} className="search-icon" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por empresa ou contato..." />
        </div>
        <Select value={segFilter} onChange={setSegFilter} options={["Todos", ...SEGMENTS]} />
        <Select value={statusFilter} onChange={setStatusFilter} options={["Todos", ...STATUS]} />
        <Select value={cityFilter} onChange={setCityFilter} options={["Todas", ...CITIES]} />
        <div className="filter-count">{filtered.length} de {leads.length}</div>
      </div>

      {canDelete && selectedInFilter > 0 && (
        <div className="bulk-bar">
          <div className="bulk-info">
            <CheckBox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} title="Selecionar todos" />
            <span className="bulk-count">{selectedInFilter} selecionado{selectedInFilter !== 1 ? "s" : ""}</span>
          </div>
          <div className="bulk-actions">
            {!allSelected && (
              <button className="bulk-link" onClick={toggleAll}>Selecionar todos os {filtered.length}</button>
            )}
            <button className="bulk-link" onClick={clearSelection}>Limpar seleção</button>
            <button className="btn btn-danger btn-sm" onClick={bulkDelete}>
              <Icon name="trash" size={15} /> Excluir selecionados
            </button>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {canDelete && (
                <th className="col-check">
                  <CheckBox checked={allSelected} indeterminate={someSelected} onChange={toggleAll}
                    title={allSelected ? "Desmarcar todos" : "Selecionar todos"} />
                </th>
              )}
              <th className="col-num">#</th>
              <th>Empresa</th>
              <th>Segmento</th>
              <th>Responsável</th>
              <th>Cidade</th>
              <th>Status</th>
              <th>Último Contato</th>
              <th>Próxima Ação</th>
              <th className="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className={"data-row" + (selected.has(l.id) ? " row-selected" : "")} onClick={() => onOpenLead(l.id)}>
                {canDelete && (
                  <td className="col-check" onClick={(e) => e.stopPropagation()}>
                    <CheckBox checked={selected.has(l.id)} onChange={() => toggleOne(l.id)} title="Selecionar lead" />
                  </td>
                )}
                <td className="col-num mono">{String(l.id).padStart(2, "0")}</td>
                <td>
                  <div className="cell-empresa">
                    <span className="cell-empresa-name">{l.empresa}</span>
                    <span className="cell-empresa-cnpj mono">{l.cnpj}</span>
                  </div>
                </td>
                <td>
                  <span className="seg-tag" style={{ "--seg": SEGMENT_COLORS[l.segmento] }}>
                    <span className="seg-dot" style={{ background: SEGMENT_COLORS[l.segmento] }}></span>
                    {l.segmento}
                  </span>
                </td>
                <td>
                  <div className="cell-resp">
                    <Avatar initials={l.dono} size={26} />
                    <span>{l.responsavel}</span>
                  </div>
                </td>
                <td className="cell-muted">{l.cidade}</td>
                <td><StatusBadge status={l.status} pulse /></td>
                <td className="cell-muted mono">{fmtDate(l.ultimoContato)}</td>
                <td className="cell-action-text">{l.proximaAcao}</td>
                <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                  <div className="row-actions">
                    <button className="row-detail-btn" onClick={() => onOpenLead(l.id)}>Ver Detalhes</button>
                    {canDelete && (
                      <button className="row-trash" title="Remover lead" onClick={() => {
                        if (window.confirm(`Remover o lead "${l.empresa}"? Esta ação não pode ser desfeita.`)) onDeleteLead(l.id);
                      }}><Icon name="trash" size={15} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={10} className="empty-row">Nenhum lead encontrado com os filtros atuais.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span className="pagination-info">
          Mostrando {rows.length ? (current - 1) * PAGE_SIZE + 1 : 0}–{(current - 1) * PAGE_SIZE + rows.length} de {filtered.length}
        </span>
        <div className="pagination-controls">
          <button className="page-btn" disabled={current === 1} onClick={() => setPage(current - 1)}>
            <Icon name="chevron-left" size={16} />
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <button key={p} className={"page-btn" + (p === current ? " page-btn-active" : "")}
              onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="page-btn" disabled={current === pageCount} onClick={() => setPage(current + 1)}>
            <Icon name="chevron-right" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Lead detail drawer content -------------------------------------------
function LeadDetail({ lead, onClose, onAddInteraction, onEdit, onDelete, canDelete }) {
  const [tipo, setTipo] = useState("Ligação");
  const [nota, setNota] = useState("");
  if (!lead) return null;

  const submit = () => {
    if (!nota.trim()) return;
    onAddInteraction(lead.id, { tipo, nota: nota.trim() });
    setNota("");
  };

  const sorted = [...lead.interacoes].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div className="lead-detail">
      <div className="drawer-head">
        <div className="drawer-head-top">
          <span className="seg-tag" style={{ "--seg": SEGMENT_COLORS[lead.segmento] }}>
            <span className="seg-dot" style={{ background: SEGMENT_COLORS[lead.segmento] }}></span>
            {lead.segmento}
          </span>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <h2 className="drawer-empresa">{lead.empresa}</h2>
        <div className="drawer-status-row">
          <StatusBadge status={lead.status} pulse />
          <PriorityBadge priority={lead.prioridade} />
          <span className="drawer-valor mono">{fmtBRL(lead.valor)}<small>/mês</small></span>
        </div>
      </div>

      <div className="drawer-body">
        <div className="detail-grid">
          <div className="detail-item"><span className="detail-k"><Icon name="briefcase" size={14} /> CNPJ</span><span className="detail-v mono">{lead.cnpj}</span></div>
          <div className="detail-item"><span className="detail-k"><Icon name="map-pin" size={14} /> Cidade</span><span className="detail-v">{lead.cidade}</span></div>
          <div className="detail-item"><span className="detail-k"><Icon name="user" size={14} /> Contato</span><span className="detail-v">{lead.responsavel}</span></div>
          <div className="detail-item"><span className="detail-k"><Icon name="briefcase" size={14} /> Cargo</span><span className="detail-v">{lead.cargo}</span></div>
          <div className="detail-item"><span className="detail-k"><Icon name="message-circle" size={14} /> WhatsApp</span><span className="detail-v mono">{lead.whatsapp}</span></div>
          <div className="detail-item"><span className="detail-k"><Icon name="user" size={14} /> Responsável</span><span className="detail-v detail-rep"><Avatar initials={lead.dono} size={22} /> {REPS[lead.dono].name}</span></div>
        </div>

        <div className="detail-section-label">Adicionar interação</div>
        <div className="add-interaction">
          <div className="add-int-types">
            {Object.keys(INTERACTION_META).map((t) => (
              <button key={t} className={"int-type" + (tipo === t ? " active" : "")}
                style={tipo === t ? { "--c": INTERACTION_META[t].color, borderColor: INTERACTION_META[t].color + "66", color: INTERACTION_META[t].color, background: INTERACTION_META[t].color + "14" } : {}}
                onClick={() => setTipo(t)}>
                <Icon name={INTERACTION_META[t].icon} size={14} /> {t}
              </button>
            ))}
          </div>
          <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={3}
            placeholder="Descreva a interação..." className="textarea" />
          <button className="btn btn-primary btn-block" onClick={submit} disabled={!nota.trim()}>
            <Icon name="plus" size={16} /> Registrar
          </button>
        </div>

        <div className="detail-section-label">Timeline de interações</div>
        <div className="timeline">
          {sorted.map((it) => {
            const meta = INTERACTION_META[it.tipo];
            return (
              <div className="tl-item" key={it.id}>
                <div className="tl-marker" style={{ background: meta.color + "1A", color: meta.color, borderColor: meta.color + "44" }}>
                  <Icon name={meta.icon} size={13} />
                </div>
                <div className="tl-content">
                  <div className="tl-head">
                    <span className="tl-type" style={{ color: meta.color }}>{it.tipo}</span>
                    <span className="tl-date mono">{fmtDate(it.data)}</span>
                  </div>
                  <p className="tl-note">{it.nota}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="drawer-foot">
        {canDelete ? (
          <button className="btn btn-danger" onClick={() => {
            if (window.confirm(`Remover o lead "${lead.empresa}"? Esta ação não pode ser desfeita.`)) onDelete(lead.id);
          }}><Icon name="trash" size={15} /> Excluir</button>
        ) : <span></span>}
        <div className="drawer-foot-right">
          <button className="btn btn-ghost" onClick={onClose}>Fechar</button>
          <button className="btn btn-primary" onClick={() => onEdit(lead)}><Icon name="edit" size={15} /> Editar Lead</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LeadsTable, LeadDetail });
