import { defineAsyncComponent } from 'vue';
import { CommunityChannelModel } from '../../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../../_common/community/community.model';
import { showModal } from '../../../../../_common/modal/modal.service';

export async function showCommunityRemoveChannelModal(
	community: CommunityModel,
	channel: CommunityChannelModel
) {
	return await showModal<CommunityChannelModel | null>({
		modalId: 'CommunityRemoveChannel',
		component: defineAsyncComponent(() => import('./modal.vue')),
		props: { community, channel },
		size: 'sm',
	});
}
