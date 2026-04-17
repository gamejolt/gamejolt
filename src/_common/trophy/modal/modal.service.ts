import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';
import { UserBaseTrophyModel } from '~common/user/trophy/user-base-trophy.model';

export async function showTrophyModal(userTrophy: UserBaseTrophyModel) {
	return await showModal<void>({
		modalId: 'Trophy',
		component: defineAsyncComponent(() => import('~common/trophy/modal/AppTrophyModal.vue')),
		props: {
			userTrophy,
		},
		size: 'sm',
	});
}
