import { RouteConfig } from 'vue-router';
import { routeCommunitiesViewEditCollaborators } from './collaborators/collaborators.route';
import { routeCommunitiesViewEditTags } from './tags/tags.route';

export const routeCommunitiesViewEdit: RouteConfig = {
	name: 'communities.view.edit',
	path: '/c/:path/edit/:id(\\d+)',
	component: () => import(/* webpackChunkName: "routeCommunitiesViewEdit" */ './edit.vue'),
	children: [routeCommunitiesViewEditTags, routeCommunitiesViewEditCollaborators],
};
