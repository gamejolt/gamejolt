import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountWithdrawFunds: RouteRecordRaw = {
	name: 'dash.account.withdraw-funds',
	path: 'withdraw-funds',
	alias: 'developer/withdraw-funds',
	component: () => import('./withdraw-funds.vue'),
};
