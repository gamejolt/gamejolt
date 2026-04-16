import { defineAsyncComponent } from 'vue';

import { CreatorExperienceLevelModel } from '~common/creator/experience/level.model';
import { showModal } from '~common/modal/modal.service';

export async function showCreatorExperienceLevelUpModal(level: CreatorExperienceLevelModel) {
	return await showModal<CreatorExperienceLevelModel>({
		modalId: 'CreatorExperienceLevelUp',
		component: defineAsyncComponent(() => import('~common/creator/experience/level-up-modal/AppCreatorExperienceLevelUpModal.vue')),
		props: {
			level,
		},
		size: 'sm',
	});
}
