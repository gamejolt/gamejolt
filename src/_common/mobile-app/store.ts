import { InjectionKey, inject, provide, ref } from 'vue';
import { UserModel } from '../user/user.model';

export type AppPromotionSource =
	| 'footer'
	| 'top-nav'
	| 'top-nav-options'
	| 'sidebar'
	| 'landing'
	| 'home-hero'
	| 'banner';

export type AppPromotionCohort = 'store' | 'community';

export const AppPromotionStoreKey: InjectionKey<AppPromotionStore> = Symbol('app-promotion-store');

export type AppPromotionStore = ReturnType<typeof createAppPromotionStore>;

export function useAppPromotionStore() {
	return inject(AppPromotionStoreKey)!;
}

export function createAppPromotionStore() {
	const cohort = ref<AppPromotionCohort | null>(
		!import.meta.env.SSR
			? (sessionStorage.getItem(storageKey) as AppPromotionCohort | null)
			: null
	);

	const context = ref<UserModel>();

	const c = {
		cohort,
		context,
	};

	provide(AppPromotionStoreKey, c);
	return c;
}

const storageKey = 'app-promotion-cohort';
const appStoreUrl = 'https://apps.apple.com/us/app/game-jolt-social/id1546759412';
const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.gamejolt.app';

function _getDeepLink({ cohort }: AppPromotionStore) {
	const params = [] as string[];
	params.push(`ac=${cohort.value ?? 'other'}`);

	return 'https://gamejolt.com/x/deep/?' + params.join('&');
}

export function setAppPromotionCohort(
	{ cohort }: AppPromotionStore,
	newCohort: AppPromotionCohort
) {
	// 'store' cohort takes precedence.
	if (cohort.value == 'store') {
		return;
	}

	cohort.value = newCohort;

	if (!import.meta.env.SSR) {
		sessionStorage.setItem(storageKey, newCohort);
	}
}

export function getAppUrl(
	store: AppPromotionStore,
	{ targetStore }: { targetStore?: 'play' | 'app' } = {}
) {
	let desktopLink = 'https://gamejolt.com/app';
	if (targetStore === 'play') {
		desktopLink = playStoreUrl;
	} else if (targetStore === 'app') {
		desktopLink = appStoreUrl;
	}

	return (
		'https://app.gamejolt.com/?' +
		[
			'link=' + encodeURIComponent(_getDeepLink(store)),
			'ofl=' + encodeURIComponent(desktopLink),
			'apn=com.gamejolt.app',
			'isi=1546759412',
			'ibi=com.gamejolt.op',
			'utm_source=site',
			'utm_campaign=landing',
		].join('&')
	);
}
