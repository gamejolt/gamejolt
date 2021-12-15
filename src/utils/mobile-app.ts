import { Route } from 'vue-router';

export type AppPromotionSource =
	| 'footer'
	| 'top-nav'
	| 'top-nav-options'
	| 'sidebar'
	| 'landing'
	| 'home-hero';
export type AppPromotionCohort = 'store' | 'community';

export const AppPromotionStoreKey = Symbol();

export function shouldShowAppPromotion(route: Route) {
	if (GJ_IS_CLIENT) {
		return false;
	}

	const name = route.name ?? '';
	return (
		name.startsWith('communities.') ||
		name === 'home' ||
		name === 'discover.home' ||
		name === 'discover.communities' ||
		name === 'post'
	);
}

const storageKey = 'app-promotion-cohort';

export class AppPromotionStore {
	cohort: AppPromotionCohort | null = !GJ_IS_SSR
		? (sessionStorage.getItem(storageKey) as AppPromotionCohort | null)
		: null;

	get appStoreUrl(): string {
		return 'https://testflight.apple.com/join/JdCeNWsX';
	}

	get playStoreUrl(): string {
		const params = [] as string[];

		params.push(`ac=${this.cohort ?? 'other'}`);

		const storeUrl = encodeURIComponent(
			'https://play.google.com/store/apps/details?id=com.gamejolt.app&utm_source=site&utm_campaign=landing'
		);

		return (
			'https://app.gamejolt.com/?' +
			[
				'link=' + encodeURIComponent('https://gamejolt.com/x/deep/?' + params.join('&')),
				'apn=com.gamejolt.app',
				'afl=' + storeUrl,
				'ifl=' + storeUrl,
				'ibi=' + 'com.gamejolt.op',
				'ofl=' + storeUrl,
				'utm_source=site',
				'utm_campaign=landing',
				'amv=44',
				'imv=44',
			].join('&')
		);
	}
}

export function setAppPromotionCohort(store: AppPromotionStore, cohort: AppPromotionCohort) {
	// 'store' cohort takes precedence.
	if (store.cohort == 'store') {
		return;
	}

	store.cohort = cohort;

	if (!GJ_IS_SSR) {
		sessionStorage.setItem(storageKey, cohort);
	}
}
