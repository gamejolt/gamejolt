import { defineAsyncComponent } from 'vue';
import { CommunityChannelModel } from '../../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../../_common/community/community.model';
import { showModal } from '../../../../../_common/modal/modal.service';

export class CommunityChannelChangeUrlModal {
	static async show(
		channel: CommunityChannelModel,
		community: CommunityModel,
		channels: CommunityChannelModel[]
	) {
		return await showModal<CommunityChannelModel>({
			modalId: 'CommunityChannelChangeUrl',
			component: defineAsyncComponent(() => import('./change-url-modal.vue')),
			props: { channel, community, channels },
			size: 'sm',
		});
	}
}
