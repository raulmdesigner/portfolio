/* Horizonte Tátil: campos extras de PT/EN no painel; consulta os valores reais e não mantém observadores ou intervalos ativos. */
(() => {
  const groups = [
    ['Abertura e menu lateral', [['hero_eyebrow', 'Linha acima do título'], ['hero_text', 'Texto principal'], ['rail_about', 'Menu: Quem sou eu'], ['rail_work', 'Menu: Trabalhos'], ['rail_process', 'Menu: Processo'], ['rail_contact', 'Menu: Contato'], ['rail_email', 'Menu: E-mail']]],
    ['Experiência e benefício', [['satisfaction_title', 'Título das avaliações'], ['satisfaction_intro', 'Introdução das avaliações'], ['scratch_title', 'Título da raspadinha'], ['scratch_instruction', 'Instrução da raspadinha']]],
    ['Galeria e visualizador', [['gallery_back', 'Voltar da galeria'], ['gallery_eyebrow', 'Linha da galeria'], ['gallery_contact', 'Botão da galeria'], ['viewer_close', 'Fechar visualizador'], ['viewer_contact', 'Botão do visualizador']]]
  ];
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  let settings = { site_copy: {}, site_copy_en: {} };
  let locale = 'pt';
  let drafts = { pt: {}, en: {} };
  function getLocale() { return document.querySelector('[data-editorial-locale].is-active')?.dataset.editorialLocale || locale; }
  function getValues(targetLocale) { return { ...(targetLocale === 'en' ? settings.site_copy_en : settings.site_copy), ...drafts[targetLocale] }; }
  function render() {
    const target = document.getElementById('rms-extra-copy-editor');
    if (!target) return;
    locale = getLocale(); const values = getValues(locale);
    target.innerHTML = groups.map(([title, fields]) => `<details class="experience-group rms-extra-copy-group" open><summary>${esc(title)}</summary><div class="form-grid two">${fields.map(([key, label]) => `<label>${esc(label)}<textarea rows="3" data-editorial-copy="${esc(key)}" data-rms-extra-copy="true" placeholder="${locale === 'en' ? 'English text' : 'Texto em português'}">${esc(values[key] || '')}</textarea></label>`).join('')}</div></details>`).join('');
    target.querySelectorAll('[data-rms-extra-copy]').forEach(input => input.addEventListener('input', event => { drafts[locale][event.currentTarget.dataset.editorialCopy] = event.currentTarget.value; }));
  }
  async function loadValues() {
    const config = window.RAUL_PORTFOLIO_SUPABASE_CONFIG;
    if (!config?.url || !config?.anonKey) { render(); return; }
    try {
      const response = await fetch(`${config.url}/rest/v1/site_settings?id=eq.true&select=site_copy,site_copy_en`, { headers: { apikey: config.anonKey, Authorization: `Bearer ${config.anonKey}` } });
      const rows = await response.json(); settings = Array.isArray(rows) && rows[0] ? rows[0] : settings;
    } catch (_) { /* O editor permanece disponível mesmo sem recarregar os valores. */ }
    render();
  }
  function init() {
    const form = document.getElementById('editorial-form'); const grid = document.getElementById('editorial-copy-editor');
    if (!form || !grid || document.getElementById('rms-extra-copy-editor')) return;
    const wrapper = document.createElement('div'); wrapper.id = 'rms-extra-copy-editor'; wrapper.className = 'rms-extra-copy-editor'; grid.insertAdjacentElement('afterend', wrapper);
    const style = document.createElement('style'); style.textContent = '.rms-extra-copy-editor{display:grid;gap:12px;margin-top:12px}.rms-extra-copy-group summary{cursor:pointer;font-weight:700;padding:4px 0 12px}.rms-extra-copy-group textarea{min-height:74px;resize:vertical}'; document.head.appendChild(style);
    form.querySelectorAll('[data-editorial-locale]').forEach(button => button.addEventListener('click', () => window.setTimeout(render, 0)));
    loadValues();
  }
  window.addEventListener('load', init, { once: true });
})();
