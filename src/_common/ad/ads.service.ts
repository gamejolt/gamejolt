import { makeObservableService } from '../../utils/vue';
import { Environment } from '../environment/environment.service';
import { Model } from '../model/model.service';

// To show ads on the page for dev, just change this to false.
export const AdsDisabledDev = GJ_BUILD_TYPE === 'development';
// export const AdsDisabledDev = false;

export class AdSettingsContainer {
	isPageDisabled = false;
	resource: Model | null = null;
}

const defaultSettings = new AdSettingsContainer();

export class Ads {
	static readonly EVENT_VIEW = 'view';
	static readonly EVENT_CLICK = 'click';

	static readonly TYPE_DISPLAY = 'display';
	static readonly TYPE_VIDEO = 'video';

	static readonly RESOURCE_TYPE_NONE = 1;
	static readonly RESOURCE_TYPE_GAME = 2;
	static readonly RESOURCE_TYPE_USER = 3;
	static readonly RESOURCE_TYPE_FIRESIDE_POST = 4;

	static get settings() {
		return this.pageSettings || defaultSettings;
	}

	private static pageSettings: AdSettingsContainer | null = null;

	static get shouldShow() {
		if (GJ_IS_CLIENT || GJ_IS_SSR) {
			return false;
		}

		if (this.settings.isPageDisabled) {
			return false;
		}

		return true;
	}

	static setPageSettings(container: AdSettingsContainer) {
		Ads.pageSettings = container;
	}

	static releasePageSettings() {
		Ads.pageSettings = null;
	}

	static sendBeacon(event: string, type: string, resource?: string, resourceId?: number) {
		let queryString = '';

		// Cache busting.
		queryString += 'cb=' + Date.now();

		if (resource) {
			if (resource === 'Game') {
				queryString += '&resource_type=' + this.RESOURCE_TYPE_GAME;
				queryString += '&resource_id=' + resourceId;
			} else if (resource === 'User') {
				queryString += '&resource_type=' + this.RESOURCE_TYPE_USER;
				queryString += '&resource_id=' + resourceId;
			} else if (resource === 'Fireside_Post') {
				queryString += '&resource_type=' + this.RESOURCE_TYPE_FIRESIDE_POST;
				queryString += '&resource_id=' + resourceId;
			}
		}

		let path = '/adserver';
		if (event === Ads.EVENT_CLICK) {
			path += '/click';
		} else {
			path += `/log/${type}`;
		}

		// This is enough to send the beacon.
		// No need to add it to the page.
		let img = window.document.createElement('img');
		img.src = `${Environment.apiHost}${path}?${queryString}`;
	}
}

makeObservableService(Ads);
