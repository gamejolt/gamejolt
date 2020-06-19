import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditChannels: RouteConfig = {
	name: 'communities.view.edit.channels',
	path: 'channels',
	component: () => import(/* webpackChunkName: "routeCommunitiesViewEdit" */ './channels.vue'),
};
