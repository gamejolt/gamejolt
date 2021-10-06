import { asyncComponentLoader } from '../../../../../utils/utils';
import { FiresideCommunity } from '../../../../../_common/fireside/community/community.model';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { CommunityNotifyOptions } from '../../../../../_common/fireside/post/post-model';
import { Modal } from '../../../../../_common/modal/modal.service';

export type CommunityEjectFiresideModalResult = CommunityNotifyOptions;

export class CommunityEjectFiresideModal {
	static async show(firesideCommunity: FiresideCommunity, fireside: Fireside) {
		return await Modal.show<CommunityEjectFiresideModalResult>({
			modalId: 'CommunityEjectFireside',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "CommunityEjectFiresideModal" */ './modal.vue')
				),
			props: { firesideCommunity, fireside },
			size: 'sm',
		});
	}
}
