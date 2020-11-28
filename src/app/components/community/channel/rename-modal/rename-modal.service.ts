import { asyncComponentLoader } from '../../../../../utils/utils';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import { Modal } from '../../../../../_common/modal/modal.service';

export class CommunityChannelRenameModal {
	static async show(
		channel: CommunityChannel,
		community: Community,
		channels: CommunityChannel[]
	) {
		return await Modal.show<CommunityChannel>({
			modalId: 'CommunityChannelRename',
			component: () =>
				asyncComponentLoader(
					import(
						/* webpackChunkName: "CommunityChannelRenameModal" */ './rename-modal.vue'
					)
				),
			props: { channel, community, channels },
			size: 'sm',
		});
	}
}
