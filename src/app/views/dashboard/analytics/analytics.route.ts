import { RouteRecordRaw } from 'vue-router';

export const routeDashAnalytics: RouteRecordRaw = {
	name: 'dash.analytics',
	path: 'analytics/:resource/:resourceId/:metricKey?',
	component: () => import('~app/views/dashboard/analytics/RouteDashAnalytics.vue'),
};
