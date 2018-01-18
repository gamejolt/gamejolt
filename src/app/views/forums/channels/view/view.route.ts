import { RouteConfig } from 'vue-router';

// For the redirects.
const path = '/community/forums/:slug/';
const name = 'forums.channels.view';

export const routeForumsChannelsView: RouteConfig = {
	name: 'forums.channels.view',
	path: '/f/:name/:sort(active|new|top|archived)?',
	props: true,
	component: () => import(/* webpackChunkName: "routeForumsChannelsView" */ './view'),
	children: [
		{ path: `${path}2`, redirect: { name, params: { name: 'gj-feedback', sort: 'active' } } },
		{ path: `${path}7`, redirect: { name, params: { name: 'jams', sort: 'active' } } },
		{ path: `${path}1`, redirect: { name, params: { name: 'casual', sort: 'active' } } },
		{ path: `${path}3`, redirect: { name, params: { name: 'casual', sort: 'active' } } },
		{ path: `${path}4`, redirect: { name, params: { name: 'coding', sort: 'active' } } },
		{ path: `${path}5`, redirect: { name, params: { name: 'art', sort: 'active' } } },
		{ path: `${path}9`, redirect: { name, params: { name: 'gj-game-api', sort: 'active' } } },
	],
};
