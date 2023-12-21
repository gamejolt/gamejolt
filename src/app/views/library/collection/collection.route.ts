import { RouteRecordRaw } from 'vue-router';

const routes: Array<[string, string]> = [
	['playlist', '/playlist/:slug/:id(\\d+)'],
	['followed', '/@:id/followed'],
	['developer', '/@:id/games'],
	['owned', '/@:id/owned'],
	['recommended', '/@:id/recommended'],
	['bundle', '/library/bundle/:slug/:id(\\d+)/games'],
];

// TODO(profile-scrunch) This route doesn't get properly rebuilt when going
// between these mapped routes. You can replicate this by viewing your games,
// opening the cbar, and viewing a different route. Seems like it still shows
// the original route, even though the url changes.
export const routeLibraryCollectionRoutes: RouteRecordRaw[] = routes.map(route => {
	return {
		name: `library.collection.${route[0]}`,
		path: route[1],
		component: () => import('./collection.vue'),
		meta: {
			collectionType: route[0],
		},
	};
});
