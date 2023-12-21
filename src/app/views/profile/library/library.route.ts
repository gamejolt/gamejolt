import { RouteRecordRaw } from 'vue-router';

export const routeProfileLibrary: RouteRecordRaw = {
	name: 'profile.library',
	path: 'library',
	redirect: {
		name: 'profile.overview',
	},
	children: [
		{
			// This may not work if their username is different than slug.
			path: '/profile/:username/game-library/:id(\\d+)',
			redirect: {
				name: 'profile.overview',
			},
		},
	],
};
