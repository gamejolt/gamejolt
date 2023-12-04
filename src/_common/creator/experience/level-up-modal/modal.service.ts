import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../modal/modal.service';
import { CreatorExperienceLevelModel } from '../level.model';

export async function showCreatorExperienceLevelUpModal(level: CreatorExperienceLevelModel) {
	return await showModal<CreatorExperienceLevelModel>({
		modalId: 'CreatorExperienceLevelUp',
		component: defineAsyncComponent(() => import('./AppCreatorExperienceLevelUpModal.vue')),
		props: {
			level,
		},
		size: 'sm',
	});
}
