import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Modal } from '../../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export class GameHeaderModal {
	static async show(game: Game) {
		return await Modal.show<Game>({
			modalId: 'GameHeader',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "GameHeaderModal" */ './header-modal')
				),
			props: {
				game,
			},
			size: 'sm',
		});
	}
}
