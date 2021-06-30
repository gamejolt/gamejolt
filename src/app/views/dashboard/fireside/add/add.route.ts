import { RouteConfig } from 'vue-router';

export const routeDashFiresideAdd: RouteConfig = {
	name: 'dash.fireside.add',
	path: 'add',
	component: () => import(/* webpackChunkName: "routeDashFiresideAdd" */ './add.vue'),
};
