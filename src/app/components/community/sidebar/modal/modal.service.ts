import { defineAsyncComponent } from 'vue';
import { CommunityModel } from '../../../../../_common/community/community.model';
import { showModal } from '../../../../../_common/modal/modal.service';
import { CommunitySidebarData } from '../sidebar-data';

interface Options {
	isEditing: boolean;
	sidebarData: CommunitySidebarData;
	community: CommunityModel;
}

export async function showCommunitySidebarModal(options: Options) {
	const { isEditing, community, sidebarData } = options;

	return await showModal<void>({
		modalId: 'CommunitySidebarModal-' + community.id,
		component: defineAsyncComponent(() => import('./modal.vue')),
		props: {
			isEditing,
			sidebarData,
			community,
		},
		size: 'sm',
	});
}
