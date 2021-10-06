import { asyncComponentLoader } from '../../../../../utils/utils';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Modal } from '../../../../../_common/modal/modal.service';

export class CommunityChannelBackgroundModal {
	static async show(channel: CommunityChannel) {
		return await Modal.show<CommunityChannel>({
			modalId: 'CommunityChannelBackground',
			component: () =>
				asyncComponentLoader(
					import(
						/* webpackChunkName: "CommunityChannelBackgroundModal" */ './background-modal.vue'
					)
				),
			props: {
				channel,
			},
			size: 'sm',
			noBackdropClose: true,
		});
	}
}
