import { Game } from '../../../../_common/game/game.model';
import { Modal } from '../../../../_common/modal/modal.service';
import { asyncComponentLoader } from '../../../../utils/utils';

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
