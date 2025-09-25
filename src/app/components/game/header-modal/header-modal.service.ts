import { defineAsyncComponent } from 'vue';
import { GameModel } from '../../../../_common/game/game.model';
import { showModal } from '../../../../_common/modal/modal.service';

export async function showGameHeaderModal(game: GameModel) {
	return await showModal<GameModel>({
		modalId: 'GameHeader',
		component: defineAsyncComponent(() => import('./AppGameHeaderEditModal.vue')),
		props: {
			game,
		},
		size: 'sm',
		noBackdropClose: true,
	});
}
