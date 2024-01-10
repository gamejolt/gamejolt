import { defineAsyncComponent } from 'vue';
import { EmojiModel } from '../../emoji/emoji.model';
import { showModal } from '../../modal/modal.service';
import { StickerModel } from '../sticker.model';

export async function showStickerCollectibleModal({ item }: { item: EmojiModel | StickerModel }) {
	return await showModal<void>({
		modalId: 'StickerCollectible',
		component: defineAsyncComponent(() => import('./AppStickerCollectibleModal.vue')),
		size: 'sm',
		props: { item },
	});
}
