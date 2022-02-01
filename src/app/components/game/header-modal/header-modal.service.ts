import { defineAsyncComponent } from 'vue';
import { Game } from '../../../../_common/game/game.model';
import { showModal } from '../../../../_common/modal/modal.service';

export class GameHeaderModal {
	static async show(game: Game) {
		return await showModal<Game>({
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
