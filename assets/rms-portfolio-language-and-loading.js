/* Horizonte Tátil: idioma e carregamento progressivos; nunca retém o conteúdo por depender do Supabase. */
(() => {
  const defaults = {
    pt: {
      satisfaction_title: 'O cuidado também aparece na experiência.', satisfaction_intro: 'Indicadores agregados e avaliações resumidas, extraídos de respostas reais de clientes.',
      scratch_title: 'Raspe para revelar um benefício.', scratch_instruction: 'Passe a moeda sobre o cartão e descubra uma condição especial para seu próximo projeto.',
      contact_title: 'Tem algo que<br />precisa comunicar?', rail_about: 'Quem sou eu', rail_work: 'Trabalhos', rail_process: 'Conheça o processo', rail_contact: 'Contato', rail_email: 'E-mail', hero_eyebrow: 'designer gráfico · sc, brasil', hero_text: 'Eu estudo o universo de cada marca para criar peças que se adaptam ao que ela precisa dizer, sem perder cuidado com cada detalhe.', gallery_back: 'Voltar', gallery_eyebrow: 'seleção de trabalhos', gallery_contact: 'Falar sobre esse tipo de projeto', viewer_close: 'Fechar', viewer_contact: 'Falar sobre este trabalho'
    },
    en: {
      satisfaction_title: 'Care also shows in the experience.', satisfaction_intro: 'Aggregate indicators and summarized reviews drawn from real client responses.',
      scratch_title: 'Scratch to reveal a benefit.', scratch_instruction: 'Move the coin over the card and discover a special condition for your next project.',
      contact_title: 'Have something<br />to communicate?', rail_about: 'About me', rail_work: 'Work', rail_process: 'See the process', rail_contact: 'Contact', rail_email: 'Email', hero_eyebrow: 'graphic designer · sc, brazil', hero_text: 'I study the universe of each brand to create pieces that adapt to what it needs to say, without losing care for every detail.', gallery_back: 'Back', gallery_eyebrow: 'selected work', gallery_contact: 'Talk about this type of project', viewer_close: 'Close', viewer_contact: 'Talk about this work'
    }
  };
  let settings = null;
  const truthy = value => value === true || value === 1 || value === '1' || value === 'true';
  const ready = () => document.documentElement.classList.add('rms-portfolio-ready');
  const currentLocale = () => document.querySelector('[data-locale-toggle]')?.dataset.activeLocale === 'en' || localStorage.getItem('raul-portfolio-locale') === 'en' ? 'en' : 'pt';
  const setHtml = (selector, value) => { const node = document.querySelector(selector); if (node && value) node.innerHTML = String(value).replace(/\n/g, '<br />'); };
  const setText = (selector, value) => { const node = document.querySelector(selector); if (node && value) node.textContent = value; };
  const setButton = (selector, value, symbol) => { const node = document.querySelector(selector); if (node && value) node.innerHTML = `${String(value).replace(/\n/g, '<br />')} <span aria-hidden="true">${symbol}</span>`; };
  const copy = locale => ({ ...defaults[locale], ...(locale === 'en' ? settings?.site_copy_en : settings?.site_copy || {}) });
  function enforceLanguageToggle() {
    const button = document.querySelector('[data-locale-toggle]');
    if (!button) return;
    const visible = truthy(settings?.english_enabled);
    button.hidden = !visible;
    button.style.display = visible ? '' : 'none';
    button.setAttribute('aria-hidden', visible ? 'false' : 'true');
    button.tabIndex = visible ? 0 : -1;
  }
  function applyLocale() {
    const text = copy(currentLocale());
    setHtml('#satisfaction-title', text.satisfaction_title); setText('#satisfaction-intro', text.satisfaction_intro);
    setHtml('[data-scratch-heading]', text.scratch_title); setText('[data-scratch-instruction]', text.scratch_instruction);
    setHtml('#contact-title', text.contact_title); setText('[data-rail-link="quem-sou"]', `01 ${text.rail_about}`); setText('[data-rail-link="trabalhos"]', `02 ${text.rail_work}`); setText('[data-rail-link="processo"]', `03 ${text.rail_process}`); setText('[data-rail-link="contato"]', `04 ${text.rail_contact}`); setText('.rail-cta', text.rail_email);
    const eyebrow = document.querySelector('.hero .eyebrow'); if (eyebrow) eyebrow.innerHTML = `<span></span> ${text.hero_eyebrow}`; setText('.hero-text', text.hero_text);
    setButton('.gallery-close', text.gallery_back, '←'); setText('.gallery-content .eyebrow', text.gallery_eyebrow); setButton('#gallery-contact', text.gallery_contact, '↗'); setButton('.viewer-close', text.viewer_close, '×'); setButton('#viewer-contact', text.viewer_contact, '↗'); enforceLanguageToggle();
  }
  async function loadSettings() {
    const config = window.RAUL_PORTFOLIO_SUPABASE_CONFIG;
    if (!config?.url || !config?.anonKey) { applyLocale(); ready(); return; }
    try {
      const response = await fetch(`${config.url}/rest/v1/site_settings?id=eq.true&select=english_enabled,site_copy,site_copy_en`, { headers: { apikey: config.anonKey, Authorization: `Bearer ${config.anonKey}` } });
      const rows = await response.json(); settings = Array.isArray(rows) ? rows[0] : null; applyLocale();
    } catch (_) { applyLocale(); } finally { ready(); }
  }
  document.addEventListener('click', event => { if (event.target.closest('[data-locale-toggle]')) window.setTimeout(applyLocale, 70); });
  window.addEventListener('storage', event => { if (event.key === 'raul-portfolio-locale') applyLocale(); });
  window.addEventListener('load', () => { applyLocale(); window.setTimeout(applyLocale, 260); window.setTimeout(enforceLanguageToggle, 900); }, { once: true });
  window.setTimeout(ready, 2600); loadSettings();
})();
