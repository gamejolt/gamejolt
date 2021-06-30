import { RouteConfig } from 'vue-router';
import { routeDashFiresideAdd } from './add/add.route';

export const routeDashFireside: RouteConfig = {
	path: 'fireside',
	component: () => import(/* webpackChunkName: "routeDashFireside" */ './fireside'),
	children: [routeDashFiresideAdd],
};
