import { defineAsyncComponent } from 'vue';

import { CommunitySidebarData } from '~app/components/community/sidebar/sidebar-data';
import { CommunityModel } from '~common/community/community.model';
import { showModal } from '~common/modal/modal.service';

interface Options {
	sidebarData: CommunitySidebarData;
	community: CommunityModel;
}

export async function showCommunitySidebarModal(options: Options) {
	const { community, sidebarData } = options;

	return await showModal<void>({
		modalId: 'CommunitySidebarModal-' + community.id,
		component: defineAsyncComponent(() => import('~app/components/community/sidebar/modal/AppCommunitySidebarModal.vue')),
		props: {
			sidebarData,
			community,
		},
		size: 'sm',
	});
}
