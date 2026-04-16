import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountPaymentMethods: RouteRecordRaw = {
	name: 'dash.account.payment-methods',
	path: 'payment-methods',
	component: () => import('~app/views/dashboard/account/payment-methods/RouteDashAccountPaymentMethods.vue'),
};
