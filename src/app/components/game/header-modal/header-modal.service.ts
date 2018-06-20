import { Modal } from '../../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';

export class GameHeaderModal {
	static async show(game: Game) {
		return await Modal.show<Game>({
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "GameHeaderModal" */ './header-modal')
				),
			props: {
				game,
			},
		});
	}
}
