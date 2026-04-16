import { defineAsyncComponent } from 'vue';

import { FiresidePostCommunityModel } from '~common/fireside/post/community/community.model';
import {
	CommunityNotifyOptions,
	FiresidePostModel,
} from '~common/fireside/post/post-model';
import { showModal } from '~common/modal/modal.service';

export type CommunityEjectPostModalResult = CommunityNotifyOptions;

export async function showCommunityEjectPostModal(
	firesidePostCommunity: FiresidePostCommunityModel,
	post: FiresidePostModel
) {
	return await showModal<CommunityEjectPostModalResult>({
		modalId: 'CommunityEjectPost',
		component: defineAsyncComponent(() => import('~app/components/community/eject-post/modal/AppCommunityEjectPostModal.vue')),
		props: { firesidePostCommunity, post },
		size: 'sm',
	});
}
