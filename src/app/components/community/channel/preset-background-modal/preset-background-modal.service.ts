import { defineAsyncComponent } from 'vue';
import {
	CommunityModel,
	CommunityPresetChannelType,
} from '../../../../../_common/community/community.model';
import { showModal } from '../../../../../_common/modal/modal.service';

export async function showCommunityChannelPresetBackgroundModal(
	community: CommunityModel,
	presetType: CommunityPresetChannelType
) {
	return await showModal<CommunityModel>({
		modalId: 'CommunityChannelPresetBackground',
		component: defineAsyncComponent(() => import('./preset-background-modal.vue')),
		props: {
			community,
			presetType,
		},
		size: 'sm',
		noBackdropClose: true,
	});
}
