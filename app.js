(() => {
  'use strict';
  const config = window.SITE_CONFIG || {};
  const menu = document.querySelector('.menu-toggle');
  const nav = document.getElementById('nav');
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open');
  }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav?.classList.contains('open')) {
      menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); menu.focus();
    }
  });
  const consentKey = 'yl ar.analytics.preference'.replaceAll(' ', '');
  let consent = null;
  try { consent = localStorage.getItem(consentKey); } catch { /* Storage may be disabled. */ }
  let loaded = false;
  const banner = document.getElementById('cookie-banner');
  const configured = /^G-[A-Z0-9]+$/.test(config.gaMeasurementId || '') || /^GTM-[A-Z0-9]+$/.test(config.gtmContainerId || '');
  window.dataLayer = window.dataLayer || [];
  // Analytics receives only predefined event fields, never input values, queries, or fragments.
  const cleanUrl = location.origin + location.pathname;
  const attributionKey = 'ylar.attribution.v1';
  function readAttribution() {
    if (!['accepted','all'].includes(consent)) return {};
    try {
      const data = JSON.parse(sessionStorage.getItem(attributionKey) || '{}');
      if (!data.savedAt || Date.now() - data.savedAt > 30 * 60 * 1000) return {};
      const allowed = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','referrer_host'];
      if (consent === 'all') allowed.push('gclid','gbraid','wbraid');
      return Object.fromEntries(Object.entries(data).filter(([k,v]) => allowed.includes(k) && typeof v === 'string' && /^[a-zA-Z0-9_.~+\- ]{1,160}$/.test(v)));
    } catch { return {}; }
  }
  function captureAttribution() {
    if (!['accepted','all'].includes(consent)) return;
    const params = new URLSearchParams(location.search);
    const data = readAttribution();
    const allowed = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
    if (consent === 'all') allowed.push('gclid','gbraid','wbraid');
    // Campaign labels must never contain customer information. Reject emails, URLs and control characters.
    for (const key of allowed) {
      const value = params.get(key);
      if (value && /^[a-zA-Z0-9_.~+\- ]{1,160}$/.test(value)) data[key] = value;
    }
    try {
      const ref = new URL(document.referrer);
      if (ref.origin !== location.origin && /^[a-zA-Z0-9.-]+$/.test(ref.hostname)) data.referrer_host = ref.hostname;
    } catch {}
    try { sessionStorage.setItem(attributionKey, JSON.stringify({...data,savedAt:Date.now()})); } catch {}
  }
  captureAttribution();
  let referrerOrigin = '';
  try { referrerOrigin = new URL(document.referrer).origin; } catch {}

  function track(event, fields = {}) {
    if (!configured || !['accepted','all'].includes(consent)) return;
    const allowed = {};
    for (const key of ['placement', 'appliance_type', 'page_path']) {
      if (typeof fields[key] === 'string') allowed[key] = fields[key].slice(0, 100);
    }
    if (/^GTM-[A-Z0-9]+$/.test(config.gtmContainerId || '')) window.dataLayer.push({event, ...allowed});
    else window.gtag?.('event', event, {...allowed, page_location: cleanUrl, page_referrer: referrerOrigin});
  }
  function loadAnalytics() {
    if (loaded || !configured || !['accepted','all'].includes(consent)) return;
    loaded = true;
    window.gtag = function() { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {analytics_storage: 'granted', ad_storage: consent === 'all' ? 'granted' : 'denied', ad_user_data: consent === 'all' ? 'granted' : 'denied', ad_personalization: 'denied'});
    // Choose ONE container to prevent duplicate Analytics loads.
    if (/^GTM-[A-Z0-9]+$/.test(config.gtmContainerId || '')) {
      window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});
      const script = document.createElement('script'); script.async = true;
      script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(config.gtmContainerId); document.head.appendChild(script);
    } else {
      window.gtag('js', new Date());
      const campaign = readAttribution();
      window.gtag('config', config.gaMeasurementId, {send_page_view: false, page_location: cleanUrl, page_referrer: referrerOrigin, allow_google_signals: consent === 'all', allow_ad_personalization_signals: false, campaign_source: campaign.utm_source, campaign_medium: campaign.utm_medium, campaign_name: campaign.utm_campaign, campaign_content: campaign.utm_content, campaign_term: campaign.utm_term});
      if (consent === 'all' && /^AW-[0-9]+$/.test(config.googleAdsId || '')) window.gtag('config', config.googleAdsId);
      const script = document.createElement('script'); script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(config.gaMeasurementId); document.head.appendChild(script);
      track('page_view', {page_path: location.pathname});
    }
  }
  if (configured && !consent) banner.hidden = false;
  loadAnalytics();
  confirmThankYou();
  document.querySelector('.cookie-settings')?.addEventListener('click', () => { banner.hidden = false; });
  function setConsent(next) {
    const previous = consent; consent = next;
    try { localStorage.setItem(consentKey, next); } catch { /* In-memory preference still works. */ }
    banner.hidden = true;
    if (['accepted','all'].includes(next)) { captureAttribution(); if (loaded && previous !== next) { location.reload(); return; } else loadAnalytics(); confirmThankYou(); }
    // Reload to unload any previously accepted optional tracking scripts.
    else { try { sessionStorage.removeItem('ylar.attribution.v1'); } catch {} if (loaded) location.reload(); }
  }
  document.getElementById('accept-cookies')?.addEventListener('click', () => setConsent('accepted'));
  document.getElementById('accept-marketing')?.addEventListener('click', () => setConsent('all'));
  document.getElementById('decline-cookies')?.addEventListener('click', () => setConsent('declined'));
  document.querySelectorAll('a[href^="tel:"]').forEach(a => a.addEventListener('click', () => track('phone_click', {placement: a.dataset.placement || 'page'})));
  const popup = document.getElementById('service-popup');
  const popupKey = 'ylar.servicePopupShown';
  let shown = false;
  let returnFocus = null;
  let autoTimer = null;
  try { shown = sessionStorage.getItem(popupKey) === '1'; } catch { /* Per-page fallback. */ }
  const requested = new URLSearchParams(location.search).get('service') || location.pathname.split('/').pop().replace(/^services-/, '').replace(/\.html$/, '');
  function selectService(form, service) {
    const appliance = form.elements.namedItem('appliance');
    if (service && [...appliance.options].some(o => o.value === service)) appliance.value = service;
  }
  function openPopup(service, source = 'button') {
    if (!popup || popup.open || typeof popup.showModal !== 'function') return false;
    if (autoTimer) clearTimeout(autoTimer);
    returnFocus = document.activeElement;
    if (service) selectService(document.getElementById('popup-form'), service);
    document.querySelector('.service-nudge')?.remove();
    popup.showModal();
    document.body.classList.add('popup-open');
    shown = true;
    try { sessionStorage.setItem(popupKey, '1'); } catch { /* In-memory fallback. */ }
    track('service_popup_open', {placement: source});
    return true;
  }
  function closePopup() { popup?.close(); }
  popup?.querySelector('.popup-close').addEventListener('click', closePopup);
  popup?.addEventListener('click', e => {
    // Only a click outside the panel closes it; clicks in form spacing stay inside.
    if (e.target === popup) {
      const box = popup.getBoundingClientRect();
      if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) closePopup();
    }
  });
  popup?.addEventListener('close', () => {
    document.body.classList.remove('popup-open');
    if (returnFocus && returnFocus.isConnected) returnFocus.focus({preventScroll: true});
  });
  // Native dialog provides focus containment and Escape-to-close behavior.
  document.querySelectorAll('a[href*="#request"]').forEach(a => a.addEventListener('click', e => {
    const target = new URL(a.href, location.href);
    if (target.origin !== location.origin) return;
    if (openPopup(target.searchParams.get('service') || requested)) e.preventDefault();
  }));
  if (popup && !shown && !/privacy|404|thank-you/.test(location.pathname)) {
    autoTimer = setTimeout(() => {
      if (document.hidden || document.activeElement?.closest('form') || location.hash === '#request') return;
      const nudge = document.createElement('aside');
      nudge.className = 'service-nudge';
      nudge.setAttribute('aria-label', 'Service request');
      const action = document.createElement('button');
      action.type = 'button'; action.textContent = 'Need a repair? Request service ↗';
      action.addEventListener('click', () => { nudge.hidden = true; openPopup(requested, 'prompt'); });
      const dismiss = document.createElement('button');
      dismiss.type = 'button'; dismiss.className = 'nudge-close'; dismiss.textContent = '×';
      dismiss.setAttribute('aria-label', 'Dismiss service prompt');
      dismiss.addEventListener('click', () => { nudge.remove(); try { sessionStorage.setItem(popupKey, '1'); } catch {} });
      nudge.append(action,dismiss); document.body.appendChild(nudge);
      try { sessionStorage.setItem(popupKey, '1'); } catch {}
    }, 10000);
  }
  document.querySelectorAll('[data-inquiry-form]').forEach(form => {
    const appliance = form.elements.namedItem('appliance');
    selectService(form, requested);
    let started = false;
    form.addEventListener('focusin', e => {
      if (!started && e.target.matches('input,select,textarea')) {
        started = true; track('inquiry_form_start', {page_path: location.pathname, placement: form.dataset.placement});
      }
    });
    if (config.formDeliveryVerified) form.querySelector('.delivery-setup')?.remove();
    let leadId = null;
    let submitting = false;
    let submitted = false;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (submitting || submitted || !form.reportValidity()) return;
      const values = new FormData(form);
      if (values.get('_honey')) return;
      const result = form.querySelector('.form-result');
      const button = form.querySelector('[type="submit"]');
      const show = message => { result.textContent = message; result.hidden = false; result.focus({preventScroll: true}); };
      leadId = leadId || (window.crypto?.randomUUID?.() || ('request-' + Date.now() + '-' + Math.random().toString(36).slice(2,10)));
      const selected = appliance.options[appliance.selectedIndex].text;
      const payload = {
        'Request ID': leadId,
        'Submitted at': new Date().toISOString(),
        'Form placement': form.dataset.placement,
        'Your Name': String(values.get('name') || '').trim(),
        'Your Email': String(values.get('email') || '').trim(),
        'Your Phone': String(values.get('phone') || '').trim(),
        'Choose Service': selected,
        _replyto: String(values.get('email') || '').trim(),
        _subject: 'New submission from Contact Form — Your Local Appliance Repair',
        _template: 'table',
        _honey: '',
        _url: cleanUrl
      };
      if (!payload._replyto) delete payload._replyto;
      const attribution = readAttribution();
      for (const [key,value] of Object.entries(attribution)) payload['Campaign ' + key] = value;
      for (const [key, label] of [['location', 'City / Postal Code'], ['brand', 'Brand'], ['issue', 'Issue']]) {
        const value = String(values.get(key) || '').trim();
        if (value) payload[label] = value;
      }
      submitting = true;
      button.disabled = true;
      button.textContent = 'Sending…';
      form.setAttribute('aria-busy', 'true');
      show('Sending your request…');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(config.inquiryEmail), {
          method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'},
          body: JSON.stringify(payload), signal: controller.signal
        });
        const data = await response.json();
        if (!response.ok || !(data.success === true || data.success === 'true')) throw new Error('Submission was not accepted');
        // Provider acceptance does not prove inbox delivery. Activation is verified separately.
        if (!config.formDeliveryVerified || /activat|confirm.*email/i.test(data.message || '')) {
          show('Online requests are temporarily unavailable. Please call 437-875-2558 so we can help. Your appointment has not been booked.');
          button.textContent = 'Try again';
        } else {
          submitted = true;
          show('Thank you! Your request has been submitted. We’ll contact you to confirm pricing and availability. Your appointment is not yet booked.');
          button.textContent = 'Request submitted';
          // Store no customer contact details. Only a successful provider response reaches this branch.
          try {
            sessionStorage.setItem('ylar.confirmedRequest.v1', JSON.stringify({
              id: leadId, createdAt: Date.now(), appliance: String(values.get('appliance')),
              placement: form.dataset.placement, page: location.pathname, tracked: false
            }));
            location.assign('/thank-you.html');
          } catch {
            // If private storage is unavailable, preserve the on-page success confirmation.
            // Do not manufacture a page-view conversion or retry the accepted request.
          }
        }
      } catch {
        show('We couldn’t confirm your submission. Your details are still here. Please call 437-875-2558, or try again. If you already received a response, do not resubmit.');
        button.textContent = 'Try again';
      } finally {
        clearTimeout(timeout);
        submitting = false;
        button.disabled = submitted;
        form.removeAttribute('aria-busy');
      }
    });
  });
  function confirmThankYou() {
    if (!/^\/thank-you(?:\.html)?\/?$/.test(location.pathname)) return;
    let receipt;
    try { receipt = JSON.parse(sessionStorage.getItem('ylar.confirmedRequest.v1') || 'null'); } catch { return; }
    const services = ['refrigerator-repair','washer-repair','dryer-repair','dishwasher-repair','oven-repair','stove-repair','appliance-installation'];
    if (!receipt || !/^[a-zA-Z0-9-]{8,100}$/.test(receipt.id || '') ||
        !Number.isFinite(receipt.createdAt) || Date.now() - receipt.createdAt > 30 * 60 * 1000 ||
        receipt.createdAt > Date.now() || !services.includes(receipt.appliance)) return;
    const confirmed = document.getElementById('thank-you-confirmed');
    const unconfirmed = document.getElementById('thank-you-unconfirmed');
    if (confirmed) confirmed.hidden = false;
    if (unconfirmed) unconfirmed.hidden = true;
    const reference = document.getElementById('request-reference');
    if (reference) reference.textContent = receipt.id;
    if (receipt.tracked || !configured || !['accepted','all'].includes(consent)) return;
    // Persist first: refreshes, back navigation and duplicate page loads must not count new leads.
    try {
      sessionStorage.setItem('ylar.confirmedRequest.v1', JSON.stringify({...receipt, tracked: true}));
    } catch { return; }
    track('generate_lead', {
      appliance_type: receipt.appliance,
      placement: ['popup','inline'].includes(receipt.placement) ? receipt.placement : 'form',
      page_path: '/thank-you.html'
    });
    if (consent === 'all' && !config.gtmContainerId && /^AW-[0-9]+$/.test(config.googleAdsId || '') && /^[A-Za-z0-9_-]+$/.test(config.googleAdsLeadLabel || '')) {
      window.gtag?.('event','conversion', {
        send_to: config.googleAdsId + '/' + config.googleAdsLeadLabel,
        transaction_id: receipt.id
      });
    }
  }

})();
