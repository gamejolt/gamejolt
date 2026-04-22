import { defineAsyncComponent } from 'vue';

import type { AvatarFrameModel } from '~common/avatar/frame.model';
import type { BackgroundModel } from '~common/background/background.model';
import type { EmojiModel } from '~common/emoji/emoji.model';
import { showModal } from '~common/modal/modal.service';
import type { StickerModel } from '~common/sticker/sticker.model';

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
		component: defineAsyncComponent(
			() =>
				import('~common/collectible/resource-details-modal/AppCollectibleResourceDetailsModal.vue')
		),
		props: {
			item,
		},
		size: 'sm',
	});
}
