import { defineAsyncComponent } from 'vue';

import { ContentEditorModelData } from '~common/content/content-owner';
import { EmojiModel } from '~common/emoji/emoji.model';
import { showModal } from '~common/modal/modal.service';

interface EmojiSelectorModalOptions {
	type?: 'emojis' | 'reactions';
	modelData: ContentEditorModelData;
}

export async function showEmojiSelectorModal(options: EmojiSelectorModalOptions) {
	const { type = 'emojis', modelData } = options;

	return await showModal<EmojiModel>({
		modalId: 'EmojiSelector',
		component: defineAsyncComponent(() => import('~common/emoji/selector-modal/AppEmojiSelectorModal.vue')),
		props: {
			type,
			modelData,
		},
		size: 'sm',
	});
}
