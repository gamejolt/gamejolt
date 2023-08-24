import { defineAsyncComponent } from 'vue';
import { FiresidePostCommunityModel } from '../../../../../_common/fireside/post/community/community.model';
import {
	CommunityNotifyOptions,
	FiresidePostModel,
} from '../../../../../_common/fireside/post/post-model';
import { showModal } from '../../../../../_common/modal/modal.service';

export type CommunityEjectPostModalResult = CommunityNotifyOptions;

export class CommunityEjectPostModal {
	static async show(firesidePostCommunity: FiresidePostCommunityModel, post: FiresidePostModel) {
		return await showModal<CommunityEjectPostModalResult>({
			modalId: 'CommunityEjectPost',
			component: defineAsyncComponent(() => import('./modal.vue')),
			props: { firesidePostCommunity, post },
			size: 'sm',
		});
	}
}
