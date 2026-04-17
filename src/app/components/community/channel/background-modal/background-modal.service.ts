import { defineAsyncComponent } from 'vue';

import { CommunityChannelModel } from '~common/community/channel/channel.model';
import { showModal } from '~common/modal/modal.service';

export async function showCommunityChannelBackgroundModal(channel: CommunityChannelModel) {
	return await showModal<CommunityChannelModel>({
		modalId: 'CommunityChannelBackground',
		component: defineAsyncComponent(
			() =>
				import(
					'~app/components/community/channel/background-modal/AppCommunityChannelBackgroundModal.vue'
				)
		),
		props: {
			channel,
		},
		size: 'sm',
		noBackdropClose: true,
	});
}
