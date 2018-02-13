import { namespace, State, Action, Mutation } from 'vuex-class';
import { VuexModule, VuexMutation, VuexStore } from '../../lib/gj-lib-client/utils/vuex';
import { Translate } from '../../lib/gj-lib-client/components/translate/translate.service';
import { Connection } from '../../lib/gj-lib-client/components/connection/connection-service';
import { Screen } from '../../lib/gj-lib-client/components/screen/screen-service';
import { store } from './index';

export const BannerStoreNamespace = 'banner';
export const BannerState = namespace(BannerStoreNamespace, State);
export const BannerAction = namespace(BannerStoreNamespace, Action);
export const BannerMutation = namespace(BannerStoreNamespace, Mutation);

export type BannerActions = {};

export type BannerMutations = {
	'banner/clickBanner': void;
	'banner/closeBanner': void;
};

abstract class Banner {
	abstract message: string;
	abstract isActive: boolean;
	onClick?(): void;

	type: string = 'info';
	isClosed = false;

	get canClick() {
		return !!this.onClick;
	}
}

class NotificationsBanner extends Banner {
	get message() {
		return Translate.$gettext(
			`Game Jolt needs your permission to <em>enable desktop notifications</em>.`
		);
	}

	get isActive() {
		if (Screen.isXs || GJ_IS_SSR || GJ_IS_CLIENT) {
			return false;
		}

		// "store" is a circular dependency, so make sure it exists.
		return (
			store &&
			store.state.route.name === 'activity' &&
			'Notification' in window &&
			(Notification as any).permission === 'default'
		);
	}

	onClick() {
		Notification.requestPermission();
	}
}

class OfflineBanner extends Banner {
	type = 'error';

	get message() {
		return Translate.$gettext(`We're having trouble connecting to Game Jolt.`);
	}

	get isActive() {
		const isOffline = Connection.isOffline;

		// Always reset the closed state when we switch back online. This way the banner will show
		// again if they go offline again.
		if (!isOffline) {
			this.isClosed = false;
		}

		return isOffline;
	}
}

@VuexModule()
export class BannerStore extends VuexStore<BannerStore, BannerActions, BannerMutations> {
	banners: Banner[] = [new NotificationsBanner(), new OfflineBanner()];

	get shouldShowBanner() {
		return !!this.currentBanner;
	}

	get currentBanner() {
		return this.banners.find(i => i.isActive && !i.isClosed);
	}

	@VuexMutation
	clickBanner() {
		const banner = this.currentBanner;
		if (banner && banner.onClick) {
			banner.isClosed = true;
			banner.onClick();
		}
	}

	@VuexMutation
	closeBanner() {
		const banner = this.currentBanner;
		if (banner) {
			banner.isClosed = true;
		}
	}
}
