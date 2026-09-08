/* OMEII — comportements partagés
   Lit les fichiers JSON dans assets/data/ (chacun au format {"items":[...]})
   pour générer axes, publications, annonces et vidéos. Ces fichiers sont
   éditables sans coder — directement, ou via le backoffice /admin. */

async function loadItems(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error("Impossible de charger " + path);
  const data = await res.json();
  return data.items || [];
}

function axisStampMarkup(item) {
  return `
    <a class="fiche" href="recherche.html#${item.id}">
      <span class="fiche-stamp">${item.stamp}</span>
      <h3>${item.title}</h3>
      <p>${item.summary}</p>
      <span class="fiche-meta">${item.expert}</span>
    </a>`;
}

function monthLabel(dateStr) {
  const [year, month] = dateStr.split("-");
  const months = ["", "jan.", "fév.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  return `${months[parseInt(month, 10)] || ""} ${year}`;
}

function pubRowMarkup(pub) {
  return `
    <div class="pub-row" data-axis="${pub.axis}">
      <div class="pub-date">${monthLabel(pub.date)}</div>
      <div>
        <span class="pub-tag">${pub.type} — ${pub.axisLabel}</span>
        <h3 class="pub-title">${pub.title}</h3>
        <p class="pub-desc">${pub.excerpt}</p>
      </div>
      <a class="pub-dl" href="${pub.file}">Consulter →</a>
    </div>`;
}

function announcementMarkup(item) {
  return `
    <div class="pub-row">
      <div class="pub-date">${monthLabel(item.date)}</div>
      <div>
        <span class="pub-tag">Annonce</span>
        <h3 class="pub-title">${item.title}</h3>
        <p class="pub-desc">${item.body}</p>
      </div>
      <span></span>
    </div>`;
}

function videoMarkup(item) {
  const isFile = /\.(mp4|webm|mov)$/i.test(item.url || "");
  const frame = isFile
    ? `<video src="${item.url}" controls preload="metadata"></video>`
    : `<iframe src="${item.url}" title="${item.title}" allowfullscreen loading="lazy"></iframe>`;
  return `
    <div class="video-card">
      <div class="video-frame">${frame}</div>
      <div class="video-body">
        <h3>${item.title}</h3>
        <p>${item.description || ""}</p>
      </div>
    </div>`;
}

async function renderAxes(selector, limit) {
  const el = document.querySelector(selector);
  if (!el) return;
  try {
    let axes = await loadItems("assets/data/axes.json");
    if (limit) axes = axes.slice(0, limit);
    el.innerHTML = axes.map(axisStampMarkup).join("");
  } catch (e) {
    el.innerHTML = `<p class="empty-state">Axes de recherche indisponibles pour le moment.</p>`;
  }
}

async function renderPublications(selector, opts = {}) {
  const el = document.querySelector(selector);
  if (!el) return;
  try {
    let pubs = await loadItems("assets/data/publications.json");
    pubs.sort((a, b) => (a.date < b.date ? 1 : -1));
    if (opts.limit) pubs = pubs.slice(0, opts.limit);

    const draw = (filter) => {
      const filtered = filter && filter !== "all" ? pubs.filter((p) => p.axis === filter) : pubs;
      el.innerHTML = filtered.length
        ? filtered.map(pubRowMarkup).join("")
        : `<p class="empty-state">Aucune publication dans cet axe pour le moment.</p>`;
    };
    draw();

    if (opts.filterGroup) {
      const group = document.querySelector(opts.filterGroup);
      if (group) {
        group.addEventListener("click", (ev) => {
          const btn = ev.target.closest("[data-filter]");
          if (!btn) return;
          group.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          draw(btn.dataset.filter);
        });
      }
    }
  } catch (e) {
    el.innerHTML = `<p class="empty-state">Publications indisponibles pour le moment.</p>`;
  }
}

async function renderAnnouncements(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  try {
    const items = await loadItems("assets/data/announcements.json");
    items.sort((a, b) => (a.date < b.date ? 1 : -1));
    el.innerHTML = items.length
      ? items.map(announcementMarkup).join("")
      : `<p class="empty-state">Aucune annonce pour le moment.</p>`;
  } catch (e) {
    el.innerHTML = `<p class="empty-state">Annonces indisponibles pour le moment.</p>`;
  }
}

async function renderVideos(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  try {
    const items = await loadItems("assets/data/videos.json");
    items.sort((a, b) => (a.date < b.date ? 1 : -1));
    el.innerHTML = items.length
      ? items.map(videoMarkup).join("")
      : `<p class="empty-state">Aucune vidéo pour le moment.</p>`;
  } catch (e) {
    el.innerHTML = `<p class="empty-state">Vidéos indisponibles pour le moment.</p>`;
  }
}

function initTabs(selector) {
  const wrap = document.querySelector(selector);
  if (!wrap) return;
  const tabs = wrap.querySelectorAll(".tab-btn");
  const panels = wrap.querySelectorAll(".tab-panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      panels.forEach((p) => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      const target = wrap.querySelector(`#${tab.dataset.tab}`);
      if (target) target.classList.add("is-active");
    });
  });
}

function setActiveNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach((a) => {
    if (a.getAttribute("href") === path) a.setAttribute("aria-current", "page");
  });
}

document.addEventListener("DOMContentLoaded", setActiveNav);
