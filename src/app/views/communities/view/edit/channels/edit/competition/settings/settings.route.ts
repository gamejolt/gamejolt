import { RouteRecordRaw } from 'vue-router';

import { lazyImportNoSSR } from '~common/code-splitting';

export const routeCommunitiesViewEditChannelsCompetitionSettings: RouteRecordRaw = {
	name: 'communities.view.edit.channels.competition.settings',
	path: 'settings',
	component: lazyImportNoSSR(
		() =>
			import(
				'~app/views/communities/view/edit/channels/edit/competition/settings/RouteCommunitiesViewEditChannelsCompetitionSettings.vue'
			)
	),
};
