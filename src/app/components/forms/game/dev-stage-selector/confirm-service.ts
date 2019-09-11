import { Game } from '../../../../../_common/game/game.model';
import { Modal } from '../../../../../_common/modal/modal.service';
import { asyncComponentLoader } from '../../../../../utils/utils';

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
