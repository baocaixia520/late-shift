/* Late Shift — site behaviour. No third-party scripts, no tracking. */
(function () {
  'use strict';

  var base = document.body.getAttribute('data-base') || '';

  /* ---------- toast ---------- */
  var toastEl = document.createElement('div');
  toastEl.className = 'toast';
  toastEl.setAttribute('role', 'status');
  toastEl.setAttribute('aria-live', 'polite');
  document.body.appendChild(toastEl);
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3200);
  }
  window.LS_toast = toast;

  /* ---------- sticky nav shadow ---------- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-stuck', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- industry news dropdown ---------- */
  var dropBtn = document.querySelector('[data-drop]');
  if (dropBtn) {
    var dropWrap = dropBtn.parentNode;
    var dropMenu = dropWrap.querySelector('.nav-menu');
    var closeDrop = function () {
      dropWrap.classList.remove('is-open');
      dropBtn.setAttribute('aria-expanded', 'false');
      if (dropMenu) dropMenu.classList.remove('is-mobile-panel');
    };
    dropBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var open = !dropWrap.classList.contains('is-open');
      dropWrap.classList.toggle('is-open', open);
      dropBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (dropMenu) {
        if (open && window.innerWidth < 900 && nav) {
          dropMenu.classList.add('is-mobile-panel');
          dropMenu.style.setProperty('--panel-top', Math.round(nav.getBoundingClientRect().bottom) + 'px');
        } else {
          dropMenu.classList.remove('is-mobile-panel');
        }
      }
    });
    document.addEventListener('click', function (e) {
      if (!dropWrap.contains(e.target)) closeDrop();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrop();
    });
    window.addEventListener('resize', function () {
      if (dropMenu) dropMenu.classList.remove('is-mobile-panel');
    });
  }

  /* ---------- reading progress ---------- */
  var bar = document.querySelector('.progress');
  var articleBody = document.querySelector('.article-body');
  if (bar && articleBody) {
    var update = function () {
      var rect = articleBody.getBoundingClientRect();
      var total = rect.height - window.innerHeight * 0.4;
      var done = Math.abs(Math.min(0, rect.top)) ;
      var pct = total > 0 ? Math.min(100, (done / total) * 100) : 0;
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- search index ---------- */
  function indexData() {
    return window.LS_INDEX || [];
  }

  function renderResults(host, query) {
    var data = indexData();
    var q = (query || '').trim().toLowerCase();
    if (!q) {
      host.innerHTML = '<li class="empty-state">Type a company, platform or topic. Try “payments”, “age verification” or “retail”.</li>';
      return;
    }
    var hits = data.filter(function (item) {
      var hay = (item.t + ' ' + item.d + ' ' + (item.c || '') + ' ' + (item.k || '') + ' ' + (item.b || '')).toLowerCase();
      return hay.indexOf(q) > -1;
    }).slice(0, 12);

    if (!hits.length) {
      host.innerHTML = '<li class="empty-state">No matches for “' + escapeHtml(query) + '”. Our index covers published stories only.</li>';
      return;
    }
    host.innerHTML = hits.map(function (item) {
      return '<li><span>' + escapeHtml(item.c) + '</span>' +
        '<h3><a href="' + base + item.u + '">' + escapeHtml(item.t) + '</a></h3></li>';
    }).join('');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  /* ---------- search overlay ---------- */
  var overlay = document.getElementById('search-overlay');
  var overlayInput = overlay ? overlay.querySelector('input[type="search"]') : null;
  var overlayResults = overlay ? overlay.querySelector('.overlay-results') : null;
  var lastFocus = null;

  function openOverlay() {
    if (!overlay) return;
    lastFocus = document.activeElement;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (overlayInput) {
      overlayInput.value = '';
      overlayResults.innerHTML = '<li class="empty-state">Type a company, platform or topic. Try “payments”, “age verification” or “retail”.</li>';
      overlayInput.focus();
    }
  }
  function closeOverlay() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-search-open]'), function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (overlay) { openOverlay(); } else { window.location.href = base + 'search.html'; }
    });
  });

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeOverlay();
    });
    var closeBtn = overlay.querySelector('[data-search-close]');
    if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeOverlay();
    });
    if (overlayInput) {
      overlayInput.addEventListener('input', function () { renderResults(overlayResults, overlayInput.value); });
      overlayInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          window.location.href = base + 'search.html?q=' + encodeURIComponent(overlayInput.value);
        }
      });
    }
  }

  /* ---------- dedicated search page ---------- */
  var pageForm = document.getElementById('search-page-form');
  if (pageForm) {
    var pageInput = document.getElementById('search-page-input');
    var pageResults = document.getElementById('search-results');
    var run = function () {
      renderResults(pageResults, pageInput.value);
      var url = new URL(window.location.href);
      if (pageInput.value.trim()) { url.searchParams.set('q', pageInput.value.trim()); }
      else { url.searchParams.delete('q'); }
      window.history.replaceState({}, '', url);
    };
    pageForm.addEventListener('submit', function (e) { e.preventDefault(); run(); });
    pageInput.addEventListener('input', run);
    var preset = new URLSearchParams(window.location.search).get('q');
    if (preset) { pageInput.value = preset; }
    run();
  }

  /* ---------- newsletter forms ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('form[data-signup]'), function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var note = form.querySelector('.form-note');
      var value = (input.value || '').trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      if (!valid) {
        if (note) { note.textContent = 'That address does not look complete — check the spelling.'; note.className = 'form-note is-error'; }
        input.focus();
        return;
      }
      if (note) {
        note.textContent = 'Demo build: no mailing list is connected yet. Wire this form to your email provider in assets/js/site.js.';
        note.className = 'form-note is-ok';
      }
      toast('Form works — connect your email provider to collect addresses.');
      input.value = '';
    });
  });

  /* ---------- contact form ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('form[data-demo-form]'), function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('.form-note');
      if (note) { note.textContent = 'Demo build: this form is not connected to a mailbox. Point the action at your form endpoint or email link.'; note.className = 'form-note is-ok'; }
      toast('Demo form — no message was sent.');
    });
  });

  /* ---------- share buttons ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-share]'), function (btn) {
    btn.addEventListener('click', function () {
      var mode = btn.getAttribute('data-share');
      var url = window.location.href;
      var title = document.title;
      if (mode === 'native' && navigator.share) {
        navigator.share({ title: title, url: url }).catch(function () {});
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          toast('Link copied to clipboard.');
        }).catch(function () { toast('Copy failed — select the address bar instead.'); });
      } else {
        toast('Copy the address bar to share this story.');
      }
    });
  });

  /* ---------- copy email ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-copy]'), function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { toast('Copied: ' + text); });
      } else {
        toast(text);
      }
    });
  });
})();
