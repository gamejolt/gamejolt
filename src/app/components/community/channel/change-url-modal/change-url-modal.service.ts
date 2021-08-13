import { defineAsyncComponent } from 'vue';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import { showModal } from '../../../../../_common/modal/modal.service';

export class CommunityChannelChangeUrlModal {
	static async show(
		channel: CommunityChannel,
		community: Community,
		channels: CommunityChannel[]
	) {
		return await showModal<CommunityChannel>({
			modalId: 'CommunityChannelChangeUrl',
			component: defineAsyncComponent(
				() =>
					import(
						/* webpackChunkName: "CommunityChannelChangeUrlModal" */ './change-url-modal.vue'
					)
			),
			props: { channel, community, channels },
			size: 'sm',
		});
	}
}
