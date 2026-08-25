/* Horizonte Tátil: painel móvel estável, sem fresta lateral e sem herdar zoom ou scroll da página de fundo. */
(() => {
  const MOBILE_QUERY = '(max-width: 760px)';
  const overlayClasses = ['gallery-open', 'process-open', 'viewer-open'];
  let locked = false;
  let savedScrollY = 0;

  const isMobile = () => window.matchMedia(MOBILE_QUERY).matches;
  const overlayIsOpen = () => overlayClasses.some(name => document.body.classList.contains(name));

  function lockPage() {
    if (locked || !isMobile() || !overlayIsOpen()) return;
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    document.documentElement.style.setProperty('--rms-overlay-scroll-y', `-${savedScrollY}px`);
    document.documentElement.classList.add('rms-mobile-overlay-lock');
    locked = true;
  }

  function unlockPage() {
    if (!locked || overlayIsOpen()) return;
    document.documentElement.classList.remove('rms-mobile-overlay-lock');
    document.documentElement.style.removeProperty('--rms-overlay-scroll-y');
    window.scrollTo(0, savedScrollY);
    locked = false;
  }

  function syncOverlayState() {
    if (isMobile() && overlayIsOpen()) lockPage();
    else unlockPage();
  }

  function start() {
    const observer = new MutationObserver(syncOverlayState);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', syncOverlayState, { passive: true });
    window.addEventListener('orientationchange', syncOverlayState, { passive: true });
    window.addEventListener('pageshow', syncOverlayState, { passive: true });
    syncOverlayState();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
