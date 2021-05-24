import { Route } from 'vue-router';

export type AppPromotionSource = 'footer' | 'top-nav' | 'top-nav-mobile' | 'sidebar' | 'landing';

// We currently are trying to show it in as many places as possible.
export function shouldShowAppPromotion(_route: Route) {
	return !GJ_IS_CLIENT;
}
