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

  // Langue (FR/AR) : active uniquement sur les pages portant data-i18n="true"
  // (pour l'instant actualites.html). Les autres pages restent en français.
  var I18N_PAGE = !!(document.body && document.body.getAttribute("data-i18n") === "true");
  var LANG = "fr";
  try { if (I18N_PAGE && localStorage.getItem("omeii-lang") === "ar") LANG = "ar"; } catch (e) {}
  window.OMEII_LANG = {
    get: function () { return LANG; },
    set: function (l) {
      try { localStorage.setItem("omeii-lang", l); } catch (e) {}
      window.location.reload();
    }
  };
  if (LANG === "ar") {
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
  }

  var NAV_LINKS = [
    { href: "publications.html", label: "Publications", ar: "المنشورات" },
    { href: "actualites.html",   label: "Actualités",   ar: "الأخبار" },
    { href: "observatoire.html", label: "Observatoire", ar: "المرصد" },
    { href: "recherche.html",    label: "Recherche",    ar: "البحث" },
    { href: "equipe.html",       label: "Équipe",       ar: "الفريق" },
    { href: "adhesion.html",     label: "Adhésion",     ar: "الانخراط" },
    { href: "contact.html",      label: "Contact",      ar: "اتصل بنا" }
  ];

  var FOOTER_LINKS = [
    { href: "mentions-legales.html",  label: "Mentions légales & confidentialité", ar: "الإشعارات القانونية والخصوصية" },
    { href: "adhesion.html",          label: "Soutenir OMEII",                     ar: "ادعموا OMEII" },
    { href: "contact.html",           label: "Boîte aux lettres",                  ar: "صندوق الرسائل" },
    { href: "chat.html",              label: "Assistant / FAQ",                    ar: "المساعد / الأسئلة الشائعة" }
  ];

  function tr(item) { return LANG === "ar" ? item.ar : item.label; }

  function currentPage() {
    var file = window.location.pathname.split("/").pop();
    return file === "" ? "index.html" : file;
  }

  function buildHeader() {
    var page = currentPage();
    var links = NAV_LINKS.map(function (item) {
      var current = item.href === page ? ' aria-current="page"' : "";
      return '<a href="' + BASE + item.href + '"' + current + ">" + tr(item) + "</a>";
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
      (I18N_PAGE ? '      <button type="button" class="lang-toggle" data-lang-toggle aria-label="Langue / اللغة">' + (LANG === "ar" ? "Français" : "العربية") + "</button>\n" : "") +
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
      return '<a href="' + href + '">' + tr(item) + "</a>";
    }).join("\n      ");

    return (
      '<footer class="site-footer">\n' +
      '  <div class="wrap footer-inner">\n' +
      "    <div>\n" +
      '      <p class="footer-brand">OMEII</p>\n' +
      (LANG === "ar"
        ? '      <p class="footer-meta">موقع غير ربحي، ينتمي إلى GEOM، مجموعة الفاعلين الاقتصاديين بالمغرب — <a href="https://www.geom.ma" target="_blank" rel="noopener">www.geom.ma</a>.</p>\n'
        : '      <p class="footer-meta">Site à but non lucratif, qui fait partie du GEOM, Groupement des Opérateurs Économiques du Maroc — <a href="https://www.geom.ma" target="_blank" rel="noopener">www.geom.ma</a>.</p>\n') +
      '      <a href="' + BASE + 'admin.html" class="footer-admin-link">Admin</a>\n' +
      "    </div>\n" +
      '    <nav class="footer-nav">\n' +
      "      " + links + "\n" +
      "    </nav>\n" +
      "  </div>\n" +
      "</footer>\n" +
      '<a class="chat-launcher" href="' + BASE + 'chat.html">' + (LANG === "ar" ? "مساعد OMEII ←" : "Assistant OMEII →") + "</a>"
    );
  }

  function inject() {
    var headerSlot = document.getElementById("site-header");
    if (headerSlot) headerSlot.outerHTML = buildHeader();

    var footerSlot = document.getElementById("site-footer");
    if (footerSlot) footerSlot.outerHTML = buildFooter();

    var toggle = document.querySelector("[data-lang-toggle]");
    if (toggle) toggle.addEventListener("click", function () {
      window.OMEII_LANG.set(LANG === "ar" ? "fr" : "ar");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }

})();
