import { defineAsyncComponent } from 'vue';

import type { AvatarFrameModel } from '../../avatar/frame.model';
import type { BackgroundModel } from '../../background/background.model';
import type { EmojiModel } from '../../emoji/emoji.model';
import { showModal } from '../../modal/modal.service';
import type { StickerModel } from '../../sticker/sticker.model';

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
