import { defineAsyncComponent } from 'vue';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { FiresidePostCommunity } from '../../../../../_common/fireside/post/community/community.model';
import {
	CommunityNotifyOptions,
	FiresidePost,
} from '../../../../../_common/fireside/post/post-model';
import { showModal } from '../../../../../_common/modal/modal.service';

export type CommunityMovePostModalResult = CommunityNotifyOptions & {
	channel: CommunityChannel;
};

export class CommunityMovePostModal {
	static async show(
		firesidePostCommunity: FiresidePostCommunity,
		post: FiresidePost,
		channels: CommunityChannel[]
	) {
		return await showModal<CommunityMovePostModalResult>({
			modalId: 'CommunityMovePost',
			component: defineAsyncComponent(() => import('./modal.vue')),
			props: { firesidePostCommunity, channels, post },
			size: 'sm',
		});
	}
}
