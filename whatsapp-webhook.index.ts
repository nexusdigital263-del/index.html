// ============================================================================
//  NexusCRM · Edge Function "whatsapp-webhook"
//  RECEBE as respostas dos leads (WhatsApp Cloud API) e grava na timeline
//  do lead correspondente. Também responde ao "handshake" de verificação.
//
//  Arquivo no editor do Supabase:  index.ts
//  (crie uma função NOVA chamada exatamente: whatsapp-webhook)
//
//  Segredos (Project Settings → Edge Functions → Secrets):
//    WHATSAPP_VERIFY_TOKEN     = uma senha que VOCÊ inventa (ex.: nexus-veropa-2026)
//    SUPABASE_URL              = (já existe)
//    SUPABASE_SERVICE_ROLE_KEY = (já existe)
//
//  IMPORTANTE: esta função precisa ser PÚBLICA (sem exigir JWT), porque quem
//  chama é a Meta, não um usuário logado. Veja o passo a passo no .md.
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const onlyDigits = (s: string) => String(s || "").replace(/\D/g, "");

// extrai o texto de qualquer tipo de mensagem recebida
function extractText(m: any): string {
  if (!m) return "";
  switch (m.type) {
    case "text": return m.text?.body || "";
    case "button": return m.button?.text || "";
    case "interactive":
      return m.interactive?.button_reply?.title || m.interactive?.list_reply?.title || "";
    case "image": return m.image?.caption ? "📷 " + m.image.caption : "📷 Imagem recebida";
    case "audio": return "🎤 Áudio recebido";
    case "video": return m.video?.caption ? "🎬 " + m.video.caption : "🎬 Vídeo recebido";
    case "document": return "📄 Documento: " + (m.document?.filename || "arquivo");
    case "location": return "📍 Localização recebida";
    case "sticker": return "💬 Figurinha recebida";
    case "contacts": return "👤 Contato recebido";
    default: return `[${m.type || "mensagem"}]`;
  }
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);

  // ---- 1) GET: verificação do webhook (handshake da Meta) ----
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    const VERIFY = Deno.env.get("WHATSAPP_VERIFY_TOKEN");
    if (mode === "subscribe" && token && token === VERIFY) {
      return new Response(challenge ?? "", { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  if (req.method !== "POST") return new Response("ok", { status: 200 });

  // ---- 2) POST: mensagens recebidas ----
  try {
    const body = await req.json();
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messages = value?.messages;
    const statuses = value?.statuses;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ---- 2a) STATUS de entrega (sent/delivered/read/failed) ----
    if (statuses && statuses.length) {
      const { data: leadsS } = await admin.from("leads").select("id, interacoes");
      const allS = leadsS || [];
      const RANK: Record<string, number> = { sent: 1, delivered: 2, read: 3, failed: 4 };
      for (const st of statuses) {
        const wamid = st?.id;
        const novo = st?.status; // sent | delivered | read | failed
        if (!wamid || !novo) continue;
        for (const l of allS) {
          const arr = Array.isArray(l.interacoes) ? l.interacoes : [];
          const it = arr.find((x: any) => x.wamid === wamid);
          if (!it) continue;
          // só avança o status (não volta de "lido" para "entregue")
          if ((RANK[novo] || 0) >= (RANK[it.status] || 0) || novo === "failed") {
            it.status = novo;
            await admin.from("leads").update({ interacoes: arr }).eq("id", l.id);
            l.interacoes = arr;
          }
          break;
        }
      }
      return new Response("ok", { status: 200 });
    }

    // Sem mensagens = nada a gravar
    if (!messages || !messages.length) return new Response("ok", { status: 200 });

    // carrega leads uma vez (para casar pelo telefone)
    const { data: leads } = await admin
      .from("leads")
      .select("id, whatsapp, interacoes, unread");
    const all = leads || [];

    for (const m of messages) {
      const from = onlyDigits(m.from);
      if (from.length < 8) continue;
      const last8 = from.slice(-8); // núcleo do número (ignora DDI/9º dígito)

      const lead = all.find((l: any) => {
        const d = onlyDigits(l.whatsapp);
        return d && d.slice(-8) === last8;
      });
      if (!lead) continue; // ninguém com esse número — ignora (ou poderia virar lead novo)

      const text = extractText(m);
      const it = {
        id: "in-" + Date.now() + "-" + Math.random().toString(16).slice(2, 6),
        data: new Date().toISOString().slice(0, 10),
        ts: (Number(m.timestamp) ? Number(m.timestamp) * 1000 : Date.now()), // ordena no chat
        tipo: "WhatsApp",
        nota: text,
        dir: "in", // <- marca como RECEBIDA
      };
      const interacoes = Array.isArray(lead.interacoes) ? lead.interacoes : [];
      interacoes.push(it);
      // atualiza no banco (RLS é ignorada pela service_role)
      await admin
        .from("leads")
        .update({
          interacoes,
          ultimo_contato: it.data,
          unread: (Number(lead.unread) || 0) + 1,
        })
        .eq("id", lead.id);
      // evita gravar 2x no mesmo lead no mesmo lote
      lead.interacoes = interacoes;
      lead.unread = (Number(lead.unread) || 0) + 1;
    }

    return new Response("ok", { status: 200 });
  } catch (_e) {
    // sempre 200 para a Meta não ficar reenviando
    return new Response("ok", { status: 200 });
  }
});
