import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

export class GameThumbnailModal {
	static async show(game: Game) {
		return await Modal.show<Game>({
			modalId: 'GameThumbnail',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "GameThumbnailModal" */ './thumbnail-modal.vue')
				),
			props: {
				game,
			},
			size: 'sm',
		});
	}
}
