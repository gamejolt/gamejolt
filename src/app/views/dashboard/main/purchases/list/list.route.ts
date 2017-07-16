import VueRouter from 'vue-router';

export const routeDashMainPurchasesList: VueRouter.RouteConfig = {
	name: 'dash.main.purchases.list',
	path: 'purchases',
	props: true,
	component: () => import('./list'),
};
