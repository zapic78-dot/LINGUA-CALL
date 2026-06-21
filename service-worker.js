// service-worker.js — Lingua Companion AI
const VERSION = "lingua-v2.1.0";
const CORE = [
  "./",
  "./index.html",
  "./dashboard.html",
  "./chat.html",
  "./citizenship.html",
  "./learn.html",
  "./interview.html",
  "./profile.html",
  "./style.css",
  "./app.js",
  "./civics.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon.svg"
];

self.addEventListener("install",(e)=>{
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",(e)=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",(e)=>{
  const req = e.request;
  const url = new URL(req.url);
  // Never cache AI API calls
  if(url.hostname.includes("workers.dev") || url.pathname.includes("/v1/chat/completions")) return;
  if(req.method!=="GET") return;
  e.respondWith(
    caches.match(req).then(cached=>{
      if(cached) return cached;
      return fetch(req).then(res=>{
        if(res.ok && url.origin===location.origin){
          const clone = res.clone();
          caches.open(VERSION).then(c=>c.put(req,clone));
        }
        return res;
      }).catch(()=>caches.match("./index.html"));
    })
  );
});
