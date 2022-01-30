import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';
import { UserBaseTrophy } from '../../../../_common/user/trophy/user-base-trophy.model';

export class TrophyModal {
	static async show(userTrophy: UserBaseTrophy) {
		return await showModal<void>({
			modalId: 'Trophy',
			component: defineAsyncComponent(() => import('./modal.vue')),
			props: {
				userTrophy,
			},
			size: 'sm',
		});
	}
}
