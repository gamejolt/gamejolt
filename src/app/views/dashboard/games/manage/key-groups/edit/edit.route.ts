import { RouteConfig } from 'vue-router';

export const routeDashGamesManageKeyGroupsEdit: RouteConfig = {
	name: 'dash.games.manage.key-groups.edit',
	path: 'keys/edit/:keyGroupId(\\d+)',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageKeyGroupsEdit" */ './edit'),
};
