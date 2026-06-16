// ============================================================
//  Dashboard screen
// ============================================================
function KpiCard({ icon, label, value, delta, deltaUp, accent, suffix }) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <span className="kpi-icon" style={{ background: accent + "1A", color: accent }}>
          <Icon name={icon} size={18} />
        </span>
        {delta != null && (
          <span className={"kpi-delta " + (deltaUp ? "up" : "down")}>
            <Icon name={deltaUp ? "trending-up" : "trending-down"} size={13} />
            {delta}
          </span>
        )}
      </div>
      <div className="kpi-value">{value}<span className="kpi-suffix">{suffix}</span></div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}

function FunnelChart({ data }) {
  const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } = Recharts;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 4 }} barCategoryGap={12}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="etapa" width={132} tickLine={false} axisLine={false}
          tick={{ fill: "#8B93A7", fontSize: 12.5, fontFamily: "'DM Sans', sans-serif" }} />
        <Tooltip cursor={{ fill: "rgba(128,128,128,0.12)" }} content={<ChartTooltip unit=" leads" />} />
        <Bar dataKey="qtd" radius={[0, 6, 6, 0]} barSize={22} isAnimationActive={false}>
          {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          <LabelList dataKey="qtd" position="right" fill="#3E8E5A"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function ChartTooltip({ active, payload, label, unit = "" }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tip">
      {label && <div className="chart-tip-label">{label}</div>}
      {payload.map((p, i) => (
        <div className="chart-tip-row" key={i}>
          <span className="chart-tip-dot" style={{ background: p.color || p.payload.fill }}></span>
          <span className="chart-tip-name">{p.name}</span>
          <span className="chart-tip-val">{p.value}{unit}</span>
        </div>
      ))}
    </div>
  );
}

function ActivityList({ items, onOpenLead }) {
  return (
    <div className="activity-list">
      {items.map((it) => {
        const meta = INTERACTION_META[it.tipo];
        return (
          <button className="activity-row" key={it.id} onClick={() => onOpenLead(it.leadId)}>
            <span className="activity-icon" style={{ background: meta.color + "1A", color: meta.color }}>
              <Icon name={meta.icon} size={15} />
            </span>
            <div className="activity-main">
              <div className="activity-line1">
                <span className="activity-empresa">{it.empresa}</span>
                <span className="activity-type" style={{ color: meta.color }}>{it.tipo}</span>
              </div>
              <div className="activity-note">{it.nota}</div>
            </div>
            <span className="activity-date">{fmtDate(it.data)}</span>
          </button>
        );
      })}
    </div>
  );
}

function Dashboard({ leads, onOpenLead }) {
  const k = useMemo(() => kpis(leads), [leads]);
  const funnel = useMemo(() => funnelData(leads), [leads]);
  const activity = useMemo(() => recentActivity(leads, 8), [leads]);

  return (
    <div className="screen-pad fade-in">
      <div className="kpi-grid">
        <KpiCard icon="users" label="Total de Leads" value={k.total} delta="+12%" deltaUp accent={COLORS.forest} />
        <KpiCard icon="handshake" label="Em Negociação" value={k.negociacao} delta="+8%" deltaUp accent={COLORS.purple} />
        <KpiCard icon="calendar-check" label="Fechamentos no Mês" value={k.fechados} delta="-2%" deltaUp={false} accent={COLORS.green} />
        <KpiCard icon="target" label="Taxa de Conversão" value={k.conversao} suffix="%" delta="+5%" deltaUp accent={COLORS.amber} />
      </div>

      <div className="dash-grid">
        <Panel title="Funil de Vendas" subtitle="Distribuição de leads por etapa">
          <FunnelChart data={funnel} />
        </Panel>
        <Panel title="Atividade Recente" subtitle="Últimas interações" noPad>
          <ActivityList items={activity} onOpenLead={onOpenLead} />
        </Panel>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
