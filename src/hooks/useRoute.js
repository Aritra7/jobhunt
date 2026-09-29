import { useState, useEffect, useCallback } from 'react';

export const VIEWS = ['jobs', 'preferences', 'tracker', 'prep', 'resume'];

/**
 * "#/jobs/greenhouse%3Astripe-123" -> { view: 'jobs', sub: 'greenhouse:stripe-123' }
 * @param {string} hash
 */
function parse(hash) {
  const [view, ...rest] = hash.replace(/^#\/?/, '').split('/');
  if (!VIEWS.includes(view)) return { view: 'jobs', sub: '' };
  let sub = '';
  try {
    sub = decodeURIComponent(rest.join('/'));
  } catch {
    // Malformed URL - ignore the sub-route.
  }
  return { view, sub };
}

/**
 * @param {string} view
 * @param {string} sub
 */
function toHash(view, sub) {
  return `#/${view}${sub ? `/${encodeURIComponent(sub)}` : ''}`;
}

/**
 * Keeps the current screen in the URL so the browser's back/forward buttons
 * (and trackpad swipes) move between screens instead of leaving the app.
 * Each route is "view" plus an optional "sub" (a job id or a tab).
 */
export default function useRoute() {
  const [route, setRoute] = useState(() => parse(window.location.hash));

  useEffect(() => {
    const sync = () => setRoute(parse(window.location.hash));
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  /**
   * @param {string} view
   * @param {string} [sub]
   * @param {{ replace?: boolean }} [options]  replace = don't add a history entry
   */
  const navigate = useCallback((view, sub = '', { replace = false } = {}) => {
    const hash = toHash(view, sub);
    if (hash === window.location.hash) return;
    const state = { jobfind: true };
    if (replace) window.history.replaceState(state, '', hash);
    else window.history.pushState(state, '', hash);
    setRoute(parse(hash));
  }, []);

  /**
   * In-app "Back" button: behaves like the browser back button when the
   * previous page is inside the app, otherwise goes to the fallback.
   * @param {string} fallbackView
   * @param {string} [fallbackSub]
   */
  const goBack = useCallback((fallbackView, fallbackSub = '') => {
    if (window.history.state && window.history.state.jobfind && window.history.length > 1) window.history.back();
    else navigate(fallbackView, fallbackSub, { replace: true });
  }, [navigate]);

  return { route, navigate, goBack };
}
