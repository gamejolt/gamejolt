import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeProfileLibrary: VueRouter.RouteConfig = {
	name: 'profile.library',
	path: 'library',
	props: true,
	component: () => asyncComponentLoader(import('./library')),
	children: [
		{
			// This may not work if their username is different than slug.
			path: '/profile/:username/game-library/:id(\\d+)',
			redirect: { name: 'profile.library' },
		},
	],
};
