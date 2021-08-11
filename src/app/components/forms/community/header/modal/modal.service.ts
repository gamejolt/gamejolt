import { defineAsyncComponent } from 'vue';
import { Community } from '../../../../../../_common/community/community.model';
import { Modal } from '../../../../../../_common/modal/modal.service';

export class CommunityHeaderModal {
	static async show(community: Community) {
		return await Modal.show<Community>({
			modalId: 'CommunityHeader',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "CommunityHeaderModal" */ './modal.vue')
			),
			props: {
				community,
			},
			size: 'sm',
			noBackdropClose: true,
		});
	}
}
