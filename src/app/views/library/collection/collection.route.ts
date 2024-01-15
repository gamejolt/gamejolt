import { RouteRecordRaw } from 'vue-router';

const routes: Array<[string, string]> = [
	['playlist', '/playlist/:slug/:id(\\d+)'],
	['followed', '/@:id/followed'],
	['developer', '/@:id/games'],
	['owned', '/@:id/owned'],
	['recommended', '/@:id/recommended'],
	['bundle', '/library/bundle/:slug/:id(\\d+)/games'],
];

export const routeLibraryCollectionRoutes: RouteRecordRaw[] = routes.map(route => {
	return {
		name: `library.collection.${route[0]}`,
		path: route[1],
		component: () => import('./RouteLibraryCollection.vue'),
		meta: {
			collectionType: route[0],
		},
	};
});
