import { defineAsyncComponent } from 'vue';
import { AvatarFrameModel } from '../../avatar/frame.model';
import { BackgroundModel } from '../../background/background.model';
import { EmojiModel } from '../../emoji/emoji.model';
import { showModal } from '../../modal/modal.service';
import { StickerModel } from '../../sticker/sticker.model';

export type CollectibleResourceItem =
	| EmojiModel
	| StickerModel
	| AvatarFrameModel
	| BackgroundModel;

export async function showCollectibleResourceDetailsModal({
	item,
}: {
	item: CollectibleResourceItem;
}) {
	return await showModal<void>({
		modalId: 'CollectibleResourceDetails',
		component: defineAsyncComponent(() => import('./AppCollectibleResourceDetailsModal.vue')),
		props: {
			item,
		},
		size: 'sm',
	});
}
