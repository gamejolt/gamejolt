import { RouteRecordRaw } from 'vue-router';
import { routeForumsChannelsView } from './channels/view/view.route';
import { routeForumsLanding } from './landing/landing.route';
import { routeForumsTopicsView } from './topics/view/view.route';

// We need to redirect old forum categories over to our new channels.
const path = '/community/forums/:slug/';
const name = 'forums.channels.view';

const routeForumsChannelsRedirects: RouteRecordRaw[] = [
	{ path: `${path}2`, redirect: { name, params: { name: 'gj-feedback', sort: 'active' } } },
	{ path: `${path}7`, redirect: { name, params: { name: 'jams', sort: 'active' } } },
	{ path: `${path}1`, redirect: { name, params: { name: 'casual', sort: 'active' } } },
	{ path: `${path}3`, redirect: { name, params: { name: 'casual', sort: 'active' } } },
	{ path: `${path}4`, redirect: { name, params: { name: 'coding', sort: 'active' } } },
	{ path: `${path}5`, redirect: { name, params: { name: 'art', sort: 'active' } } },
	{ path: `${path}9`, redirect: { name, params: { name: 'gj-game-api', sort: 'active' } } },
];

export const routeForums: RouteRecordRaw = {
	path: '/forums',
	component: () => import('./forums'),
	children: [
		routeForumsLanding,
		routeForumsChannelsView,
		routeForumsTopicsView,
		...routeForumsChannelsRedirects,
	],
};
