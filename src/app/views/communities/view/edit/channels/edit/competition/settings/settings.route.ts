import { RouteRecordRaw } from 'vue-router';
import { lazyImportNoSSR } from '../../../../../../../../../_common/code-splitting';

export const routeCommunitiesViewEditChannelsCompetitionSettings: RouteRecordRaw = {
	name: 'communities.view.edit.channels.competition.settings',
	path: 'settings',
	component: lazyImportNoSSR(
		() => import('./RouteCommunitiesViewEditChannelsCompetitionSettings.vue')
	),
};
