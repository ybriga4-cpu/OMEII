/*
 * site-chrome.js — OMEII
 * En-tête et pied de page centralisés pour le site OMEII, y compris les
 * pages du sous-dossier /livres/. Modifier le menu, le logo ou le footer
 * se fait UNIQUEMENT ici, et se répercute automatiquement partout.
 *
 * Utilisation dans chaque page HTML :
 *   1. Remplacer le bloc <header class="site-header">...</header> par :
 *        <div id="site-header"></div>
 *   2. Remplacer le bloc <footer class="site-footer">...</footer> et le
 *      lien <a class="chat-launcher">...</a> qui le suit par :
 *        <div id="site-footer"></div>
 *   3. Ajouter juste avant le script assets/js/main.js :
 *        <script src="assets/js/site-chrome.js"></script>
 *      (depuis /livres/, utiliser "../assets/js/site-chrome.js")
 */
(function () {

  // Racine relative : "" à la racine du site, "../" depuis /livres/
  var BASE = window.location.pathname.indexOf("/livres/") !== -1 ? "../" : "";

  var NAV_LINKS = [
    { href: "publications.html", label: "Publications" },
    { href: "observatoire.html", label: "Observatoire" },
    { href: "recherche.html",    label: "Recherche" },
    { href: "equipe.html",       label: "Équipe" },
    { href: "adhesion.html",     label: "Adhésion" },
    { href: "contact.html",      label: "Contact" }
  ];

  var FOOTER_LINKS = [
    { href: "mentions-legales.html",  label: "Mentions légales & confidentialité" },
    { href: "adhesion.html",          label: "Soutenir OMEII" },
    { href: "contact.html",           label: "Boîte aux lettres" },
    { href: "chat.html",              label: "Assistant / FAQ" },
    { href: "mailto:contact@omeii.ma", label: "contact@omeii.ma" }
  ];

  function currentPage() {
    var file = window.location.pathname.split("/").pop();
    return file === "" ? "index.html" : file;
  }

  function buildHeader() {
    var page = currentPage();
    var links = NAV_LINKS.map(function (item) {
      var current = item.href === page ? ' aria-current="page"' : "";
      return '<a href="' + BASE + item.href + '"' + current + ">" + item.label + "</a>";
    }).join("\n      ");

    return (
      '<header class="site-header">\n' +
      '  <div class="wrap header-inner">\n' +
      '    <a class="wordmark" href="' + BASE + 'index.html">\n' +
      "      <strong>OMEII — Observatoire de l'Économie et de l'Intégration des Investissements / Observatory of Moroccan Economy and Integrated Investments</strong>\n" +
      "    </a>\n" +
      '    <nav class="main-nav" aria-label="Navigation principale">\n' +
      "      " + links + "\n" +
      "    </nav>\n" +
      '    <div class="header-right">\n' +
      '      <a class="site-logo" href="' + BASE + 'index.html">\n' +
      '        <img src="' + BASE + 'assets/img/omeii-logo.png" alt="OMEII — Observatoire de l\'Économie et de l\'Intégration des Investissements / Observatory of Moroccan Economy and Integrated Investments">\n' +
      "      </a>\n" +
      "    </div>\n" +
      "  </div>\n" +
      "</header>"
    );
  }

  function buildFooter() {
    var links = FOOTER_LINKS.map(function (item) {
      var href = item.href.indexOf("mailto:") === 0 ? item.href : BASE + item.href;
      return '<a href="' + href + '">' + item.label + "</a>";
    }).join("\n      ");

    return (
      '<footer class="site-footer">\n' +
      '  <div class="wrap footer-inner">\n' +
      "    <div>\n" +
      '      <p class="footer-brand">OMEII</p>\n' +
      '      <p class="footer-meta">Site à but non lucratif, qui fait partie du GEOM, Groupement des Opérateurs Économiques du Maroc — <a href="https://www.geom.ma" target="_blank" rel="noopener">www.geom.ma</a>.</p>\n' +
      '      <a href="' + BASE + 'admin.html" class="footer-admin-link">Admin</a>\n' +
      "    </div>\n" +
      '    <nav class="footer-nav">\n' +
      "      " + links + "\n" +
      "    </nav>\n" +
      "  </div>\n" +
      "</footer>\n" +
      '<a class="chat-launcher" href="' + BASE + 'chat.html">Assistant OMEII →</a>'
    );
  }

  function inject() {
    var headerSlot = document.getElementById("site-header");
    if (headerSlot) headerSlot.outerHTML = buildHeader();

    var footerSlot = document.getElementById("site-footer");
    if (footerSlot) footerSlot.outerHTML = buildFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }

})();
