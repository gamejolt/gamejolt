import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageCollaborators: RouteRecordRaw = {
	name: 'dash.games.manage.collaborators',
	path: 'collaborators',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageCollaborators" */ './collaborators.vue'),
};
