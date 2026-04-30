import { ref, shallowReadonly } from 'vue';
import { Router } from 'vue-router';

import { getDeviceArch, getDeviceOS, isDynamicGoogleBot } from '~common/device/device.service';
import { Environment } from '~common/environment/environment.service';
import { getPartnerReferrer } from '~common/partner-referral/partner-referral-service';
import { onRouteChangeAfter } from '~common/route/route-component';
import { defineIsolatedState } from '~common/ssr/isolated-state';

export interface HistoryTickOptions {
	sourceResource?: string;
	sourceResourceId?: number;
	key?: string;
	sourceFeed?: string;
}

export type HistoryTickStore = ReturnType<typeof initHistoryTickStore>;

const _storeHandle = defineIsolatedState<{ store: HistoryTickStore | null }>(() => ({
	store: null,
}));

/**
 * Returns the history tick store for the current request scope.
 */
export function getHistoryTickStore() {
	const store = _storeHandle().store;
	if (!store) {
		throw new Error(`HistoryTickStore not created.`);
	}
	return store;
}

export function initHistoryTickStore(router?: Router) {
	const sources = ref<Record<string, string | undefined>>({});

	// Since we're in a single page app, the referrer doesn't get reset on every
	// page change. To be able to pull the correct referrer we need to spoof it
	// by updating on every state change. The initial referrer from the Document
	// should be correct when we first hit the page. If it's empty then there
	// was no referrer when hitting the initial page.
	const referrer = ref<string | undefined>(undefined);

	if (router && !import.meta.env.SSR && window.document.referrer) {
		referrer.value = window.document.referrer;

		// We will set this to false after the first page change. We don't
		// artifically track new referrers until after the first page has passed.
		let firstPass = true;

		// After every location change we store the current URL. We can use
		// this value as the referrer when switching to the next page.
		let url: string | undefined;

		router.beforeEach((_to, _from, next) => {
			// Don't track until we've tracked on full page view.
			if (firstPass) {
				return next();
			}

			referrer.value = url;
			next();
		});

		onRouteChangeAfter.subscribe(() => {
			// We have finished the first state change.
			// We will now begin tracking new referrers.
			firstPass = false;
			url = window.location.href;
		});
	}

	/**
	 * You can track a source for a particular parent resource. For example,
	 * tracking the current referrer for a Game and then any time you log a tick
	 * for a type within that Game (game-build, game-news, etc) it will pull the
	 * source referrer into the tick.
	 *
	 * Note that we only log the first referrer for a particular resource. If
	 * you get to this resource through different means we'll still just track
	 * the initial way of getting there.
	 */
	function trackSource(resource: string, resourceId: number) {
		// Referrer info is browser-only (set from document.referrer), and the
		// only consumer (sendHistoryTick / payment form) is browser-only.
		if (import.meta.env.SSR) {
			return;
		}

		const key = resource + ':' + resourceId;
		// Look specifically for undefined and not just null. There may have
		// been a null referrer if we got here through a direct page hit.
		if (typeof sources.value[key] === 'undefined') {
			sources.value[key] = referrer.value;
		}
	}

	function getSource(resource: string, resourceId: number) {
		return sources.value[resource + ':' + resourceId];
	}

	const c = shallowReadonly({
		sources,
		referrer,
		trackSource,
		getSource,
	});

	// Store it so we can access from anywhere.
	_storeHandle().store = c;
	return c;
}

export function sendHistoryTick(
	type: string,
	resourceId?: number,
	options: HistoryTickOptions = {}
) {
	if (import.meta.env.SSR || isDynamicGoogleBot()) {
		return;
	}

	const historyTickStore = getHistoryTickStore();

	return new Promise<void>(resolve => {
		const queryParams: string[] = [];

		// Cache busting.
		queryParams.push('cb=' + Date.now());

		// Device info.
		queryParams.push('os=' + getDeviceOS());
		const arch = getDeviceArch();
		if (arch) {
			queryParams.push('arch=' + arch);
		}

		// Source/referrer.
		if (options.sourceResource && options.sourceResourceId) {
			const source = historyTickStore.getSource(
				options.sourceResource,
				options.sourceResourceId
			);
			if (source) {
				queryParams.push('source=' + source);
			}

			const ref = getPartnerReferrer(options.sourceResource, options.sourceResourceId);
			if (ref) {
				queryParams.push('ref=' + ref);
			}
		}

		// Key.
		if (options.key) {
			queryParams.push('key=' + options.key);
		}

		// Source feed.
		if (options.sourceFeed) {
			queryParams.push('feed=' + options.sourceFeed);
		}

		let url = `${Environment.apiHost}/tick/${type}`;
		if (resourceId) {
			url += `/${resourceId}`;
		}
		url += `?${queryParams.join('&')}`;

		// This is enough to send the beacon.
		// No need to add it to the page.
		const img = window.document.createElement('img');
		img.width = 1;
		img.height = 1;
		img.src = url;

		// Always resolve.
		img.onload = img.onerror = () => {
			delete (img as any).onload;
			delete (img as any).onerror;
			resolve();
		};

		if (GJ_ENVIRONMENT === 'development') {
			console.log('Tracking history tick.', {
				type: type,
				resourceId: resourceId,
				queryString: queryParams.join('&'),
			});
		}
	});
}
