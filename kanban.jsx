// ============================================================
//  Kanban screen — draggable cards (HTML5 DnD via React state)
// ============================================================
const KANBAN_COLS = [
  { status: "Novo",             label: "Prospecção",       icon: "circle-dollar" },
  { status: "Em Contato",       label: "Contato Feito",    icon: "phone" },
  { status: "Reunião Agendada", label: "Reunião Agendada", icon: "calendar" },
  { status: "Proposta Enviada", label: "Proposta Enviada", icon: "mail" },
  { status: "Fechado",          label: "Fechado",          icon: "check" },
  { status: "Perdido",          label: "Perdido",          icon: "x" },
];

function KanbanCard({ lead, onOpenLead, onDragStart, onDragEnd, dragging }) {
  return (
    <div
      className={"kanban-card" + (dragging ? " dragging" : "")}
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onDragEnd={onDragEnd}
      onClick={() => onOpenLead(lead.id)}
    >
      <div className="kc-top">
        <span className="kc-empresa">{lead.empresa}</span>
        <PriorityBadge priority={lead.prioridade} />
      </div>
      <span className="seg-tag kc-seg" style={{ "--seg": SEGMENT_COLORS[lead.segmento] }}>
        <span className="seg-dot" style={{ background: SEGMENT_COLORS[lead.segmento] }}></span>
        {lead.segmento}
      </span>
      <div className="kc-valor mono">{fmtBRL(lead.valor)}<small>/mês</small></div>
      <div className="kc-foot">
        <span className="kc-days"><Icon name="clock" size={13} /> {lead.diasNoFunil}d no funil</span>
        <Avatar initials={lead.dono} size={24} />
      </div>
    </div>
  );
}

function Kanban({ leads, onOpenLead, onMoveLead }) {
  const [draggingId, setDraggingId] = useState(null);
  const [overCol, setOverCol] = useState(null);

  const onDragStart = (e, id) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", String(id)); } catch (err) {}
  };
  const onDragEnd = () => { setDraggingId(null); setOverCol(null); };

  const onDrop = (status) => {
    if (draggingId != null) onMoveLead(draggingId, status);
    setDraggingId(null);
    setOverCol(null);
  };

  const byStatus = useMemo(() => {
    const map = {};
    KANBAN_COLS.forEach((c) => { map[c.status] = leads.filter((l) => l.status === c.status); });
    return map;
  }, [leads]);

  return (
    <div className="screen-pad kanban-screen fade-in">
      <div className="kanban-board">
        {KANBAN_COLS.map((col) => {
          const items = byStatus[col.status];
          const total = items.reduce((s, l) => s + l.valor, 0);
          const meta = STATUS_META[col.status];
          return (
            <div
              key={col.status}
              className={"kanban-col" + (overCol === col.status ? " col-over" : "")}
              onDragOver={(e) => { e.preventDefault(); setOverCol(col.status); }}
              onDragLeave={(e) => { if (e.currentTarget === e.target) setOverCol(null); }}
              onDrop={() => onDrop(col.status)}
            >
              <div className="kanban-col-head">
                <div className="kch-left">
                  <span className="kch-dot" style={{ background: meta.color }}></span>
                  <span className="kch-label">{col.label}</span>
                  <span className="kch-count">{items.length}</span>
                </div>
                <span className="kch-total mono">{fmtBRLk(total)}</span>
              </div>
              <div className="kanban-col-body">
                {items.map((lead) => (
                  <KanbanCard key={lead.id} lead={lead} onOpenLead={onOpenLead}
                    onDragStart={onDragStart} onDragEnd={onDragEnd} dragging={draggingId === lead.id} />
                ))}
                {overCol === col.status && draggingId != null && (
                  <div className="kanban-drop-hint">Soltar aqui</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { Kanban });
