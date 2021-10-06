import { RouteConfig } from 'vue-router';

/**
 * Defunct videos route, redirects to profile overview.
 * Was made obsolete on Apr 21st, 2021, and can be fully removed
 * after some time has passed.
 */
export const routeProfileVideos: RouteConfig = {
	name: 'profile.videos',
	path: 'videos',
	redirect: { name: 'profile.overview' },
};
