import { RouteConfig } from 'vue-router';

export const routeForumsTopicsAdd: RouteConfig = {
	name: 'forums.topics.add',
	path: '/f/:channel/create',
	component: () => import(/* webpackChunkName: "routeForumsTopicsAdd" */ './add.vue'),
};
