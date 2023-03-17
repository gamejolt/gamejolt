import { defineAsyncComponent } from 'vue';
import { showModal } from '../../modal/modal.service';
import { Model } from '../../model/model.service';
import { Emoji } from '../emoji.model';

interface EmojiModalOptions {
	resource: Model | undefined;
}

export class EmojiModal {
	static async show(options: EmojiModalOptions) {
		const { resource } = options;

		return await showModal<Emoji>({
			modalId: 'EmojiSelector',
			component: defineAsyncComponent(() => import('./AppEmojiModal.vue')),
			props: {
				resource,
			},
			size: 'sm',
		});
	}
}
