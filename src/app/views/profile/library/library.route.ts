import { RouteConfig } from 'vue-router';

export const routeProfileLibrary: RouteConfig = {
	name: 'profile.library',
	path: 'library',
	component: () => import(/* webpackChunkName: "routeProfileLibrary" */ './library.vue'),
	children: [
		{
			// This may not work if their username is different than slug.
			path: '/profile/:username/game-library/:id(\\d+)',
			redirect: { name: 'profile.library' },
		},
	],
};
