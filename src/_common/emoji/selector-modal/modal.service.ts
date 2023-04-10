import { defineAsyncComponent } from 'vue';
import { ContentEditorModelData } from '../../content/content-owner';
import { showModal } from '../../modal/modal.service';
import { Emoji } from '../emoji.model';

interface EmojiSelectorModalOptions {
	type?: 'emojis' | 'reactions';
	modelData: ContentEditorModelData;
}

export class EmojiSelectorModal {
	static async show(options: EmojiSelectorModalOptions) {
		const { type = 'emojis', modelData } = options;

		return await showModal<Emoji>({
			modalId: 'EmojiSelector',
			component: defineAsyncComponent(() => import('./AppEmojiSelectorModal.vue')),
			props: {
				type,
				modelData,
			},
			size: 'sm',
		});
	}
}
