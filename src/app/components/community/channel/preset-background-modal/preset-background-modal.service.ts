import { defineAsyncComponent } from 'vue';

import { CommunityModel, CommunityPresetChannelType } from '~common/community/community.model';
import { showModal } from '~common/modal/modal.service';

export async function showCommunityChannelPresetBackgroundModal(
	community: CommunityModel,
	presetType: CommunityPresetChannelType
) {
	return await showModal<CommunityModel>({
		modalId: 'CommunityChannelPresetBackground',
		component: defineAsyncComponent(
			() =>
				import(
					'~app/components/community/channel/preset-background-modal/AppCommunityChannelPresetBackgroundModal.vue'
				)
		),
		props: {
			community,
			presetType,
		},
		size: 'sm',
		noBackdropClose: true,
	});
}
