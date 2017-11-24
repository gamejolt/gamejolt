import { RouteConfig } from 'vue-router';

export const routeForumsTopicsAdd: RouteConfig = {
	name: 'forums.topics.add',
	path: '/f/:channel/create',
	props: true,
	component: () => import(/* webpackChunkName: "routeForumsTopicsAdd" */ './add'),
};
