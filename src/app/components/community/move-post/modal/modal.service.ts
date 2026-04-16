import { defineAsyncComponent } from 'vue';

import { CommunityChannelModel } from '~common/community/channel/channel.model';
import { FiresidePostCommunityModel } from '~common/fireside/post/community/community.model';
import {
	CommunityNotifyOptions,
	FiresidePostModel,
} from '~common/fireside/post/post-model';
import { showModal } from '~common/modal/modal.service';

export type CommunityMovePostModalResult = CommunityNotifyOptions & {
	channel: CommunityChannelModel;
};

export async function showCommunityMovePostModal(
	firesidePostCommunity: FiresidePostCommunityModel,
	post: FiresidePostModel,
	channels: CommunityChannelModel[]
) {
	return await showModal<CommunityMovePostModalResult>({
		modalId: 'CommunityMovePost',
		component: defineAsyncComponent(() => import('~app/components/community/move-post/modal/AppCommunityMovePostModal.vue')),
		props: { firesidePostCommunity, channels, post },
		size: 'sm',
	});
}
