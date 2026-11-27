/* OMEII — page Actualités
   Lit assets/data/actualites.json (format {"items":[...]}).
   - Filtres par catégorie via ?cat= (economie, commerce, investissement, officiel, annonces)
   - Page article via ?id=
   - Tri du plus récent au plus ancien (dates AAAA-MM-JJ)
   - FR / AR (RTL) : la langue est gérée par site-chrome.js (window.OMEII_LANG)
*/
(function () {
  "use strict";

  var LANG = (window.OMEII_LANG && window.OMEII_LANG.get()) || "fr";

  // Chaque bloc de la barre latérale peut être désactivé ici.
  var SIDEBAR = { publications: true, annonces: true, observatoire: true, adhesion: true };

  var CATS = ["all", "economie", "commerce", "investissement", "officiel", "annonces"];

  var T = {
    fr: {
      home: "Retour à l'accueil", eyebrow: "Actualités",
      h1: "Actualités & news",
      lede: "Analyses, veilles et annonces d'OMEII sur l'économie, le commerce international et l'investissement au Maroc.",
      cat: { all: "Tout", economie: "Économie", commerce: "Commerce international", investissement: "Investissement", officiel: "Sources officielles", annonces: "Annonces OMEII" },
      read: "Lire l'article", readSource: "Consulter la source", share: "Partager sur WhatsApp",
      back: "← Retour aux actualités", empty: "Aucun article dans cette catégorie pour le moment.",
      notFound: "Cet article est introuvable.", error: "Actualités indisponibles pour le moment.",
      ai: "Rédigé avec l'aide d'une IA — information générale.", example: "Exemple", breve: "Brève",
      sources: "Références officielles", by: "Par",
      sidePubs: "Dernières publications", sideAnn: "Annonces", sideAnnEmpty: "Aucune annonce pour le moment.",
      sideObs: "Observatoire GES", sideObsText: "Suivez en continu les indicateurs économiques et commerciaux.", sideObsBtn: "Consulter l'Observatoire →",
      sideJoin: "Rejoindre OMEII", sideJoinText: "L'adhésion est gratuite et ouverte aux chercheurs et experts.", sideJoinBtn: "Demander l'adhésion →",
      seeAll: "Toutes les publications →"
    },
    ar: {
      home: "العودة إلى الرئيسية", eyebrow: "الأخبار",
      h1: "الأخبار والمستجدات",
      lede: "تحليلات ورصد وإعلانات OMEII حول الاقتصاد والتجارة الدولية والاستثمار بالمغرب.",
      cat: { all: "الكل", economie: "الاقتصاد", commerce: "التجارة الدولية", investissement: "الاستثمار", officiel: "مصادر رسمية", annonces: "إعلانات OMEII" },
      read: "قراءة المقال", readSource: "الاطلاع على المصدر", share: "مشاركة عبر واتساب",
      back: "← العودة إلى الأخبار", empty: "لا توجد مقالات في هذا الصنف حاليا.",
      notFound: "هذا المقال غير موجود.", error: "الأخبار غير متاحة حاليا.",
      ai: "حُرّر بمساعدة الذكاء الاصطناعي — معلومات عامة.", example: "مثال", breve: "موجز",
      sources: "المراجع الرسمية", by: "بقلم",
      sidePubs: "آخر المنشورات", sideAnn: "الإعلانات", sideAnnEmpty: "لا توجد إعلانات حاليا.",
      sideObs: "مرصد GES", sideObsText: "تابعوا باستمرار المؤشرات الاقتصادية والتجارية.", sideObsBtn: "زيارة المرصد ←",
      sideJoin: "انضموا إلى OMEII", sideJoinText: "الانخراط مجاني ومفتوح للباحثين والخبراء.", sideJoinBtn: "طلب الانخراط ←",
      seeAll: "جميع المنشورات ←"
    }
  };
  var L = T[LANG] || T.fr;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function safeUrl(u) { return /^https?:\/\//i.test(u || "") ? u : "#"; }

  function loc(item, field) {
    // Texte arabe si disponible, sinon repli sur le français (balisé lang="fr").
    var ar = item[field + "_ar"];
    if (LANG === "ar" && ar && (!Array.isArray(ar) || ar.length)) return { v: ar, lang: "ar" };
    return { v: item[field], lang: LANG === "ar" ? "fr" : "" };
  }
  function langAttr(l) { return l ? ' lang="' + l + '" dir="' + (l === "ar" ? "rtl" : "ltr") + '"' : ""; }

  function fmtDate(d) {
    var dt = new Date(d + "T12:00:00");
    if (isNaN(dt)) return esc(d);
    var tag = LANG === "ar" ? "ar-MA-u-nu-latn" : "fr-FR";
    return dt.toLocaleDateString(tag, { day: "numeric", month: "long", year: "numeric" });
  }

  function sortItems(items) {
    return items.slice().sort(function (a, b) {
      if (a.date === b.date) return a.id < b.id ? 1 : -1;
      return a.date < b.date ? 1 : -1;
    });
  }

  function getJSON(path) {
    return fetch(path).then(function (r) {
      if (!r.ok) throw new Error(path);
      return r.json();
    }).then(function (d) { return d.items || []; });
  }

  function pageUrl(params) {
    var q = Object.keys(params).filter(function (k) { return params[k]; })
      .map(function (k) { return k + "=" + encodeURIComponent(params[k]); }).join("&");
    return "actualites.html" + (q ? "?" + q : "");
  }

  function shareHref(item) {
    var url = location.origin + location.pathname + "?id=" + encodeURIComponent(item.id);
    var title = loc(item, "title").v;
    return "https://wa.me/?text=" + encodeURIComponent(title + " — " + url);
  }

  function badges(item) {
    var out = "";
    if (item.example) out += '<span class="pill news-pill-example">' + L.example + "</span> ";
    if (item.type === "breve") out += '<span class="pill">' + L.breve + "</span> ";
    return out;
  }

  function cardMarkup(item) {
    var t = loc(item, "title"), ex = loc(item, "excerpt");
    var isBreve = item.type === "breve";
    var href = isBreve ? safeUrl(item.sourceUrl) : pageUrl({ id: item.id });
    var ext = isBreve ? ' target="_blank" rel="noopener noreferrer"' : "";
    return '<article class="news-card" data-cat="' + esc(item.cat) + '" id="a-' + esc(item.id) + '">' +
      '<div class="news-meta"><span class="news-tag">' + esc(L.cat[item.cat] || item.cat) + "</span> " + badges(item) +
      '<span class="news-byline">' + esc(item.author || "OMEII") + " · " + fmtDate(item.date) + "</span></div>" +
      '<h2 class="news-title"' + langAttr(t.lang) + '><a href="' + href + '"' + ext + ">" + esc(t.v) + "</a></h2>" +
      '<p class="news-excerpt"' + langAttr(ex.lang) + ">" + esc(ex.v) + "</p>" +
      '<div class="news-actions">' +
      '<a class="btn btn-primary" href="' + href + '"' + ext + ">" + (isBreve ? L.readSource : L.read) + "</a>" +
      '<a class="btn btn-ghost" href="' + shareHref(item) + '" target="_blank" rel="noopener noreferrer">' + L.share + "</a>" +
      "</div></article>";
  }

  function articleMarkup(item) {
    var t = loc(item, "title"), b = loc(item, "body"), ex = loc(item, "excerpt");
    var paras = Array.isArray(b.v) ? b.v : (b.v ? [b.v] : [ex.v]);
    var sources = (item.sources || []).map(function (s) {
      return '<li><a href="' + esc(safeUrl(s.url)) + '" target="_blank" rel="noopener noreferrer">' + esc(s.label || s.url) + "</a></li>";
    }).join("");
    return '<article class="news-article">' +
      '<a class="back-home" href="' + pageUrl({ cat: item.cat }) + '">' + L.back + "</a>" +
      '<div class="news-meta"><span class="news-tag">' + esc(L.cat[item.cat] || item.cat) + "</span> " + badges(item) +
      '<span class="news-byline">' + esc(item.author || "OMEII") + " · " + fmtDate(item.date) + "</span></div>" +
      '<h1 class="news-title news-title-lg"' + langAttr(t.lang) + ">" + esc(t.v) + "</h1>" +
      '<div class="news-body"' + langAttr(b.lang) + ">" + paras.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div>" +
      (sources ? '<h3 class="news-sub">' + L.sources + '</h3><ul class="news-sources">' + sources + "</ul>" : "") +
      (item.ai ? '<p class="note-box news-ai">' + L.ai + "</p>" : "") +
      '<div class="news-actions"><a class="btn btn-ghost" href="' + shareHref(item) + '" target="_blank" rel="noopener noreferrer">' + L.share + "</a></div>" +
      "</article>";
  }

  function filtersMarkup(active, items) {
    return CATS.filter(function (c) {
      // Une catégorie sans article reste visible pour afficher l'état vide ;
      // pour la masquer, décommenter la ligne suivante :
      // return c === "all" || items.some(function (i) { return i.cat === c; });
      return true;
    }).map(function (c) {
      return '<a class="filter-btn' + (c === active ? " is-active" : "") + '" href="' + pageUrl({ cat: c === "all" ? "" : c }) + '"' +
        (c === active ? ' aria-current="true"' : "") + ">" + L.cat[c] + "</a>";
    }).join("");
  }

  function sidebarMarkup(pubs, anns) {
    var out = "";
    if (SIDEBAR.publications) {
      out += '<section class="news-side-block"><h3>' + L.sidePubs + "</h3><ul>" +
        sortItems(pubs).slice(0, 3).map(function (p) {
          var href = safeUrl(p.file);
          return '<li><a href="' + esc(href) + '"' + (href === "#" ? "" : ' target="_blank" rel="noopener noreferrer"') + ">" + esc(p.title) + "</a></li>";
        }).join("") + '</ul><a class="news-side-link" href="publications.html">' + L.seeAll + "</a></section>";
    }
    if (SIDEBAR.annonces) {
      var list = sortItems(anns).slice(0, 3);
      out += '<section class="news-side-block"><h3>' + L.sideAnn + "</h3>" +
        (list.length ? "<ul>" + list.map(function (a) { return "<li>" + esc(a.title) + "</li>"; }).join("") + "</ul>" : "<p>" + L.sideAnnEmpty + "</p>") +
        "</section>";
    }
    if (SIDEBAR.observatoire) {
      out += '<section class="news-side-block"><h3>' + L.sideObs + "</h3><p>" + L.sideObsText + '</p><a class="news-side-link" href="observatoire.html">' + L.sideObsBtn + "</a></section>";
    }
    if (SIDEBAR.adhesion) {
      out += '<section class="news-side-block news-side-cta"><h3>' + L.sideJoin + "</h3><p>" + L.sideJoinText + '</p><a class="btn btn-gold" href="adhesion.html">' + L.sideJoinBtn + "</a></section>";
    }
    return out;
  }

  function init() {
    var feed = document.getElementById("news-feed");
    var side = document.getElementById("news-side");
    var filters = document.getElementById("news-filters");
    var head = document.getElementById("news-head");
    if (!feed) return;

    var params = new URLSearchParams(location.search);
    var id = params.get("id");
    var cat = params.get("cat");
    if (CATS.indexOf(cat) === -1) cat = "all";

    // Textes fixes
    var set = function (sel, txt) { var el = document.querySelector(sel); if (el) el.textContent = txt; };
    set("[data-i18n-home]", L.home);
    set("[data-i18n-eyebrow]", L.eyebrow);
    set("[data-i18n-h1]", L.h1);
    set("[data-i18n-lede]", L.lede);

    Promise.all([
      getJSON("assets/data/actualites.json"),
      getJSON("assets/data/publications.json").catch(function () { return []; }),
      getJSON("assets/data/announcements.json").catch(function () { return []; })
    ]).then(function (res) {
      var items = sortItems(res[0].filter(function (i) { return i.status !== "brouillon"; }));
      side.innerHTML = sidebarMarkup(res[1], res[2]);

      if (id) {
        var found = items.filter(function (i) { return i.id === id && i.type !== "breve"; })[0];
        if (head) head.hidden = true;
        if (filters) filters.hidden = true;
        if (found) {
          document.title = loc(found, "title").v + " — OMEII";
          feed.innerHTML = articleMarkup(found);
        } else {
          feed.innerHTML = '<p class="empty-state">' + L.notFound + '</p><a class="back-home" href="actualites.html">' + L.back + "</a>";
        }
        return;
      }

      filters.innerHTML = filtersMarkup(cat, items);
      var shown = cat === "all" ? items : items.filter(function (i) { return i.cat === cat; });
      feed.innerHTML = shown.length ? shown.map(cardMarkup).join("") : '<p class="empty-state">' + L.empty + "</p>";
    }).catch(function () {
      feed.innerHTML = '<p class="empty-state">' + L.error + "</p>";
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
