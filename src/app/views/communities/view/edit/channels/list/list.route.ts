import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditChannelsList: RouteConfig = {
	name: 'communities.view.edit.channels.list',
	path: '',
	component: () => import(/* webpackChunkName: "routeCommunitiesViewEdit" */ './list.vue'),
};
