import { RouteLocationNormalized } from 'vue-router';
import { objectEquals } from '../../utils/object';
import { installVuePlugin } from '../../utils/vue';
import { Environment } from '../environment/environment.service';
import { Model } from '../model/model.service';
import { onRouteChangeAfter } from '../route/route-component';
import { AdSlot } from './ad-slot-info';
import { AdAdapterBase } from './adapter-base';
import { AdPlaywireAdapter } from './playwire/playwire-adapter';
import { AdProperAdapter } from './proper/proper-adapter';
import AppAdWidgetInner from './widget/inner';

// TODO(vue3)
declare module 'vue/types/vue' {
	interface Vue {
		$ad: AdStore;
	}
}

// To show ads on the page for dev, just change this to false.
export const AdsDisabledDev = GJ_BUILD_TYPE === 'development';
// export const AdsDisabledDev = false;

/**
 * Whether or not we want to have click tracking enabled. It is not very
 * performant, so we should only turn on when needed.
 */
const ClickTrackingEnabled = false;

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

type AdComponent = AppAdWidgetInner;

/**
 * Inclusive of min and exclusive of max.
 */
function getRandom(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

function chooseAdapter() {
	const adapters = [AdProperAdapter];
	return adapters[getRandom(0, adapters.length)];
}

function didRouteChange(from: RouteLocationNormalized, to: RouteLocationNormalized) {
	// We don't want to consider a route changing if just the hash changed. This
	// helps with stuff like media bar.
	return (
		from.path !== to.path ||
		!objectEquals(from.params, to.params) ||
		!objectEquals(from.query, to.query)
	);
}

export class AdStore {
	private videoAdapter = new AdPlaywireAdapter();
	private adapter = new (chooseAdapter())() as AdAdapterBase;

	private routeResolved = false;
	private ads: Set<AdComponent> = new Set();
	private pageSettings: AdSettingsContainer | null = null;
	private clickTrackerBootstrapped = false;
	private clickTrackers: Map<Element, Function> = new Map();
	private focusedElem: Element | null = null;

	static install() {
		installVuePlugin('$ad', this, {
			mounted(vm) {
				if (GJ_IS_CLIENT || GJ_IS_SSR || AdsDisabledDev) {
					return;
				}

				// We set up events so that we know when a route begins and when the
				// routing is fully resolved.
				vm.$router.beforeEach((to, from, next) => {
					// Make sure we only update if the route actually changed,
					// since this gets called even if just a simple hash has
					// changed.
					if (didRouteChange(from, to)) {
						this.adapter.onBeforeRouteChange();
						this.routeResolved = false;
					}
					next();
				});

				onRouteChangeAfter.subscribe(() => {
					if (this.routeResolved) {
						return;
					}

					this.routeResolved = true;
					this.adapter.onRouteChanged();
					this.displayAds(Array.from(this.ads));
				});
			},
		});
	}

	get settings() {
		return this.pageSettings || defaultSettings;
	}

	get shouldShow() {
		if (GJ_IS_CLIENT || GJ_IS_SSR) {
			return false;
		}

		if (this.settings.isPageDisabled) {
			return false;
		}

		return true;
	}

	setPageSettings(container: AdSettingsContainer) {
		this.pageSettings = container;
	}

	releasePageSettings() {
		this.pageSettings = null;
	}

	chooseAdapterForSlot(slot: AdSlot) {
		if (slot.size === 'video') {
			return this.videoAdapter;
		}
		return this.adapter;
	}

	/**
	 * Should only be used for testing!
	 */
	overrideAdapter(adapter: AdAdapterBase) {
		this.adapter = adapter;
	}

	addAd(ad: AdComponent) {
		this.ads.add(ad);

		// If the route already resolved then this ad was mounted after the
		// fact. We have to call the initial display.
		if (this.routeResolved) {
			this.displayAds([ad]);
		}
	}

	removeAd(ad: AdComponent) {
		this.ads.delete(ad);
	}

	private async displayAds(ads: AdComponent[]) {
		for (const ad of ads) {
			ad.display();
		}
	}

	async sendBeacon(event: string, type: string, resource?: string, resourceId?: number) {
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

		if (GJ_BUILD_TYPE === 'development') {
			console.log('Sending ad beacon.', { event, type, resource, resourceId });
		}

		// This is enough to send the beacon.
		// No need to add it to the page.
		const img = window.document.createElement('img');
		img.src = `${Environment.apiHost}${path}?${queryString}`;
	}

	addClickTracker(elem: Element, cb: () => void) {
		if (!ClickTrackingEnabled) {
			return;
		}

		this.clickTrackers.set(elem, cb);
		if (this.shouldShow) {
			this.initClickTracking();
		}
	}

	removeClickTracker(elem: Element) {
		if (!ClickTrackingEnabled) {
			return;
		}

		this.clickTrackers.delete(elem);
	}

	private initClickTracking() {
		if (this.clickTrackerBootstrapped) {
			return;
		}

		this.clickTrackerBootstrapped = true;

		// Checking the active element in an interval seems to be the only way
		// of tracking clicks.
		setInterval(() => {
			if (document.activeElement === this.focusedElem) {
				return;
			}

			this.focusedElem = document.activeElement;
			this.clickTrackers.forEach((cb, adElem) => {
				if (this.focusedElem && adElem.contains(this.focusedElem)) {
					cb();
				}
			});
		}, 1000);
	}
}
