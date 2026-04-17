import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewEditGames: RouteRecordRaw = {
	name: 'communities.view.edit.games',
	path: 'games',
	component: () =>
		import('~app/views/communities/view/edit/games/RouteCommunitiesViewEditGames.vue'),
};
