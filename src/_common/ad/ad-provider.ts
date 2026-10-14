export type AdProvider = 'monetizemore' | 'adbridg';

/**
 * The percent of sessions (0-100) that get AdBridg. Everyone else gets
 * MonetizeMore. Ramp this up through deploys until we fully hand over.
 */
const AdBridgTrafficPercent = 0;

/**
 * Add `?ad_provider=adbridg` (or `?ad_provider=monetizemore`) to any URL to
 * force the ad provider, regardless of the traffic split. The choice sticks for
 * the rest of the browser session.
 */
const QueryParam = 'ad_provider';
const OverrideStorageKey = 'gj-ad-provider';

/**
 * We store the session's roll rather than the provider it landed on. That way
 * changing the traffic percent applies to existing sessions too, so ramping
 * down to 0 works as a rollback.
 */
const RollStorageKey = 'gj-ad-provider-roll';

function _isAdProvider(value: unknown): value is AdProvider {
	return value === 'monetizemore' || value === 'adbridg';
}

function _getSessionRoll() {
	const stored = parseFloat(sessionStorage.getItem(RollStorageKey) ?? '');
	if (stored >= 0 && stored < 100) {
		return stored;
	}

	const roll = Math.random() * 100;
	sessionStorage.setItem(RollStorageKey, String(roll));
	return roll;
}

/**
 * Figures out which ad provider this session should use. Only checked once on
 * boot, since we can't unload a provider's scripts once they're on the page.
 */
export function resolveAdProvider(): AdProvider {
	if (import.meta.env.SSR) {
		return 'monetizemore';
	}

	try {
		const fromQuery = new URLSearchParams(window.location.search).get(QueryParam);
		if (_isAdProvider(fromQuery)) {
			sessionStorage.setItem(OverrideStorageKey, fromQuery);
			return fromQuery;
		}

		const fromStorage = sessionStorage.getItem(OverrideStorageKey);
		if (_isAdProvider(fromStorage)) {
			return fromStorage;
		}

		return _getSessionRoll() < AdBridgTrafficPercent ? 'adbridg' : 'monetizemore';
	} catch (e) {
		// Session storage can throw when it's blocked. Fall back to a stable
		// provider so that they don't flip between providers on each load.
		console.warn('Could not resolve ad provider from session.', e);
		return 'monetizemore';
	}
}
