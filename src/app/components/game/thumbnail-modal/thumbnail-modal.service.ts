import { defineAsyncComponent } from 'vue';
import { GameModel } from '../../../../_common/game/game.model';
import { showModal } from '../../../../_common/modal/modal.service';

export async function showGameThumbnailModal(game: GameModel) {
	return await showModal<GameModel>({
		modalId: 'GameThumbnail',
		component: defineAsyncComponent(() => import('./thumbnail-modal.vue')),
		props: {
			game,
		},
		size: 'sm',
		noBackdropClose: true,
	});
}
