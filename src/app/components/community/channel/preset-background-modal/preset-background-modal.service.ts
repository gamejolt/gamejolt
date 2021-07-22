import { asyncComponentLoader } from '../../../../../utils/utils';
import {
	Community,
	CommunityPresetChannelType,
} from '../../../../../_common/community/community.model';
import { Modal } from '../../../../../_common/modal/modal.service';

export class CommunityChannelPresetBackgroundModal {
	static async show(community: Community, presetType: CommunityPresetChannelType) {
		return await Modal.show<Community>({
			modalId: 'CommunityChannelPresetBackground',
			component: () =>
				asyncComponentLoader(
					import(
						/* webpackChunkName: "CommunityChannelPresetBackgroundModal" */ './preset-background-modal.vue'
					)
				),
			props: {
				community,
				presetType,
			},
			size: 'sm',
			noBackdropClose: true,
		});
	}
}
