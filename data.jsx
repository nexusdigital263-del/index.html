// ============================================================
//  NexusCRM — Centralized mock data + helpers
// ============================================================

const COLORS = {
  blue: "#3B82F6",
  blueHover: "#2563EB",
  green: "#10B981",
  red: "#EF4444",
  amber: "#F59E0B",
  purple: "#8B5CF6",
  cyan: "#06B6D4",
  pink: "#EC4899",
};

// Canonical status set (single source of truth).
// Kanban shows these as columns with friendlier labels.
const STATUS = ["Novo", "Em Contato", "Reunião Agendada", "Proposta Enviada", "Fechado", "Perdido"];

const STATUS_META = {
  "Novo":              { color: COLORS.blue,   label: "Novo",              kanban: "Prospecção" },
  "Em Contato":        { color: COLORS.amber,  label: "Em Contato",        kanban: "Contato Feito" },
  "Reunião Agendada":  { color: COLORS.purple, label: "Reunião Agendada",  kanban: "Reunião Agendada" },
  "Proposta Enviada":  { color: COLORS.cyan,   label: "Proposta Enviada",  kanban: "Proposta Enviada" },
  "Fechado":           { color: COLORS.green,  label: "Fechado",           kanban: "Fechado" },
  "Perdido":           { color: COLORS.red,    label: "Perdido",           kanban: "Perdido" },
};

const SEGMENTS = ["Clínica Odontológica", "Concessionária", "Delivery", "Loja Natural", "Outros"];
const SEGMENT_COLORS = {
  "Clínica Odontológica": COLORS.cyan,
  "Concessionária":       COLORS.blue,
  "Delivery":             COLORS.amber,
  "Loja Natural":         COLORS.green,
  "Outros":               COLORS.purple,
};

const CITIES = ["Uberlândia", "Uberaba", "Araxá", "Patos de Minas"];

const PRIORITY_META = {
  "Alta":  { color: COLORS.red },
  "Média": { color: COLORS.amber },
  "Baixa": { color: COLORS.green },
};

// Accent → darker hover pairs (for the theme color picker)
const ACCENT_HOVER = {
  "#3B82F6": "#2563EB", // blue
  "#8B5CF6": "#7C3AED", // purple
  "#10B981": "#059669", // green
  "#06B6D4": "#0891B2", // cyan
  "#F59E0B": "#D97706", // amber
};

// Sales reps (deal owners)
const REPS = {
  "CM": { name: "Carla Mendes",   color: COLORS.blue },
  "RF": { name: "Rafael Furtado", color: COLORS.purple },
  "JL": { name: "Júlia Lopes",    color: COLORS.green },
  "TS": { name: "Thiago Souza",   color: COLORS.amber },
};

// ---- Users & roles ---------------------------------------------------------
const USERS = [
  { id: "CM", name: "Carla Mendes",   email: "carla.mendes@nexuscrm.com.br",   role: "Admin",    color: COLORS.blue },
  { id: "RF", name: "Rafael Furtado", email: "rafael.furtado@nexuscrm.com.br", role: "Gerente",  color: COLORS.purple },
  { id: "JL", name: "Júlia Lopes",    email: "julia.lopes@nexuscrm.com.br",    role: "Vendedor", color: COLORS.green },
  { id: "TS", name: "Thiago Souza",   email: "thiago.souza@nexuscrm.com.br",   role: "Vendedor", color: COLORS.amber },
];

const ROLE_META = {
  "Admin":    { color: COLORS.red,    desc: "Acesso total à plataforma" },
  "Gerente":  { color: COLORS.blue,   desc: "Gestão da equipe e relatórios" },
  "Vendedor": { color: COLORS.green,  desc: "Acesso apenas à própria carteira" },
};

// Permission keys per role. Nav keys (dashboard/leads/kanban/agenda/reports/settings/users)
// double as page-access permissions.
const ROLE_PERMS = {
  "Admin":    ["dashboard", "leads", "kanban", "agenda", "reports", "settings", "users", "viewAll", "create", "edit", "delete"],
  "Gerente":  ["dashboard", "leads", "kanban", "agenda", "reports", "viewAll", "create", "edit", "delete"],
  "Vendedor": ["dashboard", "leads", "kanban", "agenda", "create", "edit"],
};
function can(role, perm) { return (ROLE_PERMS[role] || []).includes(perm); }

// Live registry (kept in sync by App) so Avatar can resolve colors/names for
// users created at runtime, falling back to the seed REPS map.
function userInfo(id) {
  const reg = (typeof window !== "undefined" && window.__users) ? window.__users.find((u) => u.id === id) : null;
  if (reg) return reg;
  const r = REPS[id];
  return r ? { id, name: r.name, color: r.color } : { id, name: id, color: COLORS.blue };
}

const INTERACTION_META = {
  "Ligação":  { color: COLORS.blue,   icon: "phone" },
  "WhatsApp": { color: COLORS.green,  icon: "message-circle" },
  "E-mail":   { color: COLORS.amber,  icon: "mail" },
  "Reunião":  { color: COLORS.purple, icon: "users" },
};

let _id = 0;
const iid = () => `int-${++_id}`;

const LEADS = [
  {
    id: 1, empresa: "OdontoVita Clínica", segmento: "Clínica Odontológica", cnpj: "12.345.678/0001-90",
    cidade: "Uberlândia", responsavel: "Dra. Marina Caldeira", cargo: "Sócia-diretora", whatsapp: "(34) 99812-4471",
    status: "Reunião Agendada", valor: 1800, prioridade: "Alta", dono: "CM", diasNoFunil: 12,
    ultimoContato: "2026-06-03", proximaAcao: "Apresentar proposta — 09/06",
    interacoes: [
      { id: iid(), data: "2026-05-22", tipo: "Ligação",  nota: "Primeiro contato. Interessada em agenda online e lembretes por WhatsApp." },
      { id: iid(), data: "2026-05-27", tipo: "WhatsApp", nota: "Enviado material institucional. Pediu para retornar após feriado." },
      { id: iid(), data: "2026-06-03", tipo: "Reunião",  nota: "Demo realizada. Vai apresentar à sócia. Reunião marcada p/ 09/06." },
    ],
  },
  {
    id: 2, empresa: "AutoPrime Veículos", segmento: "Concessionária", cnpj: "98.765.432/0001-12",
    cidade: "Uberaba", responsavel: "Eduardo Tavares", cargo: "Gerente Comercial", whatsapp: "(34) 99745-2210",
    status: "Proposta Enviada", valor: 4200, prioridade: "Alta", dono: "RF", diasNoFunil: 19,
    ultimoContato: "2026-06-05", proximaAcao: "Follow-up da proposta — 10/06",
    interacoes: [
      { id: iid(), data: "2026-05-17", tipo: "Ligação",  nota: "Buscam CRM para gestão de test-drives e pós-venda." },
      { id: iid(), data: "2026-05-24", tipo: "Reunião",  nota: "Reunião com diretoria. Levantamento de requisitos concluído." },
      { id: iid(), data: "2026-06-05", tipo: "E-mail",   nota: "Proposta comercial enviada — plano Pro, 8 usuários." },
    ],
  },
  {
    id: 3, empresa: "SaborExpress Delivery", segmento: "Delivery", cnpj: "23.456.789/0001-55",
    cidade: "Uberlândia", responsavel: "Patrícia Nunes", cargo: "Proprietária", whatsapp: "(34) 99633-8890",
    status: "Novo", valor: 900, prioridade: "Média", dono: "JL", diasNoFunil: 2,
    ultimoContato: "2026-06-06", proximaAcao: "Primeira ligação — 07/06",
    interacoes: [
      { id: iid(), data: "2026-06-06", tipo: "WhatsApp", nota: "Lead via formulário do site. Quer integrar pedidos e fidelidade." },
    ],
  },
  {
    id: 4, empresa: "Natural & Cia", segmento: "Loja Natural", cnpj: "34.567.890/0001-33",
    cidade: "Araxá", responsavel: "Bruno Sales", cargo: "Sócio", whatsapp: "(34) 99521-7766",
    status: "Em Contato", valor: 1200, prioridade: "Média", dono: "TS", diasNoFunil: 8,
    ultimoContato: "2026-06-04", proximaAcao: "Enviar cases do segmento — 08/06",
    interacoes: [
      { id: iid(), data: "2026-05-29", tipo: "Ligação",  nota: "Tem 2 lojas, quer unificar cadastro de clientes." },
      { id: iid(), data: "2026-06-04", tipo: "WhatsApp", nota: "Pediu exemplos de outras lojas naturais usando o sistema." },
    ],
  },
  {
    id: 5, empresa: "Sorriso Pleno Odontologia", segmento: "Clínica Odontológica", cnpj: "45.678.901/0001-77",
    cidade: "Uberaba", responsavel: "Dr. Henrique Paiva", cargo: "Diretor Clínico", whatsapp: "(34) 99488-1102",
    status: "Fechado", valor: 2100, prioridade: "Alta", dono: "CM", diasNoFunil: 27,
    ultimoContato: "2026-06-02", proximaAcao: "Onboarding agendado — 11/06",
    interacoes: [
      { id: iid(), data: "2026-05-08", tipo: "Ligação",  nota: "Indicação da OdontoVita. Alta intenção de compra." },
      { id: iid(), data: "2026-05-19", tipo: "Reunião",  nota: "Demo + negociação de plano anual." },
      { id: iid(), data: "2026-06-02", tipo: "E-mail",   nota: "Contrato assinado! Plano Pro anual, 5 usuários." },
    ],
  },
  {
    id: 6, empresa: "Veloz Motors", segmento: "Concessionária", cnpj: "56.789.012/0001-44",
    cidade: "Patos de Minas", responsavel: "Sandra Rocha", cargo: "Diretora", whatsapp: "(34) 99377-5523",
    status: "Em Contato", valor: 3800, prioridade: "Alta", dono: "RF", diasNoFunil: 6,
    ultimoContato: "2026-06-05", proximaAcao: "Agendar demonstração — 09/06",
    interacoes: [
      { id: iid(), data: "2026-06-01", tipo: "E-mail",   nota: "Respondeu campanha de e-mail. Pediu mais informações." },
      { id: iid(), data: "2026-06-05", tipo: "Ligação",  nota: "Conversamos sobre gestão de leads de showroom." },
    ],
  },
  {
    id: 7, empresa: "Rango Já", segmento: "Delivery", cnpj: "67.890.123/0001-88",
    cidade: "Uberlândia", responsavel: "Felipe Andrade", cargo: "Gerente", whatsapp: "(34) 99266-9911",
    status: "Perdido", valor: 750, prioridade: "Baixa", dono: "JL", diasNoFunil: 34,
    ultimoContato: "2026-05-20", proximaAcao: "—",
    interacoes: [
      { id: iid(), data: "2026-04-28", tipo: "WhatsApp", nota: "Interessado, mas orçamento apertado." },
      { id: iid(), data: "2026-05-20", tipo: "Ligação",  nota: "Optou por concorrente mais barato. Marcado para retomar em Q4." },
    ],
  },
  {
    id: 8, empresa: "Vida Verde Produtos Naturais", segmento: "Loja Natural", cnpj: "78.901.234/0001-21",
    cidade: "Uberlândia", responsavel: "Camila Dias", cargo: "Proprietária", whatsapp: "(34) 99155-3344",
    status: "Reunião Agendada", valor: 1350, prioridade: "Média", dono: "TS", diasNoFunil: 10,
    ultimoContato: "2026-06-06", proximaAcao: "Reunião de demo — 08/06 às 14h",
    interacoes: [
      { id: iid(), data: "2026-05-28", tipo: "WhatsApp", nota: "Quer programa de fidelidade integrado ao caixa." },
      { id: iid(), data: "2026-06-06", tipo: "Ligação",  nota: "Reunião confirmada para 08/06." },
    ],
  },
  {
    id: 9, empresa: "DentalCare Araxá", segmento: "Clínica Odontológica", cnpj: "89.012.345/0001-66",
    cidade: "Araxá", responsavel: "Dra. Letícia Moura", cargo: "Sócia", whatsapp: "(34) 99044-2287",
    status: "Proposta Enviada", valor: 1650, prioridade: "Média", dono: "CM", diasNoFunil: 16,
    ultimoContato: "2026-06-04", proximaAcao: "Cobrar retorno da proposta — 09/06",
    interacoes: [
      { id: iid(), data: "2026-05-23", tipo: "Ligação",  nota: "Clínica com 3 dentistas. Foco em confirmação de consultas." },
      { id: iid(), data: "2026-06-04", tipo: "E-mail",   nota: "Proposta enviada — plano Essencial, 3 usuários." },
    ],
  },
  {
    id: 10, empresa: "Premium Cars Uberaba", segmento: "Concessionária", cnpj: "90.123.456/0001-99",
    cidade: "Uberaba", responsavel: "Marcos Vinícius", cargo: "Gerente de Vendas", whatsapp: "(34) 98933-6610",
    status: "Novo", valor: 3200, prioridade: "Alta", dono: "RF", diasNoFunil: 1,
    ultimoContato: "2026-06-06", proximaAcao: "Qualificar lead — 07/06",
    interacoes: [
      { id: iid(), data: "2026-06-06", tipo: "E-mail",   nota: "Solicitou contato via LinkedIn. Grande potencial." },
    ],
  },
  {
    id: 11, empresa: "Bom Prato Delivery", segmento: "Delivery", cnpj: "11.222.333/0001-44",
    cidade: "Patos de Minas", responsavel: "Renata Lima", cargo: "Sócia", whatsapp: "(34) 98822-4455",
    status: "Em Contato", valor: 980, prioridade: "Baixa", dono: "JL", diasNoFunil: 5,
    ultimoContato: "2026-06-05", proximaAcao: "Enviar proposta — 09/06",
    interacoes: [
      { id: iid(), data: "2026-06-02", tipo: "WhatsApp", nota: "Hamburgueria com 2 unidades. Quer controle de recompra." },
      { id: iid(), data: "2026-06-05", tipo: "Ligação",  nota: "Levantamento feito. Vai receber proposta." },
    ],
  },
  {
    id: 12, empresa: "Essência Natural", segmento: "Loja Natural", cnpj: "22.333.444/0001-55",
    cidade: "Uberaba", responsavel: "Otávio Pires", cargo: "Proprietário", whatsapp: "(34) 98711-9988",
    status: "Fechado", valor: 1100, prioridade: "Média", dono: "TS", diasNoFunil: 22,
    ultimoContato: "2026-05-30", proximaAcao: "Onboarding concluído",
    interacoes: [
      { id: iid(), data: "2026-05-09", tipo: "Ligação",  nota: "Loja em expansão, abrindo 3ª unidade." },
      { id: iid(), data: "2026-05-30", tipo: "E-mail",   nota: "Contrato fechado — plano Essencial mensal." },
    ],
  },
  {
    id: 13, empresa: "Clínica OdontoArt", segmento: "Clínica Odontológica", cnpj: "33.444.555/0001-66",
    cidade: "Uberlândia", responsavel: "Dr. Ricardo Fontes", cargo: "Diretor", whatsapp: "(34) 98600-1133",
    status: "Novo", valor: 1500, prioridade: "Média", dono: "CM", diasNoFunil: 3,
    ultimoContato: "2026-06-05", proximaAcao: "Ligação de qualificação — 07/06",
    interacoes: [
      { id: iid(), data: "2026-06-05", tipo: "WhatsApp", nota: "Veio de anúncio. Quer reduzir faltas de pacientes." },
    ],
  },
  {
    id: 14, empresa: "MaxAuto Seminovos", segmento: "Concessionária", cnpj: "44.555.666/0001-77",
    cidade: "Araxá", responsavel: "Gustavo Reis", cargo: "Proprietário", whatsapp: "(34) 98577-2244",
    status: "Reunião Agendada", valor: 2600, prioridade: "Alta", dono: "RF", diasNoFunil: 14,
    ultimoContato: "2026-06-06", proximaAcao: "Reunião — 10/06 às 10h",
    interacoes: [
      { id: iid(), data: "2026-05-26", tipo: "Ligação",  nota: "Revenda de seminovos. Quer gestão de funil de vendas." },
      { id: iid(), data: "2026-06-06", tipo: "WhatsApp", nota: "Reunião marcada para 10/06." },
    ],
  },
  {
    id: 15, empresa: "FitFood Delivery", segmento: "Delivery", cnpj: "55.666.777/0001-88",
    cidade: "Uberlândia", responsavel: "Aline Castro", cargo: "CEO", whatsapp: "(34) 98466-7755",
    status: "Proposta Enviada", valor: 1450, prioridade: "Alta", dono: "JL", diasNoFunil: 18,
    ultimoContato: "2026-06-04", proximaAcao: "Negociar condições — 09/06",
    interacoes: [
      { id: iid(), data: "2026-05-21", tipo: "Reunião",  nota: "Marmitas fitness por assinatura. Foco em retenção." },
      { id: iid(), data: "2026-06-04", tipo: "E-mail",   nota: "Proposta enviada — plano Pro com módulo de assinaturas." },
    ],
  },
  {
    id: 16, empresa: "Bem Estar Natural", segmento: "Loja Natural", cnpj: "66.777.888/0001-99",
    cidade: "Patos de Minas", responsavel: "Diego Martins", cargo: "Sócio", whatsapp: "(34) 98355-8866",
    status: "Em Contato", valor: 890, prioridade: "Baixa", dono: "TS", diasNoFunil: 7,
    ultimoContato: "2026-06-03", proximaAcao: "Agendar demo — 09/06",
    interacoes: [
      { id: iid(), data: "2026-05-31", tipo: "WhatsApp", nota: "Loja de suplementos. Quer CRM simples e barato." },
      { id: iid(), data: "2026-06-03", tipo: "Ligação",  nota: "Vai avaliar com o sócio." },
    ],
  },
  {
    id: 17, empresa: "Studio Sorriso", segmento: "Clínica Odontológica", cnpj: "77.888.999/0001-11",
    cidade: "Uberaba", responsavel: "Dra. Beatriz Antunes", cargo: "Proprietária", whatsapp: "(34) 98244-9977",
    status: "Perdido", valor: 1300, prioridade: "Baixa", dono: "CM", diasNoFunil: 29,
    ultimoContato: "2026-05-18", proximaAcao: "—",
    interacoes: [
      { id: iid(), data: "2026-04-25", tipo: "Ligação",  nota: "Interesse inicial em agenda online." },
      { id: iid(), data: "2026-05-18", tipo: "E-mail",   nota: "Sem retorno após 3 tentativas. Lead arquivado." },
    ],
  },
  {
    id: 18, empresa: "Turbo Veículos", segmento: "Concessionária", cnpj: "88.999.000/0001-22",
    cidade: "Uberlândia", responsavel: "Larissa Gomes", cargo: "Gerente Comercial", whatsapp: "(34) 98133-4400",
    status: "Novo", valor: 4500, prioridade: "Alta", dono: "RF", diasNoFunil: 1,
    ultimoContato: "2026-06-06", proximaAcao: "Primeira reunião — 08/06",
    interacoes: [
      { id: iid(), data: "2026-06-06", tipo: "Ligação",  nota: "Grande concessionária multimarcas. Excelente fit." },
    ],
  },
  {
    id: 19, empresa: "Verde Vida Empório", segmento: "Loja Natural", cnpj: "99.000.111/0001-33",
    cidade: "Araxá", responsavel: "Paulo Cesar", cargo: "Proprietário", whatsapp: "(34) 98022-1199",
    status: "Reunião Agendada", valor: 1050, prioridade: "Média", dono: "TS", diasNoFunil: 9,
    ultimoContato: "2026-06-05", proximaAcao: "Demo — 09/06 às 16h",
    interacoes: [
      { id: iid(), data: "2026-05-30", tipo: "WhatsApp", nota: "Empório de produtos a granel. Quer fidelizar clientes." },
      { id: iid(), data: "2026-06-05", tipo: "Ligação",  nota: "Demo agendada para 09/06." },
    ],
  },
  {
    id: 20, empresa: "Express Burger", segmento: "Delivery", cnpj: "10.111.222/0001-44",
    cidade: "Uberaba", responsavel: "Marcela Tavares", cargo: "Sócia", whatsapp: "(34) 97911-5566",
    status: "Fechado", valor: 1250, prioridade: "Média", dono: "JL", diasNoFunil: 24,
    ultimoContato: "2026-05-28", proximaAcao: "Cliente ativo",
    interacoes: [
      { id: iid(), data: "2026-05-04", tipo: "Reunião",  nota: "Rede de 4 lojas. Quer dashboard de recompra." },
      { id: iid(), data: "2026-05-28", tipo: "E-mail",   nota: "Fechado! Plano Pro, 6 usuários." },
    ],
  },
];

// ---- Agenda tasks (today = 2026-06-07) -------------------------------------
const TASKS = [
  { id: "t1", data: "2026-06-07", hora: "09:00", tipo: "Ligação",  leadId: 3,  status: "Pendente",  obs: "Primeiro contato de qualificação" },
  { id: "t2", data: "2026-06-07", hora: "10:30", tipo: "Ligação",  leadId: 13, status: "Pendente",  obs: "Entender dor de faltas de pacientes" },
  { id: "t3", data: "2026-06-07", hora: "11:00", tipo: "E-mail",   leadId: 10, status: "Concluído", obs: "Enviar apresentação institucional" },
  { id: "t4", data: "2026-06-07", hora: "14:00", tipo: "WhatsApp", leadId: 18, status: "Pendente",  obs: "Confirmar reunião de amanhã" },
  { id: "t5", data: "2026-06-07", hora: "16:30", tipo: "Reunião",  leadId: 1,  status: "Pendente",  obs: "Preparar deck da proposta" },
  { id: "t6", data: "2026-06-08", hora: "14:00", tipo: "Reunião",  leadId: 8,  status: "Pendente",  obs: "Demo do programa de fidelidade" },
  { id: "t7", data: "2026-06-08", hora: "09:30", tipo: "Reunião",  leadId: 18, status: "Pendente",  obs: "Primeira reunião comercial" },
  { id: "t8", data: "2026-06-09", hora: "10:00", tipo: "Reunião",  leadId: 1,  status: "Pendente",  obs: "Apresentação da proposta" },
  { id: "t9", data: "2026-06-09", hora: "11:30", tipo: "WhatsApp", leadId: 9,  status: "Pendente",  obs: "Cobrar retorno da proposta" },
  { id: "t10", data: "2026-06-09", hora: "16:00", tipo: "Reunião", leadId: 19, status: "Pendente",  obs: "Demo para o empório" },
  { id: "t11", data: "2026-06-10", hora: "10:00", tipo: "Reunião", leadId: 14, status: "Pendente",  obs: "Reunião com a MaxAuto" },
  { id: "t12", data: "2026-06-10", hora: "15:00", tipo: "Ligação", leadId: 2,  status: "Pendente",  obs: "Follow-up da proposta enviada" },
  { id: "t13", data: "2026-06-11", hora: "09:00", tipo: "Reunião", leadId: 5,  status: "Pendente",  obs: "Onboarding Sorriso Pleno" },
];

// ---- Reports: monthly evolution (last 6 months) ----------------------------
const MONTHLY = [
  { mes: "Jan", abertos: 14, fechados: 4 },
  { mes: "Fev", abertos: 18, fechados: 6 },
  { mes: "Mar", abertos: 22, fechados: 7 },
  { mes: "Abr", abertos: 19, fechados: 5 },
  { mes: "Mai", abertos: 26, fechados: 9 },
  { mes: "Jun", abertos: 20, fechados: 4 },
];

// ============================================================
//  Derived helpers
// ============================================================
const FUNNEL_ORDER = ["Novo", "Em Contato", "Reunião Agendada", "Proposta Enviada", "Fechado"];
const FUNNEL_LABEL = {
  "Novo": "Prospecção",
  "Em Contato": "Contato Feito",
  "Reunião Agendada": "Reunião Agendada",
  "Proposta Enviada": "Proposta Enviada",
  "Fechado": "Fechado",
};

function funnelData(leads) {
  return FUNNEL_ORDER.map((s) => ({
    etapa: FUNNEL_LABEL[s],
    qtd: leads.filter((l) => l.status === s).length,
    fill: STATUS_META[s].color,
  }));
}

function segmentData(leads) {
  return SEGMENTS.map((seg) => ({
    name: seg,
    value: leads.filter((l) => l.segmento === seg).length,
    fill: SEGMENT_COLORS[seg],
  })).filter((d) => d.value > 0);
}

function cityData(leads) {
  return CITIES.map((c) => ({
    cidade: c,
    leads: leads.filter((l) => l.cidade === c).length,
  }));
}

function segmentSummary(leads) {
  return SEGMENTS.map((seg) => {
    const ls = leads.filter((l) => l.segmento === seg);
    const reunioes = ls.filter((l) => ["Reunião Agendada", "Proposta Enviada", "Fechado"].includes(l.status)).length;
    const fechados = ls.filter((l) => l.status === "Fechado");
    const receita = fechados.reduce((s, l) => s + l.valor, 0);
    return {
      segmento: seg,
      leads: ls.length,
      reunioes,
      fechamentos: fechados.length,
      receita,
      ticket: fechados.length ? Math.round(receita / fechados.length) : 0,
    };
  });
}

function recentActivity(leads, limit = 8) {
  const all = [];
  leads.forEach((l) => {
    l.interacoes.forEach((it) => {
      all.push({ ...it, empresa: l.empresa, leadId: l.id });
    });
  });
  all.sort((a, b) => b.data.localeCompare(a.data));
  return all.slice(0, limit);
}

function kpis(leads) {
  const total = leads.length;
  const negociacao = leads.filter((l) => ["Reunião Agendada", "Proposta Enviada"].includes(l.status)).length;
  const fechados = leads.filter((l) => l.status === "Fechado").length;
  const perdidos = leads.filter((l) => l.status === "Perdido").length;
  const decididos = fechados + perdidos;
  const conversao = decididos ? Math.round((fechados / decididos) * 100) : 0;
  return { total, negociacao, fechados, conversao };
}

const fmtBRL = (v) => "R$ " + v.toLocaleString("pt-BR");
const fmtBRLk = (v) => v >= 1000 ? "R$ " + (v / 1000).toFixed(1).replace(".", ",") + "k" : "R$ " + v;

function fmtDate(iso) {
  if (!iso || iso === "—") return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}
function fmtDateLong(iso) {
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const [y, m, d] = iso.split("-");
  return `${d} ${months[+m - 1]} ${y}`;
}

Object.assign(window, {
  COLORS, STATUS, STATUS_META, SEGMENTS, SEGMENT_COLORS, CITIES, PRIORITY_META, REPS, INTERACTION_META,
  ACCENT_HOVER, USERS, ROLE_META, ROLE_PERMS, can, userInfo,
  LEADS, TASKS, MONTHLY,
  funnelData, segmentData, cityData, segmentSummary, recentActivity, kpis,
  fmtBRL, fmtBRLk, fmtDate, fmtDateLong, FUNNEL_LABEL,
});
