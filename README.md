# Site OMEII / OMEII — guide de prise en main (v2)

Site statique (HTML/CSS/JS), sans build ni framework. Cette version ajoute : le logo, une nouvelle palette bleu marine/or, un backoffice de gestion de contenu, une boîte aux lettres et un assistant FAQ.

## Ce qui a changé depuis la v1

- **Logo intégré** : votre logo (`assets/img/omeii-logo.png`) apparaît en haut à droite de chaque page, et en grand dans le hero de l'accueil.
- **Nouvelle palette** : bleu marine (#0B2B50) + or (#C9A24A), reprise directement de votre logo, avec plusieurs nuances de bleu (marine, royal, ciel) pour la hiérarchie visuelle — conforme aux usages des sites financiers/institutionnels où le bleu domine largement (structure, confiance) et où l'or reste un accent réservé aux éléments de valeur (CTA, tampons).
- **Page Publications** réorganisée en 3 onglets : Études & notes, Annonces, Vidéos.
- **Nouvelle page Contact** (`contact.html`) : une "boîte aux lettres" avec formulaire général.
- **Nouvelle page Assistant** (`chat.html`) : un assistant FAQ automatique, sans serveur. Un bouton flottant "Assistant OMEII" y renvoie depuis toutes les pages.
- **Backoffice** (`/admin`) : voir section dédiée ci-dessous.

## Accéder au backoffice

**Chemin : `https://votre-site.netlify.app/admin/`**

C'est la convention standard pour ce type d'outil (Decap CMS, anciennement Netlify CMS) — une interface web avec formulaires, sans ligne de code, pour gérer :

- les publications (études, notes, PDF)
- les axes de recherche
- les annonces
- les vidéos

### ⚠️ Point important avant de déployer

Le backoffice a besoin que le site soit connecté à un dépôt **GitHub**, et pas seulement déposé sur Netlify par glisser-déposer (Netlify Drop). En effet, chaque modification faite dans le backoffice crée un commit Git — c'est ce qui permet de garder un historique de toutes les modifications de contenu.

Étapes pour activer le backoffice :

1. Créez un nouveau dépôt GitHub (par exemple `omeii-website`) et poussez-y le contenu du dossier `omeii-site`.
2. Sur Netlify : **Add new site → Import an existing project → GitHub**, puis sélectionnez ce dépôt (au lieu du glisser-déposer utilisé pour Smart-Invest.IA).
3. Dans le tableau de bord du site sur Netlify : **Site configuration → Identity → Enable Identity**.
4. Toujours dans Identity : **Registration → Invite only** (recommandé, pour que seules les personnes que vous invitez puissent se connecter au backoffice).
5. **Identity → Services → Git Gateway → Enable Git Gateway**.
6. Onglet **Identity → Invite users** : invitez-vous vous-même (et les autres membres du Bureau) par e-mail.
7. Rendez-vous sur `https://votre-site.netlify.app/admin/`, connectez-vous avec le lien reçu par e-mail — le backoffice est prêt.

Tant que ces étapes ne sont pas faites, `/admin` s'affichera mais la connexion échouera : c'est normal, il manque juste la configuration côté tableau de bord Netlify (rien à modifier dans le code).

## Ajouter du contenu sans le backoffice

Toujours possible en éditant directement les fichiers JSON dans `assets/data/` (chacun au format `{"items": [...]}`) :

- `publications.json` — études et notes d'analyse
- `axes.json` — les 3 axes de recherche
- `announcements.json` — annonces
- `videos.json` — vidéos (utiliser un lien d'intégration YouTube, format `https://www.youtube.com/embed/ID_DE_LA_VIDEO`)

## Intégrer le logo (déjà fait)

Le fichier a été placé dans `assets/img/omeii-logo.png` et intégré automatiquement dans l'en-tête de toutes les pages ainsi que dans le hero de l'accueil. Si vous produisez une version haute résolution ou une variante (fond sombre, favicon), déposez-la dans `assets/img/` et dites-le-moi pour l'intégrer.

## Déploiement

- **Version simple (sans backoffice)** : Netlify Drop, comme pour Smart-Invest.IA — glissez le dossier `omeii-site` sur app.netlify.com.
- **Version avec backoffice** : déploiement via GitHub (voir étapes ci-dessus). Les formulaires "Adhésion", "Don" et "Contact" sont détectés automatiquement par Netlify dans les deux cas.

## Ce qui reste à compléter avant mise en ligne publique

- Adresse du siège social (footer et mentions légales)
- Numéro de récépissé de déclaration
- Noms des membres du Bureau et du Conseil Scientifique (`equipe.html`)
- Les données de l'Observatoire sont des exemples — à remplacer par vos propres chiffres sourcés
- La vidéo de démonstration dans `videos.json` pointe vers un identifiant à remplacer

## Multilingue (AR / EN)

Les boutons AR et EN restent désactivés pour l'instant. La police IBM Plex Sans (variante Arabic incluse) est déjà prête pour des pages `*-ar.html` en RTL, sur le modèle du dossier statutaire déjà produit.
