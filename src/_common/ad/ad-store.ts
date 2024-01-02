import { inject, InjectionKey, onUnmounted, provide, ref, shallowReadonly, toRef } from 'vue';
import { RouteLocationNormalized, useRouter } from 'vue-router';
import { createLogger } from '../../utils/logging';
import { objectEquals } from '../../utils/object';
import { isDynamicGoogleBot } from '../device/device.service';
import { Environment } from '../environment/environment.service';
import { Model } from '../model/model.service';
import { onRouteChangeAfter } from '../route/route-component';
import { AdSlot } from './ad-slot-info';
import { AdAdapter } from './adapter-base';
import { AdEnthusiastAdapter } from './enthusiast/enthusiast-adapter';
import { AdPlaywireAdapter } from './playwire/playwire-adapter';
import { AdProperAdapter } from './proper/proper-adapter';

const logger = createLogger('Ads Store');

type AdStore = ReturnType<typeof createAdStore>;
const AdStoreKey: InjectionKey<AdStore> = Symbol('ads');

// To show ads on the page for dev, just change this to false.
// TODO(profile-scrunch) Swap these after review
// export const AdsDisabledDev = GJ_BUILD_TYPE === 'serve-hmr' || GJ_BUILD_TYPE === 'serve-build';
export const AdsDisabledDev = false;

const areAdsDisabledForDevice =
	GJ_IS_DESKTOP_APP || import.meta.env.SSR || isDynamicGoogleBot() || AdsDisabledDev;

// TODO(enthusiast-ads): Temporary until we roll out.
export const isAdEnthused =
	!areAdsDisabledForDevice && window.location.search.includes('be_enthused');

/**
 * This is the interface that our ad components must register with us.
 */
export type AdInterface = { display: () => void };

export class AdSettingsContainer {
	isPageDisabled = false;
	resource: Model | null = null;
}

export const enum AdEvent {
	View = 'view',
	Click = 'click',
}

export const enum AdType {
	Display = 'display',
	Video = 'video',
}

export const enum AdResourceType {
	None = 1,
	Game = 2,
	User = 3,
	FiresidePost = 4,
}

export function createAdStore() {
	const routeResolved = ref(false);
	const ads = ref(new Set<AdInterface>());
	const pageSettings = ref<AdSettingsContainer | null>(null);
	const _defaultSettings = new AdSettingsContainer();

	let videoAdapter: AdAdapter;
	let adapter: AdAdapter;
	if (!import.meta.env.SSR) {
		if (isAdEnthused) {
			const newAdapter = new AdEnthusiastAdapter();
			videoAdapter = newAdapter;
			adapter = newAdapter;
		}
	}
	videoAdapter ??= new AdPlaywireAdapter();
	adapter ??= new AdProperAdapter();

	const settings = toRef(() => pageSettings.value || _defaultSettings);

	const shouldShow = toRef(() => {
		if (areAdsDisabledForDevice) {
			return false;
		}

		if (settings.value.isPageDisabled) {
			return false;
		}

		return true;
	});

	const c = shallowReadonly({
		videoAdapter,
		adapter,
		routeResolved,
		ads,
		pageSettings,
		settings,
		shouldShow,
	});
	provide(AdStoreKey, c);

	if (areAdsDisabledForDevice) {
		return c;
	}

	// We set up events so that we know when a route begins and when the
	// routing is fully resolved.
	const beforeDeregister = useRouter().beforeEach((to, from, next) => {
		// Make sure we only update if the route actually changed,
		// since this gets called even if just a simple hash has
		// changed.
		if (_didRouteChange(from, to)) {
			adapter.onBeforeRouteChange();
			if (adapter !== videoAdapter) {
				videoAdapter.onBeforeRouteChange();
			}
			routeResolved.value = false;
		}
		next();
	});

	const routeAfter$ = onRouteChangeAfter.subscribe(() => {
		if (routeResolved.value) {
			return;
		}

		routeResolved.value = true;
		adapter.onRouteChanged();
		if (adapter !== videoAdapter) {
			videoAdapter.onRouteChanged();
		}
		_displayAds(Array.from(ads.value));
	});

	onUnmounted(() => {
		beforeDeregister();
		routeAfter$.close();
	});

	return c;
}

function _didRouteChange(from: RouteLocationNormalized, to: RouteLocationNormalized) {
	// We don't want to consider a route changing if just the hash changed. This
	// helps with stuff like media bar.
	return (
		from.path !== to.path ||
		!objectEquals(from.params, to.params) ||
		!objectEquals(from.query, to.query)
	);
}

export function useAdStore() {
	return inject(AdStoreKey)!;
}

export function setPageAdsSettings({ pageSettings }: AdStore, container: AdSettingsContainer) {
	pageSettings.value = container;
}

export function releasePageAdsSettings({ pageSettings }: AdStore) {
	pageSettings.value = null;
}

export function chooseAdAdapterForSlot({ videoAdapter, adapter }: AdStore, slot: AdSlot) {
	if (slot.size === 'video') {
		return videoAdapter;
	}
	return adapter;
}

export function addAd(c: AdStore, ad: AdInterface) {
	const { ads, routeResolved } = c;
	ads.value.add(ad);

	// If the route already resolved then this ad was mounted after the
	// fact. We have to call the initial display.
	if (routeResolved.value) {
		_displayAds([ad]);
	}
}

export function removeAd({ ads }: AdStore, ad: AdInterface) {
	ads.value.delete(ad);
}

async function _displayAds(displayedAds: AdInterface[]) {
	for (const ad of displayedAds) {
		ad.display();
	}
}

export async function sendAdBeacon(
	event: AdEvent,
	type: AdType,
	resource?: string,
	resourceId?: number
) {
	let queryString = '';

	// Cache busting.
	queryString += 'cb=' + Date.now();

	if (resource) {
		if (resource === 'Game') {
			queryString += '&resource_type=' + AdResourceType.Game;
			queryString += '&resource_id=' + resourceId;
		} else if (resource === 'User') {
			queryString += '&resource_type=' + AdResourceType.User;
			queryString += '&resource_id=' + resourceId;
		} else if (resource === 'Fireside_Post') {
			queryString += '&resource_type=' + AdResourceType.FiresidePost;
			queryString += '&resource_id=' + resourceId;
		}
	}

	let path = '/adserver';
	if (event === AdEvent.Click) {
		path += '/click';
	} else {
		path += `/log/${type}`;
	}

	if (AdsDisabledDev) {
		logger.info('Sending ad beacon.', { event, type, resource, resourceId });
	}

	// This is enough to send the beacon.
	// No need to add it to the page.
	const img = window.document.createElement('img');
	img.src = `${Environment.apiHost}${path}?${queryString}`;
}
