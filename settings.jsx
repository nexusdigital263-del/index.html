// ============================================================
//  Settings screen — appearance, data, Supabase connection
// ============================================================
const { useState: sState } = React;

function Settings({ accent, onAccent, onReset, onLogout, user, remote, onConnect, onDisconnect }) {
  const accents = [COLORS.blue, COLORS.purple, COLORS.green, COLORS.cyan, COLORS.amber];
  const ACCENT_NAMES = {
    [COLORS.blue]: "Azul elétrico", [COLORS.purple]: "Roxo", [COLORS.green]: "Verde",
    [COLORS.cyan]: "Ciano", [COLORS.amber]: "Âmbar",
  };
  const me = user || { id: "CM", name: "—", email: "", role: "Admin" };
  const isAdmin = me.role === "Admin";

  return (
    <div className="screen-pad fade-in settings-screen">
      <div className="settings-cols">
        <div className="settings-main">
          <Panel title="Perfil" subtitle="Usuário conectado">
            <div className="profile-card">
              <Avatar initials={me.id} size={64} />
              <div className="profile-info">
                <div className="profile-name">{me.name}</div>
                <div className="profile-role-row">
                  <RoleBadge role={me.role} />
                  <span className="profile-mode">{remote ? "Supabase" : "Demonstração"}</span>
                </div>
                <div className="profile-meta mono">{me.email}</div>
              </div>
              <button className="btn btn-danger" onClick={onLogout}><Icon name="log-out" size={15} /> Sair</button>
            </div>
          </Panel>

          {isAdmin && <SupabasePanel remote={remote} onConnect={onConnect} onDisconnect={onDisconnect} />}

          <Panel title="Aparência" subtitle="Cor de destaque da interface">
            <div className="accent-row">
              <div className="accent-picker">
                {accents.map((c) => (
                  <button key={c} className={"accent-swatch" + (accent === c ? " active" : "")}
                    style={{ background: c }} onClick={() => onAccent(c)} title={ACCENT_NAMES[c]}>
                    {accent === c && <Icon name="check" size={16} strokeWidth={3} />}
                  </button>
                ))}
              </div>
              <span className="accent-current">{ACCENT_NAMES[accent] || "Personalizada"}</span>
            </div>
            <p className="accent-note">A cor é aplicada em todo o app e salva neste navegador.</p>
          </Panel>
        </div>

        <div className="settings-side">
          {!remote && (
            <Panel title="Dados" subtitle="Armazenamento local">
              <div className="settings-text" style={{ marginBottom: 14 }}>
                <div className="settings-desc">Em modo demonstração, leads e tarefas ficam salvos apenas neste navegador. Conecte o Supabase para compartilhar com a equipe.</div>
              </div>
              <button className="btn btn-ghost btn-block" onClick={() => {
                if (window.confirm("Restaurar todos os dados ao padrão? Suas alterações locais serão perdidas.")) onReset();
              }}><Icon name="shield" size={15} /> Restaurar dados padrão</button>
            </Panel>
          )}
          {remote && (
            <Panel title="Sincronização" subtitle="Dados na nuvem">
              <div className="sync-status">
                <span className="sync-dot"></span>
                <div>
                  <div className="sync-title">Conectado ao Supabase</div>
                  <div className="settings-desc">Leads, tarefas e usuários são compartilhados em tempo real com toda a equipe.</div>
                </div>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Supabase connection panel (Admin only) --------------------------------
function normalizeSbUrl(raw) {
  let u = (raw || "").trim();
  if (!u) return "";
  // accept pastes like https://xxxx.supabase.co/rest/v1/  → keep scheme+host only
  const m = u.match(/https?:\/\/[a-z0-9-]+\.supabase\.co/i);
  if (m) return m[0].replace(/^http:/i, "https:");
  return u.replace(/\/+$/, "");
}

function SupabasePanel({ remote, onConnect, onDisconnect }) {
  const cfg = (window.SB && SB.getCfg()) || {};
  const [url, setUrl] = sState(cfg.url || "");
  const [key, setKey] = sState(cfg.anonKey || "");
  const [testing, setTesting] = sState(false);
  const [result, setResult] = sState(null); // {ok, msg}

  const cleanUrl = normalizeSbUrl(url);
  const urlLooksOk = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(cleanUrl);
  const keyOk = key.trim().length > 20;
  const canTest = !!cleanUrl && !!key.trim() && !testing;
  const canSave = urlLooksOk && keyOk;

  const test = async () => {
    setResult(null); setTesting(true);
    try {
      const r = await SB.testConnection({ url: cleanUrl, anonKey: key.trim() });
      setResult(r);
    } catch (e) {
      setResult({ ok: false, msg: "Erro ao testar: " + (e && e.message ? e.message : e) });
    }
    setTesting(false);
  };

  if (remote) {
    const builtin = window.SB && SB.isBuiltin && SB.isBuiltin();
    return (
      <Panel title="Supabase" subtitle="Banco de dados compartilhado" right={<span className="conn-badge on">Conectado</span>}>
        <div className="settings-desc" style={{ marginBottom: 14 }}>
          O CRM está usando seu projeto Supabase. Todos os usuários acessam os mesmos dados, com login e permissões reais.
        </div>
        <div className="sb-url mono">{cfg.url}</div>
        {builtin ? (
          <div className="field-hint" style={{ marginTop: 12 }}>
            Conexão embutida no aplicativo — todos já entram conectados, sem precisar configurar.
          </div>
        ) : (
          <button className="btn btn-ghost btn-block" style={{ marginTop: 14 }} onClick={() => {
            if (window.confirm("Desconectar do Supabase e voltar ao modo demonstração? O app será recarregado.")) onDisconnect();
          }}><Icon name="plug" size={15} /> Desconectar</button>
        )}
      </Panel>
    );
  }

  return (
    <Panel title="Conectar Supabase" subtitle="Compartilhe o CRM com sua equipe">
      <div className="sb-steps">
        <div className="sb-step"><span className="sb-step-n">1</span> Crie um projeto grátis em <strong>supabase.com</strong></div>
        <div className="sb-step"><span className="sb-step-n">2</span> Rode o script <strong>supabase-setup.sql</strong> no SQL Editor</div>
        <div className="sb-step"><span className="sb-step-n">3</span> Cole abaixo a <strong>URL</strong> e a <strong>chave anon</strong> (Project Settings → API Keys)</div>
      </div>
      <div className="form-grid" style={{ marginTop: 16 }}>
        <label className="field">
          <span className="field-label">Project URL</span>
          <input className="input mono" value={url} onChange={(e) => { setUrl(e.target.value); setResult(null); }}
            placeholder="https://xxxxxxxx.supabase.co" />
          {url.trim() && !urlLooksOk && (
            <span className="field-hint err">Use o formato https://xxxx.supabase.co (sem /rest/v1)</span>
          )}
          {url.trim() && urlLooksOk && cleanUrl !== url.trim() && (
            <span className="field-hint">Será usada: <strong>{cleanUrl}</strong></span>
          )}
        </label>
        <label className="field">
          <span className="field-label">Anon public key</span>
          <input className="input mono" value={key} onChange={(e) => { setKey(e.target.value); setResult(null); }}
            placeholder="eyJhbGciOi... ou sb_publishable_..." type="password" />
        </label>
        {result && (
          <div className={"auth-msg " + (result.ok ? "ok" : "err")}>{result.msg}</div>
        )}
        <div className="sb-actions">
          <button className="btn btn-ghost" disabled={!canTest} onClick={test}>
            {testing ? "Testando…" : "Testar conexão"}
          </button>
          <button className="btn btn-primary" disabled={!canSave}
            onClick={() => onConnect({ url: cleanUrl, anonKey: key.trim() })}>
            <Icon name="check" size={15} /> Conectar e recarregar
          </button>
        </div>
      </div>
    </Panel>
  );
}

Object.assign(window, { Settings });
