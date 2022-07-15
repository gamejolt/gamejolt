import { defineAsyncComponent } from 'vue';
import { showModal } from '../../modal/modal.service';

export class TranslateLangSelectorModal {
	static async show() {
		return await showModal<void>({
			modalId: 'TranslateLangSelector',
			component: defineAsyncComponent(() => import('./AppTranslateLangSelectorModal.vue')),
			size: 'sm',
		});
	}
}
