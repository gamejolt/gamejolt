import { makeObservableService } from '../../utils/vue';
import { Environment } from '../environment/environment.service';
import { FiresidePost } from '../fireside/post/post-model';
import { Game } from '../game/game.model';
import { User } from '../user/user.model';

type AdControllable = Game | User | FiresidePost;

type ResourceInfo = {
	resource?: AdControllable;
	resourceType: number;
	specificity: number;
};

class AdDisabler {
	constructor(readonly resource?: AdControllable) {}
}

export class Ads {
	static readonly EVENT_VIEW = 'view';
	static readonly EVENT_CLICK = 'click';

	static readonly TYPE_DISPLAY = 'display';
	static readonly TYPE_VIDEO = 'video';

	private static readonly RESOURCE_TYPE_NONE = 1;
	private static readonly RESOURCE_TYPE_GAME = 2;
	private static readonly RESOURCE_TYPE_USER = 3;
	private static readonly RESOURCE_TYPE_FIRESIDE_POST = 4;

	// The possible resource types to send a beacon for, ordered by their specificity.
	// Read comment in sendBeacon for more info.
	private static readonly resourceTypeSpecificity = [
		Ads.RESOURCE_TYPE_NONE,
		Ads.RESOURCE_TYPE_USER,
		Ads.RESOURCE_TYPE_GAME,
		Ads.RESOURCE_TYPE_FIRESIDE_POST,
	];

	private static disablers = new Set<AdDisabler>();

	static registerDisabler(resource?: AdControllable) {
		const disabler = new AdDisabler(resource);

		// Note: equal value disablers will still show up multiple times in the set because
		// sets are doing strict equality checks. This is by design.
		this.disablers.add(disabler);
		return disabler as unknown;
	}

	static deregisterDisabler(disabler: unknown | null) {
		// Tolerate null values because it's a common case for using a non initialized disabler.
		if (disabler === null) {
			return false;
		}

		if (!(disabler instanceof AdDisabler)) {
			console.warn('Attempted to deregister a non AdDisabler.');
			return false;
		}

		return this.disablers.delete(disabler);
	}

	static get shouldShow() {
		if (GJ_IS_CLIENT || GJ_IS_SSR) {
			return false;
		}

		return this.disablers.size === 0;
	}

	private static resourceInfo(disabler: AdDisabler): ResourceInfo {
		let resourceType = -1;
		if (disabler.resource instanceof Game) {
			resourceType = this.RESOURCE_TYPE_GAME;
		} else if (disabler.resource instanceof User) {
			resourceType = this.RESOURCE_TYPE_USER;
		} else if (disabler.resource instanceof FiresidePost) {
			resourceType = this.RESOURCE_TYPE_FIRESIDE_POST;
		}

		return {
			resource: disabler.resource,
			resourceType: resourceType,
			specificity: this.resourceTypeSpecificity.indexOf(resourceType),
		};
	}

	static sendBeacon(event: string, type: string) {
		let queryString = '';

		// Cache busting.
		queryString += 'cb=' + Date.now();

		// The beacon needs to log for the resource that is being monetized for the event.
		// To do this we try looking for the most specific resource that's being viewed.
		// e.g. if we're looking at a game post the most specific resource is a post,
		// if we're looking at a game, the most specific resource is the game and not the dev.
		let beaconInfo: ResourceInfo = null as any;
		const iter = this.disablers.values();
		let v = iter.next();
		while (!v.done) {
			const candidateInfo = this.resourceInfo(v.value);
			if (beaconInfo === null || candidateInfo.specificity > beaconInfo.specificity) {
				beaconInfo = candidateInfo;
			}
			v = iter.next();
		}

		if (
			beaconInfo !== null &&
			beaconInfo.resourceType !== Ads.RESOURCE_TYPE_NONE &&
			beaconInfo.resource
		) {
			// Game posts should always send the beacon for the game they are on.
			if (
				beaconInfo.resource instanceof FiresidePost &&
				beaconInfo.resource.game instanceof Game
			) {
				beaconInfo.resource = beaconInfo.resource.game;
			}
			queryString += `&resource_type=${beaconInfo.resourceType}&resource_id=${beaconInfo.resource.id}`;
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
