import { RouteConfig } from 'vue-router';

export const routeDashCommunitiesManageCollaborators: RouteConfig = {
	name: 'dash.communities.manage.collaborators',
	path: 'collaborators',
	component: () =>
		import(/* webpackChunkName: "routeDashCommunitiesManageCollaborators" */ './collaborators'),
};
