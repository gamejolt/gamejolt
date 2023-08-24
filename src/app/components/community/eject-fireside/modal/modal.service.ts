import { defineAsyncComponent } from 'vue';
import { FiresideCommunityModel } from '../../../../../_common/fireside/community/community.model';
import { FiresideModel } from '../../../../../_common/fireside/fireside.model';
import { CommunityNotifyOptions } from '../../../../../_common/fireside/post/post-model';
import { showModal } from '../../../../../_common/modal/modal.service';

export type CommunityEjectFiresideModalResult = CommunityNotifyOptions;

export class CommunityEjectFiresideModal {
	static async show(firesideCommunity: FiresideCommunityModel, fireside: FiresideModel) {
		return await showModal<CommunityEjectFiresideModalResult>({
			modalId: 'CommunityEjectFireside',
			component: defineAsyncComponent(() => import('./modal.vue')),
			props: { firesideCommunity, fireside },
			size: 'sm',
		});
	}
}
