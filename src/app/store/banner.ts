import { namespace } from 'vuex-class';
import { Analytics } from '../../lib/gj-lib-client/components/analytics/analytics.service';
import { Connection } from '../../lib/gj-lib-client/components/connection/connection-service';
import { Screen } from '../../lib/gj-lib-client/components/screen/screen-service';
import { Translate } from '../../lib/gj-lib-client/components/translate/translate.service';
import { VuexModule, VuexMutation, VuexStore } from '../../lib/gj-lib-client/utils/vuex';
import { Settings } from '../../_common/settings/settings.service';
import { store } from './index';

export const BannerStoreNamespace = 'banner';
export const BannerModule = namespace(BannerStoreNamespace);

export type BannerActions = {};

export type BannerMutations = {
	'banner/clickBanner': void;
	'banner/closeBanner': void;
};

abstract class Banner {
	abstract message: string;
	abstract isActive: boolean;

	type = 'info';
	isClosed = false;

	onClick?(): void;
	onClose?(): void;

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
		return !!(
			store &&
			store.state.app.user &&
			store.state.route.name &&
			(store.state.route.name === 'home' || store.state.route.name === 'notifications') &&
			'Notification' in window &&
			(Notification as any).permission === 'default' &&
			Settings.get('feed-notifications')
		);
	}

	async onClick() {
		Analytics.trackEvent('notifications', 'request');

		const result = await Notification.requestPermission();
		if (result === 'denied') {
			Analytics.trackEvent('notifications', 'denied');
			Settings.set('feed-notifications', false);
		} else if (result === 'default') {
			Analytics.trackEvent('notifications', 'accepted');
			Settings.set('feed-notifications', true);
			return;
		}
	}

	onClose() {
		Settings.set('feed-notifications', false);
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

// class TermsChangeBanner extends Banner {
// 	readonly StorageKey = 'banner:terms-change-05232018';

// 	get message() {
// 		return Translate.$gettext(`Game Jolt has a new Privacy Policy. <em>Learn More</em>`);
// 	}

// 	get isActive() {
// 		if (GJ_IS_SSR) {
// 			return false;
// 		}

// 		return !window.localStorage.getItem(this.StorageKey);
// 	}

// 	async onClick() {
// 		router.push({ name: 'legal.privacy' });
// 		window.localStorage.setItem(this.StorageKey, Date.now() + '');
// 	}

// 	onClose() {
// 		window.localStorage.setItem(this.StorageKey, Date.now() + '');
// 	}
// }

@VuexModule()
export class BannerStore extends VuexStore<BannerStore, BannerActions, BannerMutations> {
	banners: Banner[] = [new NotificationsBanner(), new OfflineBanner()];

	get hasBanner() {
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
			if (banner.onClose) {
				banner.onClose();
			}
		}
	}
}
