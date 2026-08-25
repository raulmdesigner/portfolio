/* Horizonte Tátil: o idioma segue o estado oficial do Portfólio e o loading só libera conteúdo útil, não um intervalo fixo. */
(() => {
  const defaults = {
    pt: {
      hero_eyebrow: 'designer gráfico · sc, brasil', hero_title: 'Design que<br /><em>entra</em> no jogo.', hero_text: 'Eu estudo o universo de cada marca para criar peças que se adaptam ao que ela precisa dizer, sem perder cuidado com cada detalhe.',
      satisfaction_title: 'O cuidado também aparece na experiência.', satisfaction_intro: 'Indicadores agregados e avaliações resumidas, extraídos de respostas reais de clientes.',
      scratch_title: 'Raspe para revelar um benefício.', scratch_instruction: 'Passe a moeda sobre o cartão e descubra uma condição especial para seu próximo projeto.', scratch_ticket_lead: 'raspou e', scratch_ticket_strong: 'ganhou',
      contact_title: 'Tem algo que<br />precisa comunicar?', rail_about: 'Quem sou eu', rail_work: 'Trabalhos', rail_process: 'Conheça o processo', rail_contact: 'Contato', rail_email: 'E-mail', gallery_back: 'Voltar', gallery_eyebrow: 'seleção de trabalhos', gallery_contact: 'Falar sobre esse tipo de projeto', viewer_close: 'Fechar', viewer_contact: 'Falar sobre este trabalho'
    },
    en: {
      hero_eyebrow: 'graphic designer · sc, brazil', hero_title: 'Design that<br /><em>gets</em> in the game.', hero_text: 'I study the universe of each brand to create pieces that adapt to what it needs to say, without losing care for every detail.',
      satisfaction_title: 'Care also shows in the experience.', satisfaction_intro: 'Aggregate indicators and summarized reviews drawn from real client responses.',
      scratch_title: 'Scratch to unlock a benefit.', scratch_instruction: 'Move the coin over the card and discover a special condition for your next project.', scratch_ticket_lead: 'scratch and', scratch_ticket_strong: 'win',
      contact_title: 'Have something<br />to communicate?', rail_about: 'About me', rail_work: 'Work', rail_process: 'See the process', rail_contact: 'Contact', rail_email: 'Email', gallery_back: 'Back', gallery_eyebrow: 'selected work', gallery_contact: 'Talk about this type of project', viewer_close: 'Close', viewer_contact: 'Talk about this work'
    }
  };
  let settings = { site_copy: {}, site_copy_en: {} };
  let settingsLoaded = false;
  let firstFoldReady = false;
  let pageReady = false;
  const truthy = value => value === true || value === 1 || value === '1' || value === 'true';
  const element = selector => document.querySelector(selector);
  const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
  const textOfHtml = value => clean(String(value || '').replace(/<br\s*\/?\s*>/gi, ' ').replace(/<[^>]+>/g, ' '));
  const setText = (selector, value) => { const node = element(selector); if (node && value !== undefined && value !== null && clean(node.textContent) !== clean(value)) node.textContent = String(value); };
  const setHtml = (selector, value) => { const node = element(selector); if (node && value !== undefined && value !== null && clean(node.textContent) !== textOfHtml(value)) node.innerHTML = String(value).replace(/\n/g, '<br />'); };
  const setButton = (selector, value, symbol) => { const node = element(selector); const expected = `${textOfHtml(value)} ${symbol}`; if (node && value && clean(node.textContent) !== clean(expected)) node.innerHTML = `${String(value).replace(/\n/g, '<br />')} <span aria-hidden="true">${symbol}</span>`; };
  const locale = () => element('[data-locale-toggle]')?.dataset.activeLocale === 'en' ? 'en' : 'pt';
  const normalize = value => String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().toLocaleLowerCase();
  const copy = current => {
    const saved = { ...((current === 'en' ? settings.site_copy_en : settings.site_copy) || {}) };
    if (current === 'en') Object.keys(saved).forEach(key => { if (settings.site_copy?.[key] && normalize(saved[key]) === normalize(settings.site_copy[key])) delete saved[key]; });
    return { ...defaults[current], ...saved };
  };
  function enforceLanguageToggle() {
    const button = element('[data-locale-toggle]');
    if (!button) return;
    const visible = truthy(settings.english_enabled);
    button.hidden = !visible;
    button.style.display = visible ? '' : 'none';
    button.setAttribute('aria-hidden', visible ? 'false' : 'true');
    button.tabIndex = visible ? 0 : -1;
  }
  function applyLocale() {
    const current = locale(); const text = copy(current);
    const eyebrow = element('.hero .eyebrow'); if (eyebrow && clean(eyebrow.textContent) !== clean(text.hero_eyebrow)) eyebrow.innerHTML = `<span></span> ${text.hero_eyebrow}`;
    setHtml('#hero-title', text.hero_title);
    setText('.hero-text', text.hero_text); setHtml('#satisfaction-title', text.satisfaction_title); setText('#satisfaction-intro', text.satisfaction_intro);
    setHtml('[data-scratch-heading]', text.scratch_title); setText('[data-scratch-instruction]', text.scratch_instruction);
    setText('.scratch-ticket-heading span', text.scratch_ticket_lead); setText('.scratch-ticket-heading strong', text.scratch_ticket_strong);
    setHtml('#contact-title', text.contact_title); setText('[data-rail-link="quem-sou"]', `01 ${text.rail_about}`); setText('[data-rail-link="trabalhos"]', `02 ${text.rail_work}`); setText('[data-rail-link="processo"]', `03 ${text.rail_process}`); setText('[data-rail-link="contato"]', `04 ${text.rail_contact}`); setText('.rail-cta', text.rail_email);
    setButton('.gallery-close', text.gallery_back, '←'); setText('.gallery-content .eyebrow', text.gallery_eyebrow); setButton('#gallery-contact', text.gallery_contact, '↗'); setButton('.viewer-close', text.viewer_close, '×'); setButton('#viewer-contact', text.viewer_contact, '↗'); enforceLanguageToggle();
  }
  async function loadSettings() {
    const config = window.RAUL_PORTFOLIO_SUPABASE_CONFIG;
    if (!config?.url || !config?.anonKey) { settingsLoaded = true; applyLocale(); return; }
    try {
      const response = await fetch(`${config.url}/rest/v1/site_settings?id=eq.true&select=english_enabled,site_copy,site_copy_en`, { headers: { apikey: config.anonKey, Authorization: `Bearer ${config.anonKey}` } });
      const rows = await response.json(); if (Array.isArray(rows) && rows[0]) settings = rows[0];
    } catch (_) { /* A tradução padrão ainda funciona se a consulta falhar. */ }
    settingsLoaded = true; applyLocale();
  }
  function essentialScore() {
    const heroImage = element('.hero-visual .lens-large img');
    const logo = element('.site-header img');
    const checks = [
      Boolean(element('.site-header .brand')?.textContent.trim()),
      Boolean(element('.hero h1')?.textContent.trim() && element('.hero-text')?.textContent.trim()),
      Boolean(heroImage?.complete && heroImage.naturalWidth > 0),
      Boolean(logo?.complete && logo.naturalWidth > 0),
      Boolean(element('#satisfaction-reviews')?.children.length),
      Boolean(element('.category-list .category-card')),
      Boolean(element('#contact-title')?.textContent.trim())
    ];
    return checks.filter(Boolean).length / checks.length;
  }
  function finishLoading() {
    if (pageReady) return;
    pageReady = true; document.documentElement.classList.add('rms-portfolio-ready');
  }
  function coordinateLoading() {
    const started = Date.now();
    const inspect = () => {
      const score = essentialScore();
      firstFoldReady = score >= .57;
      if (settingsLoaded && firstFoldReady && score >= .8) return finishLoading();
      const status = element('.rms-load-status'); if (Date.now() - started > 8000 && status) status.textContent = 'Preparando os últimos detalhes do estúdio.';
      if (Date.now() - started > 15000) document.documentElement.classList.add('rms-load-needs-help');
      window.setTimeout(inspect, 160);
    };
    inspect();
  }
  function bindLocaleState() {
    const button = element('[data-locale-toggle]');
    if (!button) return;
    new MutationObserver(records => { if (records.some(record => record.attributeName === 'data-active-locale')) applyLocale(); }).observe(button, { attributes: true, attributeFilter: ['data-active-locale'] });
    button.addEventListener('click', () => { window.setTimeout(applyLocale, 90); window.setTimeout(applyLocale, 520); });
  }
  function observeNativeRenders() {
    const roots = ['.hero', '.satisfaction-strip', '.scratch-section', '.contact', '.contact-rail', '.gallery-overlay', '.project-viewer'].map(element).filter(Boolean);
    const observer = new MutationObserver(() => { if (locale() === 'en') window.requestAnimationFrame(applyLocale); });
    roots.forEach(root => observer.observe(root, { childList: true, subtree: true, characterData: true }));
  }
  let started = false;
  function start() {
    if (started) return; started = true;
    bindLocaleState(); observeNativeRenders(); applyLocale(); window.setTimeout(applyLocale, 700); coordinateLoading(); element('.rms-load-continue')?.addEventListener('click', finishLoading);
  }
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });
  loadSettings();
})();
