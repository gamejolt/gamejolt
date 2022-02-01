import { defineAsyncComponent } from 'vue';
import {
	Community,
	CommunityPresetChannelType,
} from '../../../../../_common/community/community.model';
import { showModal } from '../../../../../_common/modal/modal.service';

export class CommunityChannelPresetBackgroundModal {
	static async show(community: Community, presetType: CommunityPresetChannelType) {
		return await showModal<Community>({
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
}
