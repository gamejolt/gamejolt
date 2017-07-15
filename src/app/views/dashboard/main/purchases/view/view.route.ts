import VueRouter from 'vue-router';

export const routeDashMainPurchasesView: VueRouter.RouteConfig = {
	name: 'dash.main.purchases.view',
	path: 'purchases/view/:id',
	props: true,
	component: () => import('./view'),
};
