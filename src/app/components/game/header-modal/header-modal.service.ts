import { defineAsyncComponent } from 'vue';

import { GameModel } from '~common/game/game.model';
import { showModal } from '~common/modal/modal.service';

export async function showGameHeaderModal(game: GameModel) {
	return await showModal<GameModel>({
		modalId: 'GameHeader',
		component: defineAsyncComponent(
			() => import('~app/components/game/header-modal/AppGameHeaderModal.vue')
		),
		props: {
			game,
		},
		size: 'sm',
		noBackdropClose: true,
	});
}
