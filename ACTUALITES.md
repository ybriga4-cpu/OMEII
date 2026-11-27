# Rubrique Actualités — mode d'emploi

## Ajouter un article à la main
Éditer `assets/data/actualites.json` (ajouter un objet en tête de `items`) :
`id` (unique, sans espaces), `status` ("publie"), `cat` (economie | commerce | investissement | officiel | annonces),
`author`, `date` (AAAA-MM-JJ, obligatoire pour le tri), `title`, `excerpt`, `body` (liste de paragraphes),
`sources` ([{label,url}]), `ai` (true si rédigé avec l'aide d'une IA).
Version arabe optionnelle : `title_ar`, `excerpt_ar`, `body_ar` (repli sur le français si absent).
Brève officielle : `"type": "breve"` + `sourceUrl` (résumé court, jamais de copie de la source).
Supprimer les entrées dont `"example": true`.

## Article du jour automatique (Vercel Cron, 06:00 UTC)
Variables Vercel : CRON_SECRET, ANTHROPIC_API_KEY, GITHUB_TOKEN, ARTICLE_AUTO=on,
ARTICLE_MODE=brouillon (défaut) ou publie.
En mode brouillon, l'article est écrit dans `assets/data/brouillons.json` (non affiché).
Pour le publier : le relire, ajouter ses sources officielles, le déplacer dans `actualites.json`
et passer `status` à "publie".
