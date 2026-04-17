import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';

export async function showTranslateLangSelectorModal() {
	return await showModal<void>({
		modalId: 'TranslateLangSelector',
		component: defineAsyncComponent(
			() => import('~common/translate/lang-selector/AppTranslateLangSelectorModal.vue')
		),
		size: 'sm',
	});
}

export class TranslateLangSelectorModal {
	static async show() {
		return await showModal<void>({
			modalId: 'TranslateLangSelector',
			component: defineAsyncComponent(
				() => import('~common/translate/lang-selector/AppTranslateLangSelectorModal.vue')
			),
			size: 'sm',
		});
	}
}
