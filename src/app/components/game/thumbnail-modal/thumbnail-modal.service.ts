import { defineAsyncComponent } from 'vue';

import { GameModel } from '~common/game/game.model';
import { showModal } from '~common/modal/modal.service';

export async function showGameThumbnailModal(game: GameModel) {
	return await showModal<GameModel>({
		modalId: 'GameThumbnail',
		component: defineAsyncComponent(
			() => import('~app/components/game/thumbnail-modal/AppGameThumbnailModal.vue')
		),
		props: {
			game,
		},
		size: 'sm',
		noBackdropClose: true,
	});
}
