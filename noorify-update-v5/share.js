/* Noorify Education - page share button (all pages)
   Tap -> phone/laptop share sheet (WhatsApp, Facebook, Messenger, Gmail ...).
   Where the browser has no share sheet -> small menu: WhatsApp, Facebook, Telegram, Email, Copy link. */
(function () {
  'use strict';
  var btn = document.getElementById('shareBtn');
  if (!btn) return;

  var T = {
    bn: { share: 'শেয়ার করুন', copy: 'লিংক কপি করুন', copied: 'লিংক কপি হয়েছে', wa: 'WhatsApp', fb: 'Facebook', tg: 'Telegram', mail: 'ইমেইল' },
    en: { share: 'Share', copy: 'Copy link', copied: 'Link copied', wa: 'WhatsApp', fb: 'Facebook', tg: 'Telegram', mail: 'Email' }
  };
  function L() { return ((document.documentElement.lang || 'bn').slice(0, 2) === 'en') ? T.en : T.bn; }

  function meta(sel) { var m = document.querySelector(sel); return m ? (m.getAttribute('content') || m.getAttribute('href') || '') : ''; }
  // Always share the main-site address (from the canonical tag), never a preview/GitHub address.
  function pageUrl() {
    var c = document.querySelector('link[rel="canonical"]');
    var u = (c && c.href) ? c.href : location.href;
    return u.split('#')[0];
  }
  function pageTitle() { return meta('meta[property="og:title"]') || document.title; }

  var ico = {
    wa: '<path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9"/><path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1"/>',
    fb: '<path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3"/>',
    tg: '<path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4"/>',
    mail: '<path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z"/><path d="M3 7l9 6l9 -6"/>',
    copy: '<path d="M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"/><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"/>'
  };
  function svg(k) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ico[k] + '</svg>';
  }

  var menu = null, toast = null, toastTimer = 0;

  function showToast(msg) {
    if (!toast) { toast = document.createElement('div'); toast.className = 'shm-t'; toast.setAttribute('role', 'status'); document.body.appendChild(toast); }
    toast.textContent = msg;
    toast.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('on'); }, 2200);
  }

  function copyLink() {
    var url = pageUrl(), done = function () { showToast(L().copied); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, function () { legacyCopy(url, done); });
    } else { legacyCopy(url, done); }
  }
  function legacyCopy(text, done) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:-100px;opacity:0';
      document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
      document.execCommand('copy'); document.body.removeChild(ta); done();
    } catch (e) { window.prompt(L().copy, text); }
  }

  function closeMenu() { if (menu) menu.classList.remove('on'); btn.setAttribute('aria-expanded', 'false'); }

  function buildMenu() {
    var t = L(), url = encodeURIComponent(pageUrl()), title = pageTitle(), both = encodeURIComponent(title + ' ' + pageUrl());
    if (!menu) { menu = document.createElement('div'); menu.className = 'shm'; menu.setAttribute('role', 'menu'); document.body.appendChild(menu); }
    menu.innerHTML =
      '<div class="shm-h">' + t.share + '</div>' +
      '<a role="menuitem" target="_blank" rel="noopener noreferrer" href="https://wa.me/?text=' + both + '">' + svg('wa') + t.wa + '</a>' +
      '<a role="menuitem" target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/sharer/sharer.php?u=' + url + '">' + svg('fb') + t.fb + '</a>' +
      '<a role="menuitem" target="_blank" rel="noopener noreferrer" href="https://t.me/share/url?url=' + url + '&text=' + encodeURIComponent(title) + '">' + svg('tg') + t.tg + '</a>' +
      '<a role="menuitem" href="mailto:?subject=' + encodeURIComponent(title) + '&body=' + both + '">' + svg('mail') + t.mail + '</a>' +
      '<button type="button" role="menuitem" data-copy>' + svg('copy') + t.copy + '</button>';
    menu.querySelector('[data-copy]').onclick = function () { closeMenu(); copyLink(); };
    Array.prototype.forEach.call(menu.querySelectorAll('a'), function (a) { a.addEventListener('click', function () { setTimeout(closeMenu, 50); }); });
  }

  function openMenu() {
    buildMenu();
    var r = btn.getBoundingClientRect();
    menu.style.top = Math.round(r.bottom + 8) + 'px';
    menu.style.right = Math.max(8, Math.round(window.innerWidth - r.right)) + 'px';
    menu.style.left = 'auto';
    menu.classList.add('on');
    btn.setAttribute('aria-expanded', 'true');
  }

  btn.setAttribute('aria-haspopup', 'menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (menu && menu.classList.contains('on')) { closeMenu(); return; }
    if (navigator.share) {
      navigator.share({ title: pageTitle(), text: pageTitle(), url: pageUrl() }).catch(function (err) {
        // user closing the sheet is normal; anything else -> fall back to our own menu
        if (!err || err.name !== 'AbortError') openMenu();
      });
    } else { openMenu(); }
  });
  document.addEventListener('click', function (e) { if (menu && menu.classList.contains('on') && !menu.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', closeMenu);
  window.addEventListener('scroll', closeMenu, { passive: true });
})();
