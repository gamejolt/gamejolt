import { namespace, State, Action, Mutation } from 'vuex-class';
import { VuexModule, VuexMutation, VuexStore } from '../../lib/gj-lib-client/utils/vuex';
import { Translate } from '../../lib/gj-lib-client/components/translate/translate.service';
import { Connection } from '../../lib/gj-lib-client/components/connection/connection-service';
import { Screen } from '../../lib/gj-lib-client/components/screen/screen-service';
import { store } from './index';
import { Analytics } from '../../lib/gj-lib-client/components/analytics/analytics.service';
import { Settings } from '../../_common/settings/settings.service';

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
	onClose?(): void;

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

class MigrationBanner extends Banner {
	get message() {
		return Translate.$gettext(
			`Heads up! Game Jolt will be offline starting Wednesday midnight Eastern Time for an estimated 6 hours while we do some planned migration work.`
		);
	}

	get isActive() {
		if (Screen.isXs) {
			return false;
		}

		return true;
	}
}

@VuexModule()
export class BannerStore extends VuexStore<BannerStore, BannerActions, BannerMutations> {
	banners: Banner[] = [new NotificationsBanner(), new OfflineBanner(), new MigrationBanner()];

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
			if (banner.onClose) {
				banner.onClose();
			}
		}
	}
}
