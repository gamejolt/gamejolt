import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageKeyGroupsEdit: RouteRecordRaw = {
	name: 'dash.games.manage.key-groups.edit',
	path: 'keys/edit/:keyGroupId(\\d+)',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageKeyGroupsEdit" */ './edit.vue'),
};
