import { asyncComponentLoader } from '../../../../../utils/utils';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { FiresidePostCommunity } from '../../../../../_common/fireside/post/community/community.model';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { Modal } from '../../../../../_common/modal/modal.service';

export type CommunityMovePostModalResult = {
	channel: CommunityChannel;

	notifyUser: boolean;
	reasonType: string | null;
	reason: string | null;
};

export class CommunityMovePostModal {
	static async show(
		firesidePostCommunity: FiresidePostCommunity,
		post: FiresidePost,
		channels: CommunityChannel[]
	) {
		return await Modal.show<CommunityMovePostModalResult>({
			modalId: 'CommunityMovePost',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "CommunityMovePostModal" */ './modal.vue')
				),
			props: { firesidePostCommunity, channels, post },
			size: 'sm',
		});
	}
}
