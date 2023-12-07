import { defineAsyncComponent } from 'vue';
import { CommunityModel } from '../../../../../_common/community/community.model';
import { showModal } from '../../../../../_common/modal/modal.service';
import { CommunitySidebarData } from '../sidebar-data';

interface Options {
	sidebarData: CommunitySidebarData;
	community: CommunityModel;
}

export async function showCommunitySidebarModal(options: Options) {
	const { community, sidebarData } = options;

	return await showModal<void>({
		modalId: 'CommunitySidebarModal-' + community.id,
		component: defineAsyncComponent(() => import('./AppCommunitySidebarModal.vue')),
		props: {
			sidebarData,
			community,
		},
		size: 'sm',
	});
}
