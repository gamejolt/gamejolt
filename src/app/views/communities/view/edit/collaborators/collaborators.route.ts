import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditCollaborators: RouteConfig = {
	name: 'communities.view.edit.collaborators',
	path: 'collaborators',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewEditCollaborators" */ './collaborators.vue'),
};
