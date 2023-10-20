import { defineAsyncComponent } from 'vue';
import { showModal } from '../../modal/modal.service';
import { UserBaseTrophyModel } from '../../user/trophy/user-base-trophy.model';

export async function showTrophyModal(userTrophy: UserBaseTrophyModel) {
	return await showModal<void>({
		modalId: 'Trophy',
		component: defineAsyncComponent(() => import('./AppTrophyModal.vue')),
		props: {
			userTrophy,
		},
		size: 'sm',
	});
}
