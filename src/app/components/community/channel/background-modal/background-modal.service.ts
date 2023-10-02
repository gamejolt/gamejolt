import { defineAsyncComponent } from 'vue';
import { CommunityChannelModel } from '../../../../../_common/community/channel/channel.model';
import { showModal } from '../../../../../_common/modal/modal.service';

export async function showCommunityChannelBackgroundModal(channel: CommunityChannelModel) {
	return await showModal<CommunityChannelModel>({
		modalId: 'CommunityChannelBackground',
		component: defineAsyncComponent(() => import('./background-modal.vue')),
		props: {
			channel,
		},
		size: 'sm',
		noBackdropClose: true,
	});
}
