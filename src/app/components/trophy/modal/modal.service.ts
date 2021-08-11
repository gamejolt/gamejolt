import { defineAsyncComponent } from 'vue';
import { Modal } from '../../../../_common/modal/modal.service';
import { UserBaseTrophy } from '../../../../_common/user/trophy/user-base-trophy.model';

export class TrophyModal {
	static async show(userTrophy: UserBaseTrophy) {
		return await Modal.show<void>({
			modalId: 'Trophy',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "TrophyModal" */ './modal.vue')
			),
			props: {
				userTrophy,
			},
			size: 'sm',
		});
	}
}
