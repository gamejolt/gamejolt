import { RouteConfig } from 'vue-router';

export const routeDashCommunitiesAdd: RouteConfig = {
	name: 'dash.communities.add',
	path: 'add',
	component: () => import(/* webpackChunkName: "routeDashCommunitiesAdd" */ './add'),
	children: [
		{
			path: '/dashboard/developer/communities/add',
			redirect: { name: 'dash.communities.add' },
		},
	],
};
