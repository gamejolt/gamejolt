import { defineAsyncComponent } from 'vue';
import { FiresidePostCommunity } from '../../../../../_common/fireside/post/community/community.model';
import {
	CommunityNotifyOptions,
	FiresidePost,
} from '../../../../../_common/fireside/post/post-model';
import { showModal } from '../../../../../_common/modal/modal.service';

export type CommunityEjectPostModalResult = CommunityNotifyOptions;

export class CommunityEjectPostModal {
	static async show(firesidePostCommunity: FiresidePostCommunity, post: FiresidePost) {
		return await showModal<CommunityEjectPostModalResult>({
			modalId: 'CommunityEjectPost',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "CommunityEjectPostModal" */ './modal.vue')
			),
			props: { firesidePostCommunity, post },
			size: 'sm',
		});
	}
}
