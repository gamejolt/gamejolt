import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

export class GameDevStageSelectorConfirmModal {
	static async show(game: Game, stage: number) {
		return await Modal.show<boolean>({
			modalId: 'GameDevStageSelectorConfirm-' + game.id,
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "GameDevStageSelectorConfirmModal" */ './confirm.vue')
				),
			props: { game, stage },
			size: 'sm',
		});
	}
}
