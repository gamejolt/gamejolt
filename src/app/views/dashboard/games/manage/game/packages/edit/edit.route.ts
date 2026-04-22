import { RouteRecordRaw } from 'vue-router';

import { routeDashGamesManageGamePackagesEditWidget } from '~app/views/dashboard/games/manage/game/packages/edit/widget/widget.route';

export const routeDashGamesManageGamePackagesEdit: RouteRecordRaw = {
	name: 'dash.games.manage.game.packages.edit',
	path: 'packages/:packageId(\\d+)',
	component: () =>
		import('~app/views/dashboard/games/manage/game/packages/edit/RouteDashGamesManageGamePackagesEdit.vue'),
	children: [routeDashGamesManageGamePackagesEditWidget],
};
