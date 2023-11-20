import { inject, InjectionKey, onUnmounted, provide, reactive } from 'vue';
import { RouteLocationNormalized, useRouter } from 'vue-router';
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

export const AdsControllerKey: InjectionKey<AdsController> = Symbol('ads');

// To show ads on the page for dev, just change this to false.
export const AdsDisabledDev = GJ_BUILD_TYPE === 'serve-hmr' || GJ_BUILD_TYPE === 'serve-build';
// export const AdsDisabledDev = false;

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

export const AdEventView = 'view';
export const AdEventClick = 'click';

export const AdTypeDisplay = 'display';
export const AdTypeVideo = 'video';

export const AdResourceTypeNone = 1;
export const AdResourceTypeGame = 2;
export const AdResourceTypeUser = 3;
export const AdResourceTypeFiresidePost = 4;

const defaultSettings = new AdSettingsContainer();

function _didRouteChange(from: RouteLocationNormalized, to: RouteLocationNormalized) {
	// We don't want to consider a route changing if just the hash changed. This
	// helps with stuff like media bar.
	return (
		from.path !== to.path ||
		!objectEquals(from.params, to.params) ||
		!objectEquals(from.query, to.query)
	);
}

class AdsController {
	// videoAdapter: AdAdapter = new AdEnthusiastAdapter();
	// adapter: AdAdapter = new AdEnthusiastAdapter();
	readonly videoAdapter: AdAdapter;
	readonly adapter: AdAdapter;

	routeResolved = false;
	ads = new Set<AdInterface>();
	pageSettings: AdSettingsContainer | null = null;

	constructor() {
		if (!import.meta.env.SSR) {
			if (isAdEnthused) {
				this.videoAdapter = new AdEnthusiastAdapter();
				this.adapter = new AdEnthusiastAdapter();
			}
		}

		this.videoAdapter ??= new AdPlaywireAdapter();
		this.adapter ??= new AdProperAdapter();
	}

	get settings() {
		return this.pageSettings || defaultSettings;
	}

	get shouldShow() {
		if (areAdsDisabledForDevice) {
			return false;
		}

		if (this.settings.isPageDisabled) {
			return false;
		}

		return true;
	}
}

export function createAdsController() {
	const c = reactive(new AdsController()) as AdsController;
	provide(AdsControllerKey, c);

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
			c.adapter.onBeforeRouteChange();
			c.videoAdapter.onBeforeRouteChange();
			c.routeResolved = false;
		}
		next();
	});

	const routeAfter$ = onRouteChangeAfter.subscribe(() => {
		if (c.routeResolved) {
			return;
		}

		c.routeResolved = true;
		c.adapter.onRouteChanged();
		c.videoAdapter.onRouteChanged();
		_displayAds(Array.from(c.ads));
	});

	onUnmounted(() => {
		beforeDeregister();
		routeAfter$.close();
	});

	return c;
}

export function useAdsController() {
	return inject(AdsControllerKey)!;
}

export function setPageAdsSettings(c: AdsController, container: AdSettingsContainer) {
	c.pageSettings = container;
}

export function releasePageAdsSettings(c: AdsController) {
	c.pageSettings = null;
}

export function chooseAdAdapterForSlot(c: AdsController, slot: AdSlot) {
	if (slot.size === 'video') {
		return c.videoAdapter;
	}
	return c.adapter;
}

export function addAd(c: AdsController, ad: AdInterface) {
	c.ads.add(ad);

	// If the route already resolved then this ad was mounted after the
	// fact. We have to call the initial display.
	if (c.routeResolved) {
		_displayAds([ad]);
	}
}

export function removeAd(c: AdsController, ad: AdInterface) {
	c.ads.delete(ad);
}

async function _displayAds(ads: AdInterface[]) {
	for (const ad of ads) {
		ad.display();
	}
}

export async function sendAdBeacon(
	event: string,
	type: string,
	resource?: string,
	resourceId?: number
) {
	let queryString = '';

	// Cache busting.
	queryString += 'cb=' + Date.now();

	if (resource) {
		if (resource === 'Game') {
			queryString += '&resource_type=' + AdResourceTypeGame;
			queryString += '&resource_id=' + resourceId;
		} else if (resource === 'User') {
			queryString += '&resource_type=' + AdResourceTypeUser;
			queryString += '&resource_id=' + resourceId;
		} else if (resource === 'Fireside_Post') {
			queryString += '&resource_type=' + AdResourceTypeFiresidePost;
			queryString += '&resource_id=' + resourceId;
		}
	}

	let path = '/adserver';
	if (event === AdEventClick) {
		path += '/click';
	} else {
		path += `/log/${type}`;
	}

	if (AdsDisabledDev) {
		console.log('Sending ad beacon.', { event, type, resource, resourceId });
	}

	// This is enough to send the beacon.
	// No need to add it to the page.
	const img = window.document.createElement('img');
	img.src = `${Environment.apiHost}${path}?${queryString}`;
}
