import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

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
		});
	}
}
