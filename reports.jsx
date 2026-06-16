// ============================================================
//  Reports screen — pie / line / bar charts + summary table
// ============================================================
function SegmentPie({ data }) {
  const { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } = Recharts;
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="pie-wrap">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
            innerRadius={58} outerRadius={92} paddingAngle={2} stroke="none" isAnimationActive={false}>
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Pie>
          <Tooltip content={<ChartTooltip unit=" leads" />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pie-center">
        <div className="pie-center-val mono">{total}</div>
        <div className="pie-center-lbl">leads</div>
      </div>
    </div>
  );
}

function SegmentLegend({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="pie-legend">
      {data.map((d) => (
        <div className="legend-row" key={d.name}>
          <span className="legend-dot" style={{ background: d.fill }}></span>
          <span className="legend-name">{d.name}</span>
          <span className="legend-val mono">{d.value}</span>
          <span className="legend-pct mono">{Math.round((d.value / total) * 100)}%</span>
        </div>
      ))}
    </div>
  );
}

function EvolutionLine({ data }) {
  const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } = Recharts;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="mes" tickLine={false} axisLine={false}
          tick={{ fill: "#8B93A7", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }} />
        <YAxis tickLine={false} axisLine={false}
          tick={{ fill: "#8B93A7", fontSize: 12, fontFamily: "'Space Mono', monospace" }} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
        <Legend wrapperStyle={{ fontSize: 12.5, fontFamily: "'DM Sans', sans-serif", paddingTop: 8 }} iconType="circle" />
        <Line type="monotone" dataKey="abertos" name="Abertos" stroke={COLORS.blue} strokeWidth={2.5}
          dot={{ r: 3, fill: COLORS.blue, strokeWidth: 0 }} activeDot={{ r: 5 }} isAnimationActive={false} />
        <Line type="monotone" dataKey="fechados" name="Fechados" stroke={COLORS.green} strokeWidth={2.5}
          dot={{ r: 3, fill: COLORS.green, strokeWidth: 0 }} activeDot={{ r: 5 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function CityBars({ data }) {
  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } = Recharts;
  const palette = [COLORS.blue, COLORS.purple, COLORS.cyan, COLORS.amber];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: -16, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="cidade" tickLine={false} axisLine={false}
          tick={{ fill: "#8B93A7", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }} />
        <YAxis tickLine={false} axisLine={false}
          tick={{ fill: "#8B93A7", fontSize: 12, fontFamily: "'Space Mono', monospace" }} />
        <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<ChartTooltip unit=" leads" />} />
        <Bar dataKey="leads" name="Leads" radius={[6, 6, 0, 0]} barSize={46} isAnimationActive={false}>
          {data.map((d, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
          <LabelList dataKey="leads" position="top" fill="#E6E9F0"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function ProspTable({ rows, mono }) {
  if (!rows || !rows.length) return <div className="prosp-empty-sm">Sem dados.</div>;
  const maxTaxa = Math.max(100, ...rows.map((r) => r.taxa));
  return (
    <table className="data-table prosp-table">
      <thead>
        <tr>
          <th>{mono ? "Template" : "Segmento"}</th>
          <th className="num">Enviados</th>
          <th className="num">Resp.</th>
          <th>Taxa</th>
          <th className="num">Tempo</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <td className={mono ? "mono prosp-lbl" : ""}>{r.label}</td>
            <td className="num mono">{r.enviados}</td>
            <td className="num mono">{r.respostas}</td>
            <td>
              <div className="prosp-bar-cell">
                <div className="prosp-bar-track"><div className="prosp-bar-fill" style={{ width: (r.taxa / maxTaxa * 100) + "%", background: r.taxa >= 30 ? COLORS.green : r.taxa >= 15 ? COLORS.amber : COLORS.red }}></div></div>
                <span className="prosp-bar-val mono">{r.taxa}%</span>
              </div>
            </td>
            <td className="num mono">{r.tempo != null ? r.tempo + "d" : "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Reports({ leads }) {
  const seg = useMemo(() => segmentData(leads), [leads]);
  const city = useMemo(() => cityData(leads), [leads]);
  const summary = useMemo(() => segmentSummary(leads), [leads]);
  const totals = useMemo(() => summary.reduce((a, s) => ({
    leads: a.leads + s.leads, reunioes: a.reunioes + s.reunioes,
    fechamentos: a.fechamentos + s.fechamentos, receita: a.receita + s.receita,
  }), { leads: 0, reunioes: 0, fechamentos: 0, receita: 0 }), [summary]);

  const prosp = useMemo(() => prospeccaoMetrics(leads), [leads]);

  return (
    <div className="screen-pad fade-in">
      <Panel title="Desempenho da Prospecção" subtitle="Taxa de resposta do WhatsApp por segmento e por mensagem">
        {prosp.total.enviados === 0 ? (
          <div className="prosp-empty">Nenhuma mensagem de prospecção enviada ainda. Os indicadores aparecem aqui assim que você disparar o 1º contato.</div>
        ) : (
          <React.Fragment>
            <div className="prosp-kpis">
              <div className="prosp-kpi">
                <div className="prosp-kpi-val mono">{prosp.total.enviados}</div>
                <div className="prosp-kpi-lbl">Leads contatados</div>
              </div>
              <div className="prosp-kpi">
                <div className="prosp-kpi-val mono">{prosp.total.respostas}</div>
                <div className="prosp-kpi-lbl">Responderam</div>
              </div>
              <div className="prosp-kpi">
                <div className="prosp-kpi-val mono" style={{ color: COLORS.green }}>{prosp.total.taxa}%</div>
                <div className="prosp-kpi-lbl">Taxa de resposta</div>
              </div>
              <div className="prosp-kpi">
                <div className="prosp-kpi-val mono">{prosp.total.tempo != null ? prosp.total.tempo : "—"}<small>{prosp.total.tempo != null ? " d" : ""}</small></div>
                <div className="prosp-kpi-lbl">Tempo médio até resposta</div>
              </div>
            </div>
            <div className="prosp-tables">
              <div className="prosp-table-block">
                <div className="prosp-table-title">Por segmento</div>
                <ProspTable rows={prosp.segmentos} />
              </div>
              <div className="prosp-table-block">
                <div className="prosp-table-title">Por mensagem (template)</div>
                <ProspTable rows={prosp.templates} mono />
              </div>
            </div>
          </React.Fragment>
        )}
      </Panel>

      <div className="reports-top">
        <Panel title="Leads por Segmento" subtitle="Distribuição da carteira">
          <div className="seg-report">
            <SegmentPie data={seg} />
            <SegmentLegend data={seg} />
          </div>
        </Panel>
        <Panel title="Performance por Cidade" subtitle="Volume de leads por praça">
          <CityBars data={city} />
        </Panel>
      </div>

      <Panel title="Evolução de Prospecções" subtitle="Leads abertos vs. fechados — últimos 6 meses">
        <EvolutionLine data={MONTHLY} />
      </Panel>

      <Panel title="Resumo por Segmento" subtitle="Métricas consolidadas" noPad>
        <div className="table-wrap">
          <table className="data-table summary-table">
            <thead>
              <tr>
                <th>Segmento</th>
                <th className="num">Leads</th>
                <th className="num">Reuniões</th>
                <th className="num">Fechamentos</th>
                <th className="num">Receita Estimada</th>
                <th className="num">Ticket Médio</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s) => (
                <tr key={s.segmento}>
                  <td>
                    <span className="seg-tag" style={{ "--seg": SEGMENT_COLORS[s.segmento] }}>
                      <span className="seg-dot" style={{ background: SEGMENT_COLORS[s.segmento] }}></span>
                      {s.segmento}
                    </span>
                  </td>
                  <td className="num mono">{s.leads}</td>
                  <td className="num mono">{s.reunioes}</td>
                  <td className="num mono">{s.fechamentos}</td>
                  <td className="num mono">{fmtBRL(s.receita)}</td>
                  <td className="num mono">{s.ticket ? fmtBRL(s.ticket) : "—"}</td>
                </tr>
              ))}
              <tr className="summary-total">
                <td>Total</td>
                <td className="num mono">{totals.leads}</td>
                <td className="num mono">{totals.reunioes}</td>
                <td className="num mono">{totals.fechamentos}</td>
                <td className="num mono">{fmtBRL(totals.receita)}</td>
                <td className="num mono">{totals.fechamentos ? fmtBRL(Math.round(totals.receita / totals.fechamentos)) : "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

Object.assign(window, { Reports });
