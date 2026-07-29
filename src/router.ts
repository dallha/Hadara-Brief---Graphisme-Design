/**
 * Simple hash-based router — no external dependency needed.
 * URLs: /#/, /#/brief, /#/portfolio, /#/admin, /#/cv, /#/confirmation
 */
import { useState, useEffect, useCallback } from 'react';

export type AppRoute = 'home' | 'brief' | 'portfolio' | 'admin' | 'cv' | 'confirmation' | 'splash';

const HASH_TO_ROUTE: Record<string, AppRoute> = {
  '':             'home',
  '/':            'home',
  '/home':        'home',
  '/brief':       'brief',
  '/portfolio':   'portfolio',
  '/admin':       'admin',
  '/cv':          'cv',
  '/confirmation':'confirmation',
};

const ROUTE_TO_HASH: Record<AppRoute, string> = {
  home:         '#/',
  brief:        '#/brief',
  portfolio:    '#/portfolio',
  admin:        '#/admin',
  cv:           '#/cv',
  confirmation: '#/confirmation',
  splash:       '#/',
};

function getRouteFromHash(): AppRoute {
  const hash = window.location.hash.replace('#', '') || '/';
  return HASH_TO_ROUTE[hash] || 'home';
}

export function useRouter() {
  const [route, setRouteState] = useState<AppRoute>(() => {
    // Show splash only on first visit per session
    const visited = sessionStorage.getItem('hadara_visited');
    if (!visited && getRouteFromHash() === 'home') {
      return 'splash';
    }
    return getRouteFromHash();
  });

  // Listen to browser back/forward
  useEffect(() => {
    const handler = () => setRouteState(getRouteFromHash());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback((to: AppRoute) => {
    if (to !== 'splash') {
      sessionStorage.setItem('hadara_visited', 'true');
      window.location.hash = ROUTE_TO_HASH[to];
    }
    setRouteState(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { route, navigate };
}

export function getRouteHash(route: AppRoute): string {
  return ROUTE_TO_HASH[route];
}
