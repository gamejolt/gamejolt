import { defineAsyncComponent } from 'vue';
import { ContentEditorModelData } from '../../content/content-owner';
import { showModal } from '../../modal/modal.service';
import { EmojiModel } from '../emoji.model';

interface EmojiSelectorModalOptions {
	type?: 'emojis' | 'reactions';
	modelData: ContentEditorModelData;
}

export async function showEmojiSelectorModal(options: EmojiSelectorModalOptions) {
	const { type = 'emojis', modelData } = options;

	return await showModal<EmojiModel>({
		modalId: 'EmojiSelector',
		component: defineAsyncComponent(() => import('./AppEmojiSelectorModal.vue')),
		props: {
			type,
			modelData,
		},
		size: 'sm',
	});
}
