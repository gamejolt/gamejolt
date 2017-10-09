import VueRouter from 'vue-router';

export const routeDashGamesManageCollaboratorsList: VueRouter.RouteConfig = {
	name: 'dash.games.manage.collaborators.list',
	path: 'collaborators',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageCollaboratorsList" */ './list'),
};
