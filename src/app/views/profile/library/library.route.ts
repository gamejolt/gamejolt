import VueRouter from 'vue-router';

export const routeProfileLibrary: VueRouter.RouteConfig = {
	name: 'profile.library',
	path: 'library',
	props: true,
	component: () => import(/* webpackChunkName: "routeProfile" */ './library'),
	children: [
		{
			// This may not work if their username is different than slug.
			path: '/profile/:username/game-library/:id(\\d+)',
			redirect: { name: 'profile.library' },
		},
	],
};
