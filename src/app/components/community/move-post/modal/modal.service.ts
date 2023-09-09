import { defineAsyncComponent } from 'vue';
import { CommunityChannelModel } from '../../../../../_common/community/channel/channel.model';
import { FiresidePostCommunityModel } from '../../../../../_common/fireside/post/community/community.model';
import {
	CommunityNotifyOptions,
	FiresidePostModel,
} from '../../../../../_common/fireside/post/post-model';
import { showModal } from '../../../../../_common/modal/modal.service';

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
		component: defineAsyncComponent(() => import('./modal.vue')),
		props: { firesidePostCommunity, channels, post },
		size: 'sm',
	});
}
