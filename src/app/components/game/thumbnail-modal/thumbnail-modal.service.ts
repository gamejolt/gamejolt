import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Modal } from '../../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export class GameThumbnailModal {
	static async show(game: Game) {
		return await Modal.show<Game>({
			modalId: 'GameThumbnail',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "GameThumbnailModal" */ './thumbnail-modal')
				),
			props: {
				game,
			},
			size: 'sm',
		});
	}
}
