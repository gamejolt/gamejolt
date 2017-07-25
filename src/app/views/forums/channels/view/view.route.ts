import VueRouter from 'vue-router';

// For the redirects.
const path = '/community/forums/:slug/';
const name = 'forums.channels.view';

export const routeForumsChannelsView: VueRouter.RouteConfig = {
	name: 'forums.channels.view',
	path: '/f/:name',
	props: true,
	component: () => import(/* webpackChunkName: "routeForumsChannelsView" */ './view'),
	children: [
		{ path: `${path}2`, redirect: { name, params: { name: 'gj-feedback' } } },
		{ path: `${path}7`, redirect: { name, params: { name: 'jams' } } },
		{ path: `${path}1`, redirect: { name, params: { name: 'casual' } } },
		{ path: `${path}3`, redirect: { name, params: { name: 'casual' } } },
		{ path: `${path}4`, redirect: { name, params: { name: 'coding' } } },
		{ path: `${path}5`, redirect: { name, params: { name: 'art' } } },
		{ path: `${path}9`, redirect: { name, params: { name: 'gj-game-api' } } },
	],
};
