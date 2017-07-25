import VueRouter from 'vue-router';

const routes: Array<[string, string]> = [
	['playlist', '/playlist/:slug/:id(\\d+)'],
	['followed', '/@:id/followed'],
	['developer', '/@:id/games'],
	['owned', '/@:id/owned'],
	['recommended', '/@:id/recommended'],
	['bundle', '/library/bundle/:slug/:id(\\d+)/games'],
	['tag', '/tag/:id'],
];

export const routeLibraryCollectionRoutes: VueRouter.RouteConfig[] = routes.map(route => {
	return {
		name: `library.collection.${route[0]}`,
		path: route[1],
		props: true,
		component: () => import(/* webpackChunkName: "routeLibraryCollectionRoutes" */ './collection'),
		meta: {
			collectionType: route[0],
		},
	};
});
