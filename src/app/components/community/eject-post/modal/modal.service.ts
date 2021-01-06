import { asyncComponentLoader } from '../../../../../utils/utils';
import { FiresidePostCommunity } from '../../../../../_common/fireside/post/community/community.model';
import {
	CommunityNotifyOptions,
	FiresidePost,
} from '../../../../../_common/fireside/post/post-model';
import { Modal } from '../../../../../_common/modal/modal.service';

export type CommunityEjectPostModalResult = CommunityNotifyOptions;

export class CommunityEjectPostModal {
	static async show(firesidePostCommunity: FiresidePostCommunity, post: FiresidePost) {
		return await Modal.show<CommunityEjectPostModalResult>({
			modalId: 'CommunityEjectPost',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "CommunityEjectPostModal" */ './modal.vue')
				),
			props: { firesidePostCommunity, post },
			size: 'sm',
		});
	}
}
