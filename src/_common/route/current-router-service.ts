import { Router } from 'vue-router';

import { defineIsolatedState } from '~common/ssr/isolated-state';

const _routerHandle = defineIsolatedState<{ router: Router | null }>(() => ({ router: null }));

/**
 * Registers the router for the current request scope. Called once during
 * section bootstrap. After this, any module-level code can grab the router via
 * `getCurrentRouter()` instead of having it threaded through.
 */
export function setCurrentRouter(router: Router) {
	_routerHandle().router = router;
}

/**
 * Returns the router for the current request scope. In the browser this is a
 * single app-wide router; in SSR it's isolated per request via
 * AsyncLocalStorage. Throws if called before `setCurrentRouter`.
 */
export function getCurrentRouter() {
	const router = _routerHandle().router;
	if (!router) {
		throw new Error(
			`getCurrentRouter() called before setCurrentRouter(). The section's bootstrap must register the router.`
		);
	}
	return router;
}
