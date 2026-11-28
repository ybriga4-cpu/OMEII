/*
 * api/cron-article.js — article du jour OMEII (Vercel Cron)
 *
 * Chaque jour, génère UN article avec Claude Haiku et l'écrit dans :
 *   - assets/data/brouillons.json  (mode "brouillon", défaut : relecture humaine obligatoire)
 *   - assets/data/actualites.json  (mode "publie")
 *
 * Variables d'environnement (Vercel > Settings > Environment Variables) :
 *   CRON_SECRET        secret partagé ; Vercel l'envoie en "Authorization: Bearer ..."
 *   ANTHROPIC_API_KEY  clé API Anthropic
 *   GITHUB_TOKEN       jeton avec accès « Contents: read/write » au dépôt
 *   ARTICLE_AUTO       "on" pour activer (sinon la fonction ne fait rien)
 *   ARTICLE_MODE       "brouillon" (défaut) ou "publie"
 *   ARTICLES_PER_DAY   nombre d'articles par passage (défaut 2, maximum 3)
 *   GITHUB_REPO        optionnel, défaut "ybriga4-cpu/OMEII"
 *   GITHUB_BRANCH      optionnel, défaut "main"
 *   ANTHROPIC_MODEL    optionnel, défaut "claude-haiku-5-5"
 */

const THEMES = [
  { cat: "economie", sujet: "un mécanisme économique général expliqué simplement (inflation, taux, croissance, balance des paiements…)" },
  { cat: "commerce", sujet: "un point de commerce international ou de formalités douanières, expliqué simplement" },
  { cat: "investissement", sujet: "une notion d'investissement ou de montage de projet (étude de faisabilité, financement, risques…)" },
  { cat: "economie", sujet: "une notion de lecture d'indicateurs économiques (comment interpréter un chiffre, un indice, une série)" },
  { cat: "commerce", sujet: "une notion de logistique et de chaînes d'approvisionnement" },
  { cat: "investissement", sujet: "une notion de gestion financière pour porteurs de projets et PME" },
  { cat: "economie", sujet: "une notion de politique publique économique expliquée sans prendre parti" }
];

const SYSTEM = `Tu rédiges pour OMEII, observatoire marocain de l'économie et de l'investissement (association à but non lucratif).
Règles strictes :
- Écris en français, ton pédagogique et neutre, aucun avis politique, aucun conseil d'investissement personnalisé.
- N'invente AUCUN chiffre, date, nom, loi, article de loi ou citation. Si tu n'es pas certain, reste général.
- N'utilise aucun chiffre (écris les nombres en lettres si nécessaire), aucune année, aucun pourcentage, aucun montant.
- Ne parle pas de l'actualité récente : écris un contenu pédagogique intemporel.
- N'écris aucune référence ni URL : la liste de sources sera ajoutée par un relecteur humain.
- Longueur : 3 à 5 paragraphes courts.
Réponds UNIQUEMENT par un objet JSON, sans texte autour ni balises :
{"title": "...", "excerpt": "une phrase de 25 à 35 mots", "body": ["paragraphe 1", "paragraphe 2", "..."]}`;

const GH = "https://api.github.com";

async function ghGet(repo, branch, path, token) {
  const r = await fetch(`${GH}/repos/${repo}/contents/${path}?ref=${branch}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "omeii-cron" }
  });
  if (r.status === 404) return { sha: null, json: { items: [] } };
  if (!r.ok) throw new Error(`GitHub GET ${path}: ${r.status}`);
  const d = await r.json();
  return { sha: d.sha, json: JSON.parse(Buffer.from(d.content, "base64").toString("utf-8")) };
}

async function ghPut(repo, branch, path, json, sha, message, token) {
  const body = { message, branch, content: Buffer.from(JSON.stringify(json, null, 2), "utf-8").toString("base64") };
  if (sha) body.sha = sha;
  const r = await fetch(`${GH}/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "omeii-cron", "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`GitHub PUT ${path}: ${r.status} ${await r.text()}`);
}

async function generate(theme, recentTitles) {
  const ar = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
      max_tokens: 1500,
      system: SYSTEM,
      messages: [{ role: "user", content:
        `Rédige un article sur : ${theme.sujet}.\n` +
        (recentTitles.length ? `Évite ces sujets déjà traités :\n- ${recentTitles.join("\n- ")}` : "") }]
    })
  });
  if (!ar.ok) throw new Error(`Anthropic: ${ar.status} ${await ar.text()}`);
  const data = await ar.json();
  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").replace(/```json|```/g, "").trim();
  try { return JSON.parse(text); } catch (e) { return null; }
}

// Garde-fous : on ne publie jamais un texte qui contient des chiffres, des liens ou qui est incomplet.
function validate(a) {
  if (!a || !a.title || !a.excerpt || !Array.isArray(a.body) || a.body.length < 3) return "incomplet";
  const all = [a.title, a.excerpt, ...a.body].join(" ");
  if (/\d/.test(all)) return "contient des chiffres";
  if (/https?:|www\./i.test(all)) return "contient un lien";
  if (all.length < 600) return "trop court";
  return null;
}

module.exports = async (req, res) => {
  const log = (o) => console.log(JSON.stringify({ fn: "cron-article", ...o }));

  const secret = process.env.CRON_SECRET;
  if (!secret || (req.headers.authorization || "") !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "unauthorized" });
  }
  if (process.env.ARTICLE_AUTO !== "on") {
    log({ skipped: "ARTICLE_AUTO != on" });
    return res.status(200).json({ skipped: true });
  }

  const missing = ["ANTHROPIC_API_KEY", "GITHUB_TOKEN"].filter((k) => !process.env[k]);
  if (missing.length) {
    log({ error: "variables manquantes", missing });
    return res.status(500).json({ error: "missing env", missing });
  }

  const repo = process.env.GITHUB_REPO || "ybriga4-cpu/OMEII";
  const branch = process.env.GITHUB_BRANCH || "main";
  const token = process.env.GITHUB_TOKEN;
  const mode = process.env.ARTICLE_MODE === "publie" ? "publie" : "brouillon";
  const today = new Date().toISOString().slice(0, 10);
  const targetPath = mode === "publie" ? "assets/data/actualites.json" : "assets/data/brouillons.json";

  try {
    const [pub, dra] = await Promise.all([
      ghGet(repo, branch, "assets/data/actualites.json", token),
      ghGet(repo, branch, "assets/data/brouillons.json", token)
    ]);
    const known = [...(pub.json.items || []), ...(dra.json.items || [])];
    const target = mode === "publie" ? pub : dra;
    target.json.items = target.json.items || [];

    const perDay = Math.min(Math.max(parseInt(process.env.ARTICLES_PER_DAY || "2", 10) || 2, 1), 3);
    const created = [];

    for (let n = 1; n <= perDay; n++) {
      const id = `auto-${today}-${n}`;
      if (known.some((i) => i.id === id)) { log({ skipped: "déjà généré", id }); continue; }

      const theme = THEMES[(new Date().getUTCDate() * perDay + n) % THEMES.length];
      const recent = known.slice(0, 20).map((i) => i.title).filter(Boolean);
      let art = null;
      for (let attempt = 1; attempt <= 2 && !art; attempt++) {
        const candidate = await generate(theme, recent);
        const reason = validate(candidate);
        if (reason) log({ rejected: id, attempt, reason }); else art = candidate;
      }
      if (!art) { log({ error: "article rejeté deux fois", id }); continue; }

      const item = {
        id,
        status: mode === "publie" ? "publie" : "brouillon",
        cat: theme.cat,
        author: "OMEII",
        date: today,
        title: String(art.title).trim(),
        excerpt: String(art.excerpt).trim(),
        body: art.body.map((p) => String(p).trim()),
        sources: [],
        ai: true
      };
      target.json.items.unshift(item);
      known.unshift(item);
      created.push(item);
    }

    if (!created.length) return res.status(200).json({ ok: true, created: 0 });

    await ghPut(repo, branch, targetPath, target.json, target.sha, `Articles du jour (${mode}) : ${created.map((i) => i.title).join(" | ")}`, token);
    log({ ok: true, mode, created: created.map((i) => ({ id: i.id, cat: i.cat })) });
    return res.status(200).json({ ok: true, mode, created: created.length });
  } catch (e) {
    log({ error: String(e.message || e) });
    return res.status(500).json({ error: "failed" });
  }
};
