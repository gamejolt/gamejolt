import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../modal/modal.service';
import { CreatorExperienceLevel } from '../level.model';

export class CreatorExperienceLevelUpModal {
	static async show(level: CreatorExperienceLevel) {
		return await showModal<CreatorExperienceLevel>({
			modalId: 'CreatorExperienceLevelUp',
			component: defineAsyncComponent(() => import('./AppCreatorExperienceLevelUpModal.vue')),
			props: {
				level,
			},
			size: 'sm',
		});
	}
}
