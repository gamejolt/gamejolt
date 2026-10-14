import { RouteLocationNormalized } from 'vue-router';

/**
 * These match the GAM sections that AdBridg set up for us. "other" covers every
 * page that doesn't have a section, and we never allow ads on those.
 */
export type AdPageType =
	| 'homepage'
	| 'store'
	| 'game'
	| 'download'
	| 'community'
	| 'profile'
	| 'discover'
	| 'post'
	| 'realm'
	| 'search'
	| 'other';

/**
 * Everything an ad adapter needs to know about the page the user is currently
 * viewing. A new one is created every time the route changes.
 */
export type AdPageView = {
	pageType: AdPageType;
	loggedIn: boolean;
	allowAds: boolean;
	targetingTags: string[];
};

/**
 * Ordered so that the more specific route name prefixes come first.
 */
const PageTypeRoutePrefixes: [string, AdPageType][] = [
	['home', 'homepage'],
	['discover.home', 'discover'],
	['discover.communities', 'discover'],
	['discover.games.list', 'store'],
	['discover.games.view', 'game'],
	['download', 'download'],
	['communities.view', 'community'],
	['profile.post', 'post'],
	['profile', 'profile'],
	['post', 'post'],
	['realms.view', 'realm'],
	['search', 'search'],
];

export function getAdPageType(route: RouteLocationNormalized): AdPageType {
	const name = typeof route.name === 'string' ? route.name : '';

	for (const [prefix, pageType] of PageTypeRoutePrefixes) {
		if (name === prefix || name.startsWith(`${prefix}.`)) {
			return pageType;
		}
	}

	return 'other';
}
