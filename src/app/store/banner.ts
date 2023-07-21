import { computed, inject, InjectionKey, ref, Ref, unref, watch } from 'vue';
import { Router } from 'vue-router';
import { Analytics } from '../../_common/analytics/analytics.service';
import { Connection } from '../../_common/connection/connection-service';
import { isDynamicGoogleBot } from '../../_common/device/device.service';
import { Screen } from '../../_common/screen/screen-service';
import { SettingFeedNotifications } from '../../_common/settings/settings.service';
import { CommonStore } from '../../_common/store/common-store';
import { $gettext } from '../../_common/translate/translate.service';

export const BannerStoreKey: InjectionKey<BannerStore> = Symbol('banner-store');

export type BannerStore = ReturnType<typeof createBannerStore>;

export function useBannerStore() {
	return inject(BannerStoreKey)!;
}

export function createBannerStore({
	commonStore,
	router,
}: {
	commonStore: CommonStore;
	router: Router;
}) {
	const banners = ref([
		_createBanner({
			message: computed(() =>
				$gettext(
					`Game Jolt needs your permission to <em>enable desktop notifications</em>.`
				)
			),
			isActive: computed(() => {
				if (
					import.meta.env.SSR ||
					GJ_IS_DESKTOP_APP ||
					Screen.isXs ||
					isDynamicGoogleBot()
				) {
					return false;
				}

				const route = router.currentRoute.value;

				return !!(
					commonStore.user.value &&
					(route.name === 'home' || route.name === 'notifications') &&
					'Notification' in window &&
					(Notification as any).permission === 'default' &&
					SettingFeedNotifications.get()
				);
			}),
			async onClick() {
				Analytics.trackEvent('notifications', 'request');

				const result = await Notification.requestPermission();
				if (result === 'denied') {
					Analytics.trackEvent('notifications', 'denied');
					SettingFeedNotifications.set(false);
				} else if (result === 'default') {
					Analytics.trackEvent('notifications', 'accepted');
					SettingFeedNotifications.set(true);
					return;
				}
			},
			onClose() {
				SettingFeedNotifications.set(false);
			},
		}),

		_createBanner({
			type: 'error',
			message: computed(() => $gettext(`We're having trouble connecting to Game Jolt.`)),
			isActive: computed(() => Connection.isOffline),
		}),
	]);

	const currentBanner = computed(() => banners.value.find(i => i.isActive && !i.isClosed));
	const hasBanner = computed(() => !!currentBanner.value);

	function clickBanner() {
		const banner = currentBanner.value;
		if (banner?.onClick) {
			banner.isClosed = true;
			banner.onClick();
		}
	}

	function closeBanner() {
		const banner = currentBanner.value;
		if (banner) {
			banner.isClosed = true;
			banner.onClose?.();
		}
	}

	return {
		banners,
		hasBanner,
		currentBanner,
		clickBanner,
		closeBanner,
	};
}

function _createBanner({
	type = 'info',
	message,
	isActive,
	onClick,
	onClose,
}: {
	type?: string;
	message: Ref<string>;
	isActive: Ref<boolean>;

	onClick?(): void;
	onClose?(): void;
}) {
	const isClosed = ref(false);

	// Not actually reactive to anything, but returning as a Ref keeps things
	// simple.
	const canClick = computed(() => !!onClick);

	// When they close the banner, if it deactivates we want to reset the
	// isClosed state. That will allow it to show again when it becomes active
	// again. For example, showing that they're offline, they close, then if
	// they go online and offline again, we want to show again.
	watch(
		() => unref(isActive),
		isActive => {
			if (!isActive) {
				isClosed.value = false;
			}
		}
	);

	return {
		type,
		message,
		isActive,
		isClosed,
		canClick,
		onClick,
		onClose,
	};
}
