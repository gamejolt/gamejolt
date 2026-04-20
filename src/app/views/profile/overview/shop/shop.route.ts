import type { RouteRecordRaw } from 'vue-router';

import type { UserModel } from '~common/user/user.model';

export const routeProfileOverviewShop: RouteRecordRaw = {
	name: 'profile.shop',
	path: '/@:username/shop',
	component: () => import('~app/views/profile/overview/shop/RouteProfileOverviewShop.vue'),
};

export function routeUrlProfileShop({ username }: { username: UserModel['username'] }) {
	return `/@${username}/shop`;
}
