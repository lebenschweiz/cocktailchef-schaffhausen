/* Cookie-Einwilligung für Google (Consent Mode v2) und Meta-Pixel.
   Muss im <head> vor Google Tag Manager und gtag.js geladen werden. */
(function () {
  var KEY = "cc_consent";          // "granted" | "denied"
  var META_PIXEL_ID = "1062630506275386";

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { dataLayer.push(arguments); };

  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500
  });

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  var pixelLoaded = false;
  function loadPixel() {
    if (pixelLoaded) return;
    pixelLoaded = true;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", META_PIXEL_ID);
    fbq("track", "PageView");
  }

  function grant() {
    gtag("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted"
    });
    dataLayer.push({ event: "consent_granted" });
    loadPixel();
  }

  // Wird vom Anfrageformular aufgerufen, nur aktiv nach Zustimmung
  window.ccTrackLead = function () { if (window.fbq && pixelLoaded) fbq("track", "Lead"); };

  if (read() === "granted") grant();

  var css =
    "#cc-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:560px;margin:0 auto;" +
    "background:#1c1812;color:#f6efe2;border:1px solid rgba(255,204,26,.35);border-radius:16px;padding:18px 18px 16px;" +
    "box-shadow:0 12px 40px rgba(0,0,0,.5);font:15px/1.5 Inter,system-ui,sans-serif}" +
    "#cc-consent p{margin:0 0 14px}#cc-consent a{color:#ffcc1a}" +
    "#cc-consent .cc-row{display:flex;gap:10px;flex-wrap:wrap}" +
    "#cc-consent button{flex:1 1 140px;min-height:44px;border-radius:999px;font:600 15px Inter,system-ui,sans-serif;cursor:pointer;padding:10px 16px}" +
    "#cc-consent .cc-yes{background:#ffcc1a;color:#0d0b08;border:0}" +
    "#cc-consent .cc-no{background:transparent;color:#f6efe2;border:1px solid rgba(246,239,226,.4)}";

  function showBanner() {
    if (document.getElementById("cc-consent")) return;
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    var box = document.createElement("div");
    box.id = "cc-consent";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "Cookie-Einstellungen");
    box.innerHTML =
      "<p>Wir verwenden Cookies von Google und Meta, um unsere Website zu verbessern und unsere Werbung zu messen. " +
      "Du entscheidest, ob du das erlaubst. Mehr dazu in der <a href=\"/datenschutz.html\">Datenschutzerklärung</a>.</p>" +
      "<div class=\"cc-row\"><button type=\"button\" class=\"cc-no\">Nur notwendige</button>" +
      "<button type=\"button\" class=\"cc-yes\">Alle akzeptieren</button></div>";
    box.querySelector(".cc-yes").onclick = function () { save("granted"); grant(); box.remove(); };
    box.querySelector(".cc-no").onclick = function () {
      var was = read(); save("denied"); box.remove();
      if (was === "granted") location.reload(); // bereits geladene Dienste entfernen
    };
    document.body.appendChild(box);
  }

  function addSettingsLink() {
    var foot = document.querySelector("footer nav") || document.querySelector("footer");
    if (!foot || document.getElementById("cc-settings")) return;
    var a = document.createElement("a");
    a.id = "cc-settings"; a.href = "#"; a.textContent = "Cookie-Einstellungen";
    a.onclick = function (e) { e.preventDefault(); showBanner(); };
    if (foot.tagName === "FOOTER") foot.appendChild(document.createTextNode(" · "));
    foot.appendChild(a);
  }

  function init() { addSettingsLink(); if (!read()) showBanner(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
