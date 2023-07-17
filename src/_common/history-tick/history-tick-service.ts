import { getDeviceArch, getDeviceOS, isGoogleBot } from '../device/device.service';
import { Environment } from '../environment/environment.service';
import { PartnerReferral } from '../partner-referral/partner-referral-service';
import { Referrer } from '../referrer/referrer.service';

export interface BeaconOptions {
	sourceResource?: string;
	sourceResourceId?: number;
	key?: string;
	sourceFeed?: string;
}

export class HistoryTick {
	private static _sources: Record<string, string | undefined> = {};

	/**
	 * You can track a source for a particular parent resource.
	 * For example, tracking the current referrer for a Game and then any time
	 * you log a tick for a type within that Game (game-build, game-news, etc)
	 * it will pull the source referrer into the tick.
	 *
	 * Note that we only log the first referrer for a particular resource.
	 * If you get to this resource through different means we'll still just
	 * track the initial way of getting there.
	 */
	static trackSource(resource: string, resourceId: number) {
		// Look specifically for undefined and not just null.
		// There may have been a null referrer if we got here through a direct page hit.
		if (typeof this._sources[resource + ':' + resourceId] === 'undefined') {
			this._sources[resource + ':' + resourceId] = Referrer.referrer;
		}
	}

	static getSource(resource: string, resourceId: number) {
		return this._sources[resource + ':' + resourceId];
	}

	static sendBeacon(type: string, resourceId?: number, options: BeaconOptions = {}) {
		if (import.meta.env.SSR || isGoogleBot()) {
			return;
		}

		return new Promise(resolve => {
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
				const source = this.getSource(options.sourceResource, options.sourceResourceId);
				if (source) {
					queryParams.push('source=' + source);
				}

				const ref = PartnerReferral.getReferrer(
					options.sourceResource,
					options.sourceResourceId
				);
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
				delete img.onload;
				delete img.onerror;
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
}
