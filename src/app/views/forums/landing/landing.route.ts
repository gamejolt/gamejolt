import { RouteRecordRaw } from 'vue-router';

import { routeForumsLandingActive } from '~app/views/forums/landing/active/active.route';
import { routeForumsLandingOverview } from '~app/views/forums/landing/overview/overview.route';

export const routeForumsLanding: RouteRecordRaw = {
	path: '',
	component: () => import('~app/views/forums/landing/RouteForumsLanding.vue'),
	children: [routeForumsLandingOverview, routeForumsLandingActive],
};
