// Kanai's Portfolio: static SPA. Content comes from /data/*.json (newest "date" first).
const view = document.getElementById("view");
const nav = document.getElementById("nav");
const burger = document.querySelector(".burger");
const lb = document.getElementById("lightbox");
const cache = {};

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const newestFirst = list => [...list].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

async function load(name) {
  if (cache[name]) return cache[name];
  try {
    const res = await fetch(`data/${name}.json`);
    if (!res.ok) throw new Error(res.status);
    const json = await res.json();
    return (cache[name] = Array.isArray(json) ? newestFirst(json) : json);
  } catch (e) {
    console.error(`Could not load data/${name}.json. Check for a missing comma or quote.`, e);
    return null;
  }
}

const empty = msg => `<p class="empty">${msg}</p>`;
const head = (t, extra = "") => `<div class="sec-h"><h2>${t}</h2>${extra}</div>`;
const fail = t => head(t) + empty(`${t} could not be loaded. Please try again later.`);
const contactCta = `<section class="route-contact-cta"><p>Let’s create something memorable.</p><a class="btn fill" href="#/contact">Contact &#8594;</a></section>`;

const pages = {
  async home() {
    const [siteData, photoData, videoData, reelData] = await Promise.all([
      load("site"), load("photos"), load("videos"), load("reels")
    ]);
    const s = siteData || {};
    const name = s.name || "Kanai";
    const configuredStrip = Array.isArray(s.filmStrip)
  ? s.filmStrip.filter(Boolean).slice(0, 2)
  : [];

const strip = configuredStrip.length
  ? configuredStrip
  : Array.isArray(photoData)
    ? photoData.slice(0, 2).map(p => p.file).filter(Boolean)
    : [];
    const stats = Array.isArray(s.stats) ? s.stats.slice(0, 3) : [];
    const desc = s.description ?? "Capturing real emotions, honest moments and timeless love stories through films and photographs.";
    const mobileDesc = s.mobileDescription || desc;
    const videos = Array.isArray(videoData) ? videoData.slice(0, 4) : [];
    const reels = Array.isArray(reelData) ? reelData.slice(0, 6) : [];
    const photos = Array.isArray(photoData) ? photoData.slice(0, 6) : [];
    const rail = (title, href, type, cards) => `<section class="home-section home-${type}">
      <h2>${title}</h2><div class="home-rail" aria-label="${title}">${cards}</div>
      <a class="home-see-all" href="${href}">See All <span aria-hidden="true">&#8594;</span></a></section>`;
    const videoCards = videos.map(v => `<a class="card" href="${esc(v.link)}" target="_blank" rel="noopener"><div class="im"><img loading="lazy" src="${esc(v.thumb)}" alt="${esc(v.title)}"><span class="play"></span></div><div class="cap">${esc(v.title)}</div></a>`).join("");
    const reelCards = reels.map(v => `<a class="card" href="${esc(v.link)}" target="_blank" rel="noopener"><div class="im"><img loading="lazy" src="${esc(v.thumb)}" alt="${esc(v.caption)}"><span class="play"></span></div><div class="cap">${esc(v.caption)}</div></a>`).join("");
    const photoCards = photos.map(p => `<a class="card" href="#/photos"><div class="im"><img loading="lazy" src="${esc(p.file)}" alt="${esc(p.alt || p.caption)}"></div>${p.caption ? `<div class="cap">${esc(p.caption)}</div>` : ""}</a>`).join("");
    return `<section class="hero">
      <div class="hero-text">
        <div class="hero-copy">
        <p class="eyebrow">${esc(s.eyebrow ?? "Wedding films & photography")}</p>
        <h1>I'm ${esc(name)}</h1>
        <p class="tag">${esc(s.tagline)}</p>
        ${desc ? `<p class="desc"><span class="desc-desktop">${esc(desc)}</span><span class="desc-mobile">${esc(mobileDesc)}</span></p>` : ""}
        </div>
        <div class="btns"><a class="btn fill" href="#/videos">Watch my work &#8599;</a><a class="btn line" href="#/contact">Let's talk</a></div>
        ${stats.length ? `<ul class="stats">${stats.map(t => `<li><b>${esc(t.value)}</b><span>${esc(t.label)}</span></li>`).join("")}</ul>` : ""}
      </div>
      <div class="hero-media">
        <div class="plate"></div>
        <img src="${esc(s.heroImage)}" alt="${esc(name)}" fetchpriority="high">
        <span class="script">${esc(s.script ?? "Stories through my lens")}</span>
        ${strip.length ? `<div class="strip">${strip.map(src => `<img src="${esc(src)}" alt="" loading="lazy">`).join("")}</div>` : ""}
        <svg class="badge" viewBox="0 0 120 120" aria-hidden="true"><defs><path id="circ" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/></defs>
          <text><textPath href="#circ" textLength="270" lengthAdjust="spacing">REAL MOMENTS &#8226; TIMELESS MEMORIES &#8226; </textPath></text></svg>
      </div>
    </section><div class="home-portfolios">
      ${videos.length ? rail("Videos", "#/videos", "videos", videoCards) : ""}
      ${reels.length ? rail("Reels", "#/reels", "reels", reelCards) : ""}
      ${photos.length ? rail("Photos", "#/photos", "photos", photoCards) : ""}
    </div>`;
  },
  async videos() {
    const d = await load("videos");
    if (!d) return fail("Videos");
    if (!d.length) return head("Videos") + empty("No videos yet.");
    return head("Videos") + `<div class="grid v">${d.map(v => `
      <a class="card" href="${esc(v.link)}" target="_blank" rel="noopener">
        <div class="im"><img loading="lazy" src="${esc(v.thumb)}" alt="${esc(v.title)}"><span class="play"></span></div>
        <div class="cap">${esc(v.title)}</div></a>`).join("")}</div>`;
  },
  async reels() {
    const d = await load("reels");
    if (!d) return fail("Reels");
    if (!d.length) return head("Reels") + empty("No reels yet.");
    return head("Reels") + `<div class="grid r">${d.map(v => `
      <a class="card" href="${esc(v.link)}" target="_blank" rel="noopener">
        <div class="im"><img loading="lazy" src="${esc(v.thumb)}" alt="${esc(v.caption)}"><span class="play"></span></div>
        <div class="cap">${esc(v.caption)}</div></a>`).join("")}</div>`;
  },
  async photos() {
    const d = await load("photos");
    if (!d) return fail("Photos");
    if (!d.length) return head("Photos") + empty("No photos yet.");
    const tile = (p, i) => `<button class="card" data-i="${i}"><div class="im"><img loading="lazy" src="${esc(p.file)}" alt="${esc(p.alt || p.caption)}"></div>
      ${p.caption ? `<div class="cap">${esc(p.caption)}</div>` : ""}</button>`;
    return `<div class="ph">` + head("Photos", `<button id="gallery-back" class="gallery-back mob-only" aria-label="Back to single photo view">&#8592; Back</button>`) +
      `<div class="car"><div class="stage"><div class="im"><img id="cimg" src="${esc(d[0].file)}" alt="${esc(d[0].alt || d[0].caption)}"></div>
        <button class="pv" aria-label="Previous">&#8249;</button><button class="nx" aria-label="Next">&#8250;</button></div>
        <div class="photo-caption"><div class="cap" id="ccap">${esc(d[0].caption)}</div><span id="ccount">1 / ${d.length}</span></div></div>
      <div class="grid p">${d.map(tile).join("")}</div>
      <button id="all" class="all-btn mob-only">See all photos &#8594;</button></div>`;
  },
  async contact() {
    const s = await load("site") || {};
    const wa = String(s.whatsapp || "").replace(/\D/g, "");
    const msg = encodeURIComponent(s.whatsappMessage || "");
    const ico = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
    return `<section class="contact"><h2>Contact</h2><div class="rows">
      <a class="row" href="https://wa.me/${wa}${msg ? "?text=" + msg : ""}" target="_blank" rel="noopener" aria-label="Message on WhatsApp"><i class="ic">${ico('<path d="M21 12a9 9 0 0 1-13.4 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12z"/>')}</i><span>${esc(s.whatsapp)}</span><b>&rarr;</b></a>
      <a class="row" href="mailto:${esc(s.email)}" aria-label="Send an email"><i class="ic">${ico('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>')}</i><span>${esc(s.email)}</span><b>&rarr;</b></a></div></section>`;
  }
};

function openBox(p) {
  const im = lb.querySelector("img");
  im.src = p.file; im.alt = p.alt || "";
  lb.querySelector("p").textContent = p.caption || "";
  lb.hidden = false;
}

function wirePhotos(d) {
  const car = view.querySelector(".car"), grid = view.querySelector(".grid.p");
  const img = document.getElementById("cimg"), cap = document.getElementById("ccap"), count = document.getElementById("ccount");
  const back = document.getElementById("gallery-back"), ph = view.querySelector(".ph");
  let i = 0;
  const show = n => { i = (n + d.length) % d.length; img.src = d[i].file; img.alt = d[i].alt || d[i].caption || ""; cap.textContent = d[i].caption || ""; count.textContent = `${i + 1} / ${d.length}`; };
  car.querySelector(".pv").onclick = () => show(i - 1);
  car.querySelector(".nx").onclick = () => show(i + 1);
  car.querySelector(".im").onclick = () => openBox(d[i]);
  const all = document.getElementById("all");
  const toggleGallery = on => {
    grid.classList.toggle("all", on);
    car.classList.toggle("hide", on);
    ph.classList.toggle("all-view", on);
    all.hidden = on;
  };
  all.onclick = () => toggleGallery(true);
  back.onclick = () => toggleGallery(false);
  grid.addEventListener("click", e => {
    const b = e.target.closest("button.card");
    if (b) openBox(d[+b.dataset.i]);
  });
}

async function route() {
  const key = (location.hash.replace(/^#\/?/, "") || "home").split("?")[0];
  const page = pages[key] || pages.home;
  view.innerHTML = await page() + (key === "contact" ? "" : contactCta);
  document.title = key === "home" || !pages[key] ? "Kanai's Portfolio" : `${key[0].toUpperCase() + key.slice(1)} | Kanai's Portfolio`;
  nav.querySelectorAll("a").forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#/" + key));
  nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false");
  if (key === "photos") { const d = await load("photos"); if (d && d.length) wirePhotos(d); }
  window.scrollTo(0, 0);
}

burger.onclick = () => { const o = nav.classList.toggle("open"); burger.setAttribute("aria-expanded", o); };
lb.onclick = () => (lb.hidden = true);
document.addEventListener("keydown", e => { if (e.key === "Escape") lb.hidden = true; });
window.addEventListener("hashchange", route);
route();
