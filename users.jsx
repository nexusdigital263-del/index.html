// ============================================================
//  Users & roles — login, management, add-user modal
// ============================================================
const { useState: uState, useMemo: uMemo } = React;

const USER_PALETTE = [COLORS.blue, COLORS.purple, COLORS.green, COLORS.amber, COLORS.cyan, COLORS.pink, COLORS.red];

function initialsFrom(name, taken) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  let base = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0])
    : (parts[0] ? parts[0].slice(0, 2) : "U");
  base = base.toUpperCase();
  if (!taken.includes(base)) return base;
  // disambiguate
  for (let i = 0; i < 26; i++) {
    const alt = (base[0] + String.fromCharCode(65 + i));
    if (!taken.includes(alt)) return alt;
  }
  return base + Math.floor(Math.random() * 9);
}

// ---- Login -----------------------------------------------------------------
function LoginScreen({ remote, users, onLoginDemo, onLoginRemote, onSignUp }) {
  if (remote) return <RemoteLogin onLoginRemote={onLoginRemote} onSignUp={onSignUp} />;
  return (
    <div className="login-screen">
      <div className="login-card login-wide fade-in">
        <div className="brand-mark login-mark"><Icon name="activity" size={26} strokeWidth={2.5} /></div>
        <h1 className="login-brand">Nexus<span>CRM</span></h1>
        <p className="login-sub">Selecione seu usuário para entrar</p>
        <div className="login-users">
          {users.map((u) => (
            <button key={u.id} className="login-user" onClick={() => onLoginDemo(u.id)}>
              <Avatar initials={u.id} size={42} />
              <div className="login-user-info">
                <div className="login-user-name">{u.name}</div>
                <div className="login-user-email mono">{u.email}</div>
              </div>
              <RoleBadge role={u.role} />
            </button>
          ))}
        </div>
        <div className="login-foot">Ambiente de demonstração · acesso baseado em perfil</div>
      </div>
    </div>
  );
}

// ---- Remote (Supabase) login / signup --------------------------------------
function RemoteLogin({ onLoginRemote, onSignUp }) {
  const [mode, setMode] = uState("login"); // 'login' | 'signup'
  const [name, setName] = uState("");
  const [email, setEmail] = uState("");
  const [pw, setPw] = uState("");
  const [busy, setBusy] = uState(false);
  const [err, setErr] = uState("");
  const [ok, setOk] = uState("");

  const submit = async () => {
    setErr(""); setOk("");
    if (!email.trim() || !pw) { setErr("Preencha e-mail e senha."); return; }
    if (mode === "signup" && !name.trim()) { setErr("Informe seu nome."); return; }
    setBusy(true);
    const res = mode === "login"
      ? await onLoginRemote(email, pw)
      : await onSignUp(name, email, pw);
    setBusy(false);
    if (res && res.error) setErr(res.error);
    else if (res && res.needsConfirm) { setOk("Conta criada! Confirme o e-mail (se exigido) e faça login."); setMode("login"); setPw(""); }
  };
  const onKey = (e) => { if (e.key === "Enter") submit(); };

  return (
    <div className="login-screen">
      <div className="login-card fade-in">
        <div className="brand-mark login-mark"><Icon name="activity" size={26} strokeWidth={2.5} /></div>
        <h1 className="login-brand">Nexus<span>CRM</span></h1>
        <p className="login-sub">{mode === "login" ? "Entre com sua conta" : "Crie sua conta de acesso"}</p>

        <div className="auth-form">
          {mode === "signup" && (
            <label className="field">
              <span className="field-label">Nome completo</span>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={onKey} placeholder="Seu nome" autoFocus />
            </label>
          )}
          <label className="field">
            <span className="field-label">E-mail</span>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={onKey} placeholder="voce@empresa.com.br" />
          </label>
          <label className="field">
            <span className="field-label">Senha</span>
            <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={onKey} placeholder="••••••••" />
          </label>

          {err && <div className="auth-msg err">{err}</div>}
          {ok && <div className="auth-msg ok">{ok}</div>}

          <button className="btn btn-primary btn-block login-btn" disabled={busy} onClick={submit}>
            {busy ? "Aguarde…" : (mode === "login" ? "Entrar" : "Criar conta")}
          </button>
        </div>

        <button className="auth-switch" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); setOk(""); }}>
          {mode === "login" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
        </button>
        <div className="login-foot">Conectado ao Supabase · dados compartilhados pela equipe</div>
      </div>
    </div>
  );
}

// ---- Add / edit user modal -------------------------------------------------
function UserFormModal({ open, user, users, onClose, onSave }) {
  const isEdit = !!user;
  const [name, setName] = uState("");
  const [email, setEmail] = uState("");
  const [role, setRole] = uState("Vendedor");

  React.useEffect(() => {
    if (open) {
      setName(user ? user.name : "");
      setEmail(user ? user.email : "");
      setRole(user ? user.role : "Vendedor");
    }
  }, [open, user]);

  const valid = name.trim() && email.trim();
  const submit = () => {
    if (!valid) return;
    if (isEdit) {
      onSave({ ...user, name: name.trim(), email: email.trim(), role });
    } else {
      const taken = users.map((u) => u.id);
      const id = initialsFrom(name, taken);
      const color = USER_PALETTE[users.length % USER_PALETTE.length];
      onSave({ id, name: name.trim(), email: email.trim(), role, color });
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Editar Usuário" : "Novo Usuário"} width={460}>
      <div className="form-grid">
        <label className="field">
          <span className="field-label">Nome completo <span className="req">*</span></span>
          <input className="input" value={name} autoFocus placeholder="Ex: Marina Caldeira"
            onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">E-mail <span className="req">*</span></span>
          <input className="input" value={email} placeholder="nome@nexuscrm.com.br"
            onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">Perfil de acesso</span>
          <div className="select-wrap">
            <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
              {Object.keys(ROLE_META).map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <Icon name="chevron-down" size={15} className="select-chevron" />
          </div>
        </label>
        <div className="role-hint">
          <RoleBadge role={role} />
          <span>{ROLE_META[role].desc}</span>
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" disabled={!valid} onClick={submit}>
          <Icon name="check" size={15} /> {isEdit ? "Salvar" : "Criar Usuário"}
        </button>
      </div>
    </Modal>
  );
}

// ---- Users management screen (Admin) ---------------------------------------
function UsersScreen({ users, currentUser, leads, remote, onAdd, onUpdate, onRemove }) {
  const [modalOpen, setModalOpen] = uState(false);
  const [editing, setEditing] = uState(null);

  const leadCount = uMemo(() => {
    const m = {};
    leads.forEach((l) => { m[l.dono] = (m[l.dono] || 0) + 1; });
    return m;
  }, [leads]);

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (u) => { setEditing(u); setModalOpen(true); };

  return (
    <div className="screen-pad fade-in">
      <div className="users-head">
        <div className="users-summary">
          {Object.keys(ROLE_META).map((r) => {
            const count = users.filter((u) => u.role === r).length;
            return (
              <div className="role-stat" key={r}>
                <span className="role-stat-dot" style={{ background: ROLE_META[r].color }}></span>
                <span className="role-stat-count mono">{count}</span>
                <span className="role-stat-label">{r}{count !== 1 ? "s" : ""}</span>
              </div>
            );
          })}
        </div>
        {!remote && <button className="btn btn-primary" onClick={openNew}><Icon name="plus" size={16} /> Novo Usuário</button>}
      </div>

      {remote && (
        <div className="info-banner">
          <Icon name="shield" size={16} />
          <span>Novos acessos são criados pela própria pessoa na <strong>tela de login</strong> (cadastro). Aqui você ajusta o <strong>perfil</strong> de cada um ou remove acessos.</span>
        </div>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th className="num">Leads</th>
              <th>Acesso</th>
              <th className="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isMe = u.id === currentUser.id;
              const access = can(u.role, "viewAll") ? "Todos os leads" : "Apenas próprios";
              return (
                <tr key={u.id} className="data-row">
                  <td>
                    <div className="cell-resp">
                      <Avatar initials={u.id} size={30} />
                      <div className="user-cell-name">
                        {u.name} {isMe && <span className="me-tag">você</span>}
                      </div>
                    </div>
                  </td>
                  <td className="cell-muted mono">{u.email}</td>
                  <td><RoleBadge role={u.role} /></td>
                  <td className="num mono">{leadCount[u.id] || 0}</td>
                  <td className="cell-muted">{access}</td>
                  <td className="col-actions">
                    <div className="row-actions">
                      <button className="row-detail-btn" onClick={() => openEdit(u)}>Editar</button>
                      <button className="row-trash" title="Remover usuário"
                        disabled={isMe}
                        onClick={() => {
                          if (isMe) return;
                          if (window.confirm(`Remover o usuário "${u.name}"? Os leads atribuídos a ele permanecerão na base.`)) onRemove(u.id);
                        }}><Icon name="trash" size={15} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <UserFormModal open={modalOpen} user={editing} users={users}
        onClose={() => setModalOpen(false)}
        onSave={(u) => { editing ? onUpdate(u) : onAdd(u); }} />
    </div>
  );
}

// ---- Access denied fallback ------------------------------------------------
function NoAccess() {
  return (
    <div className="screen-pad fade-in">
      <div className="empty-state" style={{ padding: "80px 20px" }}>
        <Icon name="shield" size={34} />
        <p>Você não tem permissão para acessar esta área.</p>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen, UsersScreen, UserFormModal, NoAccess });
