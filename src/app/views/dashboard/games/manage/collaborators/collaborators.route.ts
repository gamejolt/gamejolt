import { RouteConfig } from 'vue-router';

export const routeDashGamesManageCollaborators: RouteConfig = {
	name: 'dash.games.manage.collaborators',
	path: 'collaborators',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageCollaborators" */ './collaborators.vue'),
};
