import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';
import { StickerPack } from '../../../../_common/sticker/pack/pack.model';
import { Sticker } from '../../../../_common/sticker/sticker.model';

export async function showStickerEditModal({
	sticker,
	stickers,
	updatePack,
	canActivate,
	warnDeactivate,
}: {
	/**
	 * Existing sticker model to be edited.
	 */
	sticker: Sticker | null;

	/**
	 * List of stickers we already have. New sticker will be added to this list.
	 */
	stickers?: Sticker[];

	/**
	 * Function to run when we get a new sticker pack from the backend.
	 */
	updatePack?: (_payloadPack: StickerPack | undefined) => void;

	/**
	 * Whether the sticker can be activated.
	 */
	canActivate?: boolean;

	/**
	 * Whether to show a warning message when deactivating a sticker.
	 */
	warnDeactivate?: boolean;
}) {
	return await showModal<void>({
		modalId: 'StickerEdit',
		component: defineAsyncComponent(() => import('./StickerEditModal.vue')),
		props: {
			sticker,
			stickers,
			updatePack,
			canActivate,
			warnDeactivate,
		},
		size: 'sm',
	});
}
