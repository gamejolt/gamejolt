import { defineAsyncComponent } from 'vue';
import { Game } from '../../../../_common/game/game.model';
import { showModal } from '../../../../_common/modal/modal.service';

export class GameThumbnailModal {
	static async show(game: Game) {
		return await showModal<Game>({
			modalId: 'GameThumbnail',
			component: defineAsyncComponent(() => import('./thumbnail-modal.vue')),
			props: {
				game,
			},
			size: 'sm',
			noBackdropClose: true,
		});
	}
}
