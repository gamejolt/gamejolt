import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditChannelsList: RouteConfig = {
	name: 'communities.view.edit.channels.list',
	path: '/c/:path/edit/:id(\\d+)/channels',
	component: () => import(/* webpackChunkName: "routeCommunitiesViewEdit" */ './list.vue'),
};
