import { RouteConfig } from 'vue-router';
import { routeDashCommunitiesManageCollaborators } from './collaborators/collaborators.route';
import { routeDashCommunitiesManageDesign } from './design/design.route';
import { routeDashCommunitiesManageDetails } from './details/details.route';
import { routeDashCommunitiesManageOverview } from './overview/overview.route';

export const routeDashCommunitiesManage: RouteConfig = {
	path: ':id(\\d+)',
	component: () => import(/* webpackChunkName: "routeDashCommunitiesManage" */ './manage'),
	children: [
		routeDashCommunitiesManageCollaborators,
		routeDashCommunitiesManageDesign,
		routeDashCommunitiesManageDetails,
		routeDashCommunitiesManageOverview,
	],
};
