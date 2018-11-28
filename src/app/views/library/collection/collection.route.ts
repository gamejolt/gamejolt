import { RouteConfig } from 'vue-router';

const routes: Array<[string, string]> = [
	['playlist', '/playlist/:slug/:id(\\d+)'],
	['followed', '/@:id/followed'],
	['developer', '/@:id/games'],
	['owned', '/@:id/owned'],
	['recommended', '/@:id/recommended'],
	['bundle', '/library/bundle/:slug/:id(\\d+)/games'],
	['jam', '/jam/:id/games'],
];

export const routeLibraryCollectionRoutes: RouteConfig[] = routes.map(route => {
	return {
		name: `library.collection.${route[0]}`,
		path: route[1],
		component: () => import(/* webpackChunkName: "routeLibrary" */ './collection'),
		meta: {
			collectionType: route[0],
		},
	};
});
