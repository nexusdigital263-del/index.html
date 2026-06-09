// ============================================================
//  Lead import — CSV parser + smart column mapping + modal
//  Fecha o ciclo: importar lista → automação dispara o 1º contato.
// ============================================================
const { useState: iState, useEffect: iEffect, useRef: iRef } = React;

// ---- CSV parsing -----------------------------------------------------------
function parseCSV(text) {
  text = (text || "").replace(/^\uFEFF/, "");
  const nl = text.indexOf("\n");
  const firstLine = nl >= 0 ? text.slice(0, nl) : text;
  // detecta delimitador: ; ou , (o que aparecer mais no cabeçalho)
  const delim = (firstLine.split(";").length > firstLine.split(",").length) ? ";" : ",";
  const rows = [];
  let cur = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === delim) { cur.push(field); field = ""; }
      else if (c === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
      else if (c === "\r") { /* ignore */ }
      else field += c;
    }
  }
  if (field.length || cur.length) { cur.push(field); rows.push(cur); }
  return rows.filter((r) => r.some((c) => (c || "").trim() !== ""));
}

const _norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const FIELD_ALIASES = {
  empresa: ["empresa", "company", "razao social", "cliente", "estabelecimento", "nome da empresa"],
  responsavel: ["contato", "responsavel", "nome contato", "nome do contato", "nome"],
  cargo: ["cargo", "role", "funcao"],
  whatsapp: ["whatsapp", "whats", "telefone", "celular", "fone", "phone", "numero", "tel"],
  segmento: ["segmento", "segment", "ramo", "setor", "categoria"],
  cidade: ["cidade", "city", "municipio"],
  valor: ["valor mensal (r$)", "valor mensal", "valor", "ticket", "mensalidade"],
  status: ["status", "etapa"],
};

function mapHeaders(headerRow) {
  const map = {};
  headerRow.forEach((h, idx) => {
    const n = _norm(h);
    if (!n || n.indexOf("link") >= 0) return; // ignora coluna "Link WhatsApp"
    for (const field in FIELD_ALIASES) {
      if (map[field] != null) continue;
      if (FIELD_ALIASES[field].some((a) => n === a)) { map[field] = idx; return; }
    }
  });
  // segunda passada: correspondência parcial p/ o que faltou
  headerRow.forEach((h, idx) => {
    const n = _norm(h);
    if (!n || n.indexOf("link") >= 0) return;
    if (Object.values(map).indexOf(idx) >= 0) return;
    for (const field in FIELD_ALIASES) {
      if (map[field] != null) continue;
      if (FIELD_ALIASES[field].some((a) => n.indexOf(a) >= 0)) { map[field] = idx; return; }
    }
  });
  return map;
}

function matchSegment(v) {
  const n = _norm(v);
  if (!n) return "Outros";
  const found = SEGMENTS.find((s) => _norm(s) === n) || SEGMENTS.find((s) => _norm(s).indexOf(n) >= 0 || n.indexOf(_norm(s)) >= 0);
  return found || "Outros";
}
function matchStatus(v) {
  const n = _norm(v);
  if (!n) return "Novo";
  return STATUS.find((s) => _norm(s) === n) || "Novo";
}
function parseValor(v) {
  if (!v) return 0;
  const num = String(v).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(num);
  return isNaN(n) ? 0 : Math.round(n);
}

// Converte linhas do CSV → leads. {leads, total, skipped, noEmpresa, map}
function rowsToLeads(rows) {
  if (!rows.length) return { leads: [], total: 0, skipped: 0 };
  const header = rows[0];
  const map = mapHeaders(header);
  if (map.empresa == null) return { leads: [], total: 0, skipped: 0, noEmpresa: true };
  const out = [];
  let skipped = 0;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const get = (f) => (map[f] != null ? (r[map[f]] || "").trim() : "");
    const empresa = get("empresa");
    if (!empresa) { skipped++; continue; }
    out.push({
      empresa,
      responsavel: get("responsavel") || "—",
      cargo: get("cargo") || "—",
      whatsapp: get("whatsapp"),
      segmento: matchSegment(get("segmento")),
      cidade: get("cidade") || (CITIES[0] || "—"),
      valor: parseValor(get("valor")) || 1000,
      status: matchStatus(get("status")),
      cnpj: "—",
      prioridade: "Média",
      diasNoFunil: 0,
      proximaAcao: "Primeiro contato",
    });
  }
  return { leads: out, total: out.length, skipped, map };
}

function downloadImportTemplate() {
  const header = ["Empresa", "Contato", "Cargo", "WhatsApp", "Segmento", "Cidade", "Valor mensal (R$)", "Status"];
  const sample = ["Clínica Exemplo", "Maria Silva", "Sócia", "(34) 99999-8888", "Clínica Odontológica", "Uberlândia", "1500", "Novo"];
  const csv = "\uFEFF" + [header, sample].map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(";")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "modelo-importacao-leads.csv";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---- Import modal ----------------------------------------------------------
function ImportLeadsModal({ open, onClose, onImport, autoOn, intervalMin }) {
  const [parsed, setParsed] = iState(null);
  const [fileName, setFileName] = iState("");
  const [busy, setBusy] = iState(false);
  const fileRef = iRef(null);

  iEffect(() => { if (open) { setParsed(null); setFileName(""); setBusy(false); } }, [open]);
  if (!open) return null;

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { setParsed(rowsToLeads(parseCSV(String(reader.result)))); setFileName(f.name); };
    reader.readAsText(f, "UTF-8");
  };
  const doImport = async () => {
    if (!parsed || !parsed.leads.length) return;
    setBusy(true);
    await onImport(parsed.leads);
    setBusy(false);
    onClose();
  };

  const preview = parsed && parsed.leads ? parsed.leads.slice(0, 5) : [];
  const newCount = parsed && parsed.leads ? parsed.leads.filter((l) => l.status === "Novo").length : 0;

  return (
    <Modal open={open} onClose={onClose} title="Importar leads (CSV)" width={640}>
      <div className="form-grid">
        <div className="import-drop" onClick={() => fileRef.current && fileRef.current.click()}>
          <span className="import-drop-icon"><Icon name="download" size={20} /></span>
          <div className="import-drop-text">
            <strong>{fileName || "Escolher arquivo CSV"}</strong>
            <span>Clique para selecionar a planilha (.csv) com seus leads</span>
          </div>
          <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={onFile} />
        </div>

        <div className="import-help">
          <span>Colunas reconhecidas: <strong>Empresa</strong> (obrigatória), Contato, Cargo, WhatsApp, Segmento, Cidade, Valor, Status.</span>
          <button className="bulk-link" onClick={downloadImportTemplate}>Baixar modelo de planilha</button>
        </div>

        {parsed && parsed.noEmpresa && (
          <div className="auth-msg err">Não encontrei a coluna <strong>Empresa</strong>. Confira o cabeçalho da planilha ou baixe o modelo acima.</div>
        )}
        {parsed && !parsed.noEmpresa && parsed.total === 0 && (
          <div className="auth-msg err">Nenhum lead válido encontrado no arquivo.</div>
        )}

        {parsed && !parsed.noEmpresa && parsed.total > 0 && (
          <React.Fragment>
            <div className="import-summary">
              <span className="import-stat"><strong className="mono">{parsed.total}</strong> leads prontos para importar</span>
              {parsed.skipped > 0 && <span className="import-stat muted">{parsed.skipped} linha(s) sem empresa ignorada(s)</span>}
            </div>

            <div className="import-preview">
              <table className="data-table">
                <thead><tr><th>Empresa</th><th>Contato</th><th>WhatsApp</th><th>Segmento</th><th>Cidade</th></tr></thead>
                <tbody>
                  {preview.map((l, i) => (
                    <tr key={i}>
                      <td><span className="cell-empresa-name">{l.empresa}</span></td>
                      <td className="cell-muted">{l.responsavel}</td>
                      <td className="cell-muted mono">{l.whatsapp || "—"}</td>
                      <td><span className="seg-tag"><span className="seg-dot" style={{ background: SEGMENT_COLORS[l.segmento] || COLORS.purple }}></span>{l.segmento}</span></td>
                      <td className="cell-muted">{l.cidade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.total > preview.length && <div className="import-more">+ {parsed.total - preview.length} outros…</div>}
            </div>

            {autoOn && newCount > 0 && (
              <div className="wa-mode live">
                <Icon name="message-circle" size={15} />
                <span><strong>Automação ligada:</strong> {newCount} lead(s) "Novo" receberão o 1º contato por WhatsApp automaticamente{intervalMin > 0 ? `, 1 a cada ${intervalMin} min` : ""}.</span>
              </div>
            )}
            {!autoOn && (
              <div className="wa-mode sim">
                <Icon name="message-circle" size={15} />
                <span>Dica: ative a <strong>automação de 1º contato</strong> (Configurações → WhatsApp) para disparar a prospecção automaticamente ao importar.</span>
              </div>
            )}
          </React.Fragment>
        )}
      </div>

      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" disabled={busy || !parsed || !parsed.leads || !parsed.leads.length} onClick={doImport}>
          <Icon name="download" size={15} /> {busy ? "Importando…" : (parsed && parsed.total ? `Importar ${parsed.total} leads` : "Importar")}
        </button>
      </div>
    </Modal>
  );
}

Object.assign(window, { ImportLeadsModal, parseCSV, rowsToLeads });
