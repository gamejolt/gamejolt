import { asyncComponentLoader } from '../../../../utils/utils';
import { Game } from '../../../../_common/game/game.model';
import { Modal } from '../../../../_common/modal/modal.service';

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
			noBackdropClose: true,
		});
	}
}
