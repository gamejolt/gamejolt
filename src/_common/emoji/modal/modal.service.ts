import { defineAsyncComponent } from 'vue';
import { ContentEditorModelData } from '../../content/content-owner';
import { showModal } from '../../modal/modal.service';
import { Emoji } from '../emoji.model';

interface EmojiModalOptions {
	modelData: ContentEditorModelData;
}

export class EmojiModal {
	static async show(options: EmojiModalOptions) {
		const { modelData } = options;

		return await showModal<Emoji>({
			modalId: 'EmojiSelector',
			component: defineAsyncComponent(() => import('./AppEmojiModal.vue')),
			props: {
				modelData,
			},
			size: 'sm',
		});
	}
}
