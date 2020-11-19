import { asyncComponentLoader } from '../../../../utils/utils';
import { Game } from '../../../../_common/game/game.model';
import { Modal } from '../../../../_common/modal/modal.service';

export class GameHeaderModal {
	static async show(game: Game) {
		return await Modal.show<Game>({
			modalId: 'GameHeader',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "GameHeaderModal" */ './header-modal.vue')
				),
			props: {
				game,
			},
			size: 'sm',
			noBackdropClose: true,
		});
	}
}
