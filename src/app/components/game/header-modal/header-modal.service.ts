import { defineAsyncComponent } from 'vue';
import { GameModel } from '../../../../_common/game/game.model';
import { showModal } from '../../../../_common/modal/modal.service';

export class GameHeaderModal {
	static async show(game: GameModel) {
		return await showModal<GameModel>({
			modalId: 'GameHeader',
			component: defineAsyncComponent(() => import('./header-modal.vue')),
			props: {
				game,
			},
			size: 'sm',
			noBackdropClose: true,
		});
	}
}
