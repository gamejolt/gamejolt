import { RouteConfig } from 'vue-router';

export const routeDashCommunitiesManageDetails: RouteConfig = {
	name: 'dash.communities.manage.details',
	path: 'details',
	component: () =>
		import(/* webpackChunkName: "routeDashCommunitiesManageDetails" */ './details'),
	children: [
		{
			path: '/dashboard/communities/details/:id(\\d+)',
			redirect: { name: 'dash.communities.manage.details' },
		},
	],
};
