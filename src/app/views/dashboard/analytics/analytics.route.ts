import { RouteConfig } from 'vue-router';

export const routeDashAnalytics: RouteConfig = {
	name: 'dash.analytics',
	path: 'analytics/:resource/:resourceId/:metricKey?',
	component: () => import(/* webpackChunkName: "routeDashAnalytics" */ './analytics'),
};
