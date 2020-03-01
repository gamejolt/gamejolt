import { installVuePlugin } from '../../utils/vue';
import { Environment } from '../environment/environment.service';
import { EventBus } from '../event-bus/event-bus.service';
import { Model } from '../model/model.service';
import { AdPlaywireAdapter } from './playwire/playwire-adapter';
import AppAdWidgetInner from './widget/inner';

declare module 'vue/types/vue' {
	interface Vue {
		$ad: AdStore;
	}
}

// To show ads on the page for dev, just change this to false.
// export const AdsDisabledDev = GJ_BUILD_TYPE === 'development';
export const AdsDisabledDev = false;

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

export class AdStore {
	adapter = new AdPlaywireAdapter();

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
				vm.$router.beforeEach((_to, _from, next) => {
					this.routeResolved = false;
					next();
				});

				EventBus.on('routeChangeAfter', () => {
					this.routeResolved = true;
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
