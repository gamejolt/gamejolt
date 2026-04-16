import { defineAsyncComponent } from 'vue';

import { CommunityChannelModel } from '~common/community/channel/channel.model';
import { CommunityModel } from '~common/community/community.model';
import { showModal } from '~common/modal/modal.service';

export async function showCommunityRemoveChannelModal(
	community: CommunityModel,
	channel: CommunityChannelModel
) {
	return await showModal<CommunityChannelModel | null>({
		modalId: 'CommunityRemoveChannel',
		component: defineAsyncComponent(() => import('~app/components/community/remove-channel/modal/AppCommunityRemoveChannelModal.vue')),
		props: { community, channel },
		size: 'sm',
	});
}
