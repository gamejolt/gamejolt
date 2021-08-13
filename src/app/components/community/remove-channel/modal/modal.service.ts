import { defineAsyncComponent } from 'vue';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import { showModal } from '../../../../../_common/modal/modal.service';

export class CommunityRemoveChannelModal {
	static async show(community: Community, channel: CommunityChannel) {
		return await showModal<CommunityChannel | null>({
			modalId: 'CommunityRemoveChannel',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "CommunityRemoveChannelModal" */ './modal.vue')
			),
			props: { community, channel },
			size: 'sm',
		});
	}
}
