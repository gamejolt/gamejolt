import { defineAsyncComponent } from 'vue';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { showModal } from '../../../../../_common/modal/modal.service';

export class CommunityChannelBackgroundModal {
	static async show(channel: CommunityChannel) {
		return await showModal<CommunityChannel>({
			modalId: 'CommunityChannelBackground',
			component: defineAsyncComponent(() => import('./background-modal.vue')),
			props: {
				channel,
			},
			size: 'sm',
			noBackdropClose: true,
		});
	}
}
