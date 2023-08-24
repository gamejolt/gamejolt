import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../modal/modal.service';
import { CreatorExperienceLevelModel } from '../level.model';

export class CreatorExperienceLevelUpModal {
	static async show(level: CreatorExperienceLevelModel) {
		return await showModal<CreatorExperienceLevelModel>({
			modalId: 'CreatorExperienceLevelUp',
			component: defineAsyncComponent(() => import('./AppCreatorExperienceLevelUpModal.vue')),
			props: {
				level,
			},
			size: 'sm',
		});
	}
}
