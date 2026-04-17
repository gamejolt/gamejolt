import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageGameDescription: RouteRecordRaw = {
	name: 'dash.games.manage.game.description',
	path: 'description',
	component: () =>
		import(
			'~app/views/dashboard/games/manage/game/description/RouteDashGamesManageGameDescription.vue'
		),
	children: [
		{
			path: '/dashboard/developer/games/description/:id(\\d+)',
			redirect: { name: 'dash.games.manage.game.description' },
		},
	],
};
