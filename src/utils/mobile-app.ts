import { Route } from 'vue-router';

export type AppPromotionSource = 'footer' | 'top-nav' | 'top-nav-mobile' | 'sidebar' | 'landing';

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
