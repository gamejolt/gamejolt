import { asyncComponentLoader } from '../../../../../utils/utils';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { FiresidePostCommunity } from '../../../../../_common/fireside/post/community/community.model';
import { Modal } from '../../../../../_common/modal/modal.service';

export class CommunityMovePostModal {
	static async show(firesidePostCommunity: FiresidePostCommunity, channels: CommunityChannel[]) {
		return await Modal.show<CommunityChannel>({
			modalId: 'CommunityMovePost',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "CommunityMovePostModal" */ './modal.vue')
				),
			props: { firesidePostCommunity, channels },
			size: 'sm',
		});
	}
}
