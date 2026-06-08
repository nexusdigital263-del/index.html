// ============================================================
//  Agenda screen — month calendar + day tasks + new-task modal
// ============================================================
const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function isoOf(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function Calendar({ tasks, selected, onSelect, viewYear, viewMonth, onMonth }) {
  const first = new Date(viewYear, viewMonth, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const today = "2026-06-07";

  const counts = useMemo(() => {
    const m = {};
    tasks.forEach((t) => { m[t.data] = (m[t.data] || 0) + 1; });
    return m;
  }, [tasks]);

  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="calendar">
      <div className="cal-head">
        <div className="cal-title">{MONTH_NAMES[viewMonth]} <span className="mono">{viewYear}</span></div>
        <div className="cal-nav">
          <button className="icon-btn" onClick={() => onMonth(-1)}><Icon name="chevron-left" size={16} /></button>
          <button className="icon-btn" onClick={() => onMonth(1)}><Icon name="chevron-right" size={16} /></button>
        </div>
      </div>
      <div className="cal-grid cal-weekdays">
        {WEEKDAYS.map((w) => <div key={w} className="cal-weekday">{w}</div>)}
      </div>
      <div className="cal-grid">
        {cells.map((d, i) => {
          if (d == null) return <div key={i} className="cal-cell cal-empty"></div>;
          const iso = isoOf(viewYear, viewMonth, d);
          const n = counts[iso] || 0;
          return (
            <button key={i}
              className={"cal-cell" + (iso === selected ? " cal-selected" : "") + (iso === today ? " cal-today" : "")}
              onClick={() => onSelect(iso)}>
              <span className="cal-daynum">{d}</span>
              {n > 0 && <span className="cal-dots">{Array.from({ length: Math.min(n, 3) }).map((_, j) => <span key={j} className="cal-dot"></span>)}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TaskRow({ task, lead, onToggle, onDelete }) {
  const meta = INTERACTION_META[task.tipo];
  const done = task.status === "Concluído";
  return (
    <div className={"task-row" + (done ? " task-done" : "")}>
      <button className={"task-check" + (done ? " checked" : "")} onClick={() => onToggle(task.id)}>
        {done && <Icon name="check" size={13} strokeWidth={3} />}
      </button>
      <span className="task-hora mono">{task.hora}</span>
      <span className="task-type-icon" style={{ background: meta.color + "1A", color: meta.color }}>
        <Icon name={meta.icon} size={14} />
      </span>
      <div className="task-main">
        <div className="task-line1">
          <span className="task-type" style={{ color: meta.color }}>{task.tipo}</span>
          <span className="task-lead">· {lead ? lead.empresa : "—"}</span>
        </div>
        <div className="task-obs">{task.obs}</div>
      </div>
      <span className={"task-status " + (done ? "done" : "pending")}>{task.status}</span>
      <button className="task-trash" title="Remover tarefa" onClick={() => onDelete(task.id)}>
        <Icon name="trash" size={15} />
      </button>
    </div>
  );
}

function Agenda({ tasks, leads, onToggleTask, onAddTask, onDeleteTask }) {
  const [selected, setSelected] = useState("2026-06-07");
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(5); // June
  const [modal, setModal] = useState(false);

  const onMonth = (dir) => {
    let m = viewMonth + dir, y = viewYear;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setViewMonth(m); setViewYear(y);
  };

  const dayTasks = useMemo(() =>
    tasks.filter((t) => t.data === selected).sort((a, b) => a.hora.localeCompare(b.hora)),
    [tasks, selected]);

  const leadById = useMemo(() => Object.fromEntries(leads.map((l) => [l.id, l])), [leads]);
  const pending = dayTasks.filter((t) => t.status === "Pendente").length;

  return (
    <div className="screen-pad agenda-screen fade-in">
      <div className="agenda-grid">
        <Panel noPad className="agenda-cal-panel">
          <Calendar tasks={tasks} selected={selected} onSelect={setSelected}
            viewYear={viewYear} viewMonth={viewMonth} onMonth={onMonth} />
        </Panel>

        <Panel
          title={fmtDateLong(selected)}
          subtitle={`${dayTasks.length} tarefa${dayTasks.length !== 1 ? "s" : ""} · ${pending} pendente${pending !== 1 ? "s" : ""}`}
          right={<button className="btn btn-primary" onClick={() => setModal(true)}><Icon name="plus" size={16} /> Nova Tarefa</button>}
          noPad
        >
          <div className="task-list">
            {dayTasks.map((t) => <TaskRow key={t.id} task={t} lead={leadById[t.leadId]} onToggle={onToggleTask} onDelete={onDeleteTask} />)}
            {dayTasks.length === 0 && (
              <div className="empty-state">
                <Icon name="calendar" size={28} />
                <p>Nenhuma tarefa para este dia.</p>
              </div>
            )}
          </div>
        </Panel>
      </div>

      <NewTaskModal open={modal} onClose={() => setModal(false)} leads={leads}
        defaultDate={selected} onSubmit={(t) => { onAddTask(t); setModal(false); }} />
    </div>
  );
}

function NewTaskModal({ open, onClose, leads, defaultDate, onSubmit }) {
  const [tipo, setTipo] = useState("Ligação");
  const [leadId, setLeadId] = useState(leads[0]?.id);
  const [data, setData] = useState(defaultDate);
  const [hora, setHora] = useState("09:00");
  const [obs, setObs] = useState("");

  useEffect(() => { if (open) { setData(defaultDate); setObs(""); } }, [open, defaultDate]);

  const submit = () => {
    onSubmit({ tipo, leadId: Number(leadId), data, hora, obs: obs.trim() || tipo + " agendado", status: "Pendente" });
  };

  return (
    <Modal open={open} onClose={onClose} title="Nova Tarefa">
      <div className="form-grid">
        <label className="field">
          <span className="field-label">Tipo</span>
          <div className="add-int-types">
            {Object.keys(INTERACTION_META).map((t) => (
              <button key={t} className={"int-type" + (tipo === t ? " active" : "")}
                style={tipo === t ? { borderColor: INTERACTION_META[t].color + "66", color: INTERACTION_META[t].color, background: INTERACTION_META[t].color + "14" } : {}}
                onClick={() => setTipo(t)}>
                <Icon name={INTERACTION_META[t].icon} size={14} /> {t}
              </button>
            ))}
          </div>
        </label>
        <label className="field">
          <span className="field-label">Lead vinculado</span>
          <div className="select-wrap">
            <select className="select" value={leadId} onChange={(e) => setLeadId(e.target.value)}>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.empresa}</option>)}
            </select>
            <Icon name="chevron-down" size={15} className="select-chevron" />
          </div>
        </label>
        <div className="field-row">
          <label className="field">
            <span className="field-label">Data</span>
            <input type="date" className="input" value={data} onChange={(e) => setData(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">Hora</span>
            <input type="time" className="input" value={hora} onChange={(e) => setHora(e.target.value)} />
          </label>
        </div>
        <label className="field">
          <span className="field-label">Observação</span>
          <textarea className="textarea" rows={2} value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Detalhes da tarefa..." />
        </label>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={submit}><Icon name="check" size={15} /> Criar Tarefa</button>
      </div>
    </Modal>
  );
}

Object.assign(window, { Agenda });
